// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { Command } from "commander";
import clipboardy from "clipboardy";
import { PASSWORD_ERRORS } from "../errors.js";
import {
  CLI_OPTIONS,
  isValidPreset,
  getPresetConfig,
  getValidPresetsString,
  isValidPasswordType,
  getValidTypesString
} from "../config.js";
import {
  setAuditMode,
  resetAuditSession,
  finishAuditSession,
  generateAuditReport
} from "../utils/security-audit.js";
import { startOnboarding } from "../cli/onboarding.js";

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

/**
 * Generates the equivalent CLI command string based on the configuration used.
 *
 * @param {Object} config - The configuration that was used to generate the password.
 * @param {string|undefined} preset - The preset used (if any).
 * @param {Object} opts - The original CLI options passed by the user.
 * @returns {string} The equivalent CLI command string.
 */
const generateEquivalentCommand = (config, preset, opts) => {
  const parts = ["password-generator"];

  if (preset) {
    parts.push(`-p ${preset}`);
    // Only add other options if they override the preset defaults
    const presetConfig = getPresetConfig(preset);
    if (config.type !== presetConfig.type) {
      parts.push(`-t ${config.type}`);
    }
    if (config.length && config.length !== presetConfig.length) {
      parts.push(`-l ${config.length}`);
    }
    if (config.iteration !== presetConfig.iteration) {
      parts.push(`-i ${config.iteration}`);
    }
    if (config.separator !== presetConfig.separator) {
      parts.push(`-s "${config.separator}"`);
    }
  } else {
    // No preset, include all required options
    parts.push(`-t ${config.type}`);
    if (config.length) {
      parts.push(`-l ${config.length}`);
    }
    parts.push(`-i ${config.iteration}`);
    parts.push(`-s "${config.separator}"`);
  }

  // Add optional flags
  if (opts.clipboard) {
    parts.push("-c");
  }
  if (opts.audit) {
    parts.push("-a");
  }

  return parts.join(" ");
};

/**
 * Displays the command learning panel with the equivalent CLI command.
 *
 * @param {string} command - The equivalent CLI command string.
 */
const displayCommandLearningPanel = (command) => {
  console.log("\n┌─────────────────────────────────────────────────────────┐");
  console.log("│                    💡 COMMAND LEARNING                  │");
  console.log("├─────────────────────────────────────────────────────────┤");
  console.log("│ Equivalent CLI command for this password generation:   │");
  console.log("│                                                         │");
  console.log(`│ ${command.padEnd(55)} │`);
  console.log("│                                                         │");
  console.log("│ 💡 Copy this command to skip the guided mode next time │");
  console.log("│ 🚀 Learn more: password-generator --help               │");
  console.log("└─────────────────────────────────────────────────────────┘");
};

/**
 * Merges preset configuration with user options, giving priority to user options.
 *
 * @param {string|undefined} preset - The preset name.
 * @param {Object} userOptions - User-provided options.
 * @returns {Object} Merged configuration.
 */
const mergePresetWithOptions = (preset, userOptions) => {
  // Filter out undefined values from user options
  const filteredUserOptions = {};
  Object.keys(userOptions).forEach(key => {
    if (userOptions[key] !== undefined) {
      filteredUserOptions[key] = userOptions[key];
    }
  });

  if (preset) {
    if (!isValidPreset(preset)) {
      throw new Error(`Invalid preset '${preset}'. Valid presets: ${getValidPresetsString()}`);
    }
    const presetConfig = getPresetConfig(preset);
    // Apply preset values first, then override with user options
    return { ...presetConfig, ...filteredUserOptions };
  }

  return filteredUserOptions;
};

/**
 * Validates the final configuration and provides helpful error messages.
 *
 * @param {Object} config - The final configuration.
 * @param {boolean} hasPreset - Whether a preset was used.
 */
const validateFinalConfig = (config, hasPreset) => {
  const missingRequired = [];

  if (!config.type) missingRequired.push("type");
  if (config.iteration === undefined) missingRequired.push("iteration");
  if (config.separator === undefined) missingRequired.push("separator");

  if (missingRequired.length > 0) {
    /* c8 ignore next 3 - defensive code: valid presets always have required fields */
    if (hasPreset) {
      throw new Error(`Missing required options: ${missingRequired.join(", ")}. This should not happen with a valid preset.`);
    } else {
      throw new Error(
        `Missing required options: ${missingRequired.join(", ")}. ` +
        `Either provide these options or use a preset (-p ${getValidPresetsString().split(", ")[0]})`
      );
    }
  }

  if (!isValidPasswordType(config.type)) {
    throw new Error(`Invalid password type '${config.type}'. Valid types: ${getValidTypesString()}`);
  }
};

