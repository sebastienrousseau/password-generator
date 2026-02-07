// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * View model for password display in UI.
 *
 * Transforms core generation results to UI-ready data with advanced strength analysis.
 * This is a pure transformation layer with no business logic.
 */

import { getStrengthLabel, getStrengthColor } from '../../../utils/password-strength-analyzer.js';

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
   * @param {Object} data.strength - Strength analysis from password-strength-analyzer.
   * @param {Object} data.config - Configuration used for generation.
   */
  constructor(data) {
    // Password display
    this.password = data.password;
    this.maskedPassword = this._maskPassword(data.password);
    this.length = data.password?.length ?? 0;

    // Legacy entropy display (for backward compatibility)
    this.entropyBits = data.entropyInfo?.totalBits ?? 0;
    this.securityLevel = data.entropyInfo?.securityLevel ?? 'unknown';
    this.securityRecommendation = data.entropyInfo?.recommendation ?? '';

    // Advanced strength analysis
    this.strength = data.strength || {};
    this.strengthScore = this.strength.score ?? 0;
    this.strengthLabel = getStrengthLabel(this.strengthScore);
    this.strengthColor = getStrengthColor(this.strengthScore);
    this.effectiveEntropy = this.strength.entropy ?? this.entropyBits;

    // Strength feedback for UI
    this.feedback = this.strength.feedback || { suggestions: [], recommendations: [] };
    this.patterns = this.strength.patterns || [];
    this.dictionaries = this.strength.dictionaries || [];
    this.crackTime = this.strength.crackTime || {};

    // Enhanced strength indicator (uses zxcvbn-style scoring with entropy fallback)
    this.strengthIndicator = this._getStrengthIndicator(data);

    // Configuration echo (for user reference)
    this.type = data.config?.type ?? '';
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
      return '';
    }
    if (password.length <= 4) {
      return '*'.repeat(password.length);
    }
    return password.slice(0, 2) + '*'.repeat(password.length - 4) + password.slice(-2);
  }

  /**
   * Gets the appropriate strength indicator based on available data.
   * Uses score-based system when strength analysis is available,
   * falls back to entropy-based system for backward compatibility.
   *
   * @param {Object} data - Original data object.
   * @returns {Object} Strength indicator with level, label, dots, and color.
   * @private
   */
  _getStrengthIndicator(data) {
    // If we have a valid strength score (0-4), use the advanced system
    if (data.strength && typeof data.strength.score === 'number') {
      return this._mapToAdvancedStrengthIndicator();
    }
    // Otherwise, fall back to entropy-based indicator for backward compatibility
    return this._mapToStrengthIndicator(data.entropyInfo);
  }

  /**
   * Maps strength score to an advanced strength indicator object.
   *
   * @returns {Object} Strength indicator with level, label, dots, and color.
   * @private
   */
  _mapToAdvancedStrengthIndicator() {
    const score = this.strengthScore;
    const scoreToLevel = {
      0: { level: 'very_weak', label: 'Very Weak', dots: 1, color: 'critical' },
      1: { level: 'weak', label: 'Weak', dots: 2, color: 'error' },
      2: { level: 'fair', label: 'Fair', dots: 3, color: 'warning' },
      3: { level: 'good', label: 'Good', dots: 4, color: 'success' },
      4: { level: 'strong', label: 'Strong', dots: 5, color: 'excellent' },
    };

    return scoreToLevel[score] || scoreToLevel[0];
  }

  /**
   * Maps entropy info to a strength indicator object (legacy method).
   *
   * @param {Object} entropyInfo - Entropy information.
   * @returns {Object} Strength indicator with level, label, and color.
   * @private
   */
  _mapToStrengthIndicator(entropyInfo) {
    const bits = entropyInfo?.totalBits ?? 0;

    if (bits >= 128) {
      return { level: 'maximum', label: 'Maximum', dots: 4, color: 'success' };
    }
    if (bits >= 80) {
      return { level: 'strong', label: 'Strong', dots: 3, color: 'success' };
    }
    if (bits >= 64) {
      return { level: 'medium', label: 'Medium', dots: 2, color: 'warning' };
    }
    return { level: 'weak', label: 'Weak', dots: 1, color: 'error' };
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
      return '';
    }

    const parts = [];
    if (config.type) {
      parts.push(`Type: ${config.type}`);
    }
    if (config.length) {
      parts.push(`Length: ${config.length}`);
    }
    if (config.iteration) {
      parts.push(`Iterations: ${config.iteration}`);
    }
    if (config.separator) {
      parts.push(`Separator: "${config.separator}"`);
    }
    return parts.join(' | ');
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
    // Use 4 dots for entropy-based (maximum=4) or 5 dots for score-based (strong=5)
    const maxDots = filled <= 4 ? 4 : 5;
    const empty = Math.max(0, maxDots - filled);
    return '●'.repeat(filled) + '○'.repeat(empty);
  }

  /**
   * Gets the primary weakness description for display.
   *
   * @returns {string} Primary weakness or empty string.
   */
  getPrimaryWeakness() {
    if (this.feedback.warning) {
      return this.feedback.warning;
    }
    if (this.patterns.length > 0) {
      return this.patterns[0].description;
    }
    if (this.dictionaries.length > 0) {
      return this.dictionaries[0].description;
    }
    return '';
  }

  /**
   * Gets crack time for the most relevant threat model.
   *
   * @returns {string} Formatted crack time estimate.
   */
  getCrackTimeEstimate() {
    if (!this.crackTime) {
      return 'Unknown';
    }

    // Prioritize offline attack scenarios as they're most relevant for leaked passwords
    return this.crackTime.offline_slow || this.crackTime.online_unthrottled || 'Unknown';
  }

  /**
   * Gets top suggestions for password improvement.
   *
   * @param {number} limit - Maximum number of suggestions to return.
   * @returns {Array<string>} Top suggestions.
   */
  getTopSuggestions(limit = 3) {
    return this.feedback.suggestions?.slice(0, limit) || [];
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

      // Legacy entropy info
      entropyBits: this.entropyBits,
      securityLevel: this.securityLevel,
      securityRecommendation: this.securityRecommendation,

      // Advanced strength analysis
      strengthScore: this.strengthScore,
      strengthLabel: this.strengthLabel,
      strengthColor: this.strengthColor,
      effectiveEntropy: this.effectiveEntropy,
      strengthIndicator: this.strengthIndicator,

      // Detailed analysis
      feedback: this.feedback,
      patterns: this.patterns,
      dictionaries: this.dictionaries,
      crackTime: this.crackTime,

      // Metadata
      type: this.type,
      configSummary: this.configSummary,
      generatedAt: this.generatedAt,
    };
  }
}
