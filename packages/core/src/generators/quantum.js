// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure generator for quantum-resistant passwords.
 * Designed to provide ultra-high entropy for post-quantum cryptography scenarios.
 * All randomness is provided through the injected random generator port.
 *
 * @module generators/quantum
 */

import { BASE64_CHARSET } from "../domain/charset.js";
import { validatePositiveInteger } from "../domain/base64-generation.js";

/**
 * Minimum entropy target for quantum-resistant passwords (256 bits).
 * This provides adequate security against quantum computer attacks.
 */
const QUANTUM_ENTROPY_TARGET_BITS = 256;

/**
 * Entropy per character in base64 (log2(64) = 6 bits).
 */
const ENTROPY_PER_CHAR = Math.log2(BASE64_CHARSET.length);

/**
 * Minimum character length to achieve quantum-resistant entropy.
 */
export const QUANTUM_MIN_LENGTH = Math.ceil(QUANTUM_ENTROPY_TARGET_BITS / ENTROPY_PER_CHAR);

/**
 * Generates a single chunk of a quantum-resistant password using uniform character selection.
 * Uses the same character selection logic as strong passwords but with quantum-resistant defaults.
 *
 * @param {number} length - The number of characters to generate.
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @returns {Promise<string>} A random string of the specified length.
 */
export const generateQuantumChunk = async (length, randomGenerator) => {
  validatePositiveInteger(length, "length");

  if (length < QUANTUM_MIN_LENGTH) {
    console.warn(
      `Warning: Quantum password length (${length}) is below recommended minimum (${QUANTUM_MIN_LENGTH} chars) for 256-bit entropy.`
    );
  }

  let result = "";
  for (let i = 0; i < length; i++) {
    const index = await randomGenerator.generateRandomInt(BASE64_CHARSET.length);
    result += BASE64_CHARSET[index];
  }
  return result;
};

/**
 * Generates a quantum-resistant password with ultra-high entropy.
 * Designed to withstand attacks from both classical and quantum computers.
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.length - Length of each chunk (recommended: 43+ for 256+ bit entropy).
 * @param {number} config.iteration - Number of chunks.
 * @param {string} config.separator - Separator between chunks.
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @returns {Promise<string>} The generated quantum-resistant password.
 */
export const generateQuantumPassword = async (config, randomGenerator) => {
  const { length, iteration, separator } = config;

  validatePositiveInteger(length, "length");
  validatePositiveInteger(iteration, "iteration");

  // Ensure total entropy meets quantum-resistant requirements
  const totalEntropy = calculateQuantumPasswordEntropy(config);
  if (totalEntropy < QUANTUM_ENTROPY_TARGET_BITS) {
    console.warn(
      `Warning: Total entropy (${totalEntropy.toFixed(1)} bits) is below quantum-resistant target (${QUANTUM_ENTROPY_TARGET_BITS} bits).`
    );
  }

  const chunks = [];
  for (let i = 0; i < iteration; i++) {
    const chunk = await generateQuantumChunk(length, randomGenerator);
    chunks.push(chunk);
  }

  return chunks.join(separator);
};

/**
 * Calculates the entropy of a quantum-resistant password configuration.
 * Returns total entropy in bits across all chunks.
 *
 * @param {Object} config - Password configuration.
 * @param {number} config.length - Length of each chunk.
 * @param {number} config.iteration - Number of chunks.
 * @returns {number} Total entropy in bits.
 */
export const calculateQuantumPasswordEntropy = (config) => {
  const { length, iteration } = config;
  return length * iteration * ENTROPY_PER_CHAR;
};

/**
 * Validates that a configuration meets quantum-resistant entropy requirements.
 *
 * @param {Object} config - Password configuration to validate.
 * @returns {Object} Validation result with isQuantumSafe boolean and entropyBits number.
 */
export const validateQuantumSecurity = (config) => {
  const entropyBits = calculateQuantumPasswordEntropy(config);
  return {
    isQuantumSafe: entropyBits >= QUANTUM_ENTROPY_TARGET_BITS,
    entropyBits,
    recommendedMinLength: QUANTUM_MIN_LENGTH,
    target: QUANTUM_ENTROPY_TARGET_BITS,
  };
};