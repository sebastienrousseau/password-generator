/* eslint-disable node/no-unpublished-import */
/*jshint esversion: 8 */

import { randomConsonant } from "../../src/utils/randomConsonant.js";
import { randomVowel } from "../../src/utils/randomVowel.js";

export function randomSyllable() {
  return randomConsonant() + randomVowel() + randomConsonant();
}
