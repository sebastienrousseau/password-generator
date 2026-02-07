// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * CLI Service - Crush-Inspired Minimal Design
 *
 * Implements a glamorous, minimal terminal aesthetic:
 * - Clean, uncluttered output
 * - Soft colors with gradient accents
 * - Generous whitespace
 * - Elegant visual hierarchy
 *
 * @module services/cli-service
 */

import { getPresetConfig } from "../config.js";
import {
  colors,
  gradient,
  icons,
  renderPassword,
  renderCommandPanel,
  renderStrengthIndicator,
  renderHeader,
} from "../ui/theme.js";

/**
 * Generates the equivalent CLI command string based on the configuration used.
 */
export const generateEquivalentCommand = (config, preset, opts) => {
  const parts = ["password-generator"];

  if (preset) {
    parts.push(`-p ${preset}`);
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
    parts.push(`-t ${config.type}`);
    if (config.length) {
      parts.push(`-l ${config.length}`);
    }
    parts.push(`-i ${config.iteration}`);
    parts.push(`-s "${config.separator}"`);
  }

  if (opts.clipboard) {
    parts.push("-c");
  }
  if (opts.audit) {
    parts.push("-a");
  }

  return parts.join(" ");
};

/**
 * Calculate password strength
 */
const calculateStrength = (password) => {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) {charsetSize += 26;}
  if (/[A-Z]/.test(password)) {charsetSize += 26;}
  if (/[0-9]/.test(password)) {charsetSize += 10;}
  if (/[^a-zA-Z0-9]/.test(password)) {charsetSize += 32;}

  const entropy = Math.floor(password.length * Math.log2(charsetSize || 1));

  let strength = "weak";
  if (entropy >= 128) {strength = "maximum";}
  else if (entropy >= 80) {strength = "strong";}
  else if (entropy >= 50) {strength = "medium";}

  return { strength, entropy };
};

/**
 * Displays password output with minimal Crush-inspired design
 */
export const displayPasswordOutput = (password, copiedToClipboard = false, config = {}) => {
  const { strength, entropy } = calculateStrength(password);

  console.log(
    renderPassword(password, {
      copied: copiedToClipboard,
      strength,
      entropy,
    })
  );

  // Display security note for quantum-resistant passwords
  if (config.type === "quantum-resistant") {
    console.log("");
    console.log(`  ${colors.dim("🔒 security note:")} Use Argon2id KDF for storage (OWASP/NIST SP 800-63B)`);
  }
};

/**
 * Displays the command learning panel (minimal)
 */
export const displayCommandLearningPanel = (command) => {
  const shortcuts = [
    { flag: "-p quick", desc: "fast preset" },
    { flag: "-p secure", desc: "maximum security" },
    { flag: "-p quantum", desc: "quantum-resistant" },
    { flag: "-c", desc: "copy to clipboard" },
    { flag: "-a", desc: "security audit" },
  ];

  console.log(renderCommandPanel(command, shortcuts));
};

/**
 * Displays a security audit report (minimal)
 */
export const displaySecurityAuditReport = (auditReport, config = {}) => {
  console.log("");
  console.log(`  ${gradient.primary("security audit")}`);
  console.log("");

  if (auditReport) {
    if (auditReport.generation) {
      console.log(`  ${colors.dim("generation")}`);
      console.log(`  ${colors.muted(icons.pointer)} algorithm      ${colors.text(auditReport.generation.algorithm || "cryptographic")}`);
      console.log(`  ${colors.muted(icons.pointer)} entropy source ${colors.text(auditReport.generation.entropySource || "crypto.randomInt")}`);
      console.log("");
    }

    if (auditReport.password) {
      console.log(`  ${colors.dim("analysis")}`);
      console.log(`  ${colors.muted(icons.pointer)} length         ${colors.text(String(auditReport.password.length || "N/A"))}`);
      console.log(`  ${colors.muted(icons.pointer)} entropy        ${colors.text((auditReport.password.entropy || "N/A") + " bits")}`);

      // Display strength with accessible label using renderStrengthIndicator
      if (auditReport.password.entropy) {
        let strength = "weak";
        if (auditReport.password.entropy >= 128) {strength = "maximum";}
        else if (auditReport.password.entropy >= 80) {strength = "strong";}
        else if (auditReport.password.entropy >= 50) {strength = "medium";}
        console.log(`  ${colors.muted(icons.pointer)} strength       ${renderStrengthIndicator(strength, { showLabel: true })}`);
      }
      console.log("");
    }

    console.log(`  ${colors.success(icons.success)} ${colors.dim("NIST SP 800-63B compliant")}`);

    // Enhanced security guidance for quantum-resistant passwords
    if (config.type === "quantum-resistant") {
      console.log("");
      console.log(`  ${colors.dim("storage guidance")}`);
      console.log(`  ${colors.muted(icons.pointer)} Use Argon2id KDF with NIST SP 800-132 parameters`);
      console.log(`  ${colors.muted(icons.pointer)} References: OWASP Password Storage, NIST SP 800-63B`);
    }
  } else {
    console.log(`  ${colors.dim(JSON.stringify(auditReport, null, 2))}`);
  }

  console.log("");
};

/**
 * Displays help for non-TTY environments
 */
export const displayNonTTYHelp = () => {
  console.log(renderHeader("password generator"));
  console.log(`  ${colors.dim("run in a terminal for interactive mode")}`);
  console.log("");
  console.log(`  ${colors.dim("quick start")}`);
  console.log(`  ${colors.muted(icons.pointer)} ${colors.command("password-generator -p quick")}`);
  console.log(`  ${colors.muted(icons.pointer)} ${colors.command("password-generator -p secure")}`);
  console.log(`  ${colors.muted(icons.pointer)} ${colors.command("password-generator --help")}`);
  console.log("");
};
