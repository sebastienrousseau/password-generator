// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * View model for password display in UI.
 *
 * Transforms core generation results to UI-ready data.
 * This is a pure transformation layer with no business logic.
 */

/**
 * View model representing a generated password for UI display.
 */
export class PasswordViewModel {
  /**
   * Creates a PasswordViewModel from generation result data.
   *
   * @param {Object} data - Generation result data.
   * @param {string} data.password - The generated password.
   * @param {Object} data.entropyInfo - Entropy information from core.
   * @param {Object} data.config - Configuration used for generation.
   */
  constructor(data) {
    // Password display
    this.password = data.password;
    this.maskedPassword = this._maskPassword(data.password);
    this.length = data.password?.length ?? 0;

    // Entropy display
    this.entropyBits = data.entropyInfo?.totalBits ?? 0;
    this.securityLevel = data.entropyInfo?.securityLevel ?? "unknown";
    this.securityRecommendation = data.entropyInfo?.recommendation ?? "";

    // Strength indicator (for visual components)
    this.strengthIndicator = this._mapToStrengthIndicator(data.entropyInfo);

    // Configuration echo (for user reference)
    this.type = data.config?.type ?? "";
    this.configSummary = this._formatConfigSummary(data.config);

    // Timestamps
    this.generatedAt = new Date().toISOString();
  }

  /**
   * Masks a password for display, showing only first and last 2 chars.
   *
   * @param {string} password - Password to mask.
   * @returns {string} Masked password.
   * @private
   */
  _maskPassword(password) {
    if (!password) {
      return "";
    }
    if (password.length <= 4) {
      return "*".repeat(password.length);
    }
    return password.slice(0, 2) + "*".repeat(password.length - 4) + password.slice(-2);
  }

  /**
   * Maps entropy info to a strength indicator object.
   *
   * @param {Object} entropyInfo - Entropy information.
   * @returns {Object} Strength indicator with level, label, and color.
   * @private
   */
  _mapToStrengthIndicator(entropyInfo) {
    const bits = entropyInfo?.totalBits ?? 0;

    if (bits >= 128) {
      return { level: "maximum", label: "Maximum", dots: 4, color: "success" };
    }
    if (bits >= 80) {
      return { level: "strong", label: "Strong", dots: 3, color: "success" };
    }
    if (bits >= 64) {
      return { level: "medium", label: "Medium", dots: 2, color: "warning" };
    }
    return { level: "weak", label: "Weak", dots: 1, color: "error" };
  }

  /**
   * Formats configuration as a summary string.
   *
   * @param {Object} config - Configuration object.
   * @returns {string} Formatted summary.
   * @private
   */
  _formatConfigSummary(config) {
    if (!config) {
      return "";
    }

    const parts = [];
    if (config.type) {parts.push(`Type: ${config.type}`);}
    if (config.length) {parts.push(`Length: ${config.length}`);}
    if (config.iteration) {parts.push(`Iterations: ${config.iteration}`);}
    if (config.separator) {parts.push(`Separator: "${config.separator}"`);}
    return parts.join(" | ");
  }

  /**
   * Factory method from core generation result.
   *
   * @param {Object} result - Core generation result.
   * @returns {PasswordViewModel} New view model instance.
   */
  static fromGenerationResult(result) {
    return new PasswordViewModel(result);
  }

  /**
   * Gets the display password based on visibility setting.
   *
   * @param {boolean} showPassword - Whether to show or mask.
   * @returns {string} Password or masked version.
   */
  getDisplayPassword(showPassword = true) {
    return showPassword ? this.password : this.maskedPassword;
  }

  /**
   * Gets strength dots as a visual string.
   *
   * @returns {string} Dots representation (e.g., "●●●○").
   */
  getStrengthDots() {
    const filled = this.strengthIndicator.dots;
    const empty = 4 - filled;
    return "●".repeat(filled) + "○".repeat(empty);
  }

  /**
   * Converts to plain object for JSON serialization.
   *
   * @returns {Object} Plain object representation.
   */
  toJSON() {
    return {
      password: this.password,
      maskedPassword: this.maskedPassword,
      length: this.length,
      entropyBits: this.entropyBits,
      securityLevel: this.securityLevel,
      strengthIndicator: this.strengthIndicator,
      type: this.type,
      configSummary: this.configSummary,
      generatedAt: this.generatedAt,
    };
  }
}
