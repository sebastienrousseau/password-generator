// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { generateRandomBase64, splitString, validatePositiveInteger } from "../utils/crypto.js";

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
  validatePositiveInteger(length, "length");
  validatePositiveInteger(iteration, "iteration");

  const base64String = generateRandomBase64(length * iteration);
  const substrings = splitString(base64String, length);
  return substrings.slice(0, iteration).join(separator);
};

export default generatePassword;
