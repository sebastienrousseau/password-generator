// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Node.js Crypto adapter for random number generation.
 *
 * This adapter provides cryptographically secure random number generation
 * using Node.js's built-in crypto module.
 *
 * @module NodeCryptoRandom
 */

import { randomBytes, randomInt } from "crypto";
import { RandomGeneratorPort } from "../../core/ports/RandomGeneratorPort.js";

/**
 * Node.js implementation of RandomGeneratorPort using the crypto module.
 */
export class NodeCryptoRandom extends RandomGeneratorPort {
  /**
   * Generates cryptographically secure random bytes.
   *
   * @param {number} byteLength - The number of random bytes to generate.
   * @returns {Promise<Uint8Array>} A promise resolving to random bytes.
   * @throws {RangeError} If byteLength is not a positive integer.
   */
  async generateRandomBytes(byteLength) {
    if (!Number.isInteger(byteLength) || byteLength < 1) {
      throw new RangeError("byteLength must be a positive integer");
    }
    return new Uint8Array(randomBytes(byteLength));
  }

  /**
   * Generates a cryptographically secure random integer in the range [0, max).
   *
   * @param {number} max - The exclusive upper bound for the random integer.
   * @returns {Promise<number>} A promise resolving to a random integer in [0, max).
   * @throws {RangeError} If max is not a positive integer.
   */
  async generateRandomInt(max) {
    if (!Number.isInteger(max) || max < 1) {
      throw new RangeError("max must be a positive integer");
    }
    return randomInt(max);
  }

  /**
   * Generates a random base64 string of the specified byte length.
   *
   * @param {number} byteLength - The number of random bytes to generate before encoding.
   * @returns {Promise<string>} A promise resolving to a base64-encoded random string.
   * @throws {RangeError} If byteLength is not a positive integer.
   */
  async generateRandomBase64(byteLength) {
    if (!Number.isInteger(byteLength) || byteLength < 1) {
      throw new RangeError("byteLength must be a positive integer");
    }
    return randomBytes(byteLength).toString("base64");
  }

  /**
   * Generates a random string of the exact character length using uniform
   * selection from the provided character set.
   *
   * @param {number} length - The desired character length of the output.
   * @param {string} charset - The character set to sample from.
   * @returns {Promise<string>} A promise resolving to a random string of exactly length characters.
   * @throws {RangeError} If length is not a positive integer or charset is empty.
   */
  async generateRandomString(length, charset) {
    if (!Number.isInteger(length) || length < 1) {
      throw new RangeError("length must be a positive integer");
    }
    if (!charset || charset.length === 0) {
      throw new RangeError("charset must not be empty");
    }

    let result = "";
    for (let i = 0; i < length; i++) {
      const index = randomInt(charset.length);
      result += charset[index];
    }
    return result;
  }

  /**
   * Validates the randomness quality of the implementation.
   *
   * @returns {Promise<boolean>} A promise resolving to true if validation passes.
   */
  async validateRandomnessQuality() {
    // Basic chi-squared test for uniformity
    const sampleSize = 10000;
    const buckets = new Array(256).fill(0);

    const bytes = await this.generateRandomBytes(sampleSize);
    for (const byte of bytes) {
      buckets[byte]++;
    }

    const expected = sampleSize / 256;
    let chiSquared = 0;
    for (const count of buckets) {
      chiSquared += Math.pow(count - expected, 2) / expected;
    }

    // Chi-squared critical value for 255 degrees of freedom at 0.01 significance
    const criticalValue = 310.46;
    return chiSquared < criticalValue;
  }
}

export default NodeCryptoRandom;
