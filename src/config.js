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
    type: {
      flags: "-t, --type <type>",
      description: `password type (${VALID_PASSWORD_TYPES.join(", ")})`,
      required: true,
    },
    length: {
      flags: "-l, --length <number>",
      description: "length of each password chunk",
      parser: parseInt,
      defaultValue: CLI_DEFAULTS.length,
    },
    iteration: {
      flags: "-i, --iteration <number>",
      description: "number of password chunks or words",
      parser: parseInt,
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
