// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure generator for honeyword arrays.
 * Generates N-1 decoy passwords plus 1 real password with metadata indicating which is real.
 *
 * @module generators/honeyword
 */

import { generateStrongPassword } from "./strong.js";
import { validatePositiveInteger } from "../domain/base64-generation.js";

/**
 * Generates a honeyword array containing N-1 decoy passwords and 1 real password.
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.length - Length of each password.
 * @param {number} config.iteration - Total number of passwords to generate (N).
 * @param {string} config.separator - Separator between chunks within each password.
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @returns {Promise<Object>} Object containing passwords array and metadata.
 */
export const generateHoneywordSet = async (config, randomGenerator) => {
  const { length, iteration, separator } = config;

  validatePositiveInteger(length, "length");
  validatePositiveInteger(iteration, "iteration");

  if (iteration < 2) {
    throw new Error(
      "Honeyword generation requires at least 2 passwords (1 real + 1 decoy minimum)"
    );
  }

  // Generate all passwords using strong password generation
  const passwords = [];
  for (let i = 0; i < iteration; i++) {
    const password = await generateStrongPassword(
      { length, iteration: 1, separator }, // Each password is a single chunk
      randomGenerator
    );
    passwords.push(password);
  }

  // Randomly select which password is the real one
  const realPasswordIndex = await randomGenerator.generateRandomInt(iteration);

  return {
    passwords,
    metadata: {
      totalCount: iteration,
      realPasswordIndex,
      decoyCount: iteration - 1,
    },
  };
};

/**
 * Generates a honeyword set and returns it in the standard format.
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.length - Length of each password.
 * @param {number} config.iteration - Total number of passwords to generate.
 * @param {string} config.separator - Separator between chunks.
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @returns {Promise<Object>} The honeyword set with passwords and metadata.
 */
export const generateHoneywordPassword = async (config, randomGenerator) => {
  return generateHoneywordSet(config, randomGenerator);
};

/**
 * Calculates the entropy of a honeyword configuration.
 * Returns the entropy of a single password, as all passwords in the set have equal entropy.
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.length - Length of each password.
 * @param {number} config.iteration - Total number of passwords.
 * @returns {number} Total entropy in bits for a single password.
 */
export const calculateHoneywordPasswordEntropy = (config) => {
  const { length } = config;
  const bitsPerChar = Math.log2(64); // Base64 charset entropy
  return length * bitsPerChar;
};
