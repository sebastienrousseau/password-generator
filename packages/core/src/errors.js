// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Core error message templates for password generation.
 * These are pure functions that return error message strings.
 *
 * @module errors
 */

/**
 * Cryptographic operation error messages.
 */
export const CRYPTO_ERRORS = {
  /**
   * Error message for invalid positive integer parameters.
   * @param {string} paramName - The name of the parameter that must be positive.
   * @returns {string} The error message.
   */
  MUST_BE_POSITIVE_INTEGER: (paramName) => `The ${paramName} argument must be a positive integer`,

  /**
   * Error message for empty character set.
   * @returns {string} The error message.
   */
  EMPTY_CHARSET: "Character set must not be empty",

  /**
   * Error message for invalid byte length.
   * @returns {string} The error message.
   */
  INVALID_BYTE_LENGTH: "Byte length must be a positive integer",
};

/**
 * Password generation error messages.
 */
export const PASSWORD_ERRORS = {
  /**
   * Error message when password type is not provided.
   */
  TYPE_REQUIRED: "Password type is required",

  /**
   * Error message for unknown password type.
   * @param {string} type - The invalid type that was provided.
   * @param {string[]} validTypes - Array of valid password types.
   * @returns {string} The error message.
   */
  UNKNOWN_TYPE: (type, validTypes = ["strong", "base64", "memorable"]) =>
    `Unknown password type: "${type}". Valid types: ${validTypes.join(", ")}`,

  /**
   * Error message for invalid iteration count.
   * @returns {string} The error message.
   */
  INVALID_ITERATION: "Iteration must be a positive integer",
  /** Error message for invalid length. */
  INVALID_LENGTH: "Length must be a positive integer",
  /** Error message for missing separator. */
  SEPARATOR_REQUIRED: "Separator is required",
};

/**
 * Port validation error messages.
 */
export const PORT_ERRORS = {
  /**
   * Error message for missing required ports.
   * @param {string[]} missingPorts - Array of missing port names.
   * @param {string[]} requiredPorts - Array of required port names.
   * @returns {string} The error message.
   */
  MISSING_PORTS: (missingPorts, requiredPorts) =>
    `Missing required ports: ${missingPorts.join(", ")}. Required ports: ${requiredPorts.join(", ")}`,
  /** Error message for invalid port implementation. */
  INVALID_PORT: (portName, expectedClass) =>
    `${portName}: Missing required methods for ${expectedClass}`,
  /** Error message for unknown port type. */
  UNKNOWN_PORT_TYPE: (portName, expectedClass) => `${portName}: Unknown port type ${expectedClass}`,
};
