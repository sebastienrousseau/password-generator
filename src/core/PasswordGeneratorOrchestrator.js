// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { PasswordGenerationApplicationService } from "./app/PasswordGenerationApplicationService.js";

/**
 * Core orchestration class for password generation business logic.
 * Handles configuration merging, validation, and password generation coordination.
 */
export class PasswordGeneratorOrchestrator {
  /**
   * Orchestrates the complete password generation process by delegating to the
   * PasswordGenerationApplicationService.
   *
   * This method now serves as a simple facade that delegates all work to the
   * application service layer, removing direct infrastructure dependencies.
   *
   * @param {Object} options - CLI options and configuration.
   * @param {string} [options.preset] - The preset to use.
   * @param {string} [options.type] - Password type.
   * @param {number} [options.length] - Password length.
   * @param {number} [options.iteration] - Number of iterations.
   * @param {string} [options.separator] - Separator character.
   * @param {boolean} [options.audit] - Whether to enable audit mode.
   * @returns {Promise<Object>} Generation result with password, config, and optional auditReport.
   */
  static async orchestrateGeneration(options) {
    return await PasswordGenerationApplicationService.generatePassword(options);
  }
}
