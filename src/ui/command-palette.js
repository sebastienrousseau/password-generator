// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Command Palette (Ctrl+K)
 *
 * Provides quick access to commands via fuzzy search with:
 * - Fuzzy matching of command names and descriptions
 * - Keyboard navigation (arrows, enter, escape)
 * - Configurable command registry
 *
 * @module ui/command-palette
 */

import { colors, icons, box } from './theme.js';
import { matchesBinding, defaultBindings } from './keyboard.js';
import { getFocusManager } from './focus-manager.js';

/**
 * Command definition
 * @typedef {Object} Command
 * @property {string} id - Unique command identifier
 * @property {string} name - Display name
 * @property {string} [description] - Command description
 * @property {string} [shortcut] - Keyboard shortcut display
 * @property {string} [category] - Command category for grouping
 * @property {Function} action - Function to execute
 */

/**
 * Default commands for the password generator
 */
export const defaultCommands = [
  {
    id: 'preset-quick',
    name: 'Quick Preset',
    description: 'Generate a quick, simple password',
    category: 'Presets',
    action: () => ({ preset: 'quick' }),
  },
  {
    id: 'preset-secure',
    name: 'Secure Preset',
    description: 'Generate a maximum security password',
    category: 'Presets',
    action: () => ({ preset: 'secure' }),
  },
  {
    id: 'preset-memorable',
    name: 'Memorable Preset',
    description: 'Generate an easy to remember password',
    category: 'Presets',
    action: () => ({ preset: 'memorable' }),
  },
  {
    id: 'length-8',
    name: 'Length: 8',
    description: 'Set password length to 8 characters',
    category: 'Length',
    action: () => ({ length: 8 }),
  },
  {
    id: 'length-16',
    name: 'Length: 16',
    description: 'Set password length to 16 characters',
    category: 'Length',
    action: () => ({ length: 16 }),
  },
  {
    id: 'length-24',
    name: 'Length: 24',
    description: 'Set password length to 24 characters',
    category: 'Length',
    action: () => ({ length: 24 }),
  },
  {
    id: 'length-32',
    name: 'Length: 32',
    description: 'Set password length to 32 characters',
    category: 'Length',
    action: () => ({ length: 32 }),
  },
  {
    id: 'copy-clipboard',
    name: 'Copy to Clipboard',
    description: 'Copy generated password to clipboard',
    shortcut: 'Ctrl+C',
    category: 'Actions',
    action: () => ({ clipboard: true }),
  },
  {
    id: 'help',
    name: 'Help',
    description: 'Show help information',
    shortcut: '?',
    category: 'Help',
    action: () => ({ showHelp: true }),
  },
  {
    id: 'quit',
    name: 'Quit',
    description: 'Exit the application',
    shortcut: 'Esc',
    category: 'Navigation',
    action: () => ({ quit: true }),
  },
];

/**
 * Simple fuzzy match implementation
 * @param {string} query - Search query
 * @param {string} text - Text to search in
 * @returns {number} Match score (higher is better, 0 is no match)
 */
export const fuzzyMatch = (query, text) => {
  if (!query) {
    return 1;
  } // Empty query matches everything

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match gets highest score
  if (textLower === queryLower) {
    return 100;
  }

  // Starts with query gets high score
  if (textLower.startsWith(queryLower)) {
    return 80;
  }

  // Contains query as substring
  if (textLower.includes(queryLower)) {
    return 60;
  }

  // Character-by-character fuzzy match
  let queryIndex = 0;
  let score = 0;
  let consecutiveBonus = 0;

  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 10 + consecutiveBonus;
      consecutiveBonus += 5;
      queryIndex++;
    } else {
      consecutiveBonus = 0;
    }
  }

  // Only return score if all query characters were found
  return queryIndex === queryLower.length ? score : 0;
};

/**
 * Search commands using fuzzy matching
 * @param {Command[]} commands - Commands to search
 * @param {string} query - Search query
 * @returns {Command[]} Filtered and sorted commands
 */
