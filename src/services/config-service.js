// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Configuration Service - Handles configuration validation and processing
 *
 * This module provides services for merging presets with user options,
 * validating configuration, and processing password generation parameters.
 *
 * @module services/config-service
 */

import {
  isValidPreset,
  getPresetConfig,
  getValidPresetsString,
  isValidPasswordType,
  getValidTypesString,
} from '../config.js';

/**
 * Merges preset configuration with user options, giving priority to user options.
 *
 * @param {string|undefined} preset - The preset name.
 * @param {Object} userOptions - User-provided options.
 * @returns {Object} Merged configuration.
 * @throws {Error} If the preset is invalid.
 */
export const mergePresetWithOptions = (preset, userOptions) => {
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
};

/**
 * Validates the final configuration and provides helpful error messages.
 *
 * @param {Object} config - The final configuration to validate.
 * @param {boolean} hasPreset - Whether a preset was used.
 * @throws {Error} If configuration is invalid or missing required fields.
 */
export const validateFinalConfig = (config, hasPreset) => {
  const missingRequired = [];

  if (!config.type) {
    missingRequired.push('type');
  }
  if (config.iteration === undefined) {
    missingRequired.push('iteration');
  }
  if (config.separator === undefined) {
    missingRequired.push('separator');
  }

  if (missingRequired.length > 0) {
    /* c8 ignore next 3 - defensive code: valid presets always have required fields */
    if (hasPreset) {
      throw new Error(
        `Missing required options: ${missingRequired.join(
          ', '
        )}. This should not happen with a valid preset.`
      );
    } else {
      throw new Error(
        `Missing required options: ${missingRequired.join(', ')}. ` +
          `Either provide these options or use a preset (-p ${
            getValidPresetsString().split(', ')[0]
          })`
      );
    }
  }

  if (!isValidPasswordType(config.type)) {
    throw new Error(
      `Invalid password type '${config.type}'. Valid types: ${getValidTypesString()}`
    );
  }
};

/**
 * Creates a normalized configuration object for password generation.
 *
 * @param {Object} config - The raw configuration object.
 * @returns {Object} Normalized configuration ready for password generation.
 */
export const normalizeConfig = (config) => {
  return {
    type: config.type,
    length: config.length,
    iteration: config.iteration,
    separator: config.separator,
  };
};

/**
 * Processes and validates the complete configuration workflow.
 *
 * @param {string|undefined} preset - The preset name.
 * @param {Object} userOptions - User-provided options.
 * @returns {Object} Processed and validated configuration.
 * @throws {Error} If configuration is invalid.
 */
export const processConfiguration = (preset, userOptions) => {
  // Merge preset with user options
  const mergedConfig = mergePresetWithOptions(preset, userOptions);

  // Validate the final configuration
  validateFinalConfig(mergedConfig, !!preset);

  // Return normalized configuration
  return normalizeConfig(mergedConfig);
};
