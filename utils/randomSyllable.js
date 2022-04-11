/* eslint-disable node/no-unpublished-import */
/*jshint esversion: 8 */

import { randomConsonant } from "./randomConsonant.js";
import { randomVowel } from "./randomVowel.js";

export function randomSyllable() {
  return randomConsonant() + randomVowel() + randomConsonant();
}
