// Copyright © 2022-2023 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { exec } from "child_process";
import clipboardy from "clipboardy";

/**
 * Generates a strong password of a specified length using OpenSSL.
 *
 * @param {number} length - The desired length of the password.
 * @return {Promise<string>} A promise that resolves to the generated password.
 */
export const strongPassword = (length) => {
  return new Promise((resolve, reject) => {
    exec("openssl rand -base64 256", (err, stdout, stderr) => {
      if (err) {
        console.error("Failed to execute command:", stderr);
        return reject(err);
      }

      // Extract a string of the specified length from the base64 output
      const strong = stdout.toString().match(new RegExp(`.{1,${length}}`, "g"));
      resolve(strong[0]); // Resolve with the first match to ensure the correct length
    });
  });
};

/**
 * Asynchronously generates a strong password based on the provided options.
 *
 * @param {Object} options - Configuration options for password generation.
 * @param {number} options.length - The length of each password chunk.
 * @param {number} options.iteration - The number of password chunks.
 * @param {string} options.separator - The separator between password chunks.
 * @return {Promise<string>} A promise that resolves to the generated password.
 */
export const generatePassword = async({ length, iteration, separator }) => {
  let passwordChunks = [];
  for (let i = 0; i < iteration; i++) {
    // Generate each password chunk and add it to the array
    passwordChunks.push(await strongPassword(length));
  }
  // Join the chunks with the separator to form the final password
  return passwordChunks.join(separator);
};

// The command-line interface part of the script:

// Parse command-line arguments
const args = process.argv.slice(2);
const data = {};

// Ensure arguments are provided in pairs for key-value mapping
if (args.length % 2 !== 0) {
  console.error("Arguments should be provided in pairs.");
  process.exit(1);
}

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace("-", "");
  const value = args[i + 1];
  data[key] = value;
}

// Validate required arguments for the password generation
if (data.t !== "strong" || !data.l || !data.i || !data.s) {
  console.error("Usage: node . -t strong -l <length> -i <iteration> -s <separator>");
  process.exit(1);
}

// Generate the password and copy it to the clipboard
(async() => {
  try {
    const generatedPassword = await generatePassword({
      length: parseInt(data.l, 10),
      iteration: parseInt(data.i, 10),
      separator: data.s,
    });

    // Copy the password to clipboard for user convenience
    await clipboardy.write(generatedPassword);

    // Output the generated password
    console.log(`Generated Password: ${generatedPassword}`);
  } catch (error) {
    console.error("An error occurred while generating the password:", error);
  }
})();

export default generatePassword;
