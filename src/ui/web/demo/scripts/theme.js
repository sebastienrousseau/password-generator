// Copyright 2022-2026 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Theme Management - Light/Dark/System theme support
 */

const THEME_KEY = 'pwdgen_theme';
const THEMES = ['light', 'dark', 'system'];

/**
 * Gets the system preference for color scheme.
 * @returns {'light'|'dark'} The system preference.
 */
function getSystemPreference() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

/**
 * Gets the stored theme preference.
 * @returns {'light'|'dark'|'system'|null} The stored preference.
 */
function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && THEMES.includes(stored)) {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return null;
}

/**
 * Stores the theme preference.
 * @param {'light'|'dark'|'system'} theme - The theme to store.
 */
function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // localStorage not available
  }
}

/**
 * Applies a theme to the document.
 * @param {'light'|'dark'} theme - The theme to apply.
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  // Update theme-color meta tag
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'light' ? '#D14671' : '#FF6B9D');
  }
}

/**
 * Gets the resolved theme (accounting for 'system').
 * @param {'light'|'dark'|'system'} preference - The user preference.
 * @returns {'light'|'dark'} The resolved theme.
 */
function resolveTheme(preference) {
  if (preference === 'system') {
    return getSystemPreference();
  }
  return preference;
}

/**
 * Updates the theme toggle button icon.
 * @param {'light'|'dark'} theme - The current theme.
 */
function updateToggleIcon(theme) {
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    const icon = toggle.querySelector('.theme-toggle__icon');
    if (icon) {
      icon.textContent = theme === 'light' ? '☀️' : '🌙';
    }
    toggle.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
  }
}

/**
 * Initializes theme management.
 */
export function initTheme() {
  // Get initial preference
  const stored = getStoredTheme();
  const preference = stored || 'system';
  const resolved = resolveTheme(preference);

  // Apply initial theme
  applyTheme(resolved);
  updateToggleIcon(resolved);

  // Listen for system preference changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      const currentPref = getStoredTheme() || 'system';
      if (currentPref === 'system') {
        const newTheme = e.matches ? 'light' : 'dark';
        applyTheme(newTheme);
        updateToggleIcon(newTheme);
      }
    });
  }

  // Set up toggle button
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';

      applyTheme(next);
      storeTheme(next);
      updateToggleIcon(next);
    });
  }
}

export { applyTheme, getSystemPreference, getStoredTheme };
