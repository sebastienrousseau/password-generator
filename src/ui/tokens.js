// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Semantic Design Tokens
 *
 * Provides theme-aware color tokens that adapt to:
 * - Light/dark terminal themes
 * - Color capability levels
 * - Accessibility requirements
 *
 * @module ui/tokens
 */

/**
 * Base color palette
 * These are the raw color values used by semantic tokens
 */
export const palette = {
  // Primary gradient (pink to purple)
  pink: '#FF6B9D',
  hotPink: '#FF4785',
  purple: '#9D4EDD',
  violet: '#7B2CBF',
  // Accent colors
  cyan: '#00D9FF',
  mint: '#3DFFA3',
  peach: '#FFB86C',
  coral: '#FF6B6B',
  // Neutrals - Updated gray for better contrast (#9CA3AF instead of #6B7280)
  white: '#FAFAFA',
  gray: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#9CA3AF', // Improved contrast for accessibility
    500: '#71717A',
    600: '#52525B',
    700: '#4B5563', // dimGray
    800: '#374151', // darkGray
    900: '#18181B',
  },
  // Light theme variants (inverted for light backgrounds)
  light: {
    pink: '#D14671',
    purple: '#7B2CBF',
    cyan: '#0891B2',
    mint: '#059669',
    peach: '#C2410C',
    coral: '#DC2626',
    text: '#18181B',
    muted: '#52525B',
  },
};

/**
 * Semantic tokens for dark theme (default)
 */
export const darkTheme = {
  brand: {
    primary: palette.pink,
    secondary: palette.purple,
    gradient: [palette.pink, palette.purple],
  },

  feedback: {
    success: palette.mint,
    warning: palette.peach,
    error: palette.coral,
    info: palette.cyan,
  },
  text: {
    primary: palette.white,
    secondary: palette.gray[400], // Improved contrast
    muted: palette.gray[700],
    disabled: palette.gray[800],
  },

  background: {
    primary: palette.gray[900],
    secondary: palette.gray[800],
    elevated: palette.gray[700],
  },

  border: {
    default: palette.gray[700],
    focus: palette.pink,
    error: palette.coral,
  },

  interactive: {
    default: palette.cyan,
    hover: palette.pink,
    active: palette.purple,
    focus: palette.pink,
  },

  strength: {
    weak: palette.coral,
    medium: palette.peach,
    strong: palette.mint,
    maximum: palette.mint,
  },
};

/**
 * Semantic tokens for light theme
 */
export const lightTheme = {
  brand: {
    primary: palette.light.pink,
    secondary: palette.light.purple,
    gradient: [palette.light.pink, palette.light.purple],
  },

  feedback: {
    success: palette.light.mint,
    warning: palette.light.peach,
    error: palette.light.coral,
    info: palette.light.cyan,
  },

  text: {
    primary: palette.light.text,
    secondary: palette.light.muted,
    muted: palette.gray[500],
    disabled: palette.gray[300],
  },

  background: {
    primary: palette.gray[50],
    secondary: palette.gray[100],
    elevated: palette.white,
  },

  border: {
    default: palette.gray[300],
    focus: palette.light.pink,
    error: palette.light.coral,
  },

  interactive: {
    default: palette.light.cyan,
    hover: palette.light.pink,
    active: palette.light.purple,
    focus: palette.light.pink,
  },

  strength: {
    weak: palette.light.coral,
    medium: palette.light.peach,
    strong: palette.light.mint,
    maximum: palette.light.mint,
  },
};

/**
 * High contrast tokens for accessibility
 * Uses maximum contrast colors for visual impairment
 */
export const highContrastTheme = {
  brand: {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    gradient: ['#FFFFFF', '#FFFFFF'],
  },

  feedback: {
    success: '#00FF00',
    warning: '#FFFF00',
    error: '#FF0000',
    info: '#00FFFF',
  },

  text: {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    muted: '#CCCCCC',
    disabled: '#666666',
  },

  background: {
    primary: '#000000',
    secondary: '#000000',
    elevated: '#333333',
  },

  border: {
    default: '#FFFFFF',
    focus: '#FFFF00',
    error: '#FF0000',
  },

  interactive: {
    default: '#00FFFF',
    hover: '#FFFF00',
    active: '#FF00FF',
    focus: '#FFFF00',
  },

  strength: {
    weak: '#FF0000',
    medium: '#FFFF00',
    strong: '#00FF00',
    maximum: '#00FF00',
  },
};

/**
 * Get the appropriate theme tokens based on theme mode
 * @param {"dark" | "light" | "high-contrast"} mode - Theme mode
 * @returns {Object} Theme tokens
 */
export const getTheme = (mode = 'dark') => {
  switch (mode) {
    case 'light':
      return lightTheme;
    case 'high-contrast':
      return highContrastTheme;
    case 'dark':
    default:
      return darkTheme;
  }
};

/**
 * Resolve a token path to a color value
 * @param {Object} theme - Theme tokens
 * @param {string} path - Token path (e.g., "feedback.success", "text.primary")
 * @returns {string | null} Resolved color value
 */
export const resolveToken = (theme, path) => {
  const parts = path.split('.');
  let value = theme;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part];
    } else {
      return null;
    }
  }

  return typeof value === 'string' ? value : null;
};

/**
 * Strength level labels for accessibility
 */
export const strengthLabels = {
  weak: 'weak',
  medium: 'medium',
  strong: 'strong',
  maximum: 'maximum',
};

export default {
  palette,
  darkTheme,
  lightTheme,
  highContrastTheme,
  getTheme,
  resolveToken,
  strengthLabels,
};
