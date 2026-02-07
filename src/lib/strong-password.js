// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { generateBase64Chunk, validatePositiveInteger } from "../utils/crypto.js";
import { DefaultCryptoAdapter } from "../adapters/CryptoAdapter.js";

/**
 * Generates a strong password based on the provided options.
 *
 * @param {Object} options - Configuration options for password generation.
 * @param {number} options.length - The length of each password chunk.
 * @param {number} options.iteration - The number of password chunks.
 * @param {string} options.separator - The separator between password chunks.
 * @param {Object} [options.cryptoAdapter] - Optional crypto adapter instance (defaults to utilities for backward compatibility).
 * @return {string} The generated password.
 */
export const generatePassword = ({ length, iteration, separator, cryptoAdapter }) => {
  // Use injected crypto adapter if provided, otherwise fall back to legacy crypto utils
  if (cryptoAdapter) {
    cryptoAdapter.validatePositiveInteger(length, "length");
    cryptoAdapter.validatePositiveInteger(iteration, "iteration");

    const passwordChunks = Array.from({ length: iteration }, () =>
      cryptoAdapter.generateBase64Chunk(length)
    );
    return passwordChunks.join(separator);
  } else {
    // Backward compatibility: use direct crypto utility imports
    validatePositiveInteger(length, "length");
    validatePositiveInteger(iteration, "iteration");

    const passwordChunks = Array.from({ length: iteration }, () => generateBase64Chunk(length));
    return passwordChunks.join(separator);
  }
};

export default generatePassword;
