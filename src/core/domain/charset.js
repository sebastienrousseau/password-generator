// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure domain logic for character sets used in password generation.
 * This module contains immutable character set definitions without dependencies.
 *
 * @module character-sets
 */

/** Base64 character set (64 characters, no padding bias). */
export const BASE64_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Vowel characters for syllable generation. */
export const VOWELS = "aeiou";

/** Consonant characters for syllable generation. */
export const CONSONANTS = "bcdfhgjklmnpqrstvwxyz";

/**
 * Character set metadata for entropy calculations and validation.
 */
export const CHARACTER_SET_METADATA = {
  BASE64: {
    charset: BASE64_CHARSET,
    size: 64,
    bitsPerCharacter: Math.log2(64), // 6 bits
    description: "Base64 character set (RFC 4648)"
  },
  VOWELS: {
    charset: VOWELS,
    size: 5,
    bitsPerCharacter: Math.log2(5), // ~2.32 bits
    description: "English vowels for syllable generation"
  },
  CONSONANTS: {
    charset: CONSONANTS,
    size: 21,
    bitsPerCharacter: Math.log2(21), // ~4.39 bits
    description: "English consonants for syllable generation"
  }
};