// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Centralized constants for character sets used across password generators.
 *
 * @module constants
 */

/** Base64 character set (64 characters, no padding bias). */
export const BASE64_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Vowel characters for syllable generation. */
export const VOWELS = "aeiou";

/** Consonant characters for syllable generation. */
export const CONSONANTS = "bcdfhgjklmnpqrstvwxyz";