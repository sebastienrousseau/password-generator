// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Keyboard Shortcuts Configuration
 *
 * Provides configurable keyboard shortcuts with:
 * - Default keybindings (arrows, j/k, numbers)
 * - Flexible key matching
 * - Support for custom keybindings
 *
 * @module ui/keyboard
 */

/**
 * Key event object from readline
 * @typedef {Object} KeyEvent
 * @property {string} name - Key name (e.g., "up", "down", "return")
 * @property {boolean} ctrl - Whether Ctrl is pressed
 * @property {boolean} meta - Whether Meta/Alt is pressed
 * @property {boolean} shift - Whether Shift is pressed
 * @property {string} sequence - Raw key sequence
 */

/**
 * Key binding definition
 * @typedef {Object} KeyBinding
 * @property {string | string[]} key - Key name(s) to match
 * @property {boolean} [ctrl] - Require Ctrl modifier
 * @property {boolean} [meta] - Require Meta/Alt modifier
 * @property {boolean} [shift] - Require Shift modifier
 */

/**
 * Default keyboard bindings for navigation
 */
export const defaultBindings = {
  // Navigation
  up: [{ key: "up" }, { key: "k" }],
  down: [{ key: "down" }, { key: "j" }],
  left: [{ key: "left" }, { key: "h" }],
  right: [{ key: "right" }, { key: "l" }],

  // Selection
  select: [{ key: "return" }, { key: "space" }],
  selectNumber: [{ key: ["1", "2", "3", "4", "5", "6", "7", "8", "9"] }],

  // Exit / Cancel
  cancel: [{ key: "escape" }, { key: "q" }],
  quit: [{ key: "c", ctrl: true }],

  // Actions
  back: [{ key: "escape" }, { key: "backspace" }],
  help: [{ key: "?" }, { key: "h", shift: true }],

  // Command palette
  commandPalette: [
    { key: "k", ctrl: true },
    { key: "p", ctrl: true },
  ],

  // Page navigation
  pageUp: [{ key: "pageup" }, { key: "u", ctrl: true }],
  pageDown: [{ key: "pagedown" }, { key: "d", ctrl: true }],
  home: [{ key: "home" }, { key: "g" }],
  end: [{ key: "end" }, { key: "g", shift: true }],
};

/**
 * Check if a key event matches a single binding
 * @param {KeyEvent} key - The key event to check
 * @param {KeyBinding} binding - The binding to match against
 * @returns {boolean} True if the key matches the binding
 */
const matchesSingleBinding = (key, binding) => {
  if (!key) {
    return false;
  }

  // Check key name
  const keyNames = Array.isArray(binding.key) ? binding.key : [binding.key];
  const keyMatches = keyNames.includes(key.name);

  if (!keyMatches) {
    return false;
  }

  // Check modifiers (only if specified in binding)
  if (binding.ctrl !== undefined && binding.ctrl !== !!key.ctrl) {
    return false;
  }
  if (binding.meta !== undefined && binding.meta !== !!key.meta) {
    return false;
  }
  if (binding.shift !== undefined && binding.shift !== !!key.shift) {
    return false;
  }

  return true;
};

/**
 * Check if a key event matches any binding for an action
 * @param {KeyEvent} key - The key event to check
 * @param {string} action - The action name to check (e.g., "up", "select")
 * @param {Object} bindings - Optional custom bindings (defaults to defaultBindings)
 * @returns {boolean} True if the key matches any binding for the action
 */
export const matchesBinding = (key, action, bindings = defaultBindings) => {
  const actionBindings = bindings[action];
  if (!actionBindings) {
    return false;
  }

  return actionBindings.some((binding) => matchesSingleBinding(key, binding));
};

/**
 * Get the display string for a keyboard shortcut
 * @param {KeyBinding} binding - The binding to display
 * @returns {string} Human-readable shortcut string
 */
export const formatBinding = (binding) => {
  const parts = [];

  if (binding.ctrl) {
    parts.push("Ctrl");
  }
  if (binding.meta) {
    parts.push("Alt");
  }
  if (binding.shift) {
    parts.push("Shift");
  }

  const keyNames = Array.isArray(binding.key) ? binding.key : [binding.key];
  const keyDisplay = keyNames[0].charAt(0).toUpperCase() + keyNames[0].slice(1);
  parts.push(keyDisplay);

  return parts.join("+");
};

/**
 * Get all display strings for an action's bindings
 * @param {string} action - The action name
 * @param {Object} bindings - Optional custom bindings
 * @returns {string[]} Array of shortcut display strings
 */
export const getBindingDisplays = (action, bindings = defaultBindings) => {
  const actionBindings = bindings[action];
  if (!actionBindings) {
    return [];
  }

  return actionBindings.map(formatBinding);
};

/**
 * Create a keyboard handler that maps keys to actions
 * @param {Object} actionHandlers - Object mapping action names to handler functions
 * @param {Object} bindings - Optional custom bindings
 * @returns {Function} Key event handler function
 */
export const createKeyHandler = (actionHandlers, bindings = defaultBindings) => {
  return (str, key) => {
    if (!key) {
      return;
    }

    // Check each action for a match
    for (const [action, handler] of Object.entries(actionHandlers)) {
      if (matchesBinding(key, action, bindings)) {
        handler(key, str);
        return true;
      }
    }

    // Check for number key selection (special case)
    if (actionHandlers.selectNumber && str && /^[1-9]$/.test(str)) {
      const index = parseInt(str, 10) - 1;
      actionHandlers.selectNumber(index, key, str);
      return true;
    }

    return false;
  };
};

/**
 * Merge custom bindings with defaults
 * @param {Object} customBindings - Custom bindings to merge
 * @returns {Object} Merged bindings
 */
export const mergeBindings = (customBindings) => {
  const merged = { ...defaultBindings };

  for (const [action, bindings] of Object.entries(customBindings)) {
    if (merged[action]) {
      // Prepend custom bindings (higher priority)
      merged[action] = [...bindings, ...merged[action]];
    } else {
      merged[action] = bindings;
    }
  }

  return merged;
};

export default {
  defaultBindings,
  matchesBinding,
  formatBinding,
  getBindingDisplays,
  createKeyHandler,
  mergeBindings,
};
