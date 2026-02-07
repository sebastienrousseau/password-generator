// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { ConfigurationService } from "../../services/ConfigurationService.js";
import PasswordGeneratorFactory from "../PasswordGeneratorFactory.js";

/**
 * Core password generation application service.
 *
 * This service provides the fundamental password generation functionality
 * extracted from the orchestrator layer, focusing purely on the core
 * business logic without infrastructure dependencies.
 */
export class PasswordGenerator {
  /**
   * Generates a password using the specified configuration.
   *
   * This is the extracted core logic from PasswordGeneratorOrchestrator,
   * providing a clean application service for password generation.
   *
   * @param {Object} options - Generation configuration options.
   * @param {string} [options.preset] - The preset to use.
   * @param {string} [options.type] - Password type.
   * @param {number} [options.length] - Password length.
   * @param {number} [options.iteration] - Number of iterations.
   * @param {string} [options.separator] - Separator character.
   * @returns {Promise<Object>} Generation result with password and resolved configuration.
   * @throws {Error} When configuration is invalid or generation fails.
   */
  static async generate(options) {
    try {
      // Resolve and validate the configuration
      const resolvedConfig = ConfigurationService.resolveConfiguration(options.preset, {
        type: options.type,
        length: options.length,
        iteration: options.iteration,
        separator: options.separator,
      });

      // Create clean generation configuration
      const generationConfig = ConfigurationService.createGenerationConfig(resolvedConfig);

      // Generate the password using the factory
      const password = await PasswordGeneratorFactory.generate(generationConfig);

      return {
        password,
        config: resolvedConfig
      };
    } catch (error) {
      throw new Error(`Password generation failed: ${error.message}`);
    }
  }

  /**
   * Validates generation options and returns resolved configuration.
   *
   * @param {Object} options - Options to validate.
   * @param {string} [options.preset] - The preset to use.
   * @param {string} [options.type] - Password type.
   * @param {number} [options.length] - Password length.
   * @param {number} [options.iteration] - Number of iterations.
   * @param {string} [options.separator] - Separator character.
   * @returns {Object} Resolved and validated configuration.
   * @throws {Error} When configuration is invalid.
   */
  static validate(options) {
    return ConfigurationService.resolveConfiguration(options.preset, {
      type: options.type,
      length: options.length,
      iteration: options.iteration,
      separator: options.separator,
    });
  }

  /**
   * Creates a generation configuration from validated options.
   *
   * @param {Object} resolvedConfig - Pre-validated configuration.
   * @returns {Object} Clean generation configuration for the factory.
   */
  static createConfig(resolvedConfig) {
    return ConfigurationService.createGenerationConfig(resolvedConfig);
  }
}