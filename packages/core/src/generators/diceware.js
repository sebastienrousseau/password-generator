// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure generator for diceware-based passwords using EFF large wordlist.
 * All randomness and dictionary access is provided through injected ports.
 *
 * @module generators/diceware
 */

import { validatePositiveInteger } from '../domain/base64-generation.js';

/**
 * Generates a diceware passphrase using the EFF large wordlist (7776 words).
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.iteration - Number of words to use.
 * @param {string} config.separator - Separator between words.
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @param {Object} dictionary - DictionaryPort implementation with EFF diceware list.
 * @returns {Promise<string>} The generated diceware passphrase.
 */
export const generateDicewarePassword = async (config, randomGenerator, dictionary) => {
  const { iteration, separator } = config;

  validatePositiveInteger(iteration, 'iteration');

  // Ensure dictionary is loaded
  const words = await dictionary.loadDictionary();
  if (!words || words.length === 0) {
    throw new Error('Diceware dictionary is empty or not loaded');
  }

  // Verify we have the correct EFF diceware word count
  const wordCount = await dictionary.getWordCount();
  if (wordCount !== 7776) {
    throw new Error(`Invalid diceware dictionary size: ${wordCount}. Expected 7776 words.`);
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
 * Calculates the entropy of a diceware passphrase configuration.
 * Uses log2(7776) bits per word as per EFF specification.
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.iteration - Number of words.
 * @returns {number} Total entropy in bits.
 */
export const calculateDicewarePasswordEntropy = (config) => {
  const { iteration } = config;
  // EFF large wordlist has 7776 words (6^5 = 7776, log2(7776) ≈ 12.925 bits per word)
  const bitsPerWord = Math.log2(7776);
  return iteration * bitsPerWord;
};

/**
 * Validates diceware configuration parameters.
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.iteration - Number of words.
 * @param {string} config.separator - Separator between words.
 * @returns {Object} Validation result with isValid boolean and errors array.
 */
export const validateDicewareConfig = (config) => {
  const errors = [];
  const { iteration, separator } = config;

  if (!Number.isInteger(iteration) || iteration < 1) {
    errors.push('Iteration must be a positive integer');
  }

  if (iteration > 20) {
    errors.push('Iteration should not exceed 20 words for practical use');
  }

  if (typeof separator !== 'string') {
    errors.push('Separator must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
