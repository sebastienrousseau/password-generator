// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * View model for validation display in UI.
 *
 * Maps core validation errors to specific form fields for UI display.
 * This is a pure transformation layer with no validation logic.
 */

/**
 * View model representing validation state for UI display.
 */
export class ValidationViewModel {
  /**
   * Creates a ValidationViewModel.
   *
   * @param {Object} data - Validation data.
   * @param {boolean} data.isValid - Overall validity.
   * @param {string[]} data.errors - List of error messages.
   * @param {Object} data.fieldErrors - Errors mapped to fields.
   */
  constructor(data) {
    this.isValid = data.isValid;
    this.errors = data.errors;
    this.fieldErrors = data.fieldErrors;

    // Convenience flags for UI binding
    this.hasTypeError = data.fieldErrors.type !== null;
    this.hasLengthError = data.fieldErrors.length !== null;
    this.hasIterationError = data.fieldErrors.iteration !== null;
    this.hasSeparatorError = data.fieldErrors.separator !== null;
    this.hasErrors = !data.isValid;
  }

  /**
   * Maps core validation result to field-specific errors for UI display.
   *
   * @param {Object} validation - Core validation result.
   * @param {boolean} validation.isValid - Whether config is valid.
   * @param {string[]} validation.errors - Array of error messages.
   * @param {FormState} [formState] - Optional form state for context.
   * @returns {ValidationViewModel} New view model instance.
   */
  // eslint-disable-next-line no-unused-vars
  static fromValidationResult(validation, formState = null) {
    const fieldErrors = {
      type: null,
      length: null,
      iteration: null,
      separator: null,
    };

    // Parse core errors and map to specific fields
    for (const error of validation.errors) {
      const lowerError = error.toLowerCase();

      if (lowerError.includes('type')) {
        fieldErrors.type = error;
      } else if (lowerError.includes('length')) {
        fieldErrors.length = error;
      } else if (lowerError.includes('iteration')) {
        fieldErrors.iteration = error;
      } else if (lowerError.includes('separator')) {
        fieldErrors.separator = error;
      }
    }

    return new ValidationViewModel({
      isValid: validation.isValid,
      errors: validation.errors,
      fieldErrors,
    });
  }

  /**
   * Creates a valid (no errors) view model.
   *
   * @returns {ValidationViewModel} Valid view model.
   */
  static valid() {
    return new ValidationViewModel({
      isValid: true,
      errors: [],
      fieldErrors: {
        type: null,
        length: null,
        iteration: null,
        separator: null,
      },
    });
  }

  /**
   * Gets error message for a specific field.
   *
   * @param {string} fieldName - Name of the field.
   * @returns {string|null} Error message or null.
   */
  getFieldError(fieldName) {
    return this.fieldErrors[fieldName] ?? null;
  }

  /**
   * Checks if a specific field has an error.
   *
   * @param {string} fieldName - Name of the field.
   * @returns {boolean} True if field has error.
   */
  hasFieldError(fieldName) {
    return fieldName in this.fieldErrors && this.fieldErrors[fieldName] !== null;
  }

  /**
   * Gets all field names that have errors.
   *
   * @returns {string[]} Array of field names with errors.
   */
  getErrorFields() {
    return Object.entries(this.fieldErrors)
      .filter(([, error]) => error !== null)
      .map(([field]) => field);
  }

  /**
   * Gets the first error message for display.
   *
   * @returns {string|null} First error or null.
   */
  getFirstError() {
    return this.errors.length > 0 ? this.errors[0] : null;
  }

  /**
   * Converts to plain object for JSON serialization.
   *
   * @returns {Object} Plain object representation.
   */
  toJSON() {
    return {
      isValid: this.isValid,
      errors: this.errors,
      fieldErrors: this.fieldErrors,
    };
  }
}
