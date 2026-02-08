#!/usr/bin/env node

// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

// Import the main PasswordGenerator and services from the refactored module
import {
  PasswordGenerator,
  generatePassword,
  safeGeneratePassword,
  generateMultiplePasswords,
  processConfiguration,
  mergePresetWithOptions,
  validateFinalConfig,
  generateEquivalentCommand,
  displayCommandLearningPanel,
  startAuditSession,
  completeAuditSession,
  executeWithAudit,
} from './src/bin/password-generator.js';

// Export PasswordGenerator as the default export for backward compatibility
export default PasswordGenerator;

// Export all services as named exports for modular access
export {
  PasswordGenerator,
  generatePassword,
  safeGeneratePassword,
  generateMultiplePasswords,
  processConfiguration,
  mergePresetWithOptions,
  validateFinalConfig,
  generateEquivalentCommand,
  displayCommandLearningPanel,
  startAuditSession,
  completeAuditSession,
  executeWithAudit,
};
