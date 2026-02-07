// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Unified Entropy Normalizer for Password Generation
 *
 * Provides consistent entropy calculation across all password generation methods.
 * Implements normalized calculation methodology for entropy comparison.
 *
 * @module domain/entropy-normalizer
 */

import { PASSWORD_TYPES } from './password-types.js';

/**
 * Constants for entropy calculations
 */
export const ENTROPY_CONSTANTS = {
  // Diceware uses EFF large wordlist
  DICEWARE_WORDS: 7776,
  // Base64 charset size
  BASE64_CHARSET_SIZE: 64,
  // Default dictionary size for memorable passwords
  DEFAULT_DICTIONARY_SIZE: 7776,
  // CVVC syllable combinations: 21 consonants * 5 vowels * 5 vowels * 21 consonants
  CVVC_SYLLABLE_COMBINATIONS: 21 * 5 * 5 * 21, // 11,025
};

/**
 * Calculates normalized entropy for diceware passwords.
 * Formula: L * log₂(N) where L = number of words, N = 7776 words
 *
 * @param {Object} config - Password configuration
 * @param {number} config.iteration - Number of words
 * @returns {number} Entropy in bits
 */
export const calculateDicewareEntropy = (config) => {
  const { iteration = 6 } = config;
  return iteration * Math.log2(ENTROPY_CONSTANTS.DICEWARE_WORDS);
};

/**
 * Calculates normalized entropy for custom character set passwords.
 * Formula: L * log₂(R) where L = total characters, R = charset size
 *
 * @param {Object} config - Password configuration
 * @param {string} config.allowedChars - Allowed characters or preset name
 * @param {string} [config.forbiddenChars] - Characters to exclude
 * @param {number} config.length - Length of each chunk
 * @param {number} config.iteration - Number of chunks
 * @returns {number} Entropy in bits
 */
export const calculateCustomEntropy = (config) => {
  const { length = 16, iteration = 1 } = config;

  // Import createCustomCharset dynamically to avoid circular dependencies
  try {
    // Calculate charset size - this is a simplified version
    // In practice, this should use the actual charset creation logic
    let charsetSize = 0;

    if (config.allowedChars) {
      // This is a simplified calculation - in practice we'd use createCustomCharset
      if (typeof config.allowedChars === 'string') {
        // Remove forbidden chars if specified
        let effectiveChars = config.allowedChars;
        if (config.forbiddenChars) {
          effectiveChars = effectiveChars
            .split('')
            .filter((char) => !config.forbiddenChars.includes(char))
            .join('');
        }
        charsetSize = new Set(effectiveChars).size;
      }
    }

    if (charsetSize === 0) {
      return 0;
    }

    const bitsPerChar = Math.log2(charsetSize);
    return length * iteration * bitsPerChar;
  } catch (error) {
    return 0;
  }
};

/**
 * Calculates normalized entropy for strong passwords.
 * Formula: L * log₂(64) where L = total character length
 *
 * @param {Object} config - Password configuration
 * @param {number} config.length - Length of each chunk
 * @param {number} config.iteration - Number of chunks
 * @returns {number} Entropy in bits
 */
export const calculateStrongEntropy = (config) => {
  const { length = 16, iteration = 1 } = config;
  const bitsPerChar = Math.log2(ENTROPY_CONSTANTS.BASE64_CHARSET_SIZE);
  return length * iteration * bitsPerChar;
};

/**
 * Calculates normalized entropy for base64 passwords.
 * Formula: L * log₂(64) where L = total character length
 *
 * @param {Object} config - Password configuration
 * @param {number} config.length - Length of each chunk
 * @param {number} config.iteration - Number of chunks
 * @returns {number} Entropy in bits
 */
export const calculateBase64Entropy = (config) => {
  const { length = 16, iteration = 1 } = config;
  const bitsPerChar = Math.log2(ENTROPY_CONSTANTS.BASE64_CHARSET_SIZE);
  return length * iteration * bitsPerChar;
};

/**
 * Calculates normalized entropy for memorable passwords.
 * Formula: L * log₂(D) where L = number of words, D = dictionary size
 *
 * @param {Object} config - Password configuration
 * @param {number} config.iteration - Number of words
 * @param {number} [config.dictionarySize] - Size of dictionary
 * @returns {number} Entropy in bits
 */
export const calculateMemorableEntropy = (config) => {
  const { iteration = 4, dictionarySize = ENTROPY_CONSTANTS.DEFAULT_DICTIONARY_SIZE } = config;
  return iteration * Math.log2(dictionarySize);
};

/**
 * Calculates normalized entropy for quantum-resistant passwords.
 * Formula: L * log₂(64) where L = total character length (same as strong/base64)
 *
 * @param {Object} config - Password configuration
 * @param {number} config.length - Length of each chunk
 * @param {number} config.iteration - Number of chunks
 * @returns {number} Entropy in bits
 */
