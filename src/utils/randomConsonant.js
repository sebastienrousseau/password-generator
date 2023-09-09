import { randomNumber } from "../../src/utils/randomNumber.js";

/**
 * Generates a random consonant character.
 * @returns {string} A single consonant character.
 */
export function randomConsonant() {
  // There are 21 consonants (b, c, d, f, h, g, j, k, l, m, n, p, q, r, s, t, v, w, x, y, z)
  const consonants = "bcdfhgjklmnpqrstvwxyz";
  return consonants[randomNumber(consonants.length)];
}
