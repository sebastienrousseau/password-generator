// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Domain layer exports for password generation core logic.
 *
 * @module domain
 */

// Character sets
export {
  BASE64_CHARSET,
  VOWELS,
  CONSONANTS,
  CHARACTER_SET_METADATA,
} from "./charset.js";

// Entropy calculations
export {
  ENTROPY_CONSTANTS,
  calculateBase64Entropy,
  calculateBase64ChunkEntropy,
  calculateDictionaryEntropy,
  calculateCharsetEntropy,
  calculateSyllableEntropy,
  getSecurityLevel,
  getSecurityRecommendation,
  calculateTotalEntropy,
} from "./entropy-calculator.js";

// Password types
export {
  PASSWORD_TYPES,
  GENERATION_STRATEGIES,
  VALID_PASSWORD_TYPES,
  isValidPasswordType,
  PASSWORD_TYPE_METADATA,
  validatePasswordTypeConfig,
  getExpectedEntropy,
} from "./password-types.js";

// Base64 generation utilities
export {
  validatePositiveInteger,
  isValidBase64,
  splitString,
  calculateBase64Length,
  calculateRequiredByteLength,
  BASE64_DOMAIN_RULES,
} from "./base64-generation.js";
