// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Web UI - Thin Adapter for Browser Environments
 *
 * This module provides a complete Web UI integration following the thin adapter pattern:
 *
 * 1. **Adapters** - Browser implementations of core ports (Web Crypto, localStorage, etc.)
 * 2. **State** - UI form state and mapping to core configuration
 * 3. **View Models** - Transformers for core results to UI-friendly data
 * 4. **Controllers** - Thin adapters that wire adapters to core and delegate all logic
 * 5. **Hooks** - React hooks for easy integration (optional)
 *
 * ## Architecture
 *
 * ```
 * UI Input → FormState → StateToCoreMapper → service.validateConfig()
 *                                          → service.generate()
 *                                          → PasswordViewModel → UI Render
 * ```
 *
 * ## Usage (Vanilla JS)
 *
 * ```javascript
 * import { createWebUIController, FormState } from './ui/web';
 *
 * const controller = createWebUIController();
 * const formState = new FormState({ type: 'strong', iteration: '4' });
 *
 * // Validate
 * const validation = controller.validate(formState);
 * if (!validation.isValid) {
 *   console.error(validation.errors);
 * }
 *
 * // Generate
 * const result = await controller.generate(formState);
 * console.log(result.password);
 * console.log(result.strengthIndicator.label);
 * ```
 *
 * ## Usage (React)
 *
 * ```javascript
 * import { usePasswordGenerator } from './ui/web';
 *
 * function PasswordForm() {
 *   const { formState, setField, generate, result, error } = usePasswordGenerator();
 *   // ... use in component
 * }
 * ```
 *
 * @module ui/web
 */

// Adapters - Browser implementations of core ports
export { BrowserCryptoRandom, BrowserStorage, BrowserClock } from './adapters/index.js';

// State - UI form state management
export { FormState, StateToCoreMapper } from './state/index.js';

// View Models - Core result transformers
export { PasswordViewModel, ValidationViewModel, EntropyViewModel } from './view-models/index.js';

// Controllers - Thin adapters
export { WebUIController, createWebUIController } from './controllers/index.js';

// Hooks - React integration (optional)
export { usePasswordGenerator } from './hooks/index.js';
