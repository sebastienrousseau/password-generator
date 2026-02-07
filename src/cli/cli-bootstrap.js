#!/usr/bin/env node

// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * CLI Bootstrap - Node.js Adapter to Core Wiring
 *
 * This module serves as the primary bootstrap for the CLI interface,
 * wiring Node.js specific adapters to the core password generation service.
 * It provides a clean separation between CLI concerns and business logic.
 *
 * The CLI is a thin adapter that:
 * 1. Parses CLI arguments
 * 2. Wires Node.js adapters to core service
 * 3. Delegates all business logic to core
 * 4. Renders output
 */

import { resolve } from 'path';
import { createCLIController } from './CLIController.js';
import { createService } from '../../packages/core/src/index.js';
import { NodeCryptoRandom } from '../adapters/node/crypto-random.js';
import { EFFDicewareDictionary } from '../adapters/node/eff-diceware-dictionary.js';

/**
 * Creates the core password generation service with Node.js adapters.
 *
 * @returns {Object} The configured password generation service.
 */
function createCoreService() {
  const randomGenerator = new NodeCryptoRandom();
  const dictionary = new EFFDicewareDictionary();

  return createService(
    {},
    {
      randomGenerator,
      dictionary,
      // Optional ports use defaults from core:
      // - logger: NoOpLogger
      // - storage: MemoryStorage
      // - clock: FixedClock
    }
  );
}

/**
 * CLI Bootstrap Factory
 * Creates and configures a complete CLI interface wired to the core engine.
 */
export class CLIBootstrap {
  constructor() {
    this.service = null;
    this.controller = null;
  }

  /**
   * Initializes the CLI controller with the core service.
   *
   * @returns {CLIBootstrap} This instance for method chaining
   */
  initialize() {
    // Create the core service with Node.js adapters
    this.service = createCoreService();

    // Create the CLI controller with the service
    this.controller = createCLIController(this.service);
    return this;
  }

  /**
   * Runs the CLI with provided arguments.
   *
   * @param {string[]} args - Command line arguments (defaults to process.argv.slice(2))
   * @returns {Promise<void>}
   */
  async run(args = process.argv.slice(2)) {
    if (!this.controller) {
      throw new Error('CLI Bootstrap not initialized. Call initialize() first.');
    }

    try {
      await this.controller.run(args);
    } catch (error) {
      console.error(`CLI execution failed: ${error.message}`);
      process.exit(1);
    }
  }

  /**
   * Gets the underlying CLI controller instance.
   * Useful for testing and advanced customization.
   *
   * @returns {CLIController} The CLI controller instance
   */
  getController() {
    return this.controller;
  }

  /**
   * Gets the core service instance.
   * Useful for direct access to core functionality.
   *
   * @returns {Object} The core service instance
   */
  getService() {
    return this.service;
  }
}

/**
 * Factory function to create and initialize a CLI bootstrap instance.
 *
 * @returns {CLIBootstrap} A configured CLI bootstrap instance
 */
export function createCLIBootstrap() {
  return new CLIBootstrap().initialize();
}

/**
 * Auto-execution logic for direct CLI usage.
 * Only executes when this file is run directly, not when imported as a module.
 */
const resolvedArg = process.argv[1] ? resolve(process.argv[1]) : '';
const isMainModule =
  resolvedArg &&
  (resolvedArg.endsWith('cli-bootstrap.js') || resolvedArg.includes('cli/cli-bootstrap'));

/* c8 ignore start - CLI entry point execution, tested via subprocess */
if (isMainModule) {
  // Create and run CLI bootstrap
  const bootstrap = createCLIBootstrap();

  bootstrap.run().catch((error) => {
    console.error(`Bootstrap failed: ${error.message}`);
    process.exit(1);
  });
}
/* c8 ignore stop */
