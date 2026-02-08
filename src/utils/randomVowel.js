import { randomNumber } from './randomNumber.js';
import { VOWELS } from '../constants.js';

/**
 * Generate a random vowel character from a predefined list of vowels.
 *
 * @returns {string} A randomly selected vowel character from the set [aeiou].
 * @throws {Error} If the random number generation fails (rare crypto module failure).
 */
export function randomVowel() {
  // Use the centralized vowel character set

  // Generate a random index within the range of the vowels string
  const randomIndex = randomNumber(VOWELS.length);

  // Return the vowel character at the randomly selected index
  return VOWELS[randomIndex];
}