export const searchCommands = (commands, query) => {
  if (!query) {
    return commands;
  }

  const results = commands
    .map((cmd) => {
      const nameScore = fuzzyMatch(query, cmd.name);
      const descScore = cmd.description ? fuzzyMatch(query, cmd.description) * 0.5 : 0;
      const categoryScore = cmd.category ? fuzzyMatch(query, cmd.category) * 0.3 : 0;
      const totalScore = Math.max(nameScore, descScore, categoryScore);
      return { cmd, score: totalScore };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return results.map(({ cmd }) => cmd);
};

/**
 * Command Palette state and rendering
 */
export class CommandPalette {
  constructor(commands = defaultCommands) {
    this.commands = commands;
    this.filteredCommands = commands;
    this.selectedIndex = 0;
    this.query = '';
    this.isOpen = false;
    this.onSelect = null;
    this.onClose = null;
  }

  /**
   * Open the command palette
   * @param {Object} options
   * @param {Function} options.onSelect - Callback when command is selected
   * @param {Function} options.onClose - Callback when palette is closed
   */
  open(options = {}) {
    this.isOpen = true;
    this.query = '';
    this.selectedIndex = 0;
    this.filteredCommands = this.commands;
    this.onSelect = options.onSelect;
    this.onClose = options.onClose;

    // Save focus state
    const focusManager = getFocusManager();
    focusManager.push('command-palette', 0);
  }

  /**
   * Close the command palette
   */
  close() {
    this.isOpen = false;
    this.query = '';

    // Restore focus state
    const focusManager = getFocusManager();
    focusManager.pop();

    if (this.onClose) {
      this.onClose();
    }
  }

  /**
   * Update search query and filter commands
   * @param {string} query - New search query
   */
  setQuery(query) {
    this.query = query;
    this.filteredCommands = searchCommands(this.commands, query);
    this.selectedIndex = 0;
  }

  /**
   * Handle character input
   * @param {string} char - Character to append to query
   */
  handleInput(char) {
    this.setQuery(this.query + char);
  }

  /**
   * Handle backspace
   */
  handleBackspace() {
    if (this.query.length > 0) {
      this.setQuery(this.query.slice(0, -1));
    }
  }

  /**
   * Move selection up
   */
  moveUp() {
    if (this.filteredCommands.length > 0) {
      this.selectedIndex =
        this.selectedIndex > 0 ? this.selectedIndex - 1 : this.filteredCommands.length - 1;
    }
  }

  /**
   * Move selection down
   */
  moveDown() {
    if (this.filteredCommands.length > 0) {
      this.selectedIndex =
        this.selectedIndex < this.filteredCommands.length - 1 ? this.selectedIndex + 1 : 0;
    }
  }

  /**
   * Select the current command
   * @returns {Object | null} Result from command action
   */
  select() {
    if (this.filteredCommands.length > 0 && this.selectedIndex < this.filteredCommands.length) {
      const command = this.filteredCommands[this.selectedIndex];
      const result = command.action();
      this.close();
      if (this.onSelect) {
        this.onSelect(command, result);
      }
      return result;
    }
    return null;
  }

  /**
   * Handle keypress event
   * @param {string} str - Character string
   * @param {Object} key - Key event
   * @returns {boolean} True if event was handled
   */
  handleKeypress(str, key) {
    if (!this.isOpen) {
      return false;
    }

    // Escape to close
    if (matchesBinding(key, 'cancel', defaultBindings)) {
      this.close();
      return true;
    }

    // Navigation
    if (matchesBinding(key, 'up', defaultBindings)) {
      this.moveUp();
      return true;
    }
    if (matchesBinding(key, 'down', defaultBindings)) {
      this.moveDown();
      return true;
    }

    // Select
    if (matchesBinding(key, 'select', defaultBindings)) {
      this.select();
      return true;
    }

    // Backspace
    if (key && key.name === 'backspace') {
      this.handleBackspace();
      return true;
    }

    // Regular character input
    if (str && str.length === 1 && !key.ctrl && !key.meta) {
      this.handleInput(str);
      return true;
    }

    return false;
  }

  /**
   * Render the command palette
   * @param {number} maxHeight - Maximum height for the palette
   * @returns {string} Rendered palette string
   */
  render(maxHeight = 10) {
    if (!this.isOpen) {
      return '';
    }

    const lines = [];
    const width = 50;
    const innerWidth = width - 4;
    const borderColor = colors.dim;

    // Header with search input
    lines.push('');
    lines.push(
      `  ${borderColor(box.topLeft)}${borderColor(box.horizontal.repeat(innerWidth))}${borderColor(
        box.topRight
      )}`
    );

    // Search input line
    const searchIcon = colors.primary(icons.sparkle);
    const queryDisplay = this.query || colors.dim('Type to search...');
    const cursor = colors.primary('_');
    lines.push(
      `  ${borderColor(box.vertical)} ${searchIcon} ${queryDisplay}${
        this.query ? cursor : ''
      } `.padEnd(innerWidth + 3) + `${borderColor(box.vertical)}`
    );

    // Divider
    lines.push(
      `  ${borderColor(box.vertical)}${colors.dim(box.horizontal.repeat(innerWidth))}${borderColor(
        box.vertical
      )}`
    );

    // Commands list
    const displayCount = Math.min(this.filteredCommands.length, maxHeight - 5);

    if (this.filteredCommands.length === 0) {
      const noResults = colors.dim('No commands found');
      lines.push(
        `  ${borderColor(box.vertical)} ${noResults}`.padEnd(innerWidth + 3) +
          ` ${borderColor(box.vertical)}`
      );
    } else {
      for (let i = 0; i < displayCount; i++) {
        const cmd = this.filteredCommands[i];
        const isSelected = i === this.selectedIndex;

        const pointer = isSelected ? colors.primary(icons.pointer) : ' ';
        const name = isSelected ? colors.text(cmd.name) : colors.muted(cmd.name);
        const shortcut = cmd.shortcut ? colors.dim(` [${cmd.shortcut}]`) : '';

        const lineContent = `${pointer} ${name}${shortcut}`;
        const paddedLine = lineContent.padEnd(innerWidth + 2);

        lines.push(`  ${borderColor(box.vertical)} ${paddedLine}${borderColor(box.vertical)}`);
      }

      // Show count if more commands than displayed
      if (this.filteredCommands.length > displayCount) {
        const moreCount = this.filteredCommands.length - displayCount;
        const moreText = colors.dim(`+${moreCount} more`);
        lines.push(
          `  ${borderColor(box.vertical)} ${moreText}`.padEnd(innerWidth + 3) +
            ` ${borderColor(box.vertical)}`
        );
      }
    }

    // Footer
    lines.push(
      `  ${borderColor(box.bottomLeft)}${borderColor(
        box.horizontal.repeat(innerWidth)
      )}${borderColor(box.bottomRight)}`
    );

    // Help text
    lines.push(`  ${colors.dim('↑↓ navigate · enter select · esc close')}`);
    lines.push('');

    return lines.join('\n');
  }
}

// Singleton instance
let globalPalette = null;

/**
 * Get the global command palette instance
 * @returns {CommandPalette}
 */
export const getCommandPalette = () => {
  if (!globalPalette) {
    globalPalette = new CommandPalette();
  }
  return globalPalette;
};

/**
 * Reset the global command palette (useful for testing)
 * @param {Command[]} commands - Optional custom commands
 * @returns {CommandPalette}
 */
export const resetCommandPalette = (commands) => {
  globalPalette = new CommandPalette(commands);
  return globalPalette;
};

/**
 * Check if a key event should open the command palette
 * @param {Object} key - Key event
 * @returns {boolean}
 */
export const isCommandPaletteKey = (key) => {
  return matchesBinding(key, 'commandPalette', defaultBindings);
};

export default {
  CommandPalette,
  defaultCommands,
  fuzzyMatch,
  searchCommands,
  getCommandPalette,
  resetCommandPalette,
  isCommandPaletteKey,
};
