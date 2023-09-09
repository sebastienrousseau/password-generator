// Import necessary modules and functions
import { randomConsonant } from "../../src/utils/randomConsonant.js";
import { randomVowel } from "../../src/utils/randomVowel.js";

/**
 * Generate a random syllable.
 *
 * @returns {string} A random syllable containing a consonant, vowel, and consonant.
 */
export function randomSyllable() {
  return randomConsonant() + randomVowel() + randomConsonant();
}
