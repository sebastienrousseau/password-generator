#!/usr/bin/env node

// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * CLI Bootstrap - Node.js Adapter to Core Wiring
 *
 * This module serves as the primary bootstrap for the CLI interface,
 * wiring Node.js specific adapters to the core password generation engine.
 * It provides a clean separation between CLI concerns and business logic.
 */

import { resolve } from "path";
import { createCLIController } from "./CLIController.js";
import { PasswordGeneratorOrchestrator } from "../core/PasswordGeneratorOrchestrator.js";
import PasswordGeneratorFactory from "../core/PasswordGeneratorFactory.js";
import { NodeCryptoRandom } from "../adapters/node/crypto-random.js";

/**
 * Node.js CLI Adapter
 * Wraps the core password generation orchestrator with CLI-specific functionality.
 * This adapter handles the bridge between CLI arguments and core business logic.
 */
class NodeCLIAdapter {
  constructor() {
    this.orchestrator = PasswordGeneratorOrchestrator;
    this.factory = PasswordGeneratorFactory;
    this.cryptoRandom = new NodeCryptoRandom();
  }

  /**
   * Generates a password using the core factory with CLI-friendly error handling.
   *
   * @param {Object} config - Password generation configuration
   * @returns {Promise<string>} Generated password
   */
  async generatePassword(config) {
    try {
      return await this.factory.generate(config);
    } catch (error) {
      // Add CLI-specific error context
      throw new Error(`Password generation failed: ${error.message}`);
    }
  }

  /**
   * Orchestrates complete generation flow including configuration processing.
   *
   * @param {Object} options - CLI options and configuration
   * @returns {Promise<Object>} Generation result with password, config, and optional audit report
   */
  async orchestrateGeneration(options) {
    try {
      return await this.orchestrator.orchestrateGeneration(options);
    } catch (error) {
      // Add CLI-specific error context
      throw new Error(`Generation orchestration failed: ${error.message}`);
    }
  }

  /**
   * Gets the NodeCryptoRandom adapter instance for Node.js-specific crypto operations.
   *
   * @returns {NodeCryptoRandom} The crypto random adapter instance
   */
  getCryptoRandom() {
    return this.cryptoRandom;
  }
}

/**
 * CLI Bootstrap Factory
 * Creates and configures a complete CLI interface wired to the core engine.
 */
export class CLIBootstrap {
  constructor() {
    this.adapter = new NodeCLIAdapter();
    this.controller = null;
  }

  /**
   * Initializes the CLI controller with the Node.js adapter.
   *
   * @returns {CLIBootstrap} This instance for method chaining
   */
  initialize() {
    // Create the CLI controller with the adapter's generatePassword method
    this.controller = createCLIController(this.adapter.generatePassword.bind(this.adapter));
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
      throw new Error("CLI Bootstrap not initialized. Call initialize() first.");
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
   * Gets the Node.js adapter instance.
   * Useful for direct access to core functionality.
   *
   * @returns {NodeCLIAdapter} The adapter instance
   */
  getAdapter() {
    return this.adapter;
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
const resolvedArg = process.argv[1] ? resolve(process.argv[1]) : "";
const isMainModule = resolvedArg &&
  (resolvedArg.endsWith("cli-bootstrap.js") ||
   resolvedArg.includes("cli/cli-bootstrap"));

if (isMainModule) {
  // Create and run CLI bootstrap
  const bootstrap = createCLIBootstrap();

  bootstrap.run().catch((error) => {
    console.error(`Bootstrap failed: ${error.message}`);
    process.exit(1);
  });
}