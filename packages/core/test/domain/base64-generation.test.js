// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  validatePositiveInteger,
  isValidBase64,
  splitString,
  calculateBase64Length,
  calculateRequiredByteLength,
  BASE64_DOMAIN_RULES,
} from '../../src/domain/base64-generation.js';

describe('Domain: base64-generation', () => {
  describe('validatePositiveInteger', () => {
    it('should not throw for positive integers', () => {
      expect(() => validatePositiveInteger(1, 'test')).to.not.throw();
      expect(() => validatePositiveInteger(10, 'test')).to.not.throw();
      expect(() => validatePositiveInteger(1000, 'test')).to.not.throw();
    });

    it('should throw RangeError for zero', () => {
      expect(() => validatePositiveInteger(0, 'count')).to.throw(RangeError, 'count');
    });

    it('should throw RangeError for negative numbers', () => {
      expect(() => validatePositiveInteger(-1, 'length')).to.throw(RangeError, 'length');
      expect(() => validatePositiveInteger(-100, 'size')).to.throw(RangeError, 'size');
    });

    it('should throw RangeError for non-integers', () => {
      expect(() => validatePositiveInteger(1.5, 'value')).to.throw(RangeError, 'value');
      expect(() => validatePositiveInteger(0.1, 'num')).to.throw(RangeError, 'num');
    });

    it('should throw RangeError for non-numbers', () => {
      expect(() => validatePositiveInteger('5', 'param')).to.throw(RangeError);
      expect(() => validatePositiveInteger(null, 'param')).to.throw(RangeError);
      expect(() => validatePositiveInteger(undefined, 'param')).to.throw(RangeError);
      expect(() => validatePositiveInteger({}, 'param')).to.throw(RangeError);
    });

    it('should include parameter name in error message', () => {
      try {
        validatePositiveInteger(-1, 'byteLength');
      } catch (e) {
        expect(e.message).to.include('byteLength');
      }
    });
  });

  describe('isValidBase64', () => {
    it('should return true for valid base64 strings', () => {
      expect(isValidBase64('SGVsbG8=')).to.be.true;
      expect(isValidBase64('SGVsbG8gV29ybGQ=')).to.be.true;
      expect(isValidBase64('YWJjZA==')).to.be.true;
    });

    it('should return true for base64 without padding', () => {
      expect(isValidBase64('SGVsbG8')).to.be.true;
      expect(isValidBase64('ABCD')).to.be.true;
      expect(isValidBase64('abcd1234')).to.be.true;
    });

    it('should return true for base64 with + and /', () => {
      expect(isValidBase64('AB+/CD')).to.be.true;
      expect(isValidBase64('a+b/c+d/')).to.be.true;
    });

    it('should return true for empty string', () => {
      expect(isValidBase64('')).to.be.true;
    });

    it('should return false for non-string types', () => {
      expect(isValidBase64(123)).to.be.false;
      expect(isValidBase64(null)).to.be.false;
      expect(isValidBase64(undefined)).to.be.false;
      expect(isValidBase64({})).to.be.false;
      expect(isValidBase64([])).to.be.false;
    });

    it('should return false for invalid characters', () => {
      expect(isValidBase64('Hello!')).to.be.false;
      expect(isValidBase64('ABC@DEF')).to.be.false;
      expect(isValidBase64('Test#123')).to.be.false;
    });

    it('should return false for padding not at end', () => {
      expect(isValidBase64('=ABC')).to.be.false;
      expect(isValidBase64('AB=CD')).to.be.false;
    });

    it('should return false for more than 2 padding characters', () => {
      expect(isValidBase64('ABC===')).to.be.false;
      expect(isValidBase64('A====')).to.be.false;
    });

    it('should accept single padding character', () => {
      expect(isValidBase64('ABC=')).to.be.true;
    });

    it('should accept double padding characters', () => {
      expect(isValidBase64('AB==')).to.be.true;
    });

    it('should handle edge cases with padding', () => {
      // Single = at end (valid)
      expect(isValidBase64('Q==')).to.be.true;
      // Just = characters (valid per regex)
      expect(isValidBase64('=')).to.be.true;
      expect(isValidBase64('==')).to.be.true;
      // More extensive base64 examples
      expect(isValidBase64('SGVsbG8gV29ybGQh')).to.be.true;
    });
  });

  describe('splitString', () => {
    it('should split string into chunks of specified length', () => {
      const result = splitString('ABCDEFGHIJ', 2);
      expect(result).to.deep.equal(['AB', 'CD', 'EF', 'GH', 'IJ']);
    });

    it('should handle remainder correctly', () => {
      const result = splitString('ABCDEFG', 3);
      expect(result).to.deep.equal(['ABC', 'DEF', 'G']);
    });

    it('should return single chunk for short strings', () => {
      const result = splitString('ABC', 10);
      expect(result).to.deep.equal(['ABC']);
    });

    it('should return empty array for empty string', () => {
      const result = splitString('', 5);
      expect(result).to.deep.equal([]);
    });

    it('should split into single characters when length is 1', () => {
      const result = splitString('ABCD', 1);
      expect(result).to.deep.equal(['A', 'B', 'C', 'D']);
    });

    it('should throw RangeError for zero length', () => {
      expect(() => splitString('ABC', 0)).to.throw(RangeError);
    });

    it('should throw RangeError for negative length', () => {
      expect(() => splitString('ABC', -1)).to.throw(RangeError);
    });

    it('should throw RangeError for non-integer length', () => {
      expect(() => splitString('ABC', 2.5)).to.throw(RangeError);
    });

    it('should handle large strings', () => {
      const largeString = 'A'.repeat(100);
      const result = splitString(largeString, 10);
      expect(result).to.have.lengthOf(10);
      expect(result.every((chunk) => chunk.length === 10)).to.be.true;
    });
  });

  describe('calculateBase64Length', () => {
    it('should return 4 for 1-3 bytes', () => {
      expect(calculateBase64Length(1)).to.equal(4);
      expect(calculateBase64Length(2)).to.equal(4);
      expect(calculateBase64Length(3)).to.equal(4);
    });

    it('should return 8 for 4-6 bytes', () => {
      expect(calculateBase64Length(4)).to.equal(8);
      expect(calculateBase64Length(5)).to.equal(8);
      expect(calculateBase64Length(6)).to.equal(8);
    });

    it('should follow 4*(ceil(n/3)) formula', () => {
      expect(calculateBase64Length(7)).to.equal(12);
      expect(calculateBase64Length(9)).to.equal(12);
      expect(calculateBase64Length(10)).to.equal(16);
    });

    it('should handle larger byte lengths', () => {
      expect(calculateBase64Length(16)).to.equal(24);
      expect(calculateBase64Length(32)).to.equal(44);
    });

    it('should throw RangeError for zero', () => {
      expect(() => calculateBase64Length(0)).to.throw(RangeError);
    });

    it('should throw RangeError for negative numbers', () => {
      expect(() => calculateBase64Length(-1)).to.throw(RangeError);
    });

    it('should throw RangeError for non-integers', () => {
      expect(() => calculateBase64Length(1.5)).to.throw(RangeError);
    });
  });

  describe('calculateRequiredByteLength', () => {
    it('should return 1 for base64 length 1', () => {
      expect(calculateRequiredByteLength(1)).to.equal(1);
    });

    it('should return 3 for base64 length 4', () => {
      expect(calculateRequiredByteLength(4)).to.equal(3);
    });

    it('should return 6 for base64 length 8', () => {
      expect(calculateRequiredByteLength(8)).to.equal(6);
    });

    it('should follow ceil(length * 3 / 4) formula', () => {
      expect(calculateRequiredByteLength(5)).to.equal(4);
      expect(calculateRequiredByteLength(10)).to.equal(8);
      expect(calculateRequiredByteLength(16)).to.equal(12);
    });

    it('should throw RangeError for zero', () => {
      expect(() => calculateRequiredByteLength(0)).to.throw(RangeError);
    });

    it('should throw RangeError for negative numbers', () => {
      expect(() => calculateRequiredByteLength(-1)).to.throw(RangeError);
    });

    it('should throw RangeError for non-integers', () => {
      expect(() => calculateRequiredByteLength(1.5)).to.throw(RangeError);
    });

    it('should be inverse-related to calculateBase64Length', () => {
      // The base64 length of N bytes should decode to at least N bytes
      for (let bytes = 1; bytes <= 20; bytes++) {
        const base64Len = calculateBase64Length(bytes);
        const requiredBytes = calculateRequiredByteLength(base64Len);
        expect(requiredBytes).to.be.at.least(bytes);
      }
    });
  });

  describe('BASE64_DOMAIN_RULES', () => {
    it('should have MIN_BYTE_LENGTH of 1', () => {
      expect(BASE64_DOMAIN_RULES.MIN_BYTE_LENGTH).to.equal(1);
    });

    it('should have MAX_BYTE_LENGTH of 1024', () => {
      expect(BASE64_DOMAIN_RULES.MAX_BYTE_LENGTH).to.equal(1024);
    });

    it('should have MIN_CHUNK_LENGTH of 1', () => {
      expect(BASE64_DOMAIN_RULES.MIN_CHUNK_LENGTH).to.equal(1);
    });

    it('should have MAX_CHUNK_LENGTH of 1024', () => {
      expect(BASE64_DOMAIN_RULES.MAX_CHUNK_LENGTH).to.equal(1024);
    });

    it('should have CHARSET_SIZE of 64', () => {
      expect(BASE64_DOMAIN_RULES.CHARSET_SIZE).to.equal(64);
    });

    it('should have BITS_PER_CHARACTER of 6', () => {
      expect(BASE64_DOMAIN_RULES.BITS_PER_CHARACTER).to.equal(6);
    });

    it('should have BYTES_PER_CHUNK of 3', () => {
      expect(BASE64_DOMAIN_RULES.BYTES_PER_CHUNK).to.equal(3);
    });

    it('should have CHARS_PER_CHUNK of 4', () => {
      expect(BASE64_DOMAIN_RULES.CHARS_PER_CHUNK).to.equal(4);
    });

    it('should have consistent encoding ratio', () => {
      expect(
        BASE64_DOMAIN_RULES.CHARS_PER_CHUNK / BASE64_DOMAIN_RULES.BYTES_PER_CHUNK
      ).to.be.closeTo(4 / 3, 0.0001);
    });
  });
});
