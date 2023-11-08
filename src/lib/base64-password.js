// Copyright © 2022-2023 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { randomBytes } from "crypto";
import clipboardy from "clipboardy";

/**
 * Generates a random base64 string of the specified length.
 *
 * @param {number} length The length of the base64 string to generate.
 * @return {string} The generated base64 string.
 */
export const generateRandomBase64String = (length) => {
  return randomBytes(length).toString("base64");
};

/**
 * Splits a base64 string into substrings of the specified length.
 *
 * @param {string} base64String The base64 string to split.
 * @param {number} length The length of each substring.
 * @return {Array<string>} The array of substrings.
 */
export const splitBase64String = (base64String, length) => {
  const substrings = base64String.match(new RegExp(`.{1,${length}}`, "g"));
  return substrings || [];
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
  const base64String = generateRandomBase64String(length * iteration);
  const substrings = splitBase64String(base64String, length);
  const password = substrings.slice(0, iteration).join(separator);
  return password;
};

// The command-line interface part of the script:

// Parse command-line arguments
const args = process.argv.slice(2);
const data = {};

// Populate data object with key-value pairs from the command-line arguments
for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace(/^--?/, ""); // Support both - and -- prefixes
  const value = args[i + 1];
  data[key] = value;
}

// Validate required arguments for the password generation
if (data.t !== "base64" || !data.l || !data.i || !data.s) {
  console.error("Usage: node . -t base64 -l <length> -i <iteration> -s <separator>");
  process.exit(1);
}

// Generate the password and output it
(async() => {
  try {
    // Convert length and iteration to integers before passing to generatePassword
    const generatedPassword = generatePassword({
      length: parseInt(data.l, 10),
      iteration: parseInt(data.i, 10),
      separator: data.s,
    });

    // Copy the password to clipboard for user convenience
    await clipboardy.write(generatedPassword);

    // Log the generated password to the console
    console.log(`Generated Password: ${generatedPassword}`);
  } catch (error) {
    // Handle any errors during password generation
    console.error("An error occurred while generating the password:", error);
  }
})();
