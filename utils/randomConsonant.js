/* eslint-disable node/no-unpublished-import */
/*jshint esversion: 8 */

import { randomNumber } from "./randomNumber.js";

// There are 21 consonants (b, c, d, f, h, g, j, k, l, m, n, p, q, r, s, t, v, w, x, y, z)
let consonants = "bcdfhgjklmnpqrstvwxyz";

export function randomConsonant() {
  return (consonants[randomNumber(consonants.length)]);
}
