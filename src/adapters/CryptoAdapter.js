// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { randomBytes, randomInt } from "crypto";
import { BASE64_CHARSET } from "../constants.js";
import { CRYPTO_ERRORS } from "../errors.js";
import {
  recordEntropyUsage,
  recordAlgorithmUsage,
  calculateBase64Entropy,
  calculateBase64ChunkEntropy,
} from "../utils/security-audit.js";

/**
 * Validates that a value is a positive integer, throwing a RangeError if not.
 *
 * @param {*} value The value to validate.
 * @param {string} name The parameter name for the error message.
 * @throws {RangeError} If value is not a positive integer.
 */
const validatePositiveInteger = (value, name) => {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(CRYPTO_ERRORS.MUST_BE_POSITIVE_INTEGER(name));
  }
};

/**
 * Default crypto adapter implementation using Node.js built-in crypto module.
 *
 * This adapter provides cryptographically secure random number and byte generation
 * for password generation algorithms, with comprehensive entropy tracking and audit.
 *
 * @class DefaultCryptoAdapter
 */
export class DefaultCryptoAdapter {
  /**
   * Generates cryptographically secure random bytes.
   *
   * @param {number} byteLength The number of random bytes to generate.
   * @returns {Buffer} The generated random bytes.
   * @throws {RangeError} If byteLength is not a positive integer.
   */
  generateRandomBytes(byteLength) {
    validatePositiveInteger(byteLength, "byteLength");
    return randomBytes(byteLength);
  }

  /**
   * Generates a cryptographically secure random integer.
   *
   * @param {number} min The minimum value (inclusive).
   * @param {number} max The maximum value (exclusive).
   * @returns {number} A random integer in [min, max).
   */
  generateRandomInt(min, max) {
    return randomInt(min, max);
  }

  /**
   * Generates a random base64 string of the specified byte length.
   *
   * @param {number} byteLength The number of random bytes to generate.
   * @returns {string} The generated base64 string.
   * @throws {RangeError} If byteLength is not a positive integer.
   */
  generateRandomBase64(byteLength) {
    validatePositiveInteger(byteLength, "byteLength");
    const result = this.generateRandomBytes(byteLength).toString("base64");

    // Record entropy usage for audit
    recordEntropyUsage("crypto.randomBytes", 1, calculateBase64Entropy(byteLength), {
      byteLength,
      outputLength: result.length,
      method: "base64-encoding",
    });
    recordAlgorithmUsage("base64-password-generation", {
      byteLength,
      encoding: "base64",
    });

    return result;
  }

  /**
   * Generates a random string of the exact character length using uniform
   * selection from the base64 character set. Each character is independently
   * chosen via crypto.randomInt() to avoid the bias introduced by slicing
   * base64-encoded byte strings.
   *
   * @param {number} length The desired character length of the output.
   * @returns {string} A random string of exactly `length` characters.
   * @throws {RangeError} If length is not a positive integer.
   */
  generateBase64Chunk(length) {
    validatePositiveInteger(length, "length");
    let result = "";
    for (let i = 0; i < length; i++) {
      result += BASE64_CHARSET[this.generateRandomInt(0, BASE64_CHARSET.length)];
    }

    // Record entropy usage for audit
    recordEntropyUsage("crypto.randomInt", length, calculateBase64ChunkEntropy(length), {
      charsetSize: BASE64_CHARSET.length,
      outputLength: length,
      method: "character-by-character",
    });
    recordAlgorithmUsage("base64-chunk-generation", {
      charsetSize: BASE64_CHARSET.length,
      outputLength: length,
    });

    return result;
  }

  /**
   * Generates a cryptographically secure random number within a range.
   *
   * @param {number} max The upper bound (exclusive) for the random number.
   * @param {number} min The lower bound (inclusive) for the random number (optional, defaults to 0).
   * @returns {number} A cryptographically secure random integer in [min, max).
   * @throws {RangeError} If max <= min (when min is explicitly provided and >= max).
   * @throws {TypeError} If max or min are not numbers.
   */
  randomNumber(max, min = 0) {
    if (max === min) {
      return min;
    }
    const result = this.generateRandomInt(min, max);

    // Record entropy usage for audit (range size determines bits of entropy)
    const rangeSize = max - min;
    const entropyBits = Math.log2(rangeSize);
    recordEntropyUsage("crypto.randomInt", 1, entropyBits, {
      min,
      max,
      rangeSize,
      result,
    });

    return result;
  }

  /**
   * Validates that a value is a positive integer, throwing a RangeError if not.
   *
   * @param {*} value The value to validate.
   * @param {string} name The parameter name for the error message.
   * @throws {RangeError} If value is not a positive integer.
   */
  validatePositiveInteger(value, name) {
    return validatePositiveInteger(value, name);
  }

  /**
   * Splits a string into substrings of the specified length.
   *
   * @param {string} str The string to split.
   * @param {number} length The length of each substring.
   * @returns {Array<string>} The array of substrings.
   * @throws {RangeError} If length is not a positive integer.
   */
  splitString(str, length) {
    validatePositiveInteger(length, "length");
    const substrings = str.match(new RegExp(`.{1,${length}}`, "g"));
    return substrings || [];
  }
}

/**
 * Mock crypto adapter for testing purposes.
 * Provides predictable deterministic output for testing scenarios.
 *
 * @class MockCryptoAdapter
 */
export class MockCryptoAdapter {
  constructor(seedValue = 42) {
    this.seedValue = seedValue;
    this.counter = 0;
  }

  generateRandomBytes(byteLength) {
    validatePositiveInteger(byteLength, "byteLength");
    const buffer = Buffer.alloc(byteLength);
    for (let i = 0; i < byteLength; i++) {
      buffer[i] = (this.seedValue + this.counter++) % 256;
    }
    return buffer;
  }

  generateRandomInt(min, max) {
    this.counter++;
    return min + ((this.seedValue + this.counter) % (max - min));
  }

  generateRandomBase64(byteLength) {
    validatePositiveInteger(byteLength, "byteLength");
    return this.generateRandomBytes(byteLength).toString("base64");
  }

  generateBase64Chunk(length) {
    validatePositiveInteger(length, "length");
    let result = "";
    for (let i = 0; i < length; i++) {
      result += BASE64_CHARSET[this.generateRandomInt(0, BASE64_CHARSET.length)];
    }
    return result;
  }

  randomNumber(max, min = 0) {
    if (max === min) {
      return min;
    }
    return this.generateRandomInt(min, max);
  }

  validatePositiveInteger(value, name) {
    return validatePositiveInteger(value, name);
  }

  splitString(str, length) {
    validatePositiveInteger(length, "length");
    const substrings = str.match(new RegExp(`.{1,${length}}`, "g"));
    return substrings || [];
  }
}

export default DefaultCryptoAdapter;
