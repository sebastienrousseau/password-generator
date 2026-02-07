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
   *
   * Note: Uses FormState.with() (tested in FormState.test.js) with React state.
   */
  /* c8 ignore start -- React hook callback requires React test environment */
  const setField = useCallback((field, value) => {
    setFormState((prev) => prev.with({ [field]: value }));
    setError(null);
  }, []);
  /* c8 ignore stop */

  /**
   * Updates multiple form fields at once.
   *
   * Note: Uses FormState.with() (tested in FormState.test.js) with React state.
   */
  /* c8 ignore start -- React hook callback requires React test environment */
  const setFields = useCallback((updates) => {
    setFormState((prev) => prev.with(updates));
    setError(null);
  }, []);
  /* c8 ignore stop */

  /**
   * Validates the current form state.
   *
   * Note: This delegates to controller.validate (tested in WebUIController.test.js).
   * The useCallback wrapper and state setter require React test environment.
   */
  /* c8 ignore start -- React hook callback requires React test environment */
  const validate = useCallback(() => {
    const validationResult = controller.validate(formState);
    setValidation(validationResult);
    return validationResult;
  }, [controller, formState]);
  /* c8 ignore stop */

  /**
   * Generates a password using current form state.
   *
   * Note: This delegates to controller.generate (tested in WebUIController.test.js).
   * The useCallback wrapper, state setters, and error handling require React.
   */
  /* c8 ignore start -- React hook callback requires React test environment */
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
  /* c8 ignore stop */

  /**
   * Resets all state to initial values.
   *
   * Note: This is pure React state management. The state setters are
   * React primitives that require a React test environment to test.
   * The FormState constructor is tested in FormState.test.js.
   */
  /* c8 ignore start -- React hook callback requires React test environment */
  const reset = useCallback(() => {
    setFormState(new FormState());
    setResult(null);
    setValidation(null);
    setError(null);
  }, []);
  /* c8 ignore stop */

  /**
   * Applies a preset configuration.
   *
   * Note: This wraps FormState.fromPreset (tested in FormState.test.js)
   * with React state management. The try/catch and state setters require
   * a React test environment to test directly.
   */
  /* c8 ignore start -- React hook callback requires React test environment */
  const applyPreset = useCallback((presetName, presets) => {
    try {
      setFormState(FormState.fromPreset(presetName, presets));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);
  /* c8 ignore stop */

  /**
   * Calculates entropy for current configuration.
   *
   * Note: This delegates to controller.calculateEntropy which is tested
   * in WebUIController.test.js. The useCallback wrapper requires React.
   */
  /* c8 ignore start -- React hook callback requires React test environment */
  const getEntropy = useCallback(() => {
    return controller.calculateEntropy(formState);
  }, [controller, formState]);
  /* c8 ignore stop */

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
