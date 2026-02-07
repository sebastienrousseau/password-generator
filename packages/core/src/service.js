// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Core service factory for password generation.
 * This is the main entry point for creating a password generation service.
 *
 * @module service
 */

import {
  validatePorts,
  NoOpLogger,
  MemoryStorage,
  FixedClock,
  MemoryDictionary,
  DEFAULT_WORD_LIST,
} from "./ports/index.js";
import { generate, GENERATOR_REGISTRY } from "./generators/index.js";
import {
  isValidPasswordType,
  VALID_PASSWORD_TYPES,
  validatePasswordTypeConfig,
} from "./domain/password-types.js";
import {
  calculateTotalEntropy,
  getSecurityLevel,
  getSecurityRecommendation,
} from "./domain/entropy-calculator.js";
import {
  normalizeEntropy,
  getSecurityLevel as getSecurityLevelFromNormalizer,
} from "./domain/entropy-normalizer.js";
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
     * @param {boolean} [options.includeEntropy=false] - Whether to include entropy calculation in result.
     * @returns {Promise<string|Object>} The generated password (string) or with entropy info (object if includeEntropy=true).
     */
    async generate(options) {
      const {
        type,
        length = 16,
        iteration = 1,
        separator = "-",
        includeEntropy = false,
        ...restOptions
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
      const generatedConfig = { type, length, iteration, separator, ...restOptions };
      const password = await generate(generatedConfig, resolvedPorts);

      // Return just password if entropy not requested (for backward compatibility)
      if (!includeEntropy) {
        return password;
      }

      // Calculate normalized entropy
      let entropy = 0;
      let securityLevel = "WEAK";

      try {
        entropy = normalizeEntropy(password, type, generatedConfig);
        securityLevel = getSecurityLevelFromNormalizer(entropy);
      } catch (error) {
        resolvedPorts.logger.warn(`Failed to calculate normalized entropy: ${error.message}`);
        // Fallback to old entropy calculation
        try {
          entropy = calculateTotalEntropy(generatedConfig);
          securityLevel = getSecurityLevel(entropy);
        } catch (fallbackError) {
          resolvedPorts.logger.warn(
            `Failed to calculate fallback entropy: ${fallbackError.message}`
          );
        }
      }

      return {
        password,
        entropy: Math.round(entropy * 100) / 100, // Round to 2 decimal places
        securityLevel,
        metadata: {
          type,
          length: password.length,
          config: generatedConfig,
          generatedAt: await resolvedPorts.clock.now(),
        },
      };
    },

    /**
     * Generates multiple passwords with different configurations.
     *
     * @param {Array<Object>} optionsArray - Array of password options.
     * @returns {Promise<Array>} Array of generated password results.
     */
    async generateMultiple(optionsArray) {
      const results = [];
      for (const options of optionsArray) {
        const result = await this.generate(options);
        results.push(result);
      }
      return results;
    },
    /**
     * Calculates the entropy for a password configuration using the unified normalizer.
     *
     * @param {Object} options - Password configuration.
     * @param {string} [fakePassword] - Optional fake password for calculation (uses empty string if not provided).
     * @returns {Object} Entropy information.
     */
    calculateEntropy(options, fakePassword = "") {
      const { type, length = 16, iteration = 1 } = options;

      try {
        // Use the unified entropy normalizer
        const normalizedEntropy = normalizeEntropy(fakePassword, type, options);
        const securityLevel = getSecurityLevelFromNormalizer(normalizedEntropy);

        // Fallback to old entropy for recommendation
        const legacyEntropy = calculateTotalEntropy({ type, length, iteration });
        const recommendation = getSecurityRecommendation(legacyEntropy);

        return {
          totalBits: normalizedEntropy,
          securityLevel,
          recommendation,
          perUnit: this._calculatePerUnitEntropy(type, options, normalizedEntropy),
          legacy: {
            totalBits: legacyEntropy,
            securityLevel: getSecurityLevel(legacyEntropy),
          },
        };
      } catch (error) {
        // Fallback to legacy calculation
        const totalEntropy = calculateTotalEntropy({ type, length, iteration });
        const securityLevel = getSecurityLevel(totalEntropy);
        const recommendation = getSecurityRecommendation(totalEntropy);

        return {
          totalBits: totalEntropy,
          securityLevel,
          recommendation,
          perUnit: type === "memorable" ? totalEntropy / iteration : length * Math.log2(64),
          error: error.message,
        };
      }
    },
    /** Calculates per-unit entropy for display purposes. @private */
    _calculatePerUnitEntropy(type, options, totalEntropy) {
      const { iteration = 1, length = 16 } = options;

      switch (type) {
        case "memorable":
        case "diceware":
          return iteration > 0 ? totalEntropy / iteration : 0;
        case "pronounceable":
          return iteration > 0 ? totalEntropy / iteration : 0; // per syllable
        case "strong":
        case "base64":
        case "quantum-resistant":
        case "honeyword": {
          const totalChars = length * iteration;
          return totalChars > 0 ? totalEntropy / totalChars : 0; // per character
        }
        case "custom": {
          const customTotalChars = (length || 1) * iteration;
          return customTotalChars > 0 ? totalEntropy / customTotalChars : 0; // per character
        }
        default:
          return 0;
      }
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
        return {
          isValid: false,
          errors: [PASSWORD_ERRORS.UNKNOWN_TYPE(type, VALID_PASSWORD_TYPES)],
        };
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