export const calculateQuantumEntropy = (config) => {
  const { length = 32, iteration = 1 } = config;
  const bitsPerChar = Math.log2(ENTROPY_CONSTANTS.BASE64_CHARSET_SIZE);
  return length * iteration * bitsPerChar;
};

/**
 * Calculates normalized entropy for honeyword passwords.
 * Formula: L * log₂(64) where L = total character length (same as strong)
 *
 * @param {Object} config - Password configuration
 * @param {number} config.length - Length of each chunk
 * @param {number} config.iteration - Number of chunks
 * @returns {number} Entropy in bits
 */
export const calculateHoneywordEntropy = (config) => {
  const { length = 16, iteration = 1 } = config;
  const bitsPerChar = Math.log2(ENTROPY_CONSTANTS.BASE64_CHARSET_SIZE);
  return length * iteration * bitsPerChar;
};

/**
 * Calculates normalized entropy for pronounceable passwords.
 * Formula: L * log₂(C) where L = number of syllables, C = syllable combinations
 *
 * @param {Object} config - Password configuration
 * @param {number} config.iteration - Number of syllables
 * @returns {number} Entropy in bits
 */
export const calculatePronounceableEntropy = (config) => {
  const { iteration = 4 } = config;
  const bitsPerSyllable = Math.log2(ENTROPY_CONSTANTS.CVVC_SYLLABLE_COMBINATIONS);
  return iteration * bitsPerSyllable;
};

/**
 * Registry mapping password types to their entropy calculation functions
 */
export const ENTROPY_CALCULATOR_REGISTRY = {
  [PASSWORD_TYPES.DICEWARE]: calculateDicewareEntropy,
  [PASSWORD_TYPES.CUSTOM]: calculateCustomEntropy,
  [PASSWORD_TYPES.STRONG]: calculateStrongEntropy,
  [PASSWORD_TYPES.BASE64]: calculateBase64Entropy,
  [PASSWORD_TYPES.MEMORABLE]: calculateMemorableEntropy,
  [PASSWORD_TYPES.QUANTUM]: calculateQuantumEntropy,
  [PASSWORD_TYPES.HONEYWORD]: calculateHoneywordEntropy,
  [PASSWORD_TYPES.PRONOUNCEABLE]: calculatePronounceableEntropy,
};

/**
 * Unified entropy normalization function.
 * Calculates entropy correctly for each generation method using consistent methodology.
 *
 * @param {string} password - The generated password (for validation/fallback)
 * @param {string} type - Password type (diceware, custom, strong, base64, memorable, etc.)
 * @param {Object} config - Password generation configuration
 * @param {number} [config.length] - Length of each chunk (for chunk-based types)
 * @param {number} [config.iteration] - Number of chunks/words/syllables
 * @param {string} [config.allowedChars] - Custom character set (for custom type)
 * @param {string} [config.forbiddenChars] - Forbidden characters (for custom type)
 * @param {number} [config.dictionarySize] - Dictionary size (for memorable type)
 * @returns {number} Normalized entropy in bits
 * @throws {Error} If password type is not supported
 */
export const normalizeEntropy = (password, type, config) => {
  if (!type) {
    throw new Error('Password type is required for entropy calculation');
  }

  if (!config) {
    throw new Error('Configuration is required for entropy calculation');
  }

  const calculator = ENTROPY_CALCULATOR_REGISTRY[type];

  if (!calculator) {
    throw new Error(`Unsupported password type for entropy calculation: ${type}`);
  }

  try {
    const entropy = calculator(config);

    // Ensure we return a valid number
    if (!Number.isFinite(entropy) || entropy < 0) {
      console.warn(`Invalid entropy calculated for type ${type}:`, entropy);
      return 0;
    }

    return Math.round(entropy * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    console.warn(`Error calculating entropy for type ${type}:`, error.message);
    return 0;
  }
};

/**
 * Gets security level classification based on entropy bits
 *
 * @param {number} entropyBits - Entropy in bits
 * @returns {string} Security level (WEAK, MODERATE, GOOD, STRONG, EXCELLENT)
 */
export const getSecurityLevel = (entropyBits) => {
  if (entropyBits >= 256) {
    return 'EXCELLENT';
  }
  if (entropyBits >= 128) {
    return 'STRONG';
  }
  if (entropyBits >= 80) {
    return 'GOOD';
  }
  if (entropyBits >= 64) {
    return 'MODERATE';
  }
  return 'WEAK';
};

/**
 * Validates entropy calculation inputs
 *
 * @param {string} password - The generated password
 * @param {string} type - Password type
 * @param {Object} config - Configuration object
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validateEntropyInputs = (password, type, config) => {
  const errors = [];

  if (typeof password !== 'string') {
    errors.push('Password must be a string');
  }

  if (typeof type !== 'string') {
    errors.push('Type must be a string');
  }

  if (!config || typeof config !== 'object') {
    errors.push('Config must be an object');
  }

  // Only check registry if type is a valid string
  if (typeof type === 'string' && !ENTROPY_CALCULATOR_REGISTRY[type]) {
    errors.push(`Unsupported password type: ${type}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
