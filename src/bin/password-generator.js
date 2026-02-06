// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { Command } from "commander";
import clipboardy from "clipboardy";
import { PASSWORD_ERRORS } from "../errors.js";
import { CLI_OPTIONS } from "../config.js";

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
export const PasswordGenerator = async(data) => {
  if (!data.type) {
    throw new Error(PASSWORD_ERRORS.TYPE_REQUIRED);
  }

  const modulePath = `../lib/${data.type}-password.js`;

  try {
    const generatorModule = await import(modulePath);
    return await generatorModule.generatePassword(data);
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND") {
      throw new Error(PASSWORD_ERRORS.UNKNOWN_TYPE(data.type));
    }
    throw error;
  }
};

const program = new Command();

program
  .name(CLI_OPTIONS.name)
  .description(CLI_OPTIONS.description)
  .requiredOption(CLI_OPTIONS.options.type.flags, CLI_OPTIONS.options.type.description)
  .option(
    CLI_OPTIONS.options.length.flags,
    CLI_OPTIONS.options.length.description,
    CLI_OPTIONS.options.length.parser,
    CLI_OPTIONS.options.length.defaultValue
  )
  .requiredOption(CLI_OPTIONS.options.iteration.flags, CLI_OPTIONS.options.iteration.description, CLI_OPTIONS.options.iteration.parser)
  .requiredOption(CLI_OPTIONS.options.separator.flags, CLI_OPTIONS.options.separator.description)
  .option(CLI_OPTIONS.options.clipboard.flags, CLI_OPTIONS.options.clipboard.description)
  .action(async(opts) => {
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
