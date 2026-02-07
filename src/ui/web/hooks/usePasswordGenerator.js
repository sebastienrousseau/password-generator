// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * React hook for password generation.
 *
 * This hook encapsulates the thin adapter pattern for React applications.
 * It manages UI state and delegates all business logic to the core service.
 *
 * Note: This file is framework-specific (React) and optional.
 * For vanilla JS or other frameworks, use WebUIController directly.
 */

import { useState, useCallback, useMemo } from "react";
import { createWebUIController } from "../controllers/WebUIController.js";
import { FormState } from "../state/FormState.js";

/**
 * React hook that encapsulates the thin adapter pattern.
 *
 * @param {Object} [options] - Controller options.
 * @returns {Object} Hook state and actions.
 *
 * @example
 * function PasswordForm() {
 *   const {
 *     formState,
 *     setField,
 *     validate,
 *     generate,
 *     result,
 *     isLoading,
 *     error
 *   } = usePasswordGenerator();
 *
 *   return (
 *     <form onSubmit={(e) => { e.preventDefault(); generate(); }}>
 *       <select
 *         value={formState.type}
 *         onChange={(e) => setField('type', e.target.value)}
 *       >
 *         <option value="strong">Strong</option>
 *         <option value="memorable">Memorable</option>
 *       </select>
 *       <button type="submit" disabled={isLoading}>Generate</button>
 *       {result && <p>{result.password}</p>}
 *       {error && <p className="error">{error}</p>}
 *     </form>
 *   );
 * }
 */
export function usePasswordGenerator(options = {}) {
  // Create controller once (memoized)
  const controller = useMemo(() => createWebUIController(options), []);

  // State
  const [formState, setFormState] = useState(new FormState());
  const [result, setResult] = useState(null);
  const [validation, setValidation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Updates a single form field.
   */
  const setField = useCallback((field, value) => {
    setFormState((prev) => prev.with({ [field]: value }));
    setError(null);
  }, []);

  /**
   * Updates multiple form fields at once.
   */
  const setFields = useCallback((updates) => {
    setFormState((prev) => prev.with(updates));
    setError(null);
  }, []);

  /**
   * Validates the current form state.
   */
  const validate = useCallback(() => {
    const validationResult = controller.validate(formState);
    setValidation(validationResult);
    return validationResult;
  }, [controller, formState]);

  /**
   * Generates a password using current form state.
   */
  const generate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const viewModel = await controller.generate(formState);
      setResult(viewModel);
      setValidation(null);
      return viewModel;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [controller, formState]);

  /**
   * Resets all state to initial values.
   */
  const reset = useCallback(() => {
    setFormState(new FormState());
    setResult(null);
    setValidation(null);
    setError(null);
  }, []);

  /**
   * Applies a preset configuration.
   */
  const applyPreset = useCallback((presetName, presets) => {
    try {
      setFormState(FormState.fromPreset(presetName, presets));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  /**
   * Calculates entropy for current configuration.
   */
  const getEntropy = useCallback(() => {
    return controller.calculateEntropy(formState);
  }, [controller, formState]);

  return {
    // State
    formState,
    result,
    validation,
    isLoading,
    error,

    // Field actions
    setField,
    setFields,

    // Main actions
    validate,
    generate,
    reset,
    applyPreset,
    getEntropy,

    // Utilities
    supportedTypes: controller.getSupportedTypes(),
    controller,
  };
}
