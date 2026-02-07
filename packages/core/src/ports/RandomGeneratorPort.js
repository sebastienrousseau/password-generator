// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Port interface for cryptographically secure random number generation.
 *
 * This port abstracts the underlying cryptographic random generation
 * to enable testability and allow different implementations (Node.js crypto,
 * Web Crypto API, mock generators, etc.).
 *
 * All implementations MUST provide cryptographically secure randomness
 * suitable for password generation.
 *
 * @interface RandomGeneratorPort
 */
export class RandomGeneratorPort {
  /**
   * Generates cryptographically secure random bytes.
   *
   * @param {number} byteLength - The number of random bytes to generate.
   * @returns {Promise<Uint8Array>} A promise resolving to random bytes.
   * @throws {RangeError} If byteLength is not a positive integer.
   * @throws {Error} If random generation fails.
   * @abstract
   */
  async generateRandomBytes(_byteLength) {
    throw new Error('RandomGeneratorPort.generateRandomBytes() must be implemented');
  }

  /**
   * Generates a cryptographically secure random integer in the range [0, max).
   *
   * @param {number} max - The exclusive upper bound for the random integer.
   * @returns {Promise<number>} A promise resolving to a random integer in [0, max).
   * @throws {RangeError} If max is not a positive integer.
   * @throws {Error} If random generation fails.
   * @abstract
   */
  async generateRandomInt(_max) {
    throw new Error('RandomGeneratorPort.generateRandomInt() must be implemented');
  }

  /**
   * Generates a random base64 string of the specified byte length.
   *
   * @param {number} byteLength - The number of random bytes to generate before encoding.
   * @returns {Promise<string>} A promise resolving to a base64-encoded random string.
   * @throws {RangeError} If byteLength is not a positive integer.
   * @throws {Error} If random generation fails.
   * @abstract
   */
  async generateRandomBase64(_byteLength) {
    throw new Error('RandomGeneratorPort.generateRandomBase64() must be implemented');
  }

  /**
   * Generates a random string of the exact character length using uniform
   * selection from the provided character set.
   *
   * @param {number} length - The desired character length of the output.
   * @param {string} charset - The character set to sample from.
   * @returns {Promise<string>} A promise resolving to a random string of exactly length characters.
   * @throws {RangeError} If length is not a positive integer or charset is empty.
   * @throws {Error} If random generation fails.
   * @abstract
   */
  async generateRandomString(_length, _charset) {
    throw new Error('RandomGeneratorPort.generateRandomString() must be implemented');
  }
}

/**
 * Required methods for RandomGeneratorPort implementations.
 */
export const RANDOM_GENERATOR_REQUIRED_METHODS = ['generateRandomBytes', 'generateRandomInt'];

/**
 * Optional methods for RandomGeneratorPort implementations.
 */
export const RANDOM_GENERATOR_OPTIONAL_METHODS = ['generateRandomBase64', 'generateRandomString'];
