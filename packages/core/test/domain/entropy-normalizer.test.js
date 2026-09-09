// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  ENTROPY_CONSTANTS,
  calculateDicewareEntropy,
  calculateCustomEntropy,
  calculateStrongEntropy,
  calculateBase64Entropy,
  calculateMemorableEntropy,
  calculateQuantumEntropy,
  calculateHoneywordEntropy,
  calculatePronounceableEntropy,
  normalizeEntropy,
  getSecurityLevel,
  validateEntropyInputs,
  ENTROPY_CALCULATOR_REGISTRY,
} from '../../src/domain/entropy-normalizer.js';
import { PASSWORD_TYPES } from '../../src/domain/password-types.js';

describe('Domain: entropy-normalizer', () => {
  describe('ENTROPY_CONSTANTS', () => {
    it('should have DICEWARE_WORDS equal to 7776', () => {
      expect(ENTROPY_CONSTANTS.DICEWARE_WORDS).to.equal(7776);
    });

    it('should have BASE64_CHARSET_SIZE equal to 64', () => {
      expect(ENTROPY_CONSTANTS.BASE64_CHARSET_SIZE).to.equal(64);
    });

    it('should have DEFAULT_DICTIONARY_SIZE equal to 7776', () => {
      expect(ENTROPY_CONSTANTS.DEFAULT_DICTIONARY_SIZE).to.equal(7776);
    });

    it('should have CVVC_SYLLABLE_COMBINATIONS equal to 11025', () => {
      expect(ENTROPY_CONSTANTS.CVVC_SYLLABLE_COMBINATIONS).to.equal(11025);
    });
  });

  describe('calculateDicewareEntropy', () => {
    it('should calculate correct entropy for 1 word', () => {
      const result = calculateDicewareEntropy({ iteration: 1 });
      const expected = Math.log2(7776);
      expect(result).to.be.closeTo(expected, 0.001);
    });

    it('should calculate ~77.5 bits for 6 words', () => {
      const result = calculateDicewareEntropy({ iteration: 6 });
      const expected = 6 * Math.log2(7776); // ~77.5 bits
      expect(result).to.be.closeTo(expected, 0.001);
      expect(result).to.be.closeTo(77.5, 0.1);
    });

    it('should scale linearly with word count', () => {
      const entropy2 = calculateDicewareEntropy({ iteration: 2 });
      const entropy4 = calculateDicewareEntropy({ iteration: 4 });
      expect(entropy4).to.be.closeTo(entropy2 * 2, 0.001);
    });

    it('should return ~12.925 bits per word', () => {
      const entropy1 = calculateDicewareEntropy({ iteration: 1 });
      expect(entropy1).to.be.closeTo(12.925, 0.001);
    });
  });

  describe('calculateCustomEntropy', () => {
    it('should calculate ~105 bits for 16 chars from 94-char set', () => {
      const config = {
        allowedChars:
          '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~', // 94 printable ASCII chars
        length: 16,
        iteration: 1,
      };
      const result = calculateCustomEntropy(config);
      const expected = 16 * Math.log2(94); // ~105 bits
      expect(result).to.be.closeTo(expected, 0.001);
      expect(result).to.be.closeTo(105, 1);
    });

    it('should handle forbidden characters correctly', () => {
      const config = {
        allowedChars: 'abcdefghijklmnopqrstuvwxyz', // 26 chars
        forbiddenChars: 'aeiou', // remove 5 vowels
        length: 10,
        iteration: 1,
      };
      const result = calculateCustomEntropy(config);
      const expected = 10 * Math.log2(21); // 26 - 5 = 21 chars
      expect(result).to.be.closeTo(expected, 0.001);
    });

    it('should scale with length and iteration', () => {
      const config = {
        allowedChars: '0123456789abcdef', // 16 chars (hex)
        length: 8,
        iteration: 2,
      };
      const result = calculateCustomEntropy(config);
      const expected = 8 * 2 * Math.log2(16); // 8 * 2 * 4 = 64 bits
      expect(result).to.equal(64);
    });

    it('should return 0 for empty charset', () => {
      const config = {
        allowedChars: '',
        length: 10,
        iteration: 1,
      };
      const result = calculateCustomEntropy(config);
      expect(result).to.equal(0);
    });

    it('should return 0 on error', () => {
      const config = {
        allowedChars: null,
        length: 10,
        iteration: 1,
      };
      const result = calculateCustomEntropy(config);
      expect(result).to.equal(0);
    });

    it('should handle duplicate characters correctly', () => {
      const config = {
        allowedChars: 'aabbccdd', // should be counted as 4 unique chars
        length: 8,
        iteration: 1,
      };
      const result = calculateCustomEntropy(config);
      const expected = 8 * Math.log2(4); // 8 * 2 = 16 bits
      expect(result).to.equal(16);
    });
  });

  describe('calculateStrongEntropy', () => {
    it('should calculate entropy using base64 charset size', () => {
      const result = calculateStrongEntropy({ length: 16, iteration: 1 });
      const expected = 16 * Math.log2(64); // 16 * 6 = 96 bits
      expect(result).to.equal(96);
    });

    it('should scale with length and iteration', () => {
      const result = calculateStrongEntropy({ length: 8, iteration: 4 });
      const expected = 8 * 4 * Math.log2(64); // 32 * 6 = 192 bits
      expect(result).to.equal(192);
    });
  });

  describe('calculateBase64Entropy', () => {
    it('should calculate same as strong entropy', () => {
      const config = { length: 16, iteration: 1 };
      const base64Result = calculateBase64Entropy(config);
      const strongResult = calculateStrongEntropy(config);
      expect(base64Result).to.equal(strongResult);
      expect(base64Result).to.equal(96);
    });
  });

  describe('calculateMemorableEntropy', () => {
    it('should use default dictionary size', () => {
      const result = calculateMemorableEntropy({ iteration: 4 });
      const expected = 4 * Math.log2(7776);
      expect(result).to.be.closeTo(expected, 0.001);
    });

    it('should use custom dictionary size when provided', () => {
      const result = calculateMemorableEntropy({
        iteration: 3,
        dictionarySize: 10000,
      });
      const expected = 3 * Math.log2(10000);
      expect(result).to.be.closeTo(expected, 0.001);
    });
  });

  describe('calculateQuantumEntropy', () => {
    it('should calculate same as strong/base64 entropy', () => {
      const config = { length: 32, iteration: 1 };
      const quantumResult = calculateQuantumEntropy(config);
      const strongResult = calculateStrongEntropy(config);
      expect(quantumResult).to.equal(strongResult);
      expect(quantumResult).to.equal(192); // 32 * 6 bits
    });
  });

  describe('calculateHoneywordEntropy', () => {
    it('should calculate same as strong entropy', () => {
      const config = { length: 16, iteration: 1 };
      const honeywordResult = calculateHoneywordEntropy(config);
      const strongResult = calculateStrongEntropy(config);
      expect(honeywordResult).to.equal(strongResult);
    });
  });

  describe('calculatePronounceableEntropy', () => {
    it('should calculate entropy based on CVVC syllable combinations', () => {
      const result = calculatePronounceableEntropy({ iteration: 1 });
      const expected = Math.log2(11025); // ~13.42 bits per syllable
      expect(result).to.be.closeTo(expected, 0.001);
      expect(result).to.be.closeTo(13.42, 0.01);
    });

    it('should scale linearly with syllable count', () => {
      const entropy2 = calculatePronounceableEntropy({ iteration: 2 });
      const entropy6 = calculatePronounceableEntropy({ iteration: 6 });
      expect(entropy6).to.be.closeTo(entropy2 * 3, 0.001);
    });
  });

  describe('ENTROPY_CALCULATOR_REGISTRY', () => {
    it('should contain all password types', () => {
      expect(ENTROPY_CALCULATOR_REGISTRY[PASSWORD_TYPES.DICEWARE]).to.equal(
        calculateDicewareEntropy
      );
      expect(ENTROPY_CALCULATOR_REGISTRY[PASSWORD_TYPES.CUSTOM]).to.equal(calculateCustomEntropy);
      expect(ENTROPY_CALCULATOR_REGISTRY[PASSWORD_TYPES.STRONG]).to.equal(calculateStrongEntropy);
      expect(ENTROPY_CALCULATOR_REGISTRY[PASSWORD_TYPES.BASE64]).to.equal(calculateBase64Entropy);
      expect(ENTROPY_CALCULATOR_REGISTRY[PASSWORD_TYPES.MEMORABLE]).to.equal(
        calculateMemorableEntropy
      );
      expect(ENTROPY_CALCULATOR_REGISTRY[PASSWORD_TYPES.QUANTUM]).to.equal(calculateQuantumEntropy);
      expect(ENTROPY_CALCULATOR_REGISTRY[PASSWORD_TYPES.HONEYWORD]).to.equal(
        calculateHoneywordEntropy
      );
      expect(ENTROPY_CALCULATOR_REGISTRY[PASSWORD_TYPES.PRONOUNCEABLE]).to.equal(
        calculatePronounceableEntropy
      );
    });
  });

  describe('normalizeEntropy', () => {
    it('should calculate diceware entropy correctly', () => {
      const result = normalizeEntropy('test-password', PASSWORD_TYPES.DICEWARE, { iteration: 6 });
      const expected = 6 * Math.log2(7776);
      expect(result).to.be.closeTo(expected, 0.01);
    });

    it('should calculate custom entropy correctly', () => {
      const config = {
        allowedChars:
          '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{}|;:,.<>?',
        length: 16,
        iteration: 1,
      };
      const result = normalizeEntropy('test-password', PASSWORD_TYPES.CUSTOM, config);
      expect(result).to.be.greaterThan(100);
    });

    it('should throw error for missing type', () => {
      expect(() => {
        normalizeEntropy('password', null, { iteration: 1 });
      }).to.throw('Password type is required');
    });

    it('should throw error for missing config', () => {
      expect(() => {
        normalizeEntropy('password', PASSWORD_TYPES.DICEWARE, null);
      }).to.throw('Configuration is required');
    });

    it('should throw error for unsupported type', () => {
      expect(() => {
        normalizeEntropy('password', 'unsupported', { iteration: 1 });
      }).to.throw('Unsupported password type');
    });

    it('should return 0 for invalid entropy calculation', () => {
      const result = normalizeEntropy('password', PASSWORD_TYPES.CUSTOM, {
        allowedChars: '',
        length: 10,
        iteration: 1,
      });
      expect(result).to.equal(0);
    });

    it('should round result to 2 decimal places', () => {
      const result = normalizeEntropy('test', PASSWORD_TYPES.DICEWARE, { iteration: 1 });
      expect(Number.isInteger(result * 100)).to.be.true;
    });

    it('should handle all password types', () => {
      const types = [
        { type: PASSWORD_TYPES.DICEWARE, config: { iteration: 4 } },
        { type: PASSWORD_TYPES.STRONG, config: { length: 16, iteration: 1 } },
        { type: PASSWORD_TYPES.BASE64, config: { length: 16, iteration: 1 } },
        { type: PASSWORD_TYPES.MEMORABLE, config: { iteration: 4 } },
        { type: PASSWORD_TYPES.QUANTUM, config: { length: 32, iteration: 1 } },
        { type: PASSWORD_TYPES.HONEYWORD, config: { length: 16, iteration: 1 } },
        { type: PASSWORD_TYPES.PRONOUNCEABLE, config: { iteration: 4 } },
        { type: PASSWORD_TYPES.CUSTOM, config: { allowedChars: 'abc', length: 10, iteration: 1 } },
      ];

      types.forEach(({ type, config }) => {
        const result = normalizeEntropy('test-password', type, config);
        expect(result).to.be.a('number');
        expect(result).to.be.greaterThan(0);
      });
    });
  });

  describe('getSecurityLevel', () => {
    it('should return EXCELLENT for 256+ bits', () => {
      expect(getSecurityLevel(256)).to.equal('EXCELLENT');
      expect(getSecurityLevel(300)).to.equal('EXCELLENT');
      expect(getSecurityLevel(512)).to.equal('EXCELLENT');
    });

    it('should return STRONG for 128-255 bits', () => {
      expect(getSecurityLevel(128)).to.equal('STRONG');
      expect(getSecurityLevel(200)).to.equal('STRONG');
      expect(getSecurityLevel(255)).to.equal('STRONG');
    });

    it('should return GOOD for 80-127 bits', () => {
      expect(getSecurityLevel(80)).to.equal('GOOD');
      expect(getSecurityLevel(100)).to.equal('GOOD');
      expect(getSecurityLevel(127)).to.equal('GOOD');
    });

    it('should return MODERATE for 64-79 bits', () => {
      expect(getSecurityLevel(64)).to.equal('MODERATE');
      expect(getSecurityLevel(70)).to.equal('MODERATE');
      expect(getSecurityLevel(79)).to.equal('MODERATE');
    });

    it('should return WEAK for less than 64 bits', () => {
      expect(getSecurityLevel(0)).to.equal('WEAK');
      expect(getSecurityLevel(32)).to.equal('WEAK');
      expect(getSecurityLevel(63)).to.equal('WEAK');
    });
  });

  describe('validateEntropyInputs', () => {
    it('should validate correct inputs', () => {
      const result = validateEntropyInputs('test-password', PASSWORD_TYPES.DICEWARE, {
        iteration: 4,
      });
      expect(result.isValid).to.be.true;
      expect(result.errors).to.be.empty;
    });

    it('should reject non-string password', () => {
      const result = validateEntropyInputs(123, PASSWORD_TYPES.DICEWARE, { iteration: 4 });
      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Password must be a string');
    });

    it('should reject non-string type', () => {
      const result = validateEntropyInputs('test-password', 123, { iteration: 4 });
      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Type must be a string');
    });

    it('should reject non-object config', () => {
      const result = validateEntropyInputs('test-password', PASSWORD_TYPES.DICEWARE, 'invalid');
      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Config must be an object');
    });

    it('should reject unsupported password type', () => {
      const result = validateEntropyInputs('test-password', 'unsupported', { iteration: 4 });
      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Unsupported password type: unsupported');
    });

    it('should reject null config', () => {
      const result = validateEntropyInputs('test-password', PASSWORD_TYPES.DICEWARE, null);
      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Config must be an object');
    });

    it('should accumulate multiple errors', () => {
      const result = validateEntropyInputs(123, 456, null);
      expect(result.isValid).to.be.false;
      expect(result.errors).to.have.length(3);
      expect(result.errors).to.include('Password must be a string');
      expect(result.errors).to.include('Type must be a string');
      expect(result.errors).to.include('Config must be an object');
    });
  });

  // Edge cases and boundary conditions
  describe('Edge Cases', () => {
    it('should handle zero iteration gracefully', () => {
      const result = calculateDicewareEntropy({ iteration: 0 });
      expect(result).to.equal(0);
    });

    it('should handle very large iterations', () => {
      const result = calculateDicewareEntropy({ iteration: 1000 });
      const expected = 1000 * Math.log2(7776);
      expect(result).to.be.closeTo(expected, 0.001);
    });

    it('should handle single character custom charset', () => {
      const config = {
        allowedChars: 'a',
        length: 10,
        iteration: 1,
      };
      const result = calculateCustomEntropy(config);
      expect(result).to.equal(0); // log2(1) = 0
    });

    it('should handle forbidden chars that remove entire charset', () => {
      const config = {
        allowedChars: 'abc',
        forbiddenChars: 'abc',
        length: 10,
        iteration: 1,
      };
      const result = calculateCustomEntropy(config);
      expect(result).to.equal(0);
    });
  });
});
