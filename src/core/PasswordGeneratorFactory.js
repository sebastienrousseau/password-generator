// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { PASSWORD_ERRORS } from "../errors.js";
import { isValidPasswordType } from "../config.js";
import { DefaultCryptoAdapter } from "../adapters/CryptoAdapter.js";

/**
 * Factory class for dynamically loading and managing password generator modules.
 *
 * Handles dynamic module loading with comprehensive error handling, module validation,
 * and proper async/sync abstraction for different password generation algorithms.
 *
 * @class PasswordGeneratorFactory
 */
export class PasswordGeneratorFactory {
  /**
   * @private
   * @type {Map<string, Object>} Cache of loaded generator modules
   */
  static #moduleCache = new Map();

  /**
   * @private
   * @type {Object} Default crypto adapter instance
   */
  static #defaultCryptoAdapter = new DefaultCryptoAdapter();

  /**
   * @private
   * @type {Map<string, string>} Type to module path mapping
   */
  static #modulePathMap = new Map([
    ["strong", "../lib/strong-password.js"],
    ["base64", "../lib/base64-password.js"],
    ["memorable", "../lib/memorable-password.js"],
  ]);

  /**
   * @private
   * @type {Set<string>} Types that require async handling
   */
  static #asyncTypes = new Set(["memorable"]);

  /**
   * Validates that a module has the required interface.
   *
   * @private
   * @param {Object} module - The loaded module to validate
   * @param {string} type - The password type for error reporting
   * @throws {Error} If module interface is invalid
   */
  /* c8 ignore start - Defensive validation for malformed modules */
  static #validateModuleInterface(module, type) {
    if (!module || typeof module !== "object") {
      throw new Error(`Invalid module for type "${type}": module must be an object`);
    }

    if (typeof module.generatePassword !== "function") {
      throw new Error(`Invalid module for type "${type}": missing generatePassword function`);
    }

    // Additional validation could be added here for specific function signatures
    // if needed for stricter type checking
  }
  /* c8 ignore stop */

  /**
   * Validates password generation configuration.
   *
   * @private
   * @param {Object} config - Configuration object to validate
   * @throws {Error} If configuration is invalid
   */
  static #validateConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Configuration must be an object");
    }

    if (!config.type) {
      throw new Error(PASSWORD_ERRORS.TYPE_REQUIRED);
    }

    if (!isValidPasswordType(config.type)) {
      throw new Error(PASSWORD_ERRORS.UNKNOWN_TYPE(config.type));
    }

    // Type-specific validation
    if (["strong", "base64"].includes(config.type)) {
      if (typeof config.length !== "number" || config.length <= 0) {
        throw new RangeError(
          `Type "${config.type}" requires a positive integer "length" parameter`
        );
      }
    }

    if (typeof config.iteration !== "number" || config.iteration <= 0) {
      throw new RangeError("Configuration requires a positive integer \"iteration\" parameter");
    }

    if (typeof config.separator !== "string") {
      throw new Error("Configuration requires a string \"separator\" parameter");
    }
  }

  /**
   * Dynamically loads a password generator module with caching.
   *
   * @private
   * @param {string} type - The password type to load module for
   * @param {Object} [cryptoAdapter] - Optional crypto adapter to inject
   * @returns {Promise<Object>} The loaded generator module
   * @throws {Error} If module loading fails or module is invalid
   */
  static async #loadModule(type, cryptoAdapter = null) {
    // Create cache key that includes adapter identity for proper caching
    const cacheKey = cryptoAdapter ? `${type}_custom` : type;

    // Check cache first (only use cached modules for default adapter)
    if (!cryptoAdapter && this.#moduleCache.has(cacheKey)) {
      return this.#moduleCache.get(cacheKey);
    }

    const modulePath = this.#modulePathMap.get(type);
    /* c8 ignore start - Defensive check for unmapped types */
    if (!modulePath) {
      throw new Error(PASSWORD_ERRORS.UNKNOWN_TYPE(type));
    }
    /* c8 ignore stop */

    try {
      const module = await import(modulePath);

      // Validate the loaded module
      this.#validateModuleInterface(module, type);

      // Create wrapped module with injected crypto adapter if provided
      const wrappedModule = cryptoAdapter
        ? this.#wrapModuleWithAdapter(module, cryptoAdapter, type)
        : module;

      // Cache the module only for default adapter
      if (!cryptoAdapter) {
        this.#moduleCache.set(cacheKey, wrappedModule);
      }

      return wrappedModule;
      /* c8 ignore start - Error handling for various import failures */
    } catch (error) {
      // Handle different types of import errors
      if (error.code === "ERR_MODULE_NOT_FOUND") {
        throw new Error(`Password generator module not found for type "${type}"`);
      }

      if (error.code === "ERR_INVALID_MODULE_SPECIFIER") {
        throw new Error(`Invalid module specifier for type "${type}"`);
      }

      // Handle ES module syntax errors
      if (error.name === "SyntaxError") {
        throw new Error(
          `Syntax error in password generator module for type "${type}": ${error.message}`
        );
      }

      // Re-throw validation errors and other custom errors
      if (error.message.includes("Invalid module for type")) {
        throw error;
      }

      // Generic import error
      throw new Error(
        `Failed to load password generator module for type "${type}": ${error.message}`
      );
    }
    /* c8 ignore stop */
  }

  /**
   * Wraps a generator module to inject crypto adapter dependencies.
   *
   * @private
   * @param {Object} module - The generator module to wrap
   * @param {Object} cryptoAdapter - The crypto adapter instance to inject
   * @param {string} type - The password type for error reporting
   * @returns {Object} Wrapped module with injected dependencies
   */
  static #wrapModuleWithAdapter(module, cryptoAdapter, type) {
    return {
      ...module,
      generatePassword: (config) => {
        // Inject crypto adapter into the configuration
        const configWithAdapter = {
          ...config,
          cryptoAdapter,
        };

        // Call original function with injected adapter
        return module.generatePassword(configWithAdapter);
      },
    };
  }

  /**
   * Creates a password generator for the specified type.
   *
   * @param {string} type - The type of password generator to create
   * @param {Object} [cryptoAdapter] - Optional crypto adapter to inject (uses default if not provided)
   * @returns {Promise<Object>} Password generator instance with generate method
   * @throws {Error} If type is invalid or module loading fails
   */
  static async createGenerator(type, cryptoAdapter = null) {
    if (!type) {
      throw new Error(PASSWORD_ERRORS.TYPE_REQUIRED);
    }

    if (!isValidPasswordType(type)) {
      throw new Error(PASSWORD_ERRORS.UNKNOWN_TYPE(type));
    }

    try {
      const module = await this.#loadModule(type, cryptoAdapter);
      const isAsync = this.#asyncTypes.has(type);

      return {
        type,
        isAsync,

        /**
         * Generates a password using the loaded module.
         *
         * @param {Object} config - Password generation configuration
         * @returns {Promise<string>} Generated password
         */
        async generate(config) {
          // Validate configuration
          PasswordGeneratorFactory.#validateConfig({ ...config, type });

          try {
            // Call the module's generatePassword function
            const result = module.generatePassword(config);

            // Handle both sync and async modules uniformly
            return isAsync ? await result : result;
            /* c8 ignore start - Error wrapper for generation failures */
          } catch (error) {
            // Wrap generation errors with context
            throw new Error(`Password generation failed for type "${type}": ${error.message}`);
          }
          /* c8 ignore stop */
        },
      };
      /* c8 ignore start - Error wrapper for factory failures */
    } catch (error) {
      // Re-throw with factory context if not already wrapped
      if (!error.message.includes("Failed to load") && !error.message.includes("Invalid module")) {
        throw new Error(`Failed to create password generator for type "${type}": ${error.message}`);
      }
      throw error;
    }
    /* c8 ignore stop */
  }

  /**
   * Generates a password directly using the factory (convenience method).
   *
   * @param {Object} config - Password generation configuration
   * @param {string} config.type - The type of password to generate
   * @param {number} [config.length] - Length of each password chunk (for strong/base64 types)
   * @param {number} config.iteration - Number of password chunks or words
   * @param {string} config.separator - Separator between password chunks
   * @param {Object} [config.cryptoAdapter] - Optional crypto adapter to use
   * @returns {Promise<string>} Generated password
   * @throws {Error} If generation fails
   */
  static async generate(config) {
    this.#validateConfig(config);

    const { cryptoAdapter, ...generationConfig } = config;
    const generator = await this.createGenerator(config.type, cryptoAdapter);
    return generator.generate(generationConfig);
  }

  /**
   * Checks if a password type is supported.
   *
   * @param {string} type - The password type to check
   * @returns {boolean} True if type is supported, false otherwise
   */
  static isSupported(type) {
    return isValidPasswordType(type) && this.#modulePathMap.has(type);
  }

  /**
   * Gets all supported password types.
   *
   * @returns {string[]} Array of supported password types
   */
  static getSupportedTypes() {
    return Array.from(this.#modulePathMap.keys());
  }

  /**
   * Clears the module cache (useful for testing or hot reloading).
   *
   * @static
   */
  static clearCache() {
    this.#moduleCache.clear();
  }

  /**
   * Registers a new password generator type with its module path.
   *
   * @param {string} type - The password type identifier
   * @param {string} modulePath - The path to the generator module
   * @param {boolean} [isAsync=false] - Whether the module's generatePassword is async
   * @throws {Error} If type is already registered or parameters are invalid
   */
  static registerType(type, modulePath, isAsync = false) {
    if (!type || typeof type !== "string") {
      throw new Error("Type must be a non-empty string");
    }

    if (!modulePath || typeof modulePath !== "string") {
      throw new Error("Module path must be a non-empty string");
    }

    if (this.#modulePathMap.has(type)) {
      throw new Error(`Password type "${type}" is already registered`);
    }

    this.#modulePathMap.set(type, modulePath);

    if (isAsync) {
      this.#asyncTypes.add(type);
    }
  }

  /**
   * Unregisters a password generator type.
   *
   * @param {string} type - The password type to unregister
   * @returns {boolean} True if type was unregistered, false if not found
   */
  static unregisterType(type) {
    if (!this.#modulePathMap.has(type)) {
      return false;
    }

    this.#modulePathMap.delete(type);
    this.#asyncTypes.delete(type);
    this.#moduleCache.delete(type);

    return true;
  }
}

export default PasswordGeneratorFactory;
