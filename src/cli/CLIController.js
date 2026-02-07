// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { Command } from "commander";
import { CLI_OPTIONS, PRESET_PROFILES, VALID_PRESETS } from "../config.js";
import { startOnboarding } from "../onboarding.js";

// Import CLI rendering services (output only, no business logic)
import {
  generateEquivalentCommand,
  displayCommandLearningPanel,
  displayPasswordOutput,
  displaySecurityAuditReport,
  displayNonTTYHelp,
} from "../services/cli-service.js";
import { startAuditSession, completeAuditSession } from "../services/audit-service.js";

/**
 * Dynamically imports and uses clipboardy with graceful fallback.
 * Returns true if clipboard copy was successful, false otherwise.
 *
 * @param {string} text - The text to copy to clipboard
 * @returns {Promise<boolean>} Whether the copy operation succeeded
 */
async function copyToClipboard(text) {
  try {
    // Dynamic import of clipboardy to handle optional dependency
    const { default: clipboardy } = await import("clipboardy");
    await clipboardy.write(text);
    return true;
  } catch (error) {
    // Clipboard functionality is not available - this is not a fatal error
    console.warn("Warning: Clipboard functionality not available. Password generated but not copied.");
    console.warn(`Reason: ${error.message}`);
    return false;
  }
}

/**
 * CLI Controller - Thin Adapter Pattern
 *
 * This controller is a thin adapter that:
 * 1. Parses CLI arguments using Commander.js
 * 2. Resolves presets to configuration
 * 3. Delegates ALL validation to core service via service.validateConfig()
 * 4. Delegates ALL generation to core service via service.generate()
 * 5. Renders output (password, strength indicator, learn panel, audit report)
 *
 * NO business rules or validation logic beyond basic input parsing (e.g., parseInt).
 */
export class CLIController {
  /**
   * Creates a CLI controller with the core service.
   *
   * @param {Object} service - The core password generation service from packages/core
   */
  constructor(service) {
    this.service = service;
    this.program = new Command();
    this.setupCommander();
  }

  /**
   * Set up the Commander.js program with all CLI options and handlers.
   */
  setupCommander() {
    this.program
      .name(CLI_OPTIONS.name)
      .description(CLI_OPTIONS.description)
      .option(CLI_OPTIONS.options.preset.flags, CLI_OPTIONS.options.preset.description)
      .option(CLI_OPTIONS.options.type.flags, CLI_OPTIONS.options.type.description)
      .option(
        CLI_OPTIONS.options.length.flags,
        CLI_OPTIONS.options.length.description,
        CLI_OPTIONS.options.length.parser
      )
      .option(
        CLI_OPTIONS.options.iteration.flags,
        CLI_OPTIONS.options.iteration.description,
        CLI_OPTIONS.options.iteration.parser
      )
      .option(CLI_OPTIONS.options.separator.flags, CLI_OPTIONS.options.separator.description)
      .option(CLI_OPTIONS.options.clipboard.flags, CLI_OPTIONS.options.clipboard.description)
      .option(CLI_OPTIONS.options.audit.flags, CLI_OPTIONS.options.audit.description)
      .option(CLI_OPTIONS.options.learn.flags, CLI_OPTIONS.options.learn.description)
      .action(this.handleCliAction.bind(this));
  }

  /**
   * Resolves CLI options to a configuration object.
   * This merges preset values with user-provided overrides.
   *
   * Note: This only does data transformation (preset -> config).
   * All validation is delegated to the core service.
   *
   * @param {string|undefined} preset - The preset name.
   * @param {Object} userOptions - User-provided CLI options.
   * @returns {Object} Configuration object for password generation.
   * @throws {Error} If preset is invalid (basic input validation).
   */
  resolveConfiguration(preset, userOptions) {
    // Start with user options, filtering out undefined values
    const config = {};

    if (userOptions.type !== undefined) {
      config.type = userOptions.type;
    }
    if (userOptions.length !== undefined) {
      config.length = userOptions.length;
    }
    if (userOptions.iteration !== undefined) {
      config.iteration = userOptions.iteration;
    }
    if (userOptions.separator !== undefined) {
      config.separator = userOptions.separator;
    }

    // If preset provided, use as base and override with user options
    if (preset) {
      // Basic input validation: check if preset exists
      if (!VALID_PRESETS.includes(preset)) {
        throw new Error(`Invalid preset '${preset}'. Valid presets: ${VALID_PRESETS.join(", ")}`);
      }

      const presetConfig = PRESET_PROFILES[preset];

      // Preset provides defaults, user options override
      return {
        type: config.type ?? presetConfig.type,
        length: config.length ?? presetConfig.length,
        iteration: config.iteration ?? presetConfig.iteration,
        separator: config.separator ?? presetConfig.separator,
      };
    }

    return config;
  }

