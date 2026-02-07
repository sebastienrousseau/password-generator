// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure generator for memorable (dictionary-based) passwords.
 * All randomness and dictionary access is provided through injected ports.
 *
 * @module generators/memorable
 */

import { validatePositiveInteger } from '../domain/base64-generation.js';

/**
 * Generates a memorable password using dictionary words.
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.iteration - Number of words to use.
 * @param {string} config.separator - Separator between words.
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @param {Object} dictionary - DictionaryPort implementation.
 * @returns {Promise<string>} The generated password.
 */
export const generateMemorablePassword = async (config, randomGenerator, dictionary) => {
  const { iteration, separator } = config;

  validatePositiveInteger(iteration, 'iteration');

  // Ensure dictionary is loaded
  const words = await dictionary.loadDictionary();
  if (!words || words.length === 0) {
    throw new Error('Dictionary is empty or not loaded');
  }

  const selectedWords = [];
  for (let i = 0; i < iteration; i++) {
    const word = await dictionary.selectRandomWord(async (max) => {
      return randomGenerator.generateRandomInt(max);
    });
    selectedWords.push(word);
  }

  return selectedWords.join(separator);
};

/**
 * Calculates the entropy of a memorable password configuration.
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.iteration - Number of words.
 * @param {number} [config.dictionarySize] - Size of the dictionary.
 * @returns {number} Total entropy in bits.
 */
export const calculateMemorablePasswordEntropy = (config) => {
  const { iteration, dictionarySize = 7776 } = config;
  const bitsPerWord = Math.log2(dictionarySize);
  return iteration * bitsPerWord;
};

/**
 * Generates a passphrase with optional word transformations.
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.iteration - Number of words.
 * @param {string} config.separator - Separator between words.
 * @param {Object} [config.transforms] - Optional transformations.
 * @param {boolean} [config.transforms.capitalize] - Capitalize first letter of each word.
 * @param {boolean} [config.transforms.uppercase] - Convert all to uppercase.
 * @param {boolean} [config.transforms.appendNumber] - Append a random number.
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @param {Object} dictionary - DictionaryPort implementation.
 * @returns {Promise<string>} The generated passphrase.
 */
export const generatePassphrase = async (config, randomGenerator, dictionary) => {
  const { iteration, separator, transforms = {} } = config;

  let password = await generateMemorablePassword(
    { iteration, separator },
    randomGenerator,
    dictionary
  );

  // Apply transformations
  if (transforms.capitalize) {
    password = password
      .split(separator)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(separator);
  }

  if (transforms.uppercase) {
    password = password.toUpperCase();
  }

  if (transforms.appendNumber) {
    const num = await randomGenerator.generateRandomInt(1000);
    password = `${password}${num}`;
  }

  return password;
};
