import { randomNumber } from "../../src/utils/randomNumber.js";

/**
 * Generate a random vowel character from a predefined list of vowels.
 *
 * @returns {string} A randomly selected vowel character (a, e, i, o, u).
 */
export function randomVowel() {
  // Define a string containing the vowels
  const vowels = "aeiou";

  // Generate a random index within the range of the vowels string
  const randomIndex = randomNumber(vowels.length);

  // Return the vowel character at the randomly selected index
  return vowels[randomIndex];
}
