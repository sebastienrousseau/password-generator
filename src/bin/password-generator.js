// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { Command } from "commander";
import clipboardy from "clipboardy";

/**
 * Generates a password of the specified type using the appropriate generator module.
 *
 * @param {Object} data - Configuration options for password generation.
 * @param {string} data.type - The type of password to generate (strong, base64, memorable).
 * @param {number} [data.length] - The length of each password chunk.
 * @param {number} data.iteration - The number of password chunks or words.
 * @param {string} data.separator - The separator between password chunks.
 * @return {Promise<string>} The generated password.
 */
export const PasswordGenerator = async (data) => {
  if (!data.type) {
    throw new Error("Password type is required");
  }

  const modulePath = `../lib/${data.type}-password.js`;

  try {
    const generatorModule = await import(modulePath);
    return await generatorModule.generatePassword(data);
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND") {
      throw new Error(`Unknown password type: "${data.type}". Valid types: strong, base64, memorable`);
    }
    throw error;
  }
};

const program = new Command();

program
  .name("password-generator")
  .description("A fast, simple and powerful utility for generating strong, unique and random passwords")
  .requiredOption("-t, --type <type>", "password type (strong, base64, memorable)")
  .option("-l, --length <number>", "length of each password chunk", parseInt)
  .requiredOption("-i, --iteration <number>", "number of password chunks or words", parseInt)
  .requiredOption("-s, --separator <char>", "separator between password chunks")
  .option("-c, --clipboard", "copy the generated password to clipboard")
  .action(async (opts) => {
    try {
      const password = await PasswordGenerator({
        type: opts.type,
        length: opts.length,
        iteration: opts.iteration,
        separator: opts.separator,
      });

      console.log(`Generated Password: ${password}`);

      if (opts.clipboard) {
        await clipboardy.write(password);
        console.log("(Copied to clipboard)");
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Only parse argv when running as CLI (not when imported as a module)
const args = process.argv.slice(2);
if (args.length > 0) {
  program.parse();
}
