import { randomConsonant } from "../../src/utils/randomConsonant.js";
import { randomVowel } from "../../src/utils/randomVowel.js";

export function randomSyllable() {
  return randomConsonant() + randomVowel() + randomConsonant();
}
