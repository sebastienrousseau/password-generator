// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Deterministic Mock Random Generator for Cross-Interface Parity Testing.
 *
 * This mock implementation produces predictable, reproducible random sequences
 * that are identical across all platforms (CLI, Web, Mobile). This is critical
 * for verifying that adapters produce identical outputs when given identical
 * inputs and random sequences.
 *
 * The implementation uses a seeded Linear Congruential Generator (LCG) that
 * is platform-independent and produces the same sequence in any JavaScript
 * environment.
 *
 * @module parity/MockRandomGenerator
 */

import { RandomGeneratorPort } from "../../src/ports/RandomGeneratorPort.js";

/**
 * Seeded random number generator constants (LCG parameters).
 * These are the same parameters used by the MINSTD generator.
 */
const LCG_MULTIPLIER = 48271;
const LCG_MODULUS = 2147483647; // 2^31 - 1

/**
 * Deterministic mock implementation of RandomGeneratorPort.
 *
 * This generator produces reproducible sequences based on:
 * 1. An initial seed value
 * 2. A predefined sequence (for simple tests)
 *
 * @extends RandomGeneratorPort
 */
export class MockRandomGenerator extends RandomGeneratorPort {
  /**
   * Creates a MockRandomGenerator.
   *
   * @param {Object} options - Configuration options.
   * @param {number} [options.seed] - Initial seed for LCG-based generation.
   * @param {number[]} [options.sequence] - Predefined sequence to cycle through.
   */
  constructor(options = {}) {
    super();

    if (options.sequence !== undefined) {
      // Mode 1: Predefined sequence (cycles through values)
      this.mode = "sequence";
      this.sequence = options.sequence;
      this.sequenceIndex = 0;
    } else {
      // Mode 2: Seeded LCG
      this.mode = "seeded";
      this.seed = options.seed ?? 12345;
      this.state = this.seed;
    }

    // Track call counts for debugging
    this.callCounts = {
      generateRandomInt: 0,
      generateRandomBytes: 0,
      generateRandomBase64: 0,
      generateRandomString: 0,
    };
  }

  /**
   * Gets the next value from the LCG.
   *
   * @returns {number} Next pseudo-random value in [0, LCG_MODULUS).
   * @private
   */
  _nextLCG() {
    this.state = (this.state * LCG_MULTIPLIER) % LCG_MODULUS;
    return this.state;
  }

  /**
   * Gets the next value from the sequence or LCG.
   *
   * @returns {number} Next value.
   * @private
   */
  _nextValue() {
    if (this.mode === "sequence") {
      const value = this.sequence[this.sequenceIndex];
      this.sequenceIndex = (this.sequenceIndex + 1) % this.sequence.length;
      return value;
    }
    return this._nextLCG();
  }

  /**
   * Resets the generator to its initial state.
   * Useful for re-running tests with the same sequence.
   */
  reset() {
    if (this.mode === "sequence") {
      this.sequenceIndex = 0;
    } else {
      this.state = this.seed;
    }
    this.callCounts = {
      generateRandomInt: 0,
      generateRandomBytes: 0,
      generateRandomBase64: 0,
      generateRandomString: 0,
    };
  }

  /**
   * Generates a random integer in [0, max).
   *
   * @param {number} max - Upper bound (exclusive).
   * @returns {Promise<number>} Random integer.
   * @throws {RangeError} If max is not a positive integer.
   */
  async generateRandomInt(max) {
    if (!Number.isInteger(max) || max < 1) {
      throw new RangeError("max must be a positive integer");
    }

    this.callCounts.generateRandomInt++;

    if (max === 1) {
      return 0;
    }

    const value = this._nextValue();
    return value % max;
  }

  /**
   * Generates random bytes.
   *
   * @param {number} byteLength - Number of bytes to generate.
   * @returns {Promise<Uint8Array>} Array of random bytes.
   * @throws {RangeError} If byteLength is not a positive integer.
   */
  async generateRandomBytes(byteLength) {
    if (!Number.isInteger(byteLength) || byteLength < 1) {
      throw new RangeError("byteLength must be a positive integer");
    }

    this.callCounts.generateRandomBytes++;

    const bytes = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = this._nextValue() % 256;
    }
    return bytes;
  }

  /**
   * Generates a random Base64 string.
   *
   * @param {number} byteLength - Number of bytes before encoding.
   * @returns {Promise<string>} Base64-encoded string.
   */
  async generateRandomBase64(byteLength) {
    this.callCounts.generateRandomBase64++;

    const bytes = await this.generateRandomBytes(byteLength);
    // Platform-independent Base64 encoding
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let result = "";
    for (let i = 0; i < bytes.length; i += 3) {
      const b1 = bytes[i];
      const b2 = bytes[i + 1] || 0;
      const b3 = bytes[i + 2] || 0;

      result += chars[b1 >> 2];
      result += chars[((b1 & 3) << 4) | (b2 >> 4)];
      if (i + 1 < bytes.length) {
        result += chars[((b2 & 15) << 2) | (b3 >> 6)];
      }
      if (i + 2 < bytes.length) {
        result += chars[b3 & 63];
      }
    }
    return result;
  }

  /**
   * Generates a random string from a charset.
   *
   * @param {number} length - String length.
   * @param {string} charset - Characters to choose from.
   * @returns {Promise<string>} Random string.
   */
  async generateRandomString(length, charset) {
    if (!Number.isInteger(length) || length < 1) {
      throw new RangeError("length must be a positive integer");
    }
    if (!charset || charset.length === 0) {
      throw new RangeError("charset must not be empty");
    }

    this.callCounts.generateRandomString++;

    let result = "";
    for (let i = 0; i < length; i++) {
      const index = await this.generateRandomInt(charset.length);
      result += charset[index];
    }
    return result;
  }

  /**
   * Gets the current call counts for debugging.
   *
   * @returns {Object} Call counts by method.
   */
  getCallCounts() {
    return { ...this.callCounts };
  }

  /**
   * Creates a generator with a specific seed for reproducible tests.
   *
   * @param {number} seed - Seed value.
   * @returns {MockRandomGenerator} New generator instance.
   */
  static withSeed(seed) {
    return new MockRandomGenerator({ seed });
  }

  /**
   * Creates a generator with a predefined sequence.
   *
   * @param {number[]} sequence - Sequence of values to cycle through.
   * @returns {MockRandomGenerator} New generator instance.
   */
  static withSequence(sequence) {
    return new MockRandomGenerator({ sequence });
  }

  /**
   * Creates a generator that produces an incrementing sequence.
   * Useful for predictable testing where each call returns 0, 1, 2, ...
   *
   * @param {number} [start=0] - Starting value.
   * @param {number} [count=1000] - Number of values in sequence.
   * @returns {MockRandomGenerator} New generator instance.
   */
  static incrementing(start = 0, count = 1000) {
    const sequence = Array.from({ length: count }, (_, i) => start + i);
    return new MockRandomGenerator({ sequence });
  }
}

/**
 * Standard parity test seeds.
 * These seeds should be used consistently across all adapter parity tests.
 */
export const PARITY_SEEDS = {
  // Primary parity seed - use for most tests
  PRIMARY: 42,
  // Secondary seed for comparison tests
  SECONDARY: 7777,
  // Edge case seed (produces boundary values)
  EDGE_CASE: 65536,
  // Stress test seed
  STRESS: 123456789,
};

export default MockRandomGenerator;
