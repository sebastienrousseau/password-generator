// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * View model for entropy display in UI.
 *
 * Transforms core entropy information to UI-friendly data.
 * This is a pure transformation layer with no entropy calculations.
 */

/**
 * View model representing entropy information for UI display.
 */
export class EntropyViewModel {
  /**
   * Creates an EntropyViewModel.
   *
   * @param {Object} entropyInfo - Entropy information from core.
   * @param {number} entropyInfo.totalBits - Total entropy in bits.
   * @param {number} [entropyInfo.perUnit] - Entropy per unit.
   * @param {string} [entropyInfo.securityLevel] - Security level label.
   * @param {string} [entropyInfo.recommendation] - Security recommendation.
   */
  constructor(entropyInfo) {
    this.totalBits = entropyInfo.totalBits ?? 0;
    this.perUnit = entropyInfo.perUnit ?? 0;
    this.securityLevel = entropyInfo.securityLevel ?? 'unknown';
    this.recommendation = entropyInfo.recommendation ?? '';

    // UI-specific computed values
    this.displayBits = Math.round(this.totalBits);
    this.strengthPercentage = this._calculatePercentage(this.totalBits);
    this.strengthLabel = this._getStrengthLabel(this.totalBits);
    this.strengthColor = this._getStrengthColor(this.totalBits);
    this.progressBarWidth = `${this.strengthPercentage}%`;
  }

  /**
   * Calculates display percentage (capped at 100%).
   *
   * @param {number} bits - Entropy bits.
   * @returns {number} Percentage (0-100).
   * @private
   */
  _calculatePercentage(bits) {
    // Cap at 256 bits for display purposes (100% = 256 bits)
    return Math.min(100, Math.round((bits / 256) * 100));
  }

  /**
   * Gets strength label based on entropy bits.
   *
   * @param {number} bits - Entropy bits.
   * @returns {string} Strength label.
   * @private
   */
  _getStrengthLabel(bits) {
    if (bits >= 256) {
      return 'Excellent';
    }
    if (bits >= 128) {
      return 'Strong';
    }
    if (bits >= 80) {
      return 'Good';
    }
    if (bits >= 64) {
      return 'Moderate';
    }
    if (bits >= 40) {
      return 'Weak';
    }
    return 'Very Weak';
  }

  /**
   * Gets color name based on entropy bits.
   *
   * @param {number} bits - Entropy bits.
   * @returns {string} Color name.
   * @private
   */
  _getStrengthColor(bits) {
    if (bits >= 128) {
      return 'green';
    }
    if (bits >= 80) {
      return 'blue';
    }
    if (bits >= 64) {
      return 'yellow';
    }
    if (bits >= 40) {
      return 'orange';
    }
    return 'red';
  }

  /**
   * Factory method from core entropy info.
   *
   * @param {Object} entropyInfo - Core entropy information.
   * @returns {EntropyViewModel} New view model instance.
   */
  static fromEntropyInfo(entropyInfo) {
    return new EntropyViewModel(entropyInfo);
  }

  /**
   * Gets a formatted display string.
   *
   * @returns {string} Formatted entropy display.
   */
  getDisplayString() {
    return `${this.displayBits}-bit · ${this.strengthLabel}`;
  }

  /**
   * Gets ARIA label for accessibility.
   *
   * @returns {string} Accessible description.
   */
  getAriaLabel() {
    return `Password strength: ${this.strengthLabel} with ${this.displayBits} bits of entropy`;
  }

  /**
   * Converts to plain object for JSON serialization.
   *
   * @returns {Object} Plain object representation.
   */
  toJSON() {
    return {
      totalBits: this.totalBits,
      displayBits: this.displayBits,
      securityLevel: this.securityLevel,
      strengthLabel: this.strengthLabel,
      strengthColor: this.strengthColor,
      strengthPercentage: this.strengthPercentage,
      recommendation: this.recommendation,
    };
  }
}
