// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Maps UI form state to core service configuration.
 *
 * This is the ONLY place where UI state is transformed to core config.
 * No business logic - pure data transformation.
 */

import { FormState } from "./FormState.js";

/**
 * Mapper between UI FormState and core configuration objects.
 */
export class StateToCoreMapper {
  /**
   * Transforms FormState to core configuration object.
   *
   * This method performs pure data transformation:
   * - Converts string values to appropriate types
   * - Filters out empty/undefined values
   * - Does NOT validate (validation is core's responsibility)
   *
   * @param {FormState} formState - UI form state.
   * @returns {Object} Core configuration for service.generate().
   */
  toConfig(formState) {
    const config = {};

    // Type: required, pass as-is
    if (formState.type) {
      config.type = formState.type;
    }

    // Length: optional, parse to integer
    if (formState.length !== "" && formState.length !== undefined) {
      const parsed = parseInt(formState.length, 10);
      if (!isNaN(parsed)) {
        config.length = parsed;
      }
    }

    // Iteration: optional, parse to integer
    if (formState.iteration !== "" && formState.iteration !== undefined) {
      const parsed = parseInt(formState.iteration, 10);
      if (!isNaN(parsed)) {
        config.iteration = parsed;
      }
    }

    // Separator: optional, pass as-is
    if (formState.separator !== undefined) {
      config.separator = formState.separator;
    }

    return config;
  }

  /**
   * Transforms core configuration back to FormState.
   * Useful for populating forms from saved configurations.
   *
   * @param {Object} config - Core configuration object.
   * @returns {FormState} FormState populated from config.
   */
  toFormState(config) {
    return new FormState({
      type: config.type ?? "",
      length: config.length !== undefined ? String(config.length) : "",
      iteration: config.iteration !== undefined ? String(config.iteration) : "",
      separator: config.separator ?? "-",
    });
  }

  /**
   * Extracts UI-only options from FormState.
   * These are options that affect UI behavior but not password generation.
   *
   * @param {FormState} formState - UI form state.
   * @returns {Object} UI-specific options.
   */
  toUIOptions(formState) {
    return {
      copyToClipboard: formState.copyToClipboard,
      showPassword: formState.showPassword,
      preset: formState.preset,
    };
  }
}
