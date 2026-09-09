// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  ENTROPY_CONSTANTS,
  calculateBase64Entropy,
  calculateBase64ChunkEntropy,
  calculateDictionaryEntropy,
  calculateCharsetEntropy,
  calculateSyllableEntropy,
  getSecurityLevel,
  getSecurityRecommendation,
  calculateTotalEntropy,
} from '../../src/domain/entropy-calculator.js';

describe('Domain: entropy-calculator', () => {
  describe('ENTROPY_CONSTANTS', () => {
    it('should have BASE64_BITS_PER_CHAR equal to 6', () => {
      expect(ENTROPY_CONSTANTS.BASE64_BITS_PER_CHAR).to.equal(6);
    });

    it('should have DICTIONARY_ENTRIES as null initially', () => {
      expect(ENTROPY_CONSTANTS.DICTIONARY_ENTRIES).to.be.null;
    });
  });

  describe('calculateBase64Entropy', () => {
    it('should return 8 bits for 1 byte', () => {
      expect(calculateBase64Entropy(1)).to.equal(8);
    });

    it('should return 16 bits for 2 bytes', () => {
      expect(calculateBase64Entropy(2)).to.equal(16);
    });

    it('should return 128 bits for 16 bytes', () => {
      expect(calculateBase64Entropy(16)).to.equal(128);
    });

    it('should return 256 bits for 32 bytes', () => {
      expect(calculateBase64Entropy(32)).to.equal(256);
    });

    it('should scale linearly with byte length', () => {
      const bytes1 = calculateBase64Entropy(10);
      const bytes2 = calculateBase64Entropy(20);
      expect(bytes2).to.equal(bytes1 * 2);
    });
  });

  describe('calculateBase64ChunkEntropy', () => {
    it('should return 6 bits for 1 character', () => {
      expect(calculateBase64ChunkEntropy(1)).to.equal(6);
    });

    it('should return 96 bits for 16 characters', () => {
      expect(calculateBase64ChunkEntropy(16)).to.equal(96);
    });

    it('should scale linearly with character length', () => {
      const entropy1 = calculateBase64ChunkEntropy(5);
      const entropy2 = calculateBase64ChunkEntropy(10);
      expect(entropy2).to.equal(entropy1 * 2);
    });
  });

  describe('calculateDictionaryEntropy', () => {
    it('should calculate correctly for 7776 word dictionary (EFF Diceware)', () => {
      // 1 word from 7776 = log2(7776) bits
      const bitsPerWord = Math.log2(7776);
      expect(calculateDictionaryEntropy(7776, 1)).to.be.closeTo(bitsPerWord, 0.0001);
    });

    it('should calculate correctly for 4 words from 7776 dictionary', () => {
      const expected = 4 * Math.log2(7776);
      expect(calculateDictionaryEntropy(7776, 4)).to.be.closeTo(expected, 0.0001);
    });

    it('should calculate correctly for 6 words from 7776 dictionary', () => {
      const expected = 6 * Math.log2(7776);
      expect(calculateDictionaryEntropy(7776, 6)).to.be.closeTo(expected, 0.0001);
    });

    it('should scale linearly with word count', () => {
      const entropy3 = calculateDictionaryEntropy(7776, 3);
      const entropy6 = calculateDictionaryEntropy(7776, 6);
      expect(entropy6).to.be.closeTo(entropy3 * 2, 0.0001);
    });

    it('should scale logarithmically with dictionary size', () => {
      const entropy1 = calculateDictionaryEntropy(1000, 4);
      const entropy2 = calculateDictionaryEntropy(10000, 4);
      // log2(10000) / log2(1000) ratio
      expect(entropy2).to.be.greaterThan(entropy1);
    });
  });

  describe('calculateCharsetEntropy', () => {
    it('should return 6 bits per character for charset size 64', () => {
      expect(calculateCharsetEntropy(64, 1)).to.equal(6);
    });

    it('should return correct entropy for charset size 95 (printable ASCII)', () => {
      const expected = Math.log2(95) * 10;
      expect(calculateCharsetEntropy(95, 10)).to.be.closeTo(expected, 0.0001);
    });

    it('should scale linearly with length', () => {
      const entropy5 = calculateCharsetEntropy(64, 5);
      const entropy10 = calculateCharsetEntropy(64, 10);
      expect(entropy10).to.equal(entropy5 * 2);
    });
  });

  describe('calculateSyllableEntropy', () => {
    it('should calculate entropy based on 2205 syllable combinations', () => {
      // CVC pattern: 21 * 5 * 21 = 2205 combinations
      const bitsPerSyllable = Math.log2(2205);
      expect(calculateSyllableEntropy(1)).to.be.closeTo(bitsPerSyllable, 0.0001);
    });

    it('should scale linearly with syllable count', () => {
      const entropy2 = calculateSyllableEntropy(2);
      const entropy4 = calculateSyllableEntropy(4);
      expect(entropy4).to.be.closeTo(entropy2 * 2, 0.0001);
    });

    it('should calculate approximately 11.1 bits per syllable', () => {
      // log2(2205) is approximately 11.1
      expect(calculateSyllableEntropy(1)).to.be.closeTo(11.1, 0.1);
    });
  });

  describe('getSecurityLevel', () => {
    it('should return EXCELLENT for 256+ bits', () => {
      expect(getSecurityLevel(256)).to.include('EXCELLENT');
      expect(getSecurityLevel(300)).to.include('EXCELLENT');
      expect(getSecurityLevel(512)).to.include('EXCELLENT');
    });

    it('should return STRONG for 128-255 bits', () => {
      expect(getSecurityLevel(128)).to.include('STRONG');
      expect(getSecurityLevel(200)).to.include('STRONG');
      expect(getSecurityLevel(255)).to.include('STRONG');
    });

    it('should return GOOD for 80-127 bits', () => {
      expect(getSecurityLevel(80)).to.include('GOOD');
      expect(getSecurityLevel(100)).to.include('GOOD');
      expect(getSecurityLevel(127)).to.include('GOOD');
    });

    it('should return MODERATE for 64-79 bits', () => {
      expect(getSecurityLevel(64)).to.include('MODERATE');
      expect(getSecurityLevel(70)).to.include('MODERATE');
      expect(getSecurityLevel(79)).to.include('MODERATE');
    });

    it('should return WEAK for less than 64 bits', () => {
      expect(getSecurityLevel(0)).to.include('WEAK');
      expect(getSecurityLevel(32)).to.include('WEAK');
      expect(getSecurityLevel(63)).to.include('WEAK');
    });
  });

  describe('getSecurityRecommendation', () => {
    it('should recommend excellent security for 128+ bits', () => {
      const rec = getSecurityRecommendation(128);
      expect(rec).to.include('Excellent');
      expect(rec).to.include('high-security');
    });

    it('should recommend good security for 80-127 bits', () => {
      const rec = getSecurityRecommendation(80);
      expect(rec).to.include('Good');
    });

    it('should recommend increasing length for less than 80 bits', () => {
      const rec = getSecurityRecommendation(64);
      expect(rec).to.include('increasing');
    });

    it('should recommend increasing length for weak passwords', () => {
      const rec = getSecurityRecommendation(32);
      expect(rec).to.include('increasing');
    });
  });

  describe('calculateTotalEntropy', () => {
    describe('strong type', () => {
      it('should calculate entropy for strong password with defaults', () => {
        const entropy = calculateTotalEntropy({
          type: 'strong',
          length: 16,
          iteration: 1,
        });
        expect(entropy).to.equal(96); // 16 * 6 bits
      });

      it('should scale with iteration count', () => {
        const entropy = calculateTotalEntropy({
          type: 'strong',
          length: 16,
          iteration: 4,
        });
        expect(entropy).to.equal(384); // 16 * 6 * 4 bits
      });
    });

    describe('base64 type', () => {
      it('should calculate entropy for base64 password', () => {
        const entropy = calculateTotalEntropy({
          type: 'base64',
          length: 16,
          iteration: 1,
        });
        expect(entropy).to.equal(96); // 16 * 6 bits
      });

      it('should handle multiple iterations', () => {
        const entropy = calculateTotalEntropy({
          type: 'base64',
          length: 8,
          iteration: 2,
        });
        expect(entropy).to.equal(96); // 8 * 6 * 2 bits
      });
    });

    describe('memorable type', () => {
      it('should calculate entropy using default dictionary size', () => {
        const entropy = calculateTotalEntropy({
          type: 'memorable',
          iteration: 4,
        });
        const expected = 4 * Math.log2(7776);
        expect(entropy).to.be.closeTo(expected, 0.0001);
      });

      it('should use custom dictionary size when provided', () => {
        const entropy = calculateTotalEntropy({
          type: 'memorable',
          iteration: 4,
          dictionarySize: 10000,
        });
        const expected = 4 * Math.log2(10000);
        expect(entropy).to.be.closeTo(expected, 0.0001);
      });
    });

    describe('unknown type', () => {
      it('should return 0 for unknown password types', () => {
        const entropy = calculateTotalEntropy({
          type: 'unknown',
          length: 16,
          iteration: 1,
        });
        expect(entropy).to.equal(0);
      });
    });

    describe('default values', () => {
      it('should use default length of 16', () => {
        const entropy = calculateTotalEntropy({
          type: 'strong',
          iteration: 1,
        });
        expect(entropy).to.equal(96); // 16 * 6 bits
      });

      it('should use default iteration of 1', () => {
        const entropy = calculateTotalEntropy({
          type: 'strong',
          length: 16,
        });
        expect(entropy).to.equal(96); // 16 * 6 * 1 bits
      });

      it('should use default dictionary size of 7776', () => {
        const entropy = calculateTotalEntropy({
          type: 'memorable',
          iteration: 1,
        });
        expect(entropy).to.be.closeTo(Math.log2(7776), 0.0001);
      });
    });
  });
});
