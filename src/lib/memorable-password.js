// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { randomNumber } from "../utils/randomNumber.js";
import { readFile } from "fs/promises";
import { toTitleCase } from "../utils/strings.js";

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
      }),
    );
  }
  return dictionaryCache;
};

/**
 * Generate a memorable password using random words from a dictionary.
 *
 * @param {Object} options - Configuration options for password generation.
 * @param {number} options.iteration - The number of words to use.
 * @param {string} options.separator - The separator between words.
 * @return {Promise<string>} The generated password.
 */
export const generatePassword = async ({ iteration, separator }) => {
  const dictionary = await loadDictionary();

  if (!Number.isInteger(iteration) || iteration < 1) {
    throw new RangeError("The iteration argument must be a positive integer");
  }

  const memorable = Array.from({ length: iteration }, () => {
    return toTitleCase(
      dictionary.entries[randomNumber(dictionary.entries.length)],
    );
  });

  const password = memorable.join(separator).replace(/ /g, "");
  return password;
};

export default generatePassword;
