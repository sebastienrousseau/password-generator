// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Terminal Capability Detection
 *
 * Detects terminal capabilities to enable graceful degradation:
 * - Color support (NO_COLOR, FORCE_COLOR, color depth)
 * - Theme detection (light/dark mode)
 * - Unicode support
 *
 * @module ui/capabilities
 */

/**
 * Color depth levels
 * @readonly
 * @enum {number}
 */
export const ColorDepth = {
  NONE: 0,
  BASIC: 16,
  ANSI256: 256,
  TRUECOLOR: 16777216,
};

/**
 * Theme modes
 * @readonly
 * @enum {string}
 */
export const ThemeMode = {
  DARK: 'dark',
  LIGHT: 'light',
  AUTO: 'auto',
};

/**
 * Detect if colors should be disabled
 * Respects NO_COLOR (https://no-color.org/) and FORCE_COLOR
 * @returns {boolean} True if colors should be disabled
 */
export const isColorDisabled = () => {
  // FORCE_COLOR takes precedence if set to a truthy value
  if (process.env.FORCE_COLOR !== undefined) {
    const force = process.env.FORCE_COLOR;
    // FORCE_COLOR=0 or FORCE_COLOR=false means disable
    if (force === '0' || force === 'false') {
      return true;
    }
    // Any other value means force colors on
    return false;
  }

  // NO_COLOR takes precedence (https://no-color.org/)
  if (process.env.NO_COLOR !== undefined) {
    return true;
  }

  // CI environments often don't support colors
  if (process.env.CI === 'true' && !process.env.FORCE_COLOR) {
    return true;
  }

  return false;
};

/**
 * Detect the color depth of the terminal
 * @returns {number} Color depth (0, 16, 256, or 16777216)
 */
export const detectColorDepth = () => {
  if (isColorDisabled()) {
    return ColorDepth.NONE;
  }

  // Check for COLORTERM
  const colorTerm = process.env.COLORTERM;
  if (colorTerm === 'truecolor' || colorTerm === '24bit') {
    return ColorDepth.TRUECOLOR;
  }

  // Check TERM variable
  const term = process.env.TERM || '';

  // Truecolor terminals
  if (term.includes('truecolor') || term.includes('24bit')) {
    return ColorDepth.TRUECOLOR;
  }

  // 256 color terminals
  if (term.includes('256color') || term.includes('256')) {
    return ColorDepth.ANSI256;
  }

  // Dumb terminal or no color support
  if (term === 'dumb' || !term) {
    return ColorDepth.NONE;
  }

  // Most modern terminals support at least 16 colors
  if (process.stdout.isTTY) {
    return ColorDepth.BASIC;
  }

  return ColorDepth.NONE;
};

/**
 * Detect the terminal theme (light or dark mode)
 * @returns {string} "light", "dark", or "auto"
 */
export const detectTheme = () => {
  // Explicit theme setting
  const terminalTheme = process.env.TERMINAL_THEME;
  if (terminalTheme === 'light' || terminalTheme === 'dark') {
    return terminalTheme;
  }

  // macOS terminal theme detection
  const appleTerm = process.env.APPLE_TERMINAL;
  if (appleTerm === 'light') {
    return ThemeMode.LIGHT;
  }

  // COLORFGBG environment variable (format: "fg;bg" or "fg;extra;bg")
  // Higher bg values typically indicate light backgrounds
  const colorFgBg = process.env.COLORFGBG;
  if (colorFgBg) {
    const parts = colorFgBg.split(';');
    const bg = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(bg)) {
      // Background colors 0-6 and 8 are typically dark
      // Background colors 7 and 15 are typically light
      if (bg === 7 || bg === 15 || (bg >= 9 && bg <= 14)) {
        return ThemeMode.LIGHT;
      }
      return ThemeMode.DARK;
    }
  }

  // Check for common light-themed terminal indicators
  const term = process.env.TERM_PROGRAM || '';
  if (term.toLowerCase().includes('light')) {
    return ThemeMode.LIGHT;
  }

  // Default to dark (most terminal themes are dark)
  return ThemeMode.DARK;
};

/**
 * Detect if the terminal supports Unicode
 * @returns {boolean} True if Unicode is likely supported
 */
export const supportsUnicode = () => {
  // Check TERM for dumb terminal
  const term = process.env.TERM || '';
  if (term === 'dumb') {
    return false;
  }

  // Check for Windows console without UTF-8 support
  if (process.platform === 'win32') {
    // Modern Windows Terminal and PowerShell support Unicode
    const wtSession = process.env.WT_SESSION;
    const conEmuANSI = process.env.ConEmuANSI;
    const termProgram = process.env.TERM_PROGRAM;

    if (wtSession || conEmuANSI === 'ON' || termProgram) {
      return true;
    }

    // Check code page
    const codePage = process.env.CHCP;
    if (codePage === '65001') {
      return true;
    }

    // Legacy Windows cmd might not support Unicode
    return false;
  }

  // Check LANG/LC_ALL for UTF-8
  const lang = process.env.LANG || process.env.LC_ALL || '';
  if (lang.toLowerCase().includes('utf-8') || lang.toLowerCase().includes('utf8')) {
    return true;
  }

  // Most modern Unix terminals support Unicode
  return process.stdout.isTTY;
};

/**
 * Get all terminal capabilities
 * @returns {Object} Object containing all detected capabilities
 */
export const getCapabilities = () => {
  return {
    colorDisabled: isColorDisabled(),
    colorDepth: detectColorDepth(),
    theme: detectTheme(),
    unicode: supportsUnicode(),
    isTTY: process.stdout.isTTY,
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  };
};

/**
 * Cached capabilities (computed once per session)
 */
let cachedCapabilities = null;

/**
 * Get cached terminal capabilities (or compute if not cached)
 * @param {boolean} refresh - Force refresh of cached capabilities
 * @returns {Object} Terminal capabilities
 */
export const capabilities = (refresh = false) => {
  if (!cachedCapabilities || refresh) {
    cachedCapabilities = getCapabilities();
  }
  return cachedCapabilities;
};

export default {
  ColorDepth,
  ThemeMode,
  isColorDisabled,
  detectColorDepth,
  detectTheme,
  supportsUnicode,
  getCapabilities,
  capabilities,
};
