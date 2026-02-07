// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Focus State Manager
 *
 * Tracks focus state for nested navigation with:
 * - Focus state stack for nested menus
 * - Automatic restoration when returning to a menu
 * - Support for multiple independent focus contexts
 *
 * @module ui/focus-manager
 */

/**
 * Focus state entry
 * @typedef {Object} FocusState
 * @property {string} id - Unique identifier for the focusable element
 * @property {number} index - Selected index within the element
 * @property {Object} [metadata] - Additional state data
 */

/**
 * FocusManager class for tracking and restoring focus state
 */
export class FocusManager {
  constructor() {
    /** @type {FocusState[]} */
    this.stack = [];

    /** @type {Map<string, FocusState>} */
    this.savedStates = new Map();
  }

  /**
   * Push a new focus state onto the stack
   * @param {string} id - Unique identifier for the menu/component
   * @param {number} index - Currently selected index
   * @param {Object} [metadata] - Additional state data
   */
  push(id, index = 0, metadata = {}) {
    const state = { id, index, metadata };
    this.stack.push(state);
    this.savedStates.set(id, state);
  }

  /**
   * Pop the current focus state and return to the previous one
   * @returns {FocusState | null} The popped state, or null if stack is empty
   */
  pop() {
    return this.stack.pop() || null;
  }

  /**
   * Get the current focus state without removing it
   * @returns {FocusState | null} The current state, or null if stack is empty
   */
  peek() {
    return this.stack.length > 0 ? this.stack[this.stack.length - 1] : null;
  }

  /**
   * Update the current focus state's index
   * @param {number} index - New selected index
   */
  updateIndex(index) {
    const current = this.peek();
    if (current) {
      current.index = index;
      this.savedStates.set(current.id, current);
    }
  }

  /**
   * Update the current focus state's metadata
   * @param {Object} metadata - Metadata to merge with existing
   */
  updateMetadata(metadata) {
    const current = this.peek();
    if (current) {
      current.metadata = { ...current.metadata, ...metadata };
      this.savedStates.set(current.id, current);
    }
  }

  /**
   * Get the saved state for a specific menu/component
   * @param {string} id - The menu/component identifier
   * @returns {FocusState | null} The saved state, or null if not found
   */
  getSavedState(id) {
    return this.savedStates.get(id) || null;
  }

  /**
   * Get the saved index for a specific menu/component
   * @param {string} id - The menu/component identifier
   * @param {number} defaultIndex - Default index if not found
   * @returns {number} The saved index or default
   */
  getSavedIndex(id, defaultIndex = 0) {
    const state = this.savedStates.get(id);
    return state ? state.index : defaultIndex;
  }

  /**
   * Check if we can go back (stack has more than one item)
   * @returns {boolean}
   */
  canGoBack() {
    return this.stack.length > 1;
  }

  /**
   * Get the previous state (for preview/breadcrumb purposes)
   * @returns {FocusState | null}
   */
  getPrevious() {
    return this.stack.length > 1 ? this.stack[this.stack.length - 2] : null;
  }

  /**
   * Clear all focus state
   */
  clear() {
    this.stack = [];
    this.savedStates.clear();
  }

  /**
   * Get the current depth of the focus stack
   * @returns {number}
   */
  getDepth() {
    return this.stack.length;
  }

  /**
   * Get breadcrumb trail of menu IDs
   * @returns {string[]}
   */
  getBreadcrumbs() {
    return this.stack.map((state) => state.id);
  }
}

// Singleton instance for global focus management
let globalFocusManager = null;

/**
 * Get the global focus manager instance
 * @returns {FocusManager}
 */
export const getFocusManager = () => {
  if (!globalFocusManager) {
    globalFocusManager = new FocusManager();
  }
  return globalFocusManager;
};

/**
 * Reset the global focus manager (useful for testing)
 */
export const resetFocusManager = () => {
  globalFocusManager = new FocusManager();
  return globalFocusManager;
};

/**
 * Higher-order function to wrap menu navigation with focus management
 * @param {string} menuId - Unique menu identifier
 * @param {Object} options - Navigation options
 * @param {number} options.itemCount - Number of items in the menu
 * @param {Function} options.onSelect - Called when item is selected
 * @param {Function} [options.onBack] - Called when going back
 * @param {Function} [options.onRender] - Called to render the menu
 * @returns {Object} Navigation handlers
 */
export const createFocusableMenu = (menuId, options) => {
  const { itemCount, onSelect, onBack, onRender } = options;
  const focusManager = getFocusManager();

  // Initialize with saved state or default
  let selectedIndex = focusManager.getSavedIndex(menuId, 0);

  // Push onto focus stack when entering
  const enter = () => {
    focusManager.push(menuId, selectedIndex);
    if (onRender) {onRender(selectedIndex);}
  };

  // Handle navigation
  const moveUp = () => {
    selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : itemCount - 1;
    focusManager.updateIndex(selectedIndex);
    if (onRender) {onRender(selectedIndex);}
    return selectedIndex;
  };

  const moveDown = () => {
    selectedIndex = selectedIndex < itemCount - 1 ? selectedIndex + 1 : 0;
    focusManager.updateIndex(selectedIndex);
    if (onRender) {onRender(selectedIndex);}
    return selectedIndex;
  };

  const select = () => {
    if (onSelect) {onSelect(selectedIndex);}
    return selectedIndex;
  };

  const back = () => {
    focusManager.pop();
    if (onBack) {onBack();}
    return focusManager.peek();
  };

  const getIndex = () => selectedIndex;

  const setIndex = (index) => {
    if (index >= 0 && index < itemCount) {
      selectedIndex = index;
      focusManager.updateIndex(selectedIndex);
      if (onRender) {onRender(selectedIndex);}
    }
    return selectedIndex;
  };

  return {
    enter,
    moveUp,
    moveDown,
    select,
    back,
    getIndex,
    setIndex,
  };
};

export default {
  FocusManager,
  getFocusManager,
  resetFocusManager,
  createFocusableMenu,
};
