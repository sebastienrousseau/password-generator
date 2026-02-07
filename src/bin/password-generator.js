// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { resolve } from "path";
import { createCLIController } from "../cli/CLIController.js";
import { createService } from "../../packages/core/src/index.js";
import { NodeCryptoRandom } from "../adapters/node/crypto-random.js";

// Re-export services for programmatic use (backward compatibility)
export {
  generatePassword,
  safeGeneratePassword,
  generateMultiplePasswords,
} from "../services/password-service.js";
export {
  processConfiguration,
  mergePresetWithOptions,
  validateFinalConfig,
} from "../services/config-service.js";
export { generateEquivalentCommand, displayCommandLearningPanel } from "../services/cli-service.js";
export {
  startAuditSession,
  completeAuditSession,
  executeWithAudit,
} from "../services/audit-service.js";

// Re-export core service factory for advanced usage
export { createService } from "../../packages/core/src/index.js";

/**
 * Creates the core password generation service with Node.js adapters.
 *
 * @returns {Object} The configured password generation service.
 */
function createCoreService() {
  const randomGenerator = new NodeCryptoRandom();

  return createService(
    {},
    {
      randomGenerator,
      // Optional ports use defaults from core
    }
  );
}

/**
 * Generates a password using the core service.
 *
 * This function provides backward compatibility with the previous API
 * while using the new thin adapter architecture internally.
 *
 * @param {Object} data - Configuration options for password generation.
 * @param {string} data.type - The type of password to generate (strong, base64, memorable).
 * @param {number} [data.length] - The length of each password chunk.
 * @param {number} data.iteration - The number of password chunks or words.
 * @param {string} data.separator - The separator between password chunks.
 * @return {Promise<string>} The generated password.
 */
export const PasswordGenerator = async (data) => {
  const service = createCoreService();
  return service.generate(data);
};

// Only execute CLI logic when running as CLI (not when imported as a module)
// Check if this file is being run directly (not imported)
const resolvedArg = process.argv[1] ? resolve(process.argv[1]) : "";
const isMainModule =
  resolvedArg &&
  (resolvedArg.endsWith("password-generator.js") ||
    resolvedArg.endsWith("index.js") ||
    resolvedArg.includes("bin/password-generator") ||
    resolvedArg.endsWith("password-generator")); // Handle `node .` from project root

if (isMainModule) {
  // Create core service with Node.js adapters
  const service = createCoreService();

  // Create CLI controller with the service (thin adapter pattern)
  const cliController = createCLIController(service);

  // Run the CLI controller
  /* c8 ignore start - Error handler for unexpected CLI failures */
  cliController.run().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
  /* c8 ignore stop */
}
