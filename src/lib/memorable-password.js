// Copyright © 2022-2023 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import { randomNumber } from "../utils/randomNumber.js";
import { readFile } from "fs/promises";
import { toTitleCase } from "../utils/toTitleCase/toTitleCase.js";
import clipboardy from "clipboardy";

/**
 * Generate a memorable password using random words from a dictionary.
 *
 * @param {Object} options - Configuration options for password generation.
 * @param {number} options.iteration - The number of words to use.
 * @param {string} options.separator - The separator between words.
 * @return {string} The generated password.
 */
const memorablePassword = async({ iteration, separator }) => {
  const dictionary = JSON.parse(
    await readFile(new URL("../dictionaries/common.json", import.meta.url))
  );

  if (iteration < 1) {
    throw new RangeError("The iteration argument must be a positive integer");
  }

  if (separator.length > 1) {
    throw new TypeError("The separator argument must be a single character");
  }

  const memorable = Array.from({ length: iteration }, () => {
    return toTitleCase(dictionary.entries[
      randomNumber(dictionary.entries.length)
    ]);
  });

  const password = memorable.join(separator).replace(/ /g, "");

  return password;
};

// Parse command-line arguments
const args = process.argv.slice(2);
const data = {};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace("-", "");
  const value = args[i + 1];
  data[key] = value;
}

if (data.t !== "memorable" || !data.i || !data.s) {
  console.error("Usage: node . -t memorable -i <iteration> -s <separator>");
  process.exit(1);
}

// Generate and print the password
(async() => {
  const generatedPassword = await memorablePassword({
    iteration: parseInt(data.i, 10),
    separator: data.s
  });

  // Copy the password to clipboard
  clipboardy.writeSync(generatedPassword);

  console.log(generatedPassword);
})();
