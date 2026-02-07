// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Accessible Icon Definitions
 *
 * Each icon has:
 * - visual: The Unicode character displayed in supporting terminals
 * - label: Screen reader / accessibility label
 * - fallback: ASCII fallback for terminals without Unicode support
 *
 * @module ui/icons
 */

/**
 * Icon definition with visual, label, and fallback
 * @typedef {Object} IconDef
 * @property {string} visual - Unicode visual representation
 * @property {string} label - Accessible label for screen readers
 * @property {string} fallback - ASCII fallback for limited terminals
 */

/**
 * Status icons
 */
export const statusIcons = {
  success: { visual: "✓", label: "success", fallback: "[OK]" },
  error: { visual: "✗", label: "error", fallback: "[ERROR]" },
  warning: { visual: "!", label: "warning", fallback: "[WARN]" },
  info: { visual: "i", label: "info", fallback: "[INFO]" },
};

/**
 * Navigation icons
 */
export const navigationIcons = {
  arrow: { visual: "→", label: "arrow", fallback: "->" },
  pointer: { visual: "›", label: "pointer", fallback: ">" },
  bullet: { visual: "•", label: "bullet", fallback: "*" },
  back: { visual: "←", label: "back", fallback: "<-" },
  up: { visual: "↑", label: "up", fallback: "^" },
  down: { visual: "↓", label: "down", fallback: "v" },
};

/**
 * Decorative icons
 */
export const decorativeIcons = {
  sparkle: { visual: "✦", label: "sparkle", fallback: "*" },
  diamond: { visual: "◇", label: "diamond", fallback: "<>" },
  circle: { visual: "○", label: "empty circle", fallback: "o" },
  filledCircle: { visual: "●", label: "filled circle", fallback: "@" },
  star: { visual: "★", label: "star", fallback: "*" },
};

/**
 * Progress icons
 */
export const progressIcons = {
  filled: { visual: "█", label: "filled block", fallback: "#" },
  light: { visual: "░", label: "light block", fallback: "." },
  half: { visual: "▓", label: "half block", fallback: "=" },
};

/**
 * Box drawing characters
 */
export const boxIcons = {
  topLeft: { visual: "╭", label: "top left corner", fallback: "+" },
  topRight: { visual: "╮", label: "top right corner", fallback: "+" },
  bottomLeft: { visual: "╰", label: "bottom left corner", fallback: "+" },
  bottomRight: { visual: "╯", label: "bottom right corner", fallback: "+" },
  horizontal: { visual: "─", label: "horizontal line", fallback: "-" },
  vertical: { visual: "│", label: "vertical line", fallback: "|" },
  dot: { visual: "·", label: "center dot", fallback: "." },
};

/**
 * Strength indicator icons
 */
export const strengthIcons = {
  weak: { visual: "●○○○", label: "weak", fallback: "[#...]" },
  medium: { visual: "●●○○", label: "medium", fallback: "[##..]" },
  strong: { visual: "●●●○", label: "strong", fallback: "[###.]" },
  maximum: { visual: "●●●●", label: "maximum", fallback: "[####]" },
};

/**
 * All icons combined for easy access
 */
export const allIcons = {
  ...statusIcons,
  ...navigationIcons,
  ...decorativeIcons,
  ...progressIcons,
  ...boxIcons,
  ...strengthIcons,
};

/**
 * Get icon visual or fallback based on Unicode support
 * @param {IconDef} icon - Icon definition
 * @param {boolean} useUnicode - Whether to use Unicode or fallback
 * @returns {string} The appropriate visual representation
 */
export const getIcon = (icon, useUnicode = true) => {
  return useUnicode ? icon.visual : icon.fallback;
};

/**
 * Get icon with its accessible label
 * @param {IconDef} icon - Icon definition
 * @param {boolean} useUnicode - Whether to use Unicode or fallback
 * @returns {{ visual: string, label: string }} Object with visual and label
 */
export const getIconWithLabel = (icon, useUnicode = true) => {
  return {
    visual: getIcon(icon, useUnicode),
    label: icon.label,
  };
};

export default {
  statusIcons,
  navigationIcons,
  decorativeIcons,
  progressIcons,
  boxIcons,
  strengthIcons,
  allIcons,
  getIcon,
  getIconWithLabel,
};
