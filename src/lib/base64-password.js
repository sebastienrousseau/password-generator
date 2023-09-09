// Copyright © 2022-2023 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import crypto from "crypto";
import clipboardy from "clipboardy";

/**
 * Generate a random base64 string.
 *
 * @return {string} The generated base64 string.
 */
export const generateRandomBase64String = () => {
  return crypto.randomBytes(256).toString("base64");
};

/**
 * Split a base64 string into substrings of the specified length.
 *
 * @param {string} base64String The base64 string to split.
 * @param {number} length The length of each substring.
 * @return {Array<string>} The substrings.
 */
export const splitBase64String = (base64String, length) => {
  const substrings = base64String.match(new RegExp(`.{1,${length}}`, "g"));
  return substrings || [];
};

/**
 * Generate a password using random Base64 characters.
 *
 * @param {Object} options - Configuration options for password generation.
 * @param {number} options.length - The length of each password chunk.
 * @param {number} options.iteration - The number of password chunks.
 * @param {string} options.separator - The separator between password chunks.
 * @return {string} The generated password.
 */
export const base64Password = ({ length, iteration, separator }) => {
  const base64String = generateRandomBase64String();
  const substrings = splitBase64String(base64String, length);
  const password = substrings.slice(0, iteration).join(separator);
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

if (data.t !== "base64" || !data.l || !data.i || !data.s) {
  console.error(
    "Usage: node . -t base64 -l <length> -i <iteration> -s <separator>"
  );
  process.exit(1);
}

// Generate the password
(async() => {
  const generatedPassword = base64Password({
    length: parseInt(data.l, 10),
    iteration: parseInt(data.i, 10),
    separator: data.s
  });

  // Copy the password to clipboard
  clipboardy.writeSync(generatedPassword);

  // Print the generated password
  console.log(generatedPassword);
})();
