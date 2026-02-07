// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { randomNumber } from "../utils/randomNumber.js";
import { readFile } from "fs/promises";
import { toTitleCase } from "../utils/strings.js";
import { validatePositiveInteger } from "../utils/crypto.js";
import {
  recordEntropyUsage,
  recordAlgorithmUsage,
  calculateDictionaryEntropy,
  setDictionarySize,
} from "../utils/security-audit.js";

/** @type {Object|null} Cached dictionary to avoid repeated file reads. */
let dictionaryCache = null;

/**
 * Loads and caches the dictionary from disk.
 *
 * @return {Promise<Object>} The parsed dictionary object.
 */
const loadDictionary = async () => {
  if (!dictionaryCache) {
    dictionaryCache = JSON.parse(
      await readFile(new URL("../dictionaries/common.json", import.meta.url), {
        encoding: "utf8",
      })
    );
    // Set dictionary size for entropy calculations
    setDictionarySize(dictionaryCache.entries.length);
  }
  return dictionaryCache;
};

/**
 * Generate a memorable password using random words from a dictionary.
 *
 * @param {Object} options - Configuration options for password generation.
 * @param {number} options.iteration - The number of words to use.
 * @param {string} options.separator - The separator between words.
 * @param {Object} [options.cryptoAdapter] - Optional crypto adapter instance (defaults to utilities for backward compatibility).
 * @return {Promise<string>} The generated password.
 */
export const generatePassword = async ({ iteration, separator, cryptoAdapter }) => {
  const dictionary = await loadDictionary();

  // Use injected crypto adapter if provided, otherwise fall back to legacy crypto utils
  if (cryptoAdapter) {
    cryptoAdapter.validatePositiveInteger(iteration, "iteration");

    const memorable = Array.from({ length: iteration }, () => {
      return toTitleCase(dictionary.entries[cryptoAdapter.randomNumber(dictionary.entries.length)]);
    });

    // Record entropy usage for audit
    recordEntropyUsage(
      "crypto.randomInt",
      iteration,
      calculateDictionaryEntropy(dictionary.entries.length, iteration),
      {
        dictionarySize: dictionary.entries.length,
        wordCount: iteration,
        method: "dictionary-lookup",
      }
    );
    recordAlgorithmUsage("memorable-password-generation", {
      dictionarySize: dictionary.entries.length,
      wordCount: iteration,
      separator,
      transformations: ["toTitleCase", "space-removal"],
    });

    const password = memorable.join(separator).replace(/ /g, "");
    return password;
  } else {
    // Backward compatibility: use direct crypto utility imports
    validatePositiveInteger(iteration, "iteration");

    const memorable = Array.from({ length: iteration }, () => {
      return toTitleCase(dictionary.entries[randomNumber(dictionary.entries.length)]);
    });

    // Record entropy usage for audit
    recordEntropyUsage(
      "crypto.randomInt",
      iteration,
      calculateDictionaryEntropy(dictionary.entries.length, iteration),
      {
        dictionarySize: dictionary.entries.length,
        wordCount: iteration,
        method: "dictionary-lookup",
      }
    );
    recordAlgorithmUsage("memorable-password-generation", {
      dictionarySize: dictionary.entries.length,
      wordCount: iteration,
      separator,
      transformations: ["toTitleCase", "space-removal"],
    });

    const password = memorable.join(separator).replace(/ /g, "");
    return password;
  }
};

export default generatePassword;
