// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { generateBase64Chunk } from "../utils/crypto.js";

/**
 * Generates a strong password of a specified length using Node.js crypto.
 *
 * @param {number} length - The desired length of the password.
 * @return {string} The generated password chunk.
 */
export const strongPassword = (length) => {
  return generateBase64Chunk(length);
};

/**
 * Generates a strong password based on the provided options.
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

  const passwordChunks = [];
  for (let i = 0; i < iteration; i++) {
    passwordChunks.push(strongPassword(length));
  }
  return passwordChunks.join(separator);
};

export default generatePassword;
