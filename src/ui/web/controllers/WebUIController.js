// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Web UI Controller - Thin Adapter Pattern
 *
 * This controller is a thin adapter that:
 * 1. Captures UI form state
 * 2. Wires browser adapters to core service
 * 3. Delegates ALL validation to core service via service.validateConfig()
 * 4. Delegates ALL generation to core service via service.generate()
 * 5. Transforms results to view models for rendering
 *
 * NO business rules or validation logic beyond basic type coercion.
 */

import { createService } from "../../../../packages/core/src/index.js";
import { BrowserCryptoRandom } from "../adapters/BrowserCryptoRandom.js";
import { BrowserStorage } from "../adapters/BrowserStorage.js";
import { BrowserClock } from "../adapters/BrowserClock.js";
import { StateToCoreMapper } from "../state/StateToCoreMapper.js";
import { PasswordViewModel } from "../view-models/PasswordViewModel.js";
import { ValidationViewModel } from "../view-models/ValidationViewModel.js";
import { EntropyViewModel } from "../view-models/EntropyViewModel.js";

/**
 * Web UI controller implementing the thin adapter pattern.
 */
export class WebUIController {
  /**
   * Creates a WebUIController with browser adapters wired to core service.
   *
   * @param {Object} [options] - Configuration options.
   * @param {Object} [options.randomGenerator] - Custom RandomGeneratorPort.
   * @param {Object} [options.storage] - Custom StoragePort.
   * @param {Object} [options.clock] - Custom ClockPort.
   */
  constructor(options = {}) {
    // Wire browser adapters to core service
    this.service = createService({}, {
      randomGenerator: options.randomGenerator ?? new BrowserCryptoRandom(),
      storage: options.storage ?? new BrowserStorage(),
      clock: options.clock ?? new BrowserClock(),
    });

    this.stateToCoreMapper = new StateToCoreMapper();
  }

  /**
   * Validates form state by delegating to core service.
   *
   * @param {FormState} formState - The UI form state.
   * @returns {ValidationViewModel} View model for UI validation display.
   */
  validate(formState) {
    // Step 1: Map UI state to core config (data transformation only)
    const config = this.stateToCoreMapper.toConfig(formState);

    // Step 2: Delegate validation to core service
    const validation = this.service.validateConfig(config);

    // Step 3: Transform to view model
    return ValidationViewModel.fromValidationResult(validation, formState);
  }

  /**
   * Generates a password by delegating to core service.
   *
   * @param {FormState} formState - The UI form state.
   * @returns {Promise<PasswordViewModel>} View model for UI password display.
   * @throws {Error} If validation fails.
   */
  async generate(formState) {
    // Step 1: Validate first (fail fast)
    const validation = this.validate(formState);
    if (!validation.isValid) {
      throw new Error(validation.errors.join("; "));
    }

    // Step 2: Map UI state to core config
    const config = this.stateToCoreMapper.toConfig(formState);

    // Step 3: Delegate generation to core service (with entropy info for Web UI)
    const result = await this.service.generate({ ...config, includeEntropy: true });

    // Step 4: Extract password and entropy info from result
    // Core service returns an object with { password, entropy, securityLevel, metadata }
    const password = result.password;
    const entropyInfo = {
      totalBits: result.entropy,
      securityLevel: result.securityLevel,
      recommendation: result.metadata?.recommendation || ""
    };

    // Step 5: Transform to view model
    return PasswordViewModel.fromGenerationResult({
      password,
      entropyInfo,
      config,
    });
  }

  /**
   * Calculates entropy for a configuration without generating.
   *
   * @param {FormState} formState - The UI form state.
   * @returns {EntropyViewModel} View model for entropy display.
   */
  calculateEntropy(formState) {
    const config = this.stateToCoreMapper.toConfig(formState);
    const entropyInfo = this.service.calculateEntropy(config);
    return EntropyViewModel.fromEntropyInfo(entropyInfo);
  }

  /**
   * Gets supported password types from core service.
   *
   * @returns {string[]} Array of supported types.
   */
  getSupportedTypes() {
    return this.service.getSupportedTypes();
  }

  /**
   * Gets the core service instance.
   * Useful for testing and advanced usage.
   *
   * @returns {Object} The core password generation service.
   */
  getService() {
    return this.service;
  }

  /**
   * Gets the state mapper instance.
   *
   * @returns {StateToCoreMapper} The state mapper.
   */
  getMapper() {
    return this.stateToCoreMapper;
  }
}

/**
 * Factory function to create a WebUIController.
 *
 * @param {Object} [options] - Configuration options.
 * @returns {WebUIController} New controller instance.
 */
export function createWebUIController(options = {}) {
  return new WebUIController(options);
}
