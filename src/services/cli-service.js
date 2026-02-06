// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * CLI Service - Handles command generation and user interface logic
 *
 * This module provides services for generating equivalent CLI commands,
 * displaying learning panels, and handling CLI-specific formatting.
 *
 * @module services/cli-service
 */

import { getPresetConfig } from "../config.js";

/**
 * Generates the equivalent CLI command string based on the configuration used.
 *
 * @param {Object} config - The configuration that was used to generate the password.
 * @param {string|undefined} preset - The preset used (if any).
 * @param {Object} opts - The original CLI options passed by the user.
 * @returns {string} The equivalent CLI command string.
 */
export const generateEquivalentCommand = (config, preset, opts) => {
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
export const displayCommandLearningPanel = (command) => {
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
 * Displays password output with optional clipboard notification.
 *
 * @param {string} password - The generated password to display.
 * @param {boolean} copiedToClipboard - Whether the password was copied to clipboard.
 */
export const displayPasswordOutput = (password, copiedToClipboard = false) => {
  console.log(`Generated Password: ${password}`);

  if (copiedToClipboard) {
    console.log("(Copied to clipboard)");
  }
};

/**
 * Displays a security audit report in formatted output.
 *
 * @param {Object} auditReport - The audit report object to display.
 */
export const displaySecurityAuditReport = (auditReport) => {
  console.log("\n=== SECURITY AUDIT REPORT ===");
  console.log(JSON.stringify(auditReport, null, 2));
};

/**
 * Displays help information for non-TTY environments.
 */
export const displayNonTTYHelp = () => {
  console.log("🔐 Password Generator");
  console.log("\nFor interactive setup, run this command in a terminal.");
  console.log("For command-line usage:");
  console.log("  password-generator --help");
  console.log("\nQuick examples:");
  console.log("  password-generator -p quick");
  console.log("  password-generator -t strong -i 3 -s \"-\"");
};
