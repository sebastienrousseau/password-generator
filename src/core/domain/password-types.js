// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure domain logic for password type definitions and patterns.
 * This module defines the structure and rules for different password types.
 *
 * @module password-types
 */

/**
 * Enumeration of supported password types
 */
export const PASSWORD_TYPES = {
  BASE64: 'base64',
  BASE64_CHUNK: 'base64-chunk',
  SYLLABLE: 'syllable',
  DICTIONARY: 'dictionary'
};

/**
 * Password type metadata defining characteristics and constraints
 */
export const PASSWORD_TYPE_METADATA = {
  [PASSWORD_TYPES.BASE64]: {
    name: 'Base64 Password',
    description: 'Cryptographically secure base64-encoded random bytes',
    minLength: 1,
    maxLength: 1024,
    entropyPerUnit: 8, // bits per byte
    unitType: 'byte',
    pattern: /^[A-Za-z0-9+/]+={0,2}$/,
    useCases: ['High-entropy passwords', 'API tokens', 'Cryptographic keys']
  },
  [PASSWORD_TYPES.BASE64_CHUNK]: {
    name: 'Base64 Character-by-Character',
    description: 'Uniform random selection from base64 character set',
    minLength: 1,
    maxLength: 1024,
    entropyPerUnit: 6, // bits per character (log2(64))
    unitType: 'character',
    pattern: /^[A-Za-z0-9+/]+$/,
    useCases: ['Fixed-length passwords', 'Avoid base64 padding']
  },
  [PASSWORD_TYPES.SYLLABLE]: {
    name: 'Syllable-Based Password',
    description: 'Pronounceable passwords using consonant-vowel-consonant pattern',
    minLength: 1,
    maxLength: 50,
    entropyPerUnit: Math.log2(21 * 5 * 21), // ~11.11 bits per syllable
    unitType: 'syllable',
    pattern: /^[bcdfhgjklmnpqrstvwxyz][aeiou][bcdfhgjklmnpqrstvwxyz]+$/i,
    useCases: ['Human-memorable passwords', 'Verbal communication', 'User-friendly']
  },
  [PASSWORD_TYPES.DICTIONARY]: {
    name: 'Dictionary-Based Password',
    description: 'Passwords composed of dictionary words with separators',
    minLength: 1,
    maxLength: 20,
    entropyPerUnit: null, // Depends on dictionary size
    unitType: 'word',
    pattern: null, // Depends on dictionary and separator
    useCases: ['Passphrase generation', 'XKCD-style passwords', 'Human-memorable']
  }
};

/**
 * Validates password type configuration
 * @param {string} type - The password type to validate
 * @param {Object} config - Configuration object for the password type
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validatePasswordTypeConfig = (type, config) => {
  const errors = [];

  if (!Object.values(PASSWORD_TYPES).includes(type)) {
    errors.push(`Invalid password type: ${type}`);
    return { isValid: false, errors };
  }

  const metadata = PASSWORD_TYPE_METADATA[type];
  const { length = 1, byteLength = 1, syllableCount = 1, wordCount = 1 } = config;

  // Determine the relevant length parameter based on type
  let relevantLength;
  switch (type) {
    case PASSWORD_TYPES.BASE64:
      relevantLength = byteLength;
      break;
    case PASSWORD_TYPES.BASE64_CHUNK:
      relevantLength = length;
      break;
    case PASSWORD_TYPES.SYLLABLE:
      relevantLength = syllableCount;
      break;
    case PASSWORD_TYPES.DICTIONARY:
      relevantLength = wordCount;
      break;
    default:
      relevantLength = length;
  }

  if (relevantLength < metadata.minLength) {
    errors.push(`${metadata.unitType} count must be at least ${metadata.minLength}`);
  }

  if (relevantLength > metadata.maxLength) {
    errors.push(`${metadata.unitType} count must not exceed ${metadata.maxLength}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Gets the expected entropy for a password type configuration
 * @param {string} type - The password type
 * @param {Object} config - Configuration object
 * @returns {number} Expected entropy in bits
 */
export const getExpectedEntropy = (type, config) => {
  const metadata = PASSWORD_TYPE_METADATA[type];
  const { length = 1, byteLength = 1, syllableCount = 1, wordCount = 1, dictionarySize = 1000 } = config;

  switch (type) {
    case PASSWORD_TYPES.BASE64:
      return byteLength * metadata.entropyPerUnit;
    case PASSWORD_TYPES.BASE64_CHUNK:
      return length * metadata.entropyPerUnit;
    case PASSWORD_TYPES.SYLLABLE:
      return syllableCount * metadata.entropyPerUnit;
    case PASSWORD_TYPES.DICTIONARY:
      return wordCount * Math.log2(dictionarySize);
    default:
      return 0;
  }
};