// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure domain logic for character sets used in password generation.
 * This module contains immutable character set definitions without dependencies.
 *
 * @module charset
 */

/** Base64 character set (64 characters, no padding bias). */
export const BASE64_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Vowel characters for syllable generation. */
export const VOWELS = "aeiou";

/** Consonant characters for syllable generation. */
export const CONSONANTS = "bcdfhgjklmnpqrstvwxyz";

/** Standard character set categories for custom generation. */
export const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
export const DIGITS = "0123456789";
export const SPECIAL = "!@#$%^&*()_+-=[]{}|;:,.<>?";
export const HEX_UPPERCASE = "0123456789ABCDEF";
export const HEX_LOWERCASE = "0123456789abcdef";

/**
 * Character set metadata for entropy calculations and validation.
 */
export const CHARACTER_SET_METADATA = {
  BASE64: {
    charset: BASE64_CHARSET,
    size: 64,
    bitsPerCharacter: Math.log2(64), // 6 bits
    description: "Base64 character set (RFC 4648)",
  },
  VOWELS: {
    charset: VOWELS,
    size: 5,
    bitsPerCharacter: Math.log2(5), // ~2.32 bits
    description: "English vowels for syllable generation",
  },
  CONSONANTS: {
    charset: CONSONANTS,
    size: 21,
    bitsPerCharacter: Math.log2(21), // ~4.39 bits
    description: "English consonants for syllable generation",
  },
  UPPERCASE: {
    charset: UPPERCASE,
    size: 26,
    bitsPerCharacter: Math.log2(26), // ~4.70 bits
    description: "Uppercase letters A-Z",
  },
  LOWERCASE: {
    charset: LOWERCASE,
    size: 26,
    bitsPerCharacter: Math.log2(26), // ~4.70 bits
    description: "Lowercase letters a-z",
  },
  DIGITS: {
    charset: DIGITS,
    size: 10,
    bitsPerCharacter: Math.log2(10), // ~3.32 bits
    description: "Digits 0-9",
  },
  SPECIAL: {
    charset: SPECIAL,
    size: 25,
    bitsPerCharacter: Math.log2(25), // ~4.64 bits
    description: "Special characters and symbols",
  },
  HEX_UPPERCASE: {
    charset: HEX_UPPERCASE,
    size: 16,
    bitsPerCharacter: Math.log2(16), // 4 bits
    description: "Hexadecimal digits with uppercase letters",
  },
  HEX_LOWERCASE: {
    charset: HEX_LOWERCASE,
    size: 16,
    bitsPerCharacter: Math.log2(16), // 4 bits
    description: "Hexadecimal digits with lowercase letters",
  },
};

/**
 * Creates a custom character set by combining allowed and forbidden character specifications.
 *
 * @param {string} allowedChars - Characters to include (can be charset names like "UPPERCASE,DIGITS" or literal characters)
 * @param {string} [forbiddenChars] - Characters to exclude
 * @returns {Object} Custom character set metadata with charset string and metadata
 */
export const createCustomCharset = (allowedChars, forbiddenChars = "") => {
  let charset = "";

  // Parse allowed characters - can be predefined sets or literal characters
  const allowedSpecs = allowedChars.split(",").map(s => s.trim().toUpperCase());

  for (const spec of allowedSpecs) {
    if (CHARACTER_SET_METADATA[spec]) {
      // Predefined character set
      charset += CHARACTER_SET_METADATA[spec].charset;
    } else {
      // Literal characters
      charset += allowedChars.split(",").find(s => s.trim().toUpperCase() === spec)?.trim() || "";
    }
  }

  // If no predefined sets matched, treat the entire string as literal characters
  if (charset === "") {
    charset = allowedChars;
  }

  // Remove forbidden characters
  if (forbiddenChars) {
    const forbiddenSet = new Set(forbiddenChars);
    charset = charset.split("").filter(char => !forbiddenSet.has(char)).join("");
  }

  // Remove duplicates while preserving order
  const uniqueChars = [...new Set(charset)];
  const finalCharset = uniqueChars.join("");

  if (finalCharset.length === 0) {
    throw new Error("Custom character set cannot be empty after applying forbidden character filter");
  }

  return {
    charset: finalCharset,
    size: finalCharset.length,
    bitsPerCharacter: Math.log2(finalCharset.length),
    description: `Custom character set (${finalCharset.length} characters)`,
  };
};

/**
 * Validates that a character set is suitable for password generation.
 *
 * @param {string} charset - The character set to validate
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export const validateCharset = (charset) => {
  const errors = [];

  if (!charset || typeof charset !== "string") {
    errors.push("Character set must be a non-empty string");
  } else if (charset.length === 0) {
    errors.push("Character set cannot be empty");
  } else if (charset.length < 2) {
    errors.push("Character set must contain at least 2 characters for security");
  }

  // Check for potentially problematic characters
  const problematicChars = charset.match(/[\x00-\x1f\x7f-\x9f]/g);
  if (problematicChars) {
    errors.push(`Character set contains control characters: ${problematicChars.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
