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
export const VALID_PASSWORD_TYPES = [
  "strong",
  "base64",
  "memorable",
  "quantum-resistant",
  "diceware",
  "honeyword",
  "pronounceable",
  "custom",
];

/**
 * Valid output formats for bulk operations.
 */
export const VALID_OUTPUT_FORMATS = ["text", "json", "yaml", "csv"];

/**
 * Valid preset profile names.
 */
export const VALID_PRESETS = ["quick", "secure", "memorable", "quantum"];

/**
 * Preset profile configurations for zero-config CLI usage.
 */
export const PRESET_PROFILES = {
  quick: {
    type: "strong",
    length: 14,
    iteration: 4,
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
  quantum: {
    type: "quantum-resistant",
    length: 43,
    iteration: 1,
    separator: "",
  },
};

/**
 * Validation bounds for password generation parameters.
 * These constants are used by both CLI and onboarding to ensure consistency.
 */
export const VALIDATION_BOUNDS = {
  /** Minimum length for password chunks */
  minLength: 8,
  /** Maximum length for password chunks */
  maxLength: 64,
  /** Minimum number of chunks for strong/base64 passwords */
  minIteration: 1,
  /** Maximum number of chunks for strong/base64 passwords */
  maxIteration: 10,
  /** Minimum number of words for memorable passwords */
  minWords: 2,
  /** Maximum number of words for memorable passwords */
  maxWords: 8,
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
  description:
    "A fast, simple and powerful utility for generating strong, unique and quantum-resistant passwords",
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
      // Note: No default value here - defaults are handled by presets or in service layer
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
    format: {
      flags: "-f, --format <format>",
      description: "output format for bulk operations (json, yaml, csv, text)",
      defaultValue: "text",
    },
    count: {
      flags: "-n, --count <number>",
      description: "number of passwords to generate for bulk operations",
      parser: (val) => parseInt(val, 10),
      defaultValue: 1,
    },
    interactive: {
      flags: "--interactive",
      description: "start interactive guided setup for password generation",
      defaultValue: false,
    },
    kdfMemory: {
      flags: "--kdf-memory <number>",
      description: "Argon2id memory parameter in KB (default: 65536 KB = 64 MB)",
      parser: (val) => parseInt(val, 10),
      defaultValue: 65536,
    },
    kdfTime: {
      flags: "--kdf-time <number>",
      description: "Argon2id time cost parameter (default: 3 iterations)",
      parser: (val) => parseInt(val, 10),
      defaultValue: 3,
    },
    kdfParallelism: {
      flags: "--kdf-parallelism <number>",
      description: "Argon2id parallelism parameter (default: 4 threads)",
      parser: (val) => parseInt(val, 10),
      defaultValue: 4,
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
