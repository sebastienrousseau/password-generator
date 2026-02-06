// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { ConfigurationService } from "../services/ConfigurationService.js";
import PasswordGeneratorFactory from "./PasswordGeneratorFactory.js";
import {
  setAuditMode,
  resetAuditSession,
  finishAuditSession,
  generateAuditReport
} from "../utils/security-audit.js";

/**
 * Core orchestration class for password generation business logic.
 * Handles configuration merging, validation, and password generation coordination.
 */
export class PasswordGeneratorOrchestrator {


  /**
   * Orchestrates the complete password generation process including configuration merging,
   * validation, audit management, and password generation.
   *
   * @param {Object} options - CLI options and configuration.
   * @param {string} [options.preset] - The preset to use.
   * @param {string} [options.type] - Password type.
   * @param {number} [options.length] - Password length.
   * @param {number} [options.iteration] - Number of iterations.
   * @param {string} [options.separator] - Separator character.
   * @param {boolean} [options.audit] - Whether to enable audit mode.
   * @returns {Promise<{password: string, config: Object, auditReport?: Object}>} Generation result.
   */
  static async orchestrateGeneration(options) {
    try {
      // Enable audit mode if requested
      if (options.audit) {
        setAuditMode(true);
        resetAuditSession();
      }

      // Resolve and validate configuration using ConfigurationService
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

      // Finalize audit session if enabled
      if (options.audit) {
        finishAuditSession();
      }

      const result = { password, config };

      // Include audit report if audit mode was enabled
      if (options.audit) {
        result.auditReport = generateAuditReport();
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
}
