// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * CLI Design System - Crush-Inspired Theme
 *
 * Implements a "glamorous" terminal aesthetic inspired by Charm's design:
 * - Minimal, clean layouts with generous whitespace
 * - Soft rounded borders with pastel color palette
 * - Gradient-like color transitions
 * - Responsive and elegant visual hierarchy
 *
 * @module ui/theme
 */

import chalk from 'chalk';
import { createRequire } from 'module';
import { capabilities, ColorDepth } from './capabilities.js';
import { strengthLabels } from './tokens.js';
import {
  statusIcons,
  navigationIcons,
  decorativeIcons,
  progressIcons,
  strengthIcons,
  getIcon,
} from './icons.js';

// Get version from package.json
const require = createRequire(import.meta.url);
const { version } = require('../../package.json');

// Get terminal capabilities
const caps = capabilities();

// ============================================================================
// BRANDING
// ============================================================================

/**
 * Brand mark for CLI output
 */
export const brand = {
  mini: () =>
    `  ✦ ${chalk.hex('#FF6B9D')('password')} ${chalk.hex('#9D4EDD')('generator')} ${chalk.hex(
      '#4B5563'
    )(`v${version}`)}`,
  inline: () => chalk.hex('#FF6B9D')('✦') + ' ' + chalk.hex('#9D4EDD')('pwgen'),
  version: () => version,
};

// ============================================================================
// COLOR PALETTE - Soft, pastel Charm-inspired colors
// ============================================================================

const palette = {
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
  // Neutrals - Updated gray for better contrast (accessibility fix)
  white: '#FAFAFA',
  gray: '#9CA3AF', // was #6B7280, now meets WCAG AA contrast
  dimGray: '#4B5563',
  darkGray: '#374151',
};

/**
 * Check if colors are enabled
 * @returns {boolean}
 */
export const colorsEnabled = () => !caps.colorDisabled && caps.colorDepth > ColorDepth.NONE;

/**
 * Check if Unicode is supported
 * @returns {boolean}
 */
export const unicodeEnabled = () => caps.unicode;

/**
 * Gradient-like text styling
 */
export const gradient = {
  // Pink to purple gradient effect (simulated with alternating colors)
  primary: (text) => {
    const chars = text.split('');
    return chars
      .map((char, i) => {
        const ratio = i / Math.max(chars.length - 1, 1);
        if (ratio < 0.5) {
          return chalk.hex(palette.pink)(char);
        }
        return chalk.hex(palette.purple)(char);
      })
      .join('');
  },
  // Cyan to mint
  success: (text) => {
    const chars = text.split('');
    return chars
      .map((char, i) => {
        const ratio = i / Math.max(chars.length - 1, 1);
        if (ratio < 0.5) {
          return chalk.hex(palette.cyan)(char);
        }
        return chalk.hex(palette.mint)(char);
      })
      .join('');
  },
};

/**
 * Semantic color functions
 */
export const colors = {
  // Primary branding
  primary: chalk.hex(palette.pink),
  secondary: chalk.hex(palette.purple),
  accent: chalk.hex(palette.cyan),
  // Status colors
  success: chalk.hex(palette.mint),
  warning: chalk.hex(palette.peach),
  error: chalk.hex(palette.coral),
  // Text colors
  text: chalk.hex(palette.white),
  muted: chalk.hex(palette.gray),
  dim: chalk.hex(palette.dimGray),
  // Semantic shortcuts
  password: chalk.hex(palette.cyan).bold,
  command: chalk.hex(palette.peach),
  label: chalk.hex(palette.gray),
  value: chalk.hex(palette.white),
  highlight: chalk.hex(palette.pink).bold,
};

/**
 * Typography with gradient support
 */
export const typography = {
  title: (text) => gradient.primary(text),
  subtitle: (text) => chalk.hex(palette.gray)(text),
  body: (text) => chalk.hex(palette.white)(text),
  bold: (text) => chalk.bold.hex(palette.white)(text),
  code: (text) => chalk.hex(palette.peach)(text),
  success: (text) => chalk.hex(palette.mint)(text),
  muted: (text) => chalk.hex(palette.dimGray)(text),
};

/**
 * Soft rounded box characters
 */
export const box = {
  topLeft: '╭',
  topRight: '╮',
  bottomLeft: '╰',
  bottomRight: '╯',
  horizontal: '─',
  vertical: '│',
  // Minimal divider
  dot: '·',
};

/**
 * Minimal icon set with Unicode/ASCII fallback support
 */