  /**
   * Handle the main CLI action when command-line arguments are provided.
   *
   * This is a thin adapter that:
   * 1. Resolves preset to config
   * 2. Validates config via core service
   * 3. Generates password via core service
   * 4. Renders output
   *
   * @param {Object} opts - Parsed command-line options.
   */
  async handleCliAction(opts) {
    try {
      // Enable audit mode if requested
      if (opts.audit) {
        startAuditSession();
      }

      // Step 1: Resolve CLI options to configuration (data transformation only)
      const config = this.resolveConfiguration(opts.preset, {
        type: opts.type,
        length: opts.length,
        iteration: opts.iteration,
        separator: opts.separator,
      });

      // Step 2: Validate configuration via core service
      const validation = this.service.validateConfig(config);
      if (!validation.isValid) {
        // Provide helpful error message
        const errorMsg = validation.errors.join("; ");
        if (!opts.preset && (!config.type || config.iteration === undefined)) {
          throw new Error(
            `${errorMsg}. Either provide all required options (-t, -i, -s) or use a preset (-p quick)`
          );
        }
        throw new Error(errorMsg);
      }

      // Step 3: Generate password via core service
      const password = await this.service.generate(config);

      // Step 4: Handle clipboard copy (CLI-specific I/O)
      let clipboardSuccess = false;
      if (opts.clipboard) {
        clipboardSuccess = await copyToClipboard(password);
      }

      // Step 5: Render output (CLI-specific presentation)
      // Pass the actual success state instead of the requested state
      displayPasswordOutput(password, clipboardSuccess, config);

      // Display command learning panel if enabled
      if (opts.learn) {
        const equivalentCommand = generateEquivalentCommand(config, opts.preset, opts);
        displayCommandLearningPanel(equivalentCommand);
      }

      // Display security audit report if enabled
      if (opts.audit) {
        const auditReport = completeAuditSession();
        displaySecurityAuditReport(auditReport, config);
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Handle interactive onboarding flow.
   *
   * @param {Function} onCompleteCallback - Callback function for when onboarding is complete.
   */
  /* c8 ignore start - Interactive TTY onboarding requires user input */
  async handleInteractiveMode(onCompleteCallback) {
    startOnboarding(async (config) => {
      try {
        // Validate and generate via core service
        const validation = this.service.validateConfig(config);
        if (!validation.isValid) {
          throw new Error(validation.errors.join("; "));
        }

        const password = await this.service.generate(config);

        // Render output
        displayPasswordOutput(password, false, config);

        // Display command learning panel
        const equivalentCommand = generateEquivalentCommand(config, null, {});
        displayCommandLearningPanel(equivalentCommand);

        if (onCompleteCallback) {
          onCompleteCallback(config);
        }
      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
      }
    });
  }
  /* c8 ignore stop */

  /**
   * Handle no arguments provided - show appropriate help or start interactive mode.
   */
  handleNoArguments() {
    // No arguments provided
    if (!process.stdin.isTTY) {
      // Not in a terminal - show help using CLI service
      displayNonTTYHelp();
      // Exit silently for automated environments like tests
      process.exit(0);
      /* c8 ignore start - Interactive TTY onboarding requires user input */
    } else {
      // In a terminal - start interactive onboarding
      this.handleInteractiveMode();
    }
    /* c8 ignore stop */
  }

  /**
   * Parse command-line arguments and execute appropriate action.
   *
   * @param {string[]} args - Command-line arguments (defaults to process.argv.slice(2)).
   */
  async run(args = process.argv.slice(2)) {
    if (args.length > 0) {
      this.program.parse([process.argv[0], process.argv[1], ...args]);
    } else {
      this.handleNoArguments();
    }
  }

  /**
   * Get the underlying Commander program instance.
   * Useful for testing and advanced customization.
   *
   * @returns {Command} The Commander.js program instance.
   */
  getProgram() {
    return this.program;
  }

  /**
   * Get the core service instance.
   *
   * @returns {Object} The core password generation service.
   */
  getService() {
    return this.service;
  }
}

/**
 * Factory function to create a new CLIController instance.
 *
 * @param {Object} service - The core password generation service.
 * @returns {CLIController} A new CLIController instance.
 */
export function createCLIController(service) {
  return new CLIController(service);
}
