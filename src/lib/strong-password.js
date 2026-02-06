// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { generateBase64Chunk, validatePositiveInteger } from "../utils/crypto.js";

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
  validatePositiveInteger(length, "length");
  validatePositiveInteger(iteration, "iteration");

  const passwordChunks = Array.from({ length: iteration }, () => generateBase64Chunk(length));
  return passwordChunks.join(separator);
};

export default generatePassword;
