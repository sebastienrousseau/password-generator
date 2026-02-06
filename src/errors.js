// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { getValidTypesString } from "./config.js";

/**
 * Centralized error message constants for the password generator.
 *
 * This module provides a single source of truth for all error messages
 * used throughout the application, improving consistency and maintainability.
 *
 * @module errors
 */

/**
 * Error messages for string validation and transformation utilities.
 */
export const STRING_ERRORS = {
  /** Error message when a non-string value is provided where a string is expected. */
  INPUT_MUST_BE_STRING: "Input must be a string",
};

/**
 * Error messages for cryptographic operations and validation.
 */
export const CRYPTO_ERRORS = {
  /** Template for positive integer validation errors. Use with parameter name. */
  MUST_BE_POSITIVE_INTEGER: (paramName) => `The ${paramName} argument must be a positive integer`,
};

/**
 * Error messages for password generation operations.
 */
export const PASSWORD_ERRORS = {
  /** Error message when password type is missing. */
  TYPE_REQUIRED: "Password type is required",

  /** Template for unknown password type errors. Use with type value. */
  UNKNOWN_TYPE: (type) => `Unknown password type: "${type}". Valid types: ${getValidTypesString()}`,
};
