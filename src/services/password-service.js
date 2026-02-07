// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Password Service - Core password generation interface
 *
 * This module provides the main service interface for password generation,
 * including dynamic module loading and error handling.
 *
 * @module services/password-service
 */

import { PASSWORD_ERRORS } from "../errors.js";
import { createService } from "../../packages/core/src/index.js";
import { NodeCryptoRandom } from "../adapters/node/crypto-random.js";

// Create shared service instance
const randomGenerator = new NodeCryptoRandom();
const coreService = createService({}, { randomGenerator });

/**
 * Generates a password of the specified type using the appropriate generator module.
 *
 * @param {Object} config - Configuration options for password generation.
 * @param {string} config.type - The type of password to generate (strong, base64, memorable).
 * @param {number} [config.length] - The length of each password chunk.
 * @param {number} config.iteration - The number of password chunks or words.
 * @param {string} config.separator - The separator between password chunks.
 * @return {Promise<string>} The generated password.
 * @throws {Error} If the password type is invalid or generation fails.
 */
export const generatePassword = async (config) => {
  if (!config.type) {
    throw new Error(PASSWORD_ERRORS.TYPE_REQUIRED);
  }

  return coreService.generate(config);
};

/**
 * Generates multiple passwords with different configurations.
 *
 * @param {Array<Object>} configs - Array of configuration objects.
 * @returns {Promise<Array<string>>} Array of generated passwords.
 */
export const generateMultiplePasswords = async (configs) => {
  const promises = configs.map((config) => generatePassword(config));
  return Promise.all(promises);
};

/**
 * Validates a password configuration before generation.
 *
 * @param {Object} config - Configuration to validate.
 * @throws {Error} If the configuration is invalid.
 */
export const validatePasswordConfig = (config) => {
  if (!config) {
    throw new Error("Configuration is required");
  }

  if (!config.type) {
    throw new Error(PASSWORD_ERRORS.TYPE_REQUIRED);
  }

  if (typeof config.iteration !== "number" || config.iteration <= 0) {
    throw new Error("Iteration must be a positive number");
  }

  if (config.separator === undefined) {
    throw new Error("Separator is required");
  }

  // Validate length for types that require it
  if (
    (config.type === "strong" || config.type === "base64") &&
    config.length &&
    (typeof config.length !== "number" || config.length <= 0)
  ) {
    throw new Error("Length must be a positive number for strong and base64 password types");
  }
};

/**
 * Generates a password with validation and error handling.
 *
 * @param {Object} config - Configuration options for password generation.
 * @returns {Promise<string>} The generated password.
 * @throws {Error} If validation fails or generation fails.
 */
export const safeGeneratePassword = async (config) => {
  validatePasswordConfig(config);
  return generatePassword(config);
};
