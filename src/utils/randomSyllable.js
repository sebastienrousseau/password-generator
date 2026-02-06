// Import necessary modules and functions
import { randomConsonant } from "./randomConsonant.js";
import { randomVowel } from "./randomVowel.js";

/**
 * Generate a random syllable following the consonant-vowel-consonant pattern.
 *
 * @returns {string} A random syllable containing a consonant, vowel, and consonant (e.g., "bat", "fox").
 * @throws {Error} If the random generation functions fail (rare crypto module failure).
 */
export function randomSyllable() {
  return randomConsonant() + randomVowel() + randomConsonant();
}
