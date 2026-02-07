// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { resolve } from "path";
import { createCLIController } from "../cli/CLIController.js";
import PasswordGeneratorFactory from "../core/PasswordGeneratorFactory.js";

// Export services for programmatic use
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

/**
 * Generates a password of the specified type using the PasswordGeneratorFactory.
 *
 * This function serves as a bridge between the CLI and the factory pattern,
 * providing the same interface as the previous implementation while leveraging
 * improved error handling and module management.
 *
 * @param {Object} data - Configuration options for password generation.
 * @param {string} data.type - The type of password to generate (strong, base64, memorable).
 * @param {number} [data.length] - The length of each password chunk.
 * @param {number} data.iteration - The number of password chunks or words.
 * @param {string} data.separator - The separator between password chunks.
 * @return {Promise<string>} The generated password.
 */
export const PasswordGenerator = async (data) => {
  return await PasswordGeneratorFactory.generate(data);
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
  // Create CLI controller with the password generator function
  const cliController = createCLIController(PasswordGenerator);

  // Run the CLI controller
  /* c8 ignore start - Error handler for unexpected CLI failures */
  cliController.run().catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  });
  /* c8 ignore stop */
}
