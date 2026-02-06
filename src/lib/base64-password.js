// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { generateRandomBase64, splitString } from "../utils/crypto.js";

/**
 * Generates a random base64 string of the specified length.
 *
 * @param {number} length The number of random bytes to generate.
 * @return {string} The generated base64 string.
 */
export const generateRandomBase64String = (length) => {
  return generateRandomBase64(length);
};

/**
 * Splits a base64 string into substrings of the specified length.
 *
 * @param {string} base64String The base64 string to split.
 * @param {number} length The length of each substring.
 * @return {Array<string>} The array of substrings.
 */
export const splitBase64String = (base64String, length) => {
  return splitString(base64String, length);
};

/**
 * Generates a password using random Base64 characters with the specified configuration.
 *
 * @param {Object} options - Configuration options for password generation.
 * @param {number} options.length - The length of each password chunk.
 * @param {number} options.iteration - The number of password chunks.
 * @param {string} options.separator - The separator between password chunks.
 * @return {string} The generated password.
 */
export const generatePassword = ({ length, iteration, separator }) => {
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError("The length argument must be a positive integer");
  }
  if (!Number.isInteger(iteration) || iteration < 1) {
    throw new RangeError("The iteration argument must be a positive integer");
  }

  const base64String = generateRandomBase64String(length * iteration);
  const substrings = splitBase64String(base64String, length);
  const password = substrings.slice(0, iteration).join(separator);
  return password;
};

export default generatePassword;
