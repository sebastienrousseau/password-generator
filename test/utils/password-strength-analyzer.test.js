// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { describe, it } from 'mocha';
import { expect } from 'chai';
import {
  analyzePasswordStrength,
  getStrengthLabel,
  getStrengthColor,
  quickStrengthCheck
} from '../../src/utils/password-strength-analyzer.js';

describe('Password Strength Analyzer', () => {
  describe('analyzePasswordStrength', () => {
    it('should return proper structure for empty password', () => {
      const result = analyzePasswordStrength('');

      expect(result).to.have.property('score', 0);
      expect(result).to.have.property('entropy', 0);
      expect(result).to.have.property('crackTime', null);
      expect(result).to.have.property('feedback');
      expect(result).to.have.property('patterns');
      expect(result).to.have.property('dictionaries');
      expect(result).to.have.property('composition', null);
      expect(result.feedback.warning).to.equal('Password is required');
    });

    it('should detect very weak common passwords', () => {
      const commonPasswords = ['password', '123456', 'qwerty', 'password123'];

      for (const pwd of commonPasswords) {
        const result = analyzePasswordStrength(pwd);
        expect(result.score).to.equal(0, `Password "${pwd}" should score 0`);
        expect(result.dictionaries).to.have.length.greaterThan(0);
        expect(result.dictionaries.some(d => d.dictionary === 'common_passwords')).to.be.true;
      }
    });

    it('should detect sequential patterns', () => {
      const result = analyzePasswordStrength('abc123def456');

      expect(result.patterns).to.have.length.greaterThan(0);
      expect(result.patterns.some(p => p.pattern === 'sequence')).to.be.true;
      expect(result.score).to.be.lessThan(3); // Should be penalized
    });

    it('should detect keyboard patterns', () => {
      const result = analyzePasswordStrength('qwertyasdf');

      expect(result.patterns).to.have.length.greaterThan(0);
      expect(result.patterns.some(p => p.pattern === 'keyboard_row')).to.be.true;
      expect(result.score).to.be.lessThan(3); // Should be penalized
    });

    it('should detect repetition patterns', () => {
      const result = analyzePasswordStrength('aaaaaa1111');

      expect(result.patterns).to.have.length.greaterThan(0);
      expect(result.patterns.some(p => p.pattern === 'repetition')).to.be.true;
      expect(result.score).to.be.lessThan(3); // Should be penalized
    });

    it('should detect leet speak substitutions', () => {
      const result = analyzePasswordStrength('p@ssw0rd');

      expect(result.patterns).to.have.length.greaterThan(0);
      expect(result.patterns.some(p => p.pattern === 'leet_speak')).to.be.true;
    });

    it('should detect dictionary words', () => {
      const result = analyzePasswordStrength('lovetime123');

      expect(result.dictionaries).to.have.length.greaterThan(0);
      expect(result.dictionaries.some(d => d.dictionary === 'english_words')).to.be.true;
    });

    it('should analyze password composition correctly', () => {
      const result = analyzePasswordStrength('MyStr0ng!Pass');

      expect(result.composition).to.not.be.null;
      expect(result.composition.hasLowercase).to.be.true;
      expect(result.composition.hasUppercase).to.be.true;
      expect(result.composition.hasNumbers).to.be.true;
      expect(result.composition.hasSymbols).to.be.true;
      expect(result.composition.length).to.equal(13);
      expect(result.composition.charsetSize).to.be.greaterThan(90); // All character types
    });

    it('should give high score to strong passwords', () => {
      const strongPassword = 'Xy9$mQ#8pL&vN2!kR';
      const result = analyzePasswordStrength(strongPassword);

      expect(result.score).to.be.greaterThan(2);
      expect(result.entropy).to.be.greaterThan(50);
      expect(result.dictionaries).to.have.length(0);
      expect(result.patterns.length).to.be.lessThan(2); // Minimal patterns
    });

    it('should provide appropriate feedback for weak passwords', () => {
      const result = analyzePasswordStrength('pass');

      expect(result.feedback.suggestions).to.include('Use at least 8 characters');
      expect(result.feedback.suggestions).to.include('Add uppercase letters');
      expect(result.feedback.suggestions).to.include('Add numbers');
      expect(result.feedback.suggestions).to.include('Add symbols');
    });

    it('should calculate crack time estimates', () => {
      const result = analyzePasswordStrength('StrongP@ssw0rd123');

      expect(result.crackTime).to.have.property('online_throttled');
      expect(result.crackTime).to.have.property('online_unthrottled');
      expect(result.crackTime).to.have.property('offline_slow');
      expect(result.crackTime).to.have.property('offline_fast');

      // Crack times should be strings with time units
      expect(result.crackTime.online_throttled).to.match(/seconds|minutes|hours|days|years|centuries/);
    });

    it('should handle edge cases gracefully', () => {
      const testCases = [null, undefined, 42, [], {}];

      for (const testCase of testCases) {
        const result = analyzePasswordStrength(testCase);
        expect(result.score).to.equal(0);
        expect(result.feedback.warning).to.equal('Password is required');
      }
    });
  });

  describe('getStrengthLabel', () => {
    it('should return correct labels for all scores', () => {
      expect(getStrengthLabel(0)).to.equal('Very Weak');
      expect(getStrengthLabel(1)).to.equal('Weak');
      expect(getStrengthLabel(2)).to.equal('Fair');
      expect(getStrengthLabel(3)).to.equal('Good');
      expect(getStrengthLabel(4)).to.equal('Strong');
    });

    it('should handle invalid scores', () => {
      expect(getStrengthLabel(-1)).to.equal('Unknown');
      expect(getStrengthLabel(5)).to.equal('Unknown');
      expect(getStrengthLabel(null)).to.equal('Unknown');
    });
  });

  describe('getStrengthColor', () => {
    it('should return correct colors for all scores', () => {
      expect(getStrengthColor(0)).to.equal('#d73502'); // Red
      expect(getStrengthColor(1)).to.equal('#f56500'); // Orange-Red
      expect(getStrengthColor(2)).to.equal('#f7a800'); // Orange
      expect(getStrengthColor(3)).to.equal('#8bc34a'); // Light Green
      expect(getStrengthColor(4)).to.equal('#4caf50'); // Green
    });

    it('should handle invalid scores', () => {
      expect(getStrengthColor(-1)).to.equal('#666');
      expect(getStrengthColor(5)).to.equal('#666');
      expect(getStrengthColor(null)).to.equal('#666');
    });
  });

  describe('quickStrengthCheck', () => {
    it('should return simplified analysis', () => {
      const result = quickStrengthCheck('MyTestP@ss123');

      expect(result).to.have.property('score');
      expect(result).to.have.property('label');
      expect(result).to.have.property('color');
      expect(result).to.have.property('entropy');
      expect(result).to.have.property('suggestions');

      // Should limit suggestions to 3
      expect(result.suggestions.length).to.be.lessThanOrEqual(3);
    });

    it('should handle edge cases', () => {
      const result = quickStrengthCheck('');

      expect(result.score).to.equal(0);
      expect(result.label).to.equal('Very Weak');
      expect(result.color).to.equal('#d73502');
    });
  });

  describe('Real-world password scenarios', () => {
    it('should correctly evaluate common weak patterns', () => {
      const weakPasswords = [
        { pwd: 'password1', expectedScore: 0, reason: 'common password' },
        { pwd: 'qwerty123', expectedScore: 2, reason: 'keyboard pattern' },
        { pwd: 'abc123def', expectedScore: 2, reason: 'sequential pattern' },
        { pwd: 'aaaa1111', expectedScore: 2, reason: 'repetition' },
        { pwd: '12345678', expectedScore: 1, reason: 'pure sequence' }
      ];

      for (const { pwd, expectedScore, reason } of weakPasswords) {
        const result = analyzePasswordStrength(pwd);
        expect(result.score).to.be.lessThanOrEqual(expectedScore,
          `Password "${pwd}" should score <= ${expectedScore} (${reason})`);
      }
    });

    it('should correctly evaluate moderately strong passwords', () => {
      // Use passwords without common dictionary words to avoid false penalties
      const moderatePasswords = [
        'Kx7$mP!qR2vN',
        'Zephyr$Nyx2024',
        'Brix&Flux42!'
      ];

      for (const pwd of moderatePasswords) {
        const result = analyzePasswordStrength(pwd);
        expect(result.score).to.be.greaterThanOrEqual(2,
          `Password "${pwd}" should score >= 2`);
      }
    });

    it('should correctly evaluate strong passwords', () => {
      const strongPasswords = [
        'X9$mQ#8pL&vN2!k',
        'Butterfly$Moon97#',
        'Complex&Unique8*Password'
      ];

      for (const pwd of strongPasswords) {
        const result = analyzePasswordStrength(pwd);
        expect(result.score).to.be.greaterThanOrEqual(3,
          `Password "${pwd}" should score >= 3`);
        expect(result.entropy).to.be.greaterThan(40);
      }
    });

    it('should provide constructive feedback', () => {
      const testCases = [
        { pwd: 'short', expectedSuggestion: 'Use at least 8 characters' },
        { pwd: 'lowercase', expectedSuggestion: 'Add uppercase letters' },
        { pwd: 'UPPERCASE', expectedSuggestion: 'Add lowercase letters' },
        { pwd: 'NoNumbers!', expectedSuggestion: 'Add numbers' },
        { pwd: 'NoSymbols123', expectedSuggestion: 'Add symbols' }
      ];

      for (const { pwd, expectedSuggestion } of testCases) {
        const result = analyzePasswordStrength(pwd);
        expect(result.feedback.suggestions).to.include(expectedSuggestion,
          `Password "${pwd}" should suggest: ${expectedSuggestion}`);
      }
    });
  });
});