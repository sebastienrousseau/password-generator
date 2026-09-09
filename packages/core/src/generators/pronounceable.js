// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure generator for pronounceable passwords using CVVC patterns.
 * All randomness is provided through the injected random generator port.
 *
 * @module generators/pronounceable
 */

import { validatePositiveInteger } from '../domain/base64-generation.js';

// Character sets for pronounceable password generation
const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';
const VOWELS = 'aeiou';

/**
 * Generates a single CVVC (consonant-vowel-vowel-consonant) syllable.
 *
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @returns {Promise<string>} A CVVC syllable.
 */
export const generateCVVCSyllable = async (randomGenerator) => {
  const consonant1 = CONSONANTS[await randomGenerator.generateRandomInt(CONSONANTS.length)];
  const vowel1 = VOWELS[await randomGenerator.generateRandomInt(VOWELS.length)];
  const vowel2 = VOWELS[await randomGenerator.generateRandomInt(VOWELS.length)];
  const consonant2 = CONSONANTS[await randomGenerator.generateRandomInt(CONSONANTS.length)];

  return consonant1 + vowel1 + vowel2 + consonant2;
};

/**
 * Generates a pronounceable password using CVVC patterns.
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.iteration - Number of CVVC syllables to generate.
 * @param {string} config.separator - Separator between syllables.
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @returns {Promise<string>} The generated pronounceable password.
 */
export const generatePronounceablePassword = async (config, randomGenerator) => {
  const { iteration, separator } = config;

  validatePositiveInteger(iteration, 'iteration');

  const syllables = [];
  for (let i = 0; i < iteration; i++) {
    const syllable = await generateCVVCSyllable(randomGenerator);
    syllables.push(syllable);
  }

  return syllables.join(separator);
};

/**
 * Calculates the entropy of a pronounceable password configuration.
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.iteration - Number of CVVC syllables.
 * @returns {number} Total entropy in bits.
 */
export const calculatePronounceablePasswordEntropy = (config) => {
  const { iteration } = config;

  // Each CVVC syllable has:
  // - 1 consonant from 21 options: log2(21) = ~4.39 bits
  // - 2 vowels from 5 options each: 2 * log2(5) = ~4.64 bits
  // - 1 consonant from 21 options: log2(21) = ~4.39 bits
  // Total per syllable: ~13.42 bits
  const consonantEntropy = Math.log2(CONSONANTS.length); // ~4.39 bits
  const vowelEntropy = Math.log2(VOWELS.length); // ~2.32 bits
  const syllableEntropy = consonantEntropy + 2 * vowelEntropy + consonantEntropy; // ~13.42 bits

  return iteration * syllableEntropy;
};
