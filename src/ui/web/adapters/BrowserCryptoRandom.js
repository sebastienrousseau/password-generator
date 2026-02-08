// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Browser implementation of RandomGeneratorPort using Web Crypto API.
 *
 * This adapter provides cryptographically secure random number generation
 * for browser environments using the Web Crypto API.
 */

import { RandomGeneratorPort } from '../../../../packages/core/src/ports/RandomGeneratorPort.js';

/**
 * Browser-based cryptographically secure random generator.
 * Implements RandomGeneratorPort for Web Crypto API.
 */
export class BrowserCryptoRandom extends RandomGeneratorPort {
  /**
   * Generates cryptographically secure random bytes.
   *
   * @param {number} byteLength - Number of bytes to generate.
   * @returns {Promise<Uint8Array>} Array of random bytes.
   * @throws {RangeError} If byteLength is not a positive integer.
   * @throws {Error} If Web Crypto API is not available.
   */
  async generateRandomBytes(byteLength) {
    if (!Number.isInteger(byteLength) || byteLength < 1) {
      throw new RangeError('byteLength must be a positive integer');
    }

    if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
      throw new Error('Web Crypto API is not available');
    }

    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  /**
   * Generates a cryptographically secure random integer in range [0, max).
   *
   * Uses rejection sampling to ensure unbiased distribution.
   *
   * @param {number} max - Upper bound (exclusive).
   * @returns {Promise<number>} Random integer in [0, max).
   * @throws {RangeError} If max is not a positive integer.
   */
  async generateRandomInt(max) {
    if (!Number.isInteger(max) || max < 1) {
      throw new RangeError('max must be a positive integer');
    }

    if (max === 1) {
      return 0;
    }

    // Calculate bytes needed to represent max
    const bytesNeeded = Math.ceil(Math.log2(max + 1) / 8) || 1;
    const maxValue = Math.floor(256 ** bytesNeeded / max) * max;

    // Rejection sampling for unbiased distribution
    let randomValue;
    do {
      const randomBytes = new Uint8Array(bytesNeeded);
      crypto.getRandomValues(randomBytes);
      randomValue = randomBytes.reduce((acc, byte) => acc * 256 + byte, 0);
    } while (randomValue >= maxValue);

    return randomValue % max;
  }

  /**
   * Generates a random Base64-encoded string.
   *
   * @param {number} byteLength - Number of random bytes to encode.
   * @returns {Promise<string>} Base64-encoded random string.
   */
  async generateRandomBase64(byteLength) {
    const bytes = await this.generateRandomBytes(byteLength);
    // Convert Uint8Array to binary string, then to Base64
    const binaryString = Array.from(bytes)
      .map((byte) => String.fromCharCode(byte))
      .join('');
    return btoa(binaryString);
  }

  /**
   * Generates a random string from a given character set.
   *
   * @param {number} length - Length of string to generate.
   * @param {string} charset - Characters to choose from.
   * @returns {Promise<string>} Random string of specified length.
   * @throws {RangeError} If length is not positive or charset is empty.
   */
  async generateRandomString(length, charset) {
    if (!Number.isInteger(length) || length < 1) {
      throw new RangeError('length must be a positive integer');
    }
    if (!charset || charset.length === 0) {
      throw new RangeError('charset must not be empty');
    }

    let result = '';
    for (let i = 0; i < length; i++) {
      const index = await this.generateRandomInt(charset.length);
      result += charset[index];
    }
    return result;
  }
}
