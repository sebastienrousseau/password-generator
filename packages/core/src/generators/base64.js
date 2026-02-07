// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure generator for base64 passwords.
 * All randomness is provided through the injected random generator port.
 *
 * @module generators/base64
 */

import { BASE64_CHARSET } from '../domain/charset.js';
import { validatePositiveInteger } from '../domain/base64-generation.js';

/**
 * Generates a single chunk of a base64 password using uniform character selection.
 *
 * @param {number} length - The number of characters to generate.
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @returns {Promise<string>} A random base64 string of the specified length.
 */
export const generateBase64Chunk = async (length, randomGenerator) => {
  validatePositiveInteger(length, 'length');

  let result = '';
  for (let i = 0; i < length; i++) {
    const index = await randomGenerator.generateRandomInt(BASE64_CHARSET.length);
    result += BASE64_CHARSET[index];
  }
  return result;
};

/**
 * Generates a base64 password with multiple chunks separated by a delimiter.
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.length - Length of each chunk.
 * @param {number} config.iteration - Number of chunks.
 * @param {string} config.separator - Separator between chunks.
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @returns {Promise<string>} The generated password.
 */
export const generateBase64Password = async (config, randomGenerator) => {
  const { length, iteration, separator } = config;

  validatePositiveInteger(length, 'length');
  validatePositiveInteger(iteration, 'iteration');

  const chunks = [];
  for (let i = 0; i < iteration; i++) {
    const chunk = await generateBase64Chunk(length, randomGenerator);
    chunks.push(chunk);
  }

  return chunks.join(separator);
};

/**
 * Calculates the entropy of a base64 password configuration.
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.length - Length of each chunk.
 * @param {number} config.iteration - Number of chunks.
 * @returns {number} Total entropy in bits.
 */
export const calculateBase64PasswordEntropy = (config) => {
  const { length, iteration } = config;
  const bitsPerChar = Math.log2(BASE64_CHARSET.length); // 6 bits
  return length * iteration * bitsPerChar;
};
