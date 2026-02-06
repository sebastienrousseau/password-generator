// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Centralized configuration for the password generator CLI.
 *
 * This module provides a single source of truth for all CLI configuration,
 * including valid password types, default values, and option definitions.
 *
 * @module config
 */

/**
 * Valid password types supported by the generator.
 */
export const VALID_PASSWORD_TYPES = ["strong", "base64", "memorable"];

/**
 * Valid preset profile names.
 */
export const VALID_PRESETS = ["quick", "secure", "memorable"];

/**
 * Preset profile configurations for zero-config CLI usage.
 */
export const PRESET_PROFILES = {
  quick: {
    type: "strong",
    length: 12,
    iteration: 3,
    separator: "-",
  },
  secure: {
    type: "strong",
    length: 16,
    iteration: 4,
    separator: "",
  },
  memorable: {
    type: "memorable",
    iteration: 4,
    separator: "-",
  },
};

/**
 * Default values for CLI options.
 */
export const CLI_DEFAULTS = {
  /** Default length for password chunks (applies to strong and base64 types) */
  length: 16,
  /** Default number of password chunks or words */
  iteration: 3,
  /** Default separator between password chunks */
  separator: "-",
  /** Default clipboard option state */
  clipboard: false,
};

/**
 * CLI option configurations for the commander program.
 */
export const CLI_OPTIONS = {
  name: "password-generator",
  description: "A fast, simple and powerful utility for generating strong, unique and random passwords",
  options: {
    preset: {
      flags: "-p, --preset <preset>",
      description: `use a preset configuration (${VALID_PRESETS.join(", ")})`,
    },
    type: {
      flags: "-t, --type <type>",
      description: `password type (${VALID_PASSWORD_TYPES.join(", ")})`,
      required: true,
    },
    length: {
      flags: "-l, --length <number>",
      description: "length of each password chunk",
      parser: (val) => parseInt(val, 10),
      defaultValue: CLI_DEFAULTS.length,
    },
    iteration: {
      flags: "-i, --iteration <number>",
      description: "number of password chunks or words",
      parser: (val) => parseInt(val, 10),
      required: true,
    },
    separator: {
      flags: "-s, --separator <char>",
      description: "separator between password chunks",
      required: true,
    },
    clipboard: {
      flags: "-c, --clipboard",
      description: "copy the generated password to clipboard",
      defaultValue: CLI_DEFAULTS.clipboard,
    },
    audit: {
      flags: "-a, --audit",
      description: "show security audit with entropy sources and algorithms used",
      defaultValue: false,
    },
    learn: {
      flags: "--learn",
      description: "show equivalent CLI command to help graduate from guided mode",
      defaultValue: false,
    },
    interactive: {
      flags: "--interactive",
      description: "start interactive guided setup for password generation",
      defaultValue: false,
    },
  },
};

/**
 * Helper function to validate password type.
 *
 * @param {string} type - The password type to validate.
 * @returns {boolean} True if the type is valid, false otherwise.
 */
export const isValidPasswordType = (type) => {
  return VALID_PASSWORD_TYPES.includes(type);
};

/**
 * Helper function to get formatted valid types string for error messages.
 *
 * @returns {string} Comma-separated list of valid password types.
 */
export const getValidTypesString = () => {
  return VALID_PASSWORD_TYPES.join(", ");
};

/**
 * Helper function to validate preset name.
 *
 * @param {string} preset - The preset name to validate.
 * @returns {boolean} True if the preset is valid, false otherwise.
 */
export const isValidPreset = (preset) => {
  return VALID_PRESETS.includes(preset);
};

/**
 * Helper function to get preset configuration.
 *
 * @param {string} preset - The preset name.
 * @returns {Object|null} Preset configuration object or null if invalid.
 */
export const getPresetConfig = (preset) => {
  return isValidPreset(preset) ? PRESET_PROFILES[preset] : null;
};

/**
 * Helper function to get formatted valid presets string for error messages.
 *
 * @returns {string} Comma-separated list of valid preset names.
 */
export const getValidPresetsString = () => {
  return VALID_PRESETS.join(", ");
};
