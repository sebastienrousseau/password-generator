// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Web Crypto API adapter for random number generation in browser environments.
 *
 * This adapter provides browser-compatible alternatives to Node.js crypto functions
 * using the Web Crypto API's getRandomValues method.
 *
 * @module WebCryptoRandom
 */

import { RandomGeneratorPort } from '../../../packages/core/src/ports/index.js';

/**
 * Generates cryptographically secure random bytes using the Web Crypto API.
 * Browser equivalent of Node.js crypto.randomBytes().
 *
 * @param {number} size The number of random bytes to generate.
 * @return {Uint8Array} The generated random bytes.
 * @throws {RangeError} If size is not a positive integer.
 * @throws {Error} If Web Crypto API is not available.
 */
export const randomBytes = (size) => {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError('size must be a positive integer');
  }

  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw new Error('Web Crypto API is not available in this environment');
  }

  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytes;
};

/**
 * Generates a cryptographically secure random integer in the range [0, max).
 * Browser equivalent of Node.js crypto.randomInt().
 *
 * @param {number} max The upper bound (exclusive) for the random integer.
 * @return {number} A random integer in the range [0, max).
 * @throws {RangeError} If max is not a positive integer.
 * @throws {Error} If Web Crypto API is not available.
 */
export const randomInt = (max) => {
  if (!Number.isInteger(max) || max < 1) {
    throw new RangeError('max must be a positive integer');
  }

  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw new Error('Web Crypto API is not available in this environment');
  }

  // Calculate the number of bytes needed to represent max
  const bytesNeeded = Math.ceil(Math.log2(max) / 8);

  // Create a buffer to avoid bias in random number generation
  const maxValue = Math.floor(256 ** bytesNeeded / max) * max;

  let randomValue;
  do {
    const randomBytes = new Uint8Array(bytesNeeded);
    crypto.getRandomValues(randomBytes);

    // Convert bytes to integer
    randomValue = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = randomValue * 256 + randomBytes[i];
    }
  } while (randomValue >= maxValue); // Reject if outside unbiased range

  return randomValue % max;
};

/**
 * Converts Web Crypto API Uint8Array to base64 string.
 * Browser equivalent of Node.js Buffer.toString('base64').
 *
 * @param {Uint8Array} bytes The byte array to convert.
 * @return {string} The base64 encoded string.
 */
export const bytesToBase64 = (bytes) => {
  if (typeof btoa !== 'undefined') {
    // Use built-in btoa if available (modern browsers)
    return btoa(String.fromCharCode.apply(null, bytes));
  }

  // Fallback implementation for environments without btoa
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';

  for (let j = 0; j < bytes.length; j += 3) {
    const a = bytes[j];
    const b = j + 1 < bytes.length ? bytes[j + 1] : 0;
    const c = j + 2 < bytes.length ? bytes[j + 2] : 0;

    const group = (a << 16) | (b << 8) | c;

    result += base64Chars[(group >> 18) & 63];
    result += base64Chars[(group >> 12) & 63];
    result += j + 1 < bytes.length ? base64Chars[(group >> 6) & 63] : '=';
    result += j + 2 < bytes.length ? base64Chars[group & 63] : '=';
  }

  return result;
};

/**
 * Web Crypto Random adapter that provides Node.js crypto-compatible interface.
 */
export const WebCryptoRandom = {
  randomBytes,
  randomInt,
  bytesToBase64,
};

/**
 * Web Crypto API implementation of RandomGeneratorPort.
 *
 * This class provides a consistent interface for cryptographically secure
 * random number generation in browser environments, matching the architecture
 * of NodeCryptoRandom for consistency across adapters.
 */
export class WebCryptoRandomAdapter extends RandomGeneratorPort {
  /**
   * Generates cryptographically secure random bytes.
   *
   * @param {number} byteLength - The number of random bytes to generate.
   * @returns {Promise<Uint8Array>} A promise resolving to random bytes.
   * @throws {RangeError} If byteLength is not a positive integer.
   * @throws {Error} If Web Crypto API is not available.
   */
  async generateRandomBytes(byteLength) {
    return randomBytes(byteLength);
  }

  /**
   * Generates a cryptographically secure random integer in the range [0, max).
   *
   * @param {number} max - The exclusive upper bound for the random integer.
   * @returns {Promise<number>} A promise resolving to a random integer in [0, max).
   * @throws {RangeError} If max is not a positive integer.
   * @throws {Error} If Web Crypto API is not available.
   */
  async generateRandomInt(max) {
    return randomInt(max);
  }

  /**
   * Generates a random base64 string of the specified byte length.
   *
   * @param {number} byteLength - The number of random bytes to generate before encoding.
   * @returns {Promise<string>} A promise resolving to a base64-encoded random string.
   * @throws {RangeError} If byteLength is not a positive integer.
   * @throws {Error} If Web Crypto API is not available.
   */
  async generateRandomBase64(byteLength) {
    const bytes = randomBytes(byteLength);
    return bytesToBase64(bytes);
  }

  /**
   * Generates a random string of the exact character length using uniform
   * selection from the provided character set.
   *
   * @param {number} length - The desired character length of the output.
   * @param {string} charset - The character set to sample from.
   * @returns {Promise<string>} A promise resolving to a random string of exactly length characters.
   * @throws {RangeError} If length is not a positive integer or charset is empty.
   * @throws {Error} If Web Crypto API is not available.
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

export default WebCryptoRandom;