const useUnicode = unicodeEnabled();

export const icons = {
  // Status (simple, elegant)
  success: getIcon(statusIcons.success, useUnicode),
  error: getIcon(statusIcons.error, useUnicode),
  warning: getIcon(statusIcons.warning, useUnicode),
  info: getIcon(statusIcons.info, useUnicode),
  // Arrows and pointers
  arrow: getIcon(navigationIcons.arrow, useUnicode),
  pointer: getIcon(navigationIcons.pointer, useUnicode),
  bullet: getIcon(navigationIcons.bullet, useUnicode),
  // Minimal decorative
  sparkle: getIcon(decorativeIcons.sparkle, useUnicode),
  diamond: getIcon(decorativeIcons.diamond, useUnicode),
  circle: getIcon(decorativeIcons.circle, useUnicode),
  filledCircle: getIcon(decorativeIcons.filledCircle, useUnicode),
  // Progress
  filled: getIcon(progressIcons.filled, useUnicode),
  light: getIcon(progressIcons.light, useUnicode),
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Strip ANSI escape codes from string
 */
export const stripAnsi = (str) => {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
};

/**
 * Get terminal width
 */
export const getTerminalWidth = () => {
  return process.stdout.columns || 80;
};

/**
 * Center text within a given width
 */
export const center = (text, width) => {
  const textLen = stripAnsi(text).length;
  const padding = Math.max(0, Math.floor((width - textLen) / 2));
  return ' '.repeat(padding) + text;
};

/**
 * Create a soft horizontal divider
 */
export const divider = (width = 40, char = '─') => {
  return colors.dim(char.repeat(width));
};

/**
 * Create a dotted divider (more minimal)
 */
export const dottedDivider = (width = 40) => {
  return colors.dim('·'.repeat(width));
};

// ============================================================================
// COMPONENT RENDERERS - Minimal, Crush-inspired
// ============================================================================

/**
 * Render a strength indicator with optional text label (accessibility)
 * @param {string} strength - Strength level (weak, medium, strong, maximum)
 * @param {Object} options - Rendering options
 * @param {boolean} options.showLabel - Whether to show text label (default: true)
 * @returns {string} Formatted strength indicator
 */
export const renderStrengthIndicator = (strength, options = {}) => {
  const { showLabel = true } = options;
  const useUnicode = unicodeEnabled();

  // Get strength icon definition
  const strengthIcon = strengthIcons[strength] || strengthIcons.strong;
  const visual = getIcon(strengthIcon, useUnicode);

  // Get appropriate color for strength level
  const strengthColors = {
    weak: colors.error,
    medium: colors.warning,
    strong: colors.success,
    maximum: colors.success,
  };

  const colorFn = strengthColors[strength] || strengthColors.strong;
  const coloredVisual = colorFn(visual);

  // Add text label for accessibility
  if (showLabel) {
    const label = strengthLabels[strength] || strength;
    return `${coloredVisual} ${colors.muted(label)}`;
  }

  return coloredVisual;
};

/**
 * Render a soft rounded box
 */
export const renderBox = (content, options = {}) => {
  const { width = 50, title = '', borderColor = palette.dimGray } = options;
  const innerWidth = width - 2;
  const border = chalk.hex(borderColor);

  const lines = [];

  // Top border with optional title
  if (title) {
    const titleDisplay = ` ${gradient.primary(title)} `;
    const titleLen = stripAnsi(titleDisplay).length;
    const leftPad = 2;
    const rightPad = Math.max(0, innerWidth - leftPad - titleLen);
    lines.push(
      border(box.topLeft + box.horizontal.repeat(leftPad)) +
        titleDisplay +
        border(box.horizontal.repeat(rightPad) + box.topRight)
    );
  } else {
    lines.push(border(box.topLeft + box.horizontal.repeat(innerWidth) + box.topRight));
  }

  // Content
  const contentLines = Array.isArray(content) ? content : [content];
  for (const line of contentLines) {
    const lineLen = stripAnsi(line).length;
    const padding = Math.max(0, innerWidth - lineLen);
    lines.push(border(box.vertical) + ' ' + line + ' '.repeat(padding) + border(box.vertical));
  }

  // Bottom border
  lines.push(border(box.bottomLeft + box.horizontal.repeat(innerWidth) + box.bottomRight));

  return lines.join('\n');
};

/**
 * Render minimal password output with branding
 */
export const renderPassword = (password, options = {}) => {
  const { copied = false, strength = 'strong', entropy = 0 } = options;

  // Calculate box width based on password length (min 30, with 4 chars padding on each side)
  const minWidth = 30;
  const padding = 4;
  const innerWidth = Math.max(minWidth, password.length + padding);

  const lines = [];

  // Brand
  lines.push('');
  lines.push(brand.mini());
  lines.push('');

  // Password in a soft box
  const borderColor = chalk.hex(palette.dimGray);

  // Top
  lines.push(borderColor(`  ${box.topLeft}${box.horizontal.repeat(innerWidth)}${box.topRight}`));

  // Password line (centered)
  const pwDisplay = colors.password(password);
  const pwLen = password.length;
  const totalPadding = innerWidth - pwLen;
  const leftPad = Math.floor(totalPadding / 2);
  const rightPad = totalPadding - leftPad;
  lines.push(
    borderColor(`  ${box.vertical}`) +
      ' '.repeat(leftPad) +
      pwDisplay +
      ' '.repeat(rightPad) +
      borderColor(box.vertical)
  );

  // Bottom
  lines.push(
    borderColor(`  ${box.bottomLeft}${box.horizontal.repeat(innerWidth)}${box.bottomRight}`)
  );

  // Status line (minimal, below the box)
  lines.push('');

  const statusParts = [];

  // Strength indicator with text label for accessibility
  statusParts.push(`  ${renderStrengthIndicator(strength, { showLabel: true })}`);

  if (entropy > 0) {
    statusParts.push(colors.dim(`${entropy}-bit`));
  }

  if (copied) {
    statusParts.push(colors.success(`${icons.success} copied`));
  }

  lines.push(statusParts.join(colors.dim('  ·  ')));
  lines.push('');

  return lines.join('\n');
};

/**
 * Render command learning panel (minimal)
 */
export const renderCommandPanel = (command, shortcuts = []) => {
  const lines = [];

  lines.push('');
  lines.push(`  ${gradient.primary('command')}`);
  lines.push('');
  lines.push(`  ${colors.command(command)}`);
  lines.push('');

  if (shortcuts.length > 0) {
    lines.push(`  ${colors.dim('shortcuts')}`);
    lines.push('');
    for (const { flag, desc } of shortcuts) {
      lines.push(
        `  ${colors.muted(icons.pointer)} ${colors.command(flag.padEnd(14))} ${colors.dim(desc)}`
      );
    }
    lines.push('');
  }

  return lines.join('\n');
};

/**
 * Render a minimal progress indicator
 */
export const renderProgress = (current, total) => {
  const width = 16;
  const filled = Math.round((current / total) * width);
  const empty = width - filled;

  const bar = colors.primary(icons.filled.repeat(filled)) + colors.dim(icons.light.repeat(empty));

  return `${colors.dim(`${current}/${total}`)}  ${bar}`;
};

/**
 * Render a minimal menu
 */
export const renderMenu = (title, options, selectedIndex) => {
  const lines = [];

  lines.push('');
  lines.push(`  ${gradient.primary(title)}`);
  lines.push('');

  for (let i = 0; i < options.length; i++) {
    const isSelected = i === selectedIndex;
    const pointer = isSelected ? colors.primary(icons.pointer) : ' ';
    const option = isSelected ? colors.text(options[i]) : colors.muted(options[i]);
    lines.push(`  ${pointer} ${option}`);
  }

  lines.push('');
  lines.push(`  ${colors.dim('↑↓ navigate  enter select  esc back')}`);
  lines.push('');

  return lines.join('\n');
};

/**
 * Render a success message
 */
export const renderSuccess = (message) => {
  return `  ${colors.success(icons.success)} ${colors.text(message)}`;
};

/**
 * Render an info message
 */
export const renderInfo = (message) => {
  return `  ${colors.accent(icons.info)} ${colors.muted(message)}`;
};

/**
 * Render the welcome header
 */
export const renderHeader = (title) => {
  const lines = [];
  lines.push('');
  lines.push(`  ${icons.sparkle} ${gradient.primary(title)}`);
  lines.push('');
  return lines.join('\n');
};

export default {
  palette,
  gradient,
  colors,
  typography,
  box,
  icons,
  stripAnsi,
  getTerminalWidth,
  center,
  divider,
  dottedDivider,
  colorsEnabled,
  unicodeEnabled,
  renderStrengthIndicator,
  renderBox,
  renderPassword,
  renderCommandPanel,
  renderProgress,
  renderMenu,
  renderSuccess,
  renderInfo,
  renderHeader,
};
