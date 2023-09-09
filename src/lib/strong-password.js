// Copyright © 2022-2023 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
// SPDX-License-Identifier: MIT

import childProcess from "child_process";
import clipboardy from "clipboardy";

/**
 * Generate a strong password using OpenSSL.
 *
 * @param {Object} options - Configuration options for password generation.
 * @param {number} options.length - The length of each password chunk.
 * @param {number} options.iteration - The number of password chunks.
 * @param {string} options.separator - The separator between password chunks.
 * @return {Promise<string>} The generated password.
 */
const strongPassword = ({ length, iteration, separator }) => {
  return new Promise((resolve, reject) => {
    childProcess.exec("openssl rand -base64 256", (err, stdout, stderr) => {
      if (err) {
        console.error("Failed to execute command:", stderr);
        return reject(err);
      }

      const strong = stdout
        .toString()
        .match(new RegExp(`.{1,${length}}`, "g"))
        .slice(0, iteration)
        .join(separator);

      resolve(strong);
    });
  });
};

// Parse command-line arguments
const args = process.argv.slice(2);
const data = {};

for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace("-", "");
  const value = args[i + 1];
  data[key] = value;
}

if (data.t !== "strong" || !data.l || !data.i || !data.s) {
  console.error(
    "Usage: node . -t strong -l <length> -i <iteration> -s <separator>",
  );
  process.exit(1);
}

// Generate and print the password
(async() => {
  const generatedPassword = await strongPassword({
    length: parseInt(data.l, 10),
    iteration: parseInt(data.i, 10),
    separator: data.s,
  });

  // Copy the password to clipboard
  clipboardy.writeSync(generatedPassword);

  console.log(generatedPassword);
})();
