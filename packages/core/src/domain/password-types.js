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
  STRONG: "strong",
  BASE64: "base64",
  MEMORABLE: "memorable",
};

/**
 * Enumeration of internal generation strategies
 */
export const GENERATION_STRATEGIES = {
  BASE64: "base64",
  BASE64_CHUNK: "base64-chunk",
  SYLLABLE: "syllable",
  DICTIONARY: "dictionary",
};

/**
 * Valid password types for user-facing API
 */
export const VALID_PASSWORD_TYPES = ["strong", "base64", "memorable"];

/**
 * Checks if a password type is valid
 * @param {string} type - The password type to validate
 * @returns {boolean} True if the type is valid
 */
export const isValidPasswordType = (type) => {
  return VALID_PASSWORD_TYPES.includes(type);
};

/**
 * Password type metadata defining characteristics and constraints
 */
export const PASSWORD_TYPE_METADATA = {
  [PASSWORD_TYPES.STRONG]: {
    name: "Strong Password",
    description: "Cryptographically secure base64-encoded random bytes",
    minLength: 1,
    maxLength: 1024,
    entropyPerUnit: 6, // bits per character (log2(64))
    unitType: "character",
    pattern: /^[A-Za-z0-9+/]+$/,
    useCases: ["High-entropy passwords", "API tokens", "Secure credentials"],
  },
  [PASSWORD_TYPES.BASE64]: {
    name: "Base64 Password",
    description: "Uniform random selection from base64 character set",
    minLength: 1,
    maxLength: 1024,
    entropyPerUnit: 6, // bits per character (log2(64))
    unitType: "character",
    pattern: /^[A-Za-z0-9+/]+$/,
    useCases: ["Fixed-length passwords", "Avoid base64 padding"],
  },
  [PASSWORD_TYPES.MEMORABLE]: {
    name: "Memorable Password",
    description: "Passwords composed of dictionary words with separators",
    minLength: 1,
    maxLength: 20,
    entropyPerUnit: null, // Depends on dictionary size
    unitType: "word",
    pattern: null, // Depends on dictionary and separator
    useCases: ["Passphrase generation", "XKCD-style passwords", "Human-memorable"],
  },
};

/**
 * Validates password type configuration
 * @param {string} type - The password type to validate
 * @param {Object} config - Configuration object for the password type
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validatePasswordTypeConfig = (type, config) => {
  const errors = [];

  if (!isValidPasswordType(type)) {
    errors.push(`Invalid password type: ${type}. Valid types: ${VALID_PASSWORD_TYPES.join(", ")}`);
    return { isValid: false, errors };
  }

  const metadata = PASSWORD_TYPE_METADATA[type];
  const { length, iteration } = config;

  // Validate iteration
  if (iteration !== undefined) {
    if (!Number.isInteger(iteration) || iteration < 1) {
      errors.push("Iteration must be a positive integer");
    }
  }

  // Validate length for types that require it
  if (type !== PASSWORD_TYPES.MEMORABLE && length !== undefined) {
    if (!Number.isInteger(length) || length < metadata.minLength) {
      errors.push(`Length must be at least ${metadata.minLength}`);
    }
    if (length > metadata.maxLength) {
      errors.push(`Length must not exceed ${metadata.maxLength}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
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
  if (!metadata) return 0;

  const { length = 16, iteration = 1, dictionarySize = 7776 } = config;

  switch (type) {
    case PASSWORD_TYPES.STRONG:
    case PASSWORD_TYPES.BASE64:
      return length * metadata.entropyPerUnit * iteration;
    case PASSWORD_TYPES.MEMORABLE:
      return iteration * Math.log2(dictionarySize);
    default:
      return 0;
  }
};
