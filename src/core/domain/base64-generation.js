// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure domain logic for base64 password generation.
 * This module contains validation and string manipulation logic without crypto dependencies.
 *
 * @module base64-generation
 */

import { CRYPTO_ERRORS } from "../../errors.js";

/**
 * Validates that a value is a positive integer, throwing a RangeError if not.
 *
 * @param {*} value The value to validate.
 * @param {string} name The parameter name for the error message.
 * @throws {RangeError} If value is not a positive integer.
 */
export const validatePositiveInteger = (value, name) => {
  if (!Number.isInteger(value) || value < 1) {
    throw new RangeError(CRYPTO_ERRORS.MUST_BE_POSITIVE_INTEGER(name));
  }
};

/**
 * Validates base64 string format
 * @param {string} str - The string to validate
 * @returns {boolean} True if the string is valid base64
 */
export const isValidBase64 = (str) => {
  if (typeof str !== 'string') return false;

  // Base64 pattern: alphanumeric + / + = for padding
  const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;

  if (!base64Pattern.test(str)) return false;

  // Check padding rules: only at the end, max 2 characters
  const paddingIndex = str.indexOf('=');
  if (paddingIndex !== -1) {
    // If padding exists, it should only be at the end
    const afterPadding = str.substring(paddingIndex).replace(/=/g, '');
    if (afterPadding.length > 0) return false;

    // Max 2 padding characters
    const paddingCount = str.length - paddingIndex;
    if (paddingCount > 2) return false;
  }

  return true;
};

/**
 * Splits a string into substrings of the specified length.
 *
 * @param {string} str The string to split.
 * @param {number} length The length of each substring.
 * @return {Array<string>} The array of substrings.
 * @throws {RangeError} If length is not a positive integer.
 */
export const splitString = (str, length) => {
  validatePositiveInteger(length, "length");
  const substrings = str.match(new RegExp(`.{1,${length}}`, "g"));
  return substrings || [];
};

/**
 * Calculates the expected base64 encoded length from byte length
 * @param {number} byteLength - Number of input bytes
 * @returns {number} Expected base64 string length (with padding)
 */
export const calculateBase64Length = (byteLength) => {
  validatePositiveInteger(byteLength, "byteLength");

  // Base64 encoding: 3 bytes -> 4 characters
  // Padding is added to make the output length a multiple of 4
  return Math.ceil(byteLength / 3) * 4;
};

/**
 * Calculates the byte length that would produce a base64 string of given length
 * @param {number} base64Length - Target base64 string length
 * @returns {number} Required byte length
 */
export const calculateRequiredByteLength = (base64Length) => {
  validatePositiveInteger(base64Length, "base64Length");

  // Base64 encoding: 4 characters -> 3 bytes
  // Account for padding by taking the ceiling
  return Math.ceil((base64Length * 3) / 4);
};

/**
 * Domain rules for base64 password generation
 */
export const BASE64_DOMAIN_RULES = {
  MIN_BYTE_LENGTH: 1,
  MAX_BYTE_LENGTH: 1024,
  MIN_CHUNK_LENGTH: 1,
  MAX_CHUNK_LENGTH: 1024,
  CHARSET_SIZE: 64,
  BITS_PER_CHARACTER: 6,
  BYTES_PER_CHUNK: 3,
  CHARS_PER_CHUNK: 4
};