const program = new Command();

program
  .name(CLI_OPTIONS.name)
  .description(CLI_OPTIONS.description)
  .option(CLI_OPTIONS.options.preset.flags, CLI_OPTIONS.options.preset.description)
  .option(CLI_OPTIONS.options.type.flags, CLI_OPTIONS.options.type.description)
  .option(
    CLI_OPTIONS.options.length.flags,
    CLI_OPTIONS.options.length.description,
    CLI_OPTIONS.options.length.parser,
    CLI_OPTIONS.options.length.defaultValue
  )
  .option(CLI_OPTIONS.options.iteration.flags, CLI_OPTIONS.options.iteration.description, CLI_OPTIONS.options.iteration.parser)
  .option(CLI_OPTIONS.options.separator.flags, CLI_OPTIONS.options.separator.description)
  .option(CLI_OPTIONS.options.clipboard.flags, CLI_OPTIONS.options.clipboard.description)
  .option(CLI_OPTIONS.options.audit.flags, CLI_OPTIONS.options.audit.description)
  .option(CLI_OPTIONS.options.learn.flags, CLI_OPTIONS.options.learn.description)
  .action(async(opts) => {
    try {
      // Enable audit mode if requested
      if (opts.audit) {
        setAuditMode(true);
        resetAuditSession();
      }

      // Merge preset with user options
      const config = mergePresetWithOptions(opts.preset, {
        type: opts.type,
        length: opts.length,
        iteration: opts.iteration,
        separator: opts.separator,
      });

      // Validate the final configuration
      validateFinalConfig(config, !!opts.preset);

      const password = await PasswordGenerator({
        type: config.type,
        length: config.length,
        iteration: config.iteration,
        separator: config.separator,
      });

      // Finalize audit session if enabled
      if (opts.audit) {
        finishAuditSession();
      }

      console.log(`Generated Password: ${password}`);

      if (opts.clipboard) {
        await clipboardy.write(password);
        console.log("(Copied to clipboard)");
      }

      // Display command learning panel if enabled
      if (opts.learn) {
        const equivalentCommand = generateEquivalentCommand(config, opts.preset, opts);
        displayCommandLearningPanel(equivalentCommand);
      }

      // Display security audit report if enabled
      if (opts.audit) {
        const auditReport = generateAuditReport();
        console.log("\n=== SECURITY AUDIT REPORT ===");
        console.log(JSON.stringify(auditReport, null, 2));
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  });

// Only parse argv when running as CLI (not when imported as a module)
// Check if this file is being run directly (not imported)
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('password-generator.js') ||
  process.argv[1].endsWith('index.js') ||
  process.argv[1].includes('bin/password-generator')
);

if (isMainModule) {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    program.parse();
  } else {
    // No arguments provided
    if (!process.stdin.isTTY) {
      // Not in a terminal - show help instead
      console.log('🔐 Password Generator');
      console.log('\nFor interactive setup, run this command in a terminal.');
      console.log('For command-line usage:');
      console.log('  password-generator --help');
      console.log('\nQuick examples:');
      console.log('  password-generator -p quick');
      console.log('  password-generator -t strong -i 3 -s "-"');
    /* c8 ignore next - else branch requires TTY */
    } else {
      /* c8 ignore start - Interactive TTY onboarding requires user input */
      // In a terminal - start interactive onboarding
      startOnboarding(async (config) => {
        try {
          // Generate password with onboarding config
          const password = await PasswordGenerator({
            type: config.type,
            length: config.length,
            iteration: config.iteration,
            separator: config.separator,
          });

          console.log(`Generated Password: ${password}`);

          // Display command learning panel
          const equivalentCommand = generateEquivalentCommand(config, null, {});
          displayCommandLearningPanel(equivalentCommand);
        } catch (error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
      });
    }
    /* c8 ignore stop */
  }
}
