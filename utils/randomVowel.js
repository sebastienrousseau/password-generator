/* eslint-disable node/no-unpublished-import */
/*jshint esversion: 8 */

import { randomNumber } from "./randomNumber.js";

// There are 5 vowels (a, e, i, o, u)
let vowels = "aeiou";

export function randomVowel() {
  return vowels[randomNumber(vowels.length)];
}
