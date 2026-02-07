// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Core service factory for password generation.
 * This is the main entry point for creating a password generation service.
 *
 * @module service
 */

import { validatePorts, NoOpLogger, MemoryStorage, FixedClock, MemoryDictionary, DEFAULT_WORD_LIST } from "./ports/index.js";
import { generate, getGenerator, GENERATOR_REGISTRY } from "./generators/index.js";
import { isValidPasswordType, VALID_PASSWORD_TYPES, validatePasswordTypeConfig } from "./domain/password-types.js";
import { calculateTotalEntropy, getSecurityLevel, getSecurityRecommendation } from "./domain/entropy-calculator.js";
import { PASSWORD_ERRORS } from "./errors.js";

/**
 * Creates a password generation service with injected ports.
 *
 * @param {Object} config - Service configuration.
 * @param {boolean} [config.validateOnInit=true] - Whether to validate ports on initialization.
 * @param {Object} ports - Port implementations.
 * @param {Object} ports.randomGenerator - RandomGeneratorPort implementation (required).
 * @param {Object} [ports.logger] - LoggerPort implementation.
 * @param {Object} [ports.storage] - StoragePort implementation.
 * @param {Object} [ports.clock] - ClockPort implementation.
 * @param {Object} [ports.dictionary] - DictionaryPort implementation.
 * @returns {Object} Password generation service.
 * @throws {Error} If required ports are missing or invalid.
 */
export function createService(config = {}, ports) {
  const { validateOnInit = true } = config;

  // Fill in defaults for optional ports
  const resolvedPorts = {
    randomGenerator: ports.randomGenerator,
    logger: ports.logger ?? new NoOpLogger(),
    storage: ports.storage ?? new MemoryStorage(),
    clock: ports.clock ?? new FixedClock(),
    dictionary: ports.dictionary ?? new MemoryDictionary(DEFAULT_WORD_LIST),
  };

  // Validate ports if requested
  if (validateOnInit) {
    const validation = validatePorts(resolvedPorts);
    if (!validation.isValid) {
      throw new Error(`Port validation failed: ${validation.errors.join("; ")}`);
    }
  }

  return {
    /**
     * Generates a password with the specified configuration.
     *
     * @param {Object} options - Password generation options.
     * @param {string} options.type - Password type (strong, base64, memorable).
     * @param {number} [options.length=16] - Length of each chunk.
     * @param {number} [options.iteration=1] - Number of chunks/words.
     * @param {string} [options.separator="-"] - Separator between chunks/words.
     * @returns {Promise<string>} The generated password.
     */
    async generate(options) {
      const {
        type,
        length = 16,
        iteration = 1,
        separator = "-",
      } = options;

      // Validate type
      if (!type) {
        throw new Error(PASSWORD_ERRORS.TYPE_REQUIRED);
      }

      if (!isValidPasswordType(type)) {
        throw new Error(PASSWORD_ERRORS.UNKNOWN_TYPE(type, VALID_PASSWORD_TYPES));
      }

      // Validate configuration
      const validation = validatePasswordTypeConfig(type, { length, iteration });
      if (!validation.isValid) {
        throw new Error(validation.errors.join("; "));
      }

      // Generate password
      const generatedConfig = { type, length, iteration, separator };
      return generate(generatedConfig, resolvedPorts);
    },

    /**
     * Generates multiple passwords with different configurations.
     *
     * @param {Array<Object>} optionsArray - Array of password options.
     * @returns {Promise<string[]>} Array of generated passwords.
     */
    async generateMultiple(optionsArray) {
      const results = [];
      for (const options of optionsArray) {
        const password = await this.generate(options);
        results.push(password);
      }
      return results;
    },

    /**
     * Calculates the entropy for a password configuration.
     *
     * @param {Object} options - Password configuration.
     * @returns {Object} Entropy information.
     */
    calculateEntropy(options) {
      const { type, length = 16, iteration = 1 } = options;

      const totalEntropy = calculateTotalEntropy({ type, length, iteration });
      const securityLevel = getSecurityLevel(totalEntropy);
      const recommendation = getSecurityRecommendation(totalEntropy);

      return {
        totalBits: totalEntropy,
        securityLevel,
        recommendation,
        perUnit: type === "memorable" ? totalEntropy / iteration : (length * Math.log2(64)),
      };
    },

    /**
     * Validates a password configuration without generating.
     *
     * @param {Object} options - Password configuration.
     * @returns {Object} Validation result.
     */
    validateConfig(options) {
      const { type } = options;

      if (!type) {
        return { isValid: false, errors: [PASSWORD_ERRORS.TYPE_REQUIRED] };
      }

      if (!isValidPasswordType(type)) {
        return { isValid: false, errors: [PASSWORD_ERRORS.UNKNOWN_TYPE(type, VALID_PASSWORD_TYPES)] };
      }

      return validatePasswordTypeConfig(type, options);
    },

    /**
     * Gets the list of supported password types.
     *
     * @returns {string[]} Array of supported types.
     */
    getSupportedTypes() {
      return [...VALID_PASSWORD_TYPES];
    },

    /**
     * Gets the generator for a specific password type.
     *
     * @param {string} type - Password type.
     * @returns {Object|null} Generator or null if not found.
     */
    getGenerator(type) {
      return GENERATOR_REGISTRY[type] ?? null;
    },

    /**
     * Gets the resolved ports used by this service.
     * Useful for debugging and testing.
     *
     * @returns {Object} The port implementations.
     */
    getPorts() {
      return { ...resolvedPorts };
    },
  };
}

/**
 * Creates a service with minimal configuration for quick usage.
 *
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @returns {Object} Password generation service.
 */
export function createQuickService(randomGenerator) {
  return createService({}, { randomGenerator });
}
