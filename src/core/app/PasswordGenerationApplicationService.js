// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { ConfigurationService } from "../../services/ConfigurationService.js";
import PasswordGeneratorFactory from "../PasswordGeneratorFactory.js";
import { AuditApplicationService } from "./AuditApplicationService.js";

/**
 * Application service for password generation workflows.
 * Orchestrates the complete password generation process including configuration
 * resolution, validation, and generation coordination.
 *
 * This service acts as a pure application layer, handling business workflow
 * without direct infrastructure dependencies.
 */
export class PasswordGenerationApplicationService {
  /**
   * Generates a password with the specified configuration and options.
   * Handles configuration resolution, validation, and generation coordination.
   *
   * @param {Object} options - Generation options.
   * @param {string} [options.preset] - The preset to use.
   * @param {string} [options.type] - Password type.
   * @param {number} [options.length] - Password length.
   * @param {number} [options.iteration] - Number of iterations.
   * @param {string} [options.separator] - Separator character.
   * @param {boolean} [options.audit] - Whether to enable audit mode.
   * @returns {Promise<Object>} Generation result with password, config, and optional auditReport.
   * @throws {Error} When configuration is invalid or generation fails.
   */
  static async generatePassword(options) {
    // Define the core password generation operation
    const generateOperation = async () => {
      // Resolve and validate configuration
      const config = ConfigurationService.resolveConfiguration(options.preset, {
        type: options.type,
        length: options.length,
        iteration: options.iteration,
        separator: options.separator,
      });

      // Create clean generation configuration
      const generationConfig = ConfigurationService.createGenerationConfig(config);

      // Generate the password using the factory
      const password = await PasswordGeneratorFactory.generate(generationConfig);

      return { password, config };
    };

    try {
      // Execute the operation with or without audit based on options
      const { result, auditReport } = await AuditApplicationService.executeOperation(
        options,
        generateOperation
      );

      // Return result with audit report if available
      return auditReport ? { ...result, auditReport } : result;
    } catch (error) {
      throw new Error(`Password generation failed: ${error.message}`);
    }
  }

  /**
   * Validates generation options without performing generation.
   * Useful for pre-validation in UI contexts.
   *
   * @param {Object} options - Options to validate.
   * @param {string} [options.preset] - The preset to use.
   * @param {string} [options.type] - Password type.
   * @param {number} [options.length] - Password length.
   * @param {number} [options.iteration] - Number of iterations.
   * @param {string} [options.separator] - Separator character.
   * @returns {Object} Resolved configuration if valid.
   * @throws {Error} When configuration is invalid.
   */
  static validateOptions(options) {
    return ConfigurationService.resolveConfiguration(options.preset, {
      type: options.type,
      length: options.length,
      iteration: options.iteration,
      separator: options.separator,
    });
  }

  /**
   * Creates a generation configuration from validated options.
   * Useful for preparing configuration for batch operations.
   *
   * @param {Object} resolvedConfig - Pre-validated configuration.
   * @returns {Object} Clean generation configuration.
   */
  static createGenerationConfig(resolvedConfig) {
    return ConfigurationService.createGenerationConfig(resolvedConfig);
  }
}