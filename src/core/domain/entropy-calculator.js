// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure domain logic for entropy calculations in password generation.
 * These functions provide cryptographic entropy analysis without side effects.
 *
 * @module entropy-calculations
 */

/**
 * Entropy calculation constants
 */
export const ENTROPY_CONSTANTS = {
  // Base64 charset has 64 possible values = 6 bits per character
  BASE64_BITS_PER_CHAR: Math.log2(64),
  // Dictionary entropy depends on dictionary size
  DICTIONARY_ENTRIES: null, // Will be set when dictionary is loaded
};

/**
 * Calculates entropy for base64 password generation
 * @param {number} byteLength - Number of random bytes generated
 * @return {number} Estimated entropy in bits
 */
export const calculateBase64Entropy = (byteLength) => {
  // Each random byte provides 8 bits of entropy
  return byteLength * 8;
};

/**
 * Calculates entropy for base64 chunk generation
 * @param {number} characterLength - Number of characters in the chunk
 * @return {number} Estimated entropy in bits
 */
export const calculateBase64ChunkEntropy = (characterLength) => {
  // Each base64 character provides log2(64) = 6 bits of entropy
  return characterLength * ENTROPY_CONSTANTS.BASE64_BITS_PER_CHAR;
};

/**
 * Calculates entropy for dictionary-based password generation
 * @param {number} dictionarySize - Number of entries in the dictionary
 * @param {number} wordCount - Number of words selected
 * @return {number} Estimated entropy in bits
 */
export const calculateDictionaryEntropy = (dictionarySize, wordCount) => {
  // Each word selection provides log2(dictionarySize) bits of entropy
  const bitsPerWord = Math.log2(dictionarySize);
  return wordCount * bitsPerWord;
};

/**
 * Calculates entropy for character set based generation
 * @param {number} charsetSize - Size of the character set
 * @param {number} length - Number of characters generated
 * @return {number} Estimated entropy in bits
 */
export const calculateCharsetEntropy = (charsetSize, length) => {
  // Each character provides log2(charsetSize) bits of entropy
  const bitsPerChar = Math.log2(charsetSize);
  return length * bitsPerChar;
};

/**
 * Calculates entropy for syllable-based password generation
 * @param {number} syllableCount - Number of syllables in the password
 * @return {number} Estimated entropy in bits
 */
export const calculateSyllableEntropy = (syllableCount) => {
  // Each syllable is consonant-vowel-consonant (21 * 5 * 21 = 2205 combinations)
  const combinationsPerSyllable = 21 * 5 * 21; // CONSONANTS.length * VOWELS.length * CONSONANTS.length
  const bitsPerSyllable = Math.log2(combinationsPerSyllable);
  return syllableCount * bitsPerSyllable;
};

/**
 * Determines security level based on total entropy
 * @param {number} entropyBits - Total entropy in bits
 * @return {string} Security level classification
 */
export const getSecurityLevel = (entropyBits) => {
  if (entropyBits >= 256) {
    return "EXCELLENT (256+ bits)";
  }
  if (entropyBits >= 128) {
    return "STRONG (128-255 bits)";
  }
  if (entropyBits >= 80) {
    return "GOOD (80-127 bits)";
  }
  if (entropyBits >= 64) {
    return "MODERATE (64-79 bits)";
  }
  return "WEAK (<64 bits)";
};

/**
 * Provides security recommendations based on entropy level
 * @param {number} entropyBits - Total entropy in bits
 * @return {string} Security recommendation
 */
export const getSecurityRecommendation = (entropyBits) => {
  if (entropyBits >= 128) {
    return "Excellent security. Suitable for high-security applications.";
  } else if (entropyBits >= 80) {
    return "Good security for most applications. Consider increasing length for high-security needs.";
  } else {
    return "Consider increasing password length or iteration count for better security.";
  }
};