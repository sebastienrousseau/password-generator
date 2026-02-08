import { randomNumber } from './randomNumber.js';
import { CONSONANTS } from '../constants.js';

/**
 * Generates a random consonant character.
 *
 * @returns {string} A single consonant character from the set [bcdfhgjklmnpqrstvwxyz].
 * @throws {Error} If the random number generation fails (rare crypto module failure).
 */
export function randomConsonant() {
  // There are 21 consonants (b, c, d, f, h, g, j, k, l, m, n, p, q, r, s, t, v, w, x, y, z)
  return CONSONANTS[randomNumber(CONSONANTS.length)];
}
