// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import {
  isValidPreset,
  getPresetConfig,
  getValidPresetsString,
  isValidPasswordType,
  getValidTypesString,
} from "../config.js";

/**
 * Service for handling password generator configuration operations.
 * Provides methods for merging presets with user options, validation,
 * and configuration resolution.
 *
 * @class ConfigurationService
 */
export class ConfigurationService {
  /**
   * Merges preset configuration with user options, giving priority to user options.
   * Filters out undefined values from user options to prevent overriding preset defaults.
   *
   * @param {string|undefined} preset - The preset name.
   * @param {Object} userOptions - User-provided options.
   * @param {string} [userOptions.type] - Password type.
   * @param {number} [userOptions.length] - Length of each password chunk.
   * @param {number} [userOptions.iteration] - Number of password chunks or words.
   * @param {string} [userOptions.separator] - Separator between password chunks.
   * @returns {Object} Merged configuration object.
   * @throws {Error} When preset is invalid.
   */
  static mergePresetWithOptions(preset, userOptions) {
    // Filter out undefined values from user options
    const filteredUserOptions = {};
    Object.keys(userOptions).forEach((key) => {
      if (userOptions[key] !== undefined) {
        filteredUserOptions[key] = userOptions[key];
      }
    });

    if (preset) {
      if (!isValidPreset(preset)) {
        throw new Error(`Invalid preset '${preset}'. Valid presets: ${getValidPresetsString()}`);
      }
      const presetConfig = getPresetConfig(preset);
      // Apply preset values first, then override with user options
      return { ...presetConfig, ...filteredUserOptions };
    }

    return filteredUserOptions;
  }

  /**
   * Validates the final configuration and provides helpful error messages.
   * Checks for required fields and valid password types.
   *
   * @param {Object} config - The final configuration to validate.
   * @param {string} config.type - The password type.
   * @param {number} [config.length] - The length of each password chunk.
   * @param {number} config.iteration - The number of password chunks or words.
   * @param {string} config.separator - The separator between password chunks.
   * @param {boolean} hasPreset - Whether a preset was used in configuration.
   * @throws {Error} When configuration is invalid or missing required fields.
   */
  static validateFinalConfig(config, hasPreset) {
    const missingRequired = [];

    if (!config.type) {
      missingRequired.push("type");
    }
    if (config.iteration === undefined) {
      missingRequired.push("iteration");
    }
    if (config.separator === undefined) {
      missingRequired.push("separator");
    }

    if (missingRequired.length > 0) {
      /* c8 ignore next 3 - defensive code: valid presets always have required fields */
      if (hasPreset) {
        throw new Error(
          `Missing required options: ${missingRequired.join(
            ", "
          )}. This should not happen with a valid preset.`
        );
      } else {
        throw new Error(
          `Missing required options: ${missingRequired.join(", ")}. ` +
            `Either provide these options or use a preset (-p ${
              getValidPresetsString().split(", ")[0]
            })`
        );
      }
    }

    if (!isValidPasswordType(config.type)) {
      throw new Error(
        `Invalid password type '${config.type}'. Valid types: ${getValidTypesString()}`
      );
    }
  }

  /**
   * Resolves and validates the final configuration by merging presets with user options.
   * This is a convenience method that combines merging and validation in one step.
   *
   * @param {string|undefined} preset - The preset name.
   * @param {Object} userOptions - User-provided options.
   * @param {string} [userOptions.type] - Password type.
   * @param {number} [userOptions.length] - Length of each password chunk.
   * @param {number} [userOptions.iteration] - Number of password chunks or words.
   * @param {string} [userOptions.separator] - Separator between password chunks.
   * @returns {Object} Resolved and validated configuration object.
   * @throws {Error} When preset is invalid or configuration is incomplete.
   */
  static resolveConfiguration(preset, userOptions) {
    const mergedConfig = this.mergePresetWithOptions(preset, userOptions);
    this.validateFinalConfig(mergedConfig, !!preset);
    return mergedConfig;
  }

  /**
   * Creates a clean configuration object with only the necessary properties
   * for password generation, filtering out any extraneous properties.
   *
   * @param {Object} config - The configuration object to clean.
   * @param {string} config.type - The password type.
   * @param {number} [config.length] - The length of each password chunk.
   * @param {number} config.iteration - The number of password chunks or words.
   * @param {string} config.separator - The separator between password chunks.
   * @returns {Object} Clean configuration object with only generation properties.
   */
  static createGenerationConfig(config) {
    const generationConfig = {
      type: config.type,
      iteration: config.iteration,
      separator: config.separator,
    };

    // Only include length if it's defined (not needed for memorable passwords)
    if (config.length !== undefined) {
      generationConfig.length = config.length;
    }

    return generationConfig;
  }
}
