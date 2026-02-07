// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * UI form state definition.
 *
 * This represents the raw state from UI form controls.
 * It is a pure data structure with no business logic.
 */

/**
 * Represents the state of the password generator form in the UI.
 */
export class FormState {
  /**
   * Creates a new FormState instance.
   *
   * @param {Object} data - Initial state values.
   * @param {string} [data.type=""] - Password type (strong, base64, memorable).
   * @param {string} [data.length=""] - Password length as string from input.
   * @param {string} [data.iteration=""] - Number of iterations as string.
   * @param {string} [data.separator="-"] - Separator character.
   * @param {string|null} [data.preset=null] - Selected preset name.
   * @param {boolean} [data.copyToClipboard=false] - Auto-copy to clipboard.
   * @param {boolean} [data.showPassword=true] - Show or mask password.
   */
  constructor(data = {}) {
    // Form field values (as strings from UI inputs)
    this.type = data.type ?? "";
    this.length = data.length ?? "";
    this.iteration = data.iteration ?? "";
    this.separator = data.separator ?? "-";

    // UI-only state (not sent to core)
    this.preset = data.preset ?? null;
    this.copyToClipboard = data.copyToClipboard ?? false;
    this.showPassword = data.showPassword ?? true;
  }

  /**
   * Creates FormState from a preset configuration.
   *
   * @param {string} presetName - Name of the preset.
   * @param {Object} presets - Available preset configurations.
   * @returns {FormState} New FormState populated from preset.
   * @throws {Error} If preset name is not found.
   */
  static fromPreset(presetName, presets) {
    const preset = presets[presetName];
    if (!preset) {
      throw new Error(`Unknown preset: ${presetName}`);
    }

    return new FormState({
      type: preset.type,
      length: String(preset.length),
      iteration: String(preset.iteration),
      separator: preset.separator,
      preset: presetName,
    });
  }

  /**
   * Creates a copy of the FormState with updated values.
   *
   * @param {Object} updates - Values to update.
   * @returns {FormState} New FormState with updates applied.
   */
  with(updates) {
    return new FormState({
      type: this.type,
      length: this.length,
      iteration: this.iteration,
      separator: this.separator,
      preset: this.preset,
      copyToClipboard: this.copyToClipboard,
      showPassword: this.showPassword,
      ...updates,
    });
  }

  /**
   * Checks if form has all required fields populated.
   *
   * @returns {boolean} True if required fields are set.
   */
  hasRequiredFields() {
    return this.type !== "" && this.iteration !== "";
  }

  /**
   * Checks if this FormState is equal to another.
   *
   * @param {FormState} other - FormState to compare.
   * @returns {boolean} True if equal.
   */
  equals(other) {
    if (!(other instanceof FormState)) {
      return false;
    }
    return (
      this.type === other.type &&
      this.length === other.length &&
      this.iteration === other.iteration &&
      this.separator === other.separator &&
      this.preset === other.preset
    );
  }

  /**
   * Converts FormState to a plain object.
   *
   * @returns {Object} Plain object representation.
   */
  toJSON() {
    return {
      type: this.type,
      length: this.length,
      iteration: this.iteration,
      separator: this.separator,
      preset: this.preset,
      copyToClipboard: this.copyToClipboard,
      showPassword: this.showPassword,
    };
  }
}
