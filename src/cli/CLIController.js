// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { Command } from "commander";
import clipboardy from "clipboardy";
import { CLI_OPTIONS } from "../config.js";
import { startOnboarding } from "./onboarding.js";

// Import extracted services
import { processConfiguration } from "../services/config-service.js";
import {
  generateEquivalentCommand,
  displayCommandLearningPanel,
  displayPasswordOutput,
  displaySecurityAuditReport,
  displayNonTTYHelp
} from "../services/cli-service.js";
import {
  startAuditSession,
  completeAuditSession
} from "../services/audit-service.js";

/**
 * CLI Controller class responsible for handling command-line argument parsing,
 * option validation, and coordinating the execution flow.
 */
export class CLIController {
  constructor(passwordGenerator) {
    this.passwordGenerator = passwordGenerator;
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
        CLI_OPTIONS.options.length.parser,
        CLI_OPTIONS.options.length.defaultValue
      )
      .option(CLI_OPTIONS.options.iteration.flags, CLI_OPTIONS.options.iteration.description, CLI_OPTIONS.options.iteration.parser)
      .option(CLI_OPTIONS.options.separator.flags, CLI_OPTIONS.options.separator.description)
      .option(CLI_OPTIONS.options.clipboard.flags, CLI_OPTIONS.options.clipboard.description)
      .option(CLI_OPTIONS.options.audit.flags, CLI_OPTIONS.options.audit.description)
      .option(CLI_OPTIONS.options.learn.flags, CLI_OPTIONS.options.learn.description)
      .action(this.handleCliAction.bind(this));
  }

  /**
   * Processes configuration by delegating to the config service.
   * This method maintains backward compatibility while using the extracted service.
   *
   * @param {string|undefined} preset - The preset name.
   * @param {Object} userOptions - User-provided options.
   * @returns {Object} Processed and validated configuration.
   */
  processConfiguration(preset, userOptions) {
    return processConfiguration(preset, userOptions);
  }

  /**
   * Handle the main CLI action when command-line arguments are provided.
   *
   * @param {Object} opts - Parsed command-line options.
   */
  async handleCliAction(opts) {
    try {
      // Enable audit mode if requested
      if (opts.audit) {
        startAuditSession();
      }

      // Process and validate configuration using the config service
      const config = this.processConfiguration(opts.preset, {
        type: opts.type,
        length: opts.length,
        iteration: opts.iteration,
        separator: opts.separator,
      });

      const password = await this.passwordGenerator(config);

      // Handle clipboard copy
      if (opts.clipboard) {
        await clipboardy.write(password);
      }

      // Display password output using the CLI service
      displayPasswordOutput(password, opts.clipboard);

      // Display command learning panel if enabled
      if (opts.learn) {
        const equivalentCommand = generateEquivalentCommand(config, opts.preset, opts);
        displayCommandLearningPanel(equivalentCommand);
      }

      // Display security audit report if enabled
      if (opts.audit) {
        const auditReport = completeAuditSession();
        displaySecurityAuditReport(auditReport);
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
    startOnboarding(async(config) => {
      try {
        // Generate password with onboarding config
        const password = await this.passwordGenerator(config);

        // Display password output using the CLI service
        displayPasswordOutput(password);

        // Display command learning panel using the CLI service
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
}

/**
 * Factory function to create a new CLIController instance.
 *
 * @param {Function} passwordGenerator - The password generator function.
 * @returns {CLIController} A new CLIController instance.
 */
export function createCLIController(passwordGenerator) {
  return new CLIController(passwordGenerator);
}
