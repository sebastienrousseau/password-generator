// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Interactive Onboarding - Minimal Crush-Inspired Design
 * - Fixed arrow key navigation
 * - Reduced to 2 steps
 * - Added branding
 */

import readline, { emitKeypressEvents } from 'readline';
import { createRequire } from 'module';
import { getPresetConfig } from './config.js';
import { CommandLearningPresenter } from './presenters/CommandLearningPresenter.js';
import { colors, gradient, icons } from './ui/theme.js';
import { matchesBinding, defaultBindings } from './ui/keyboard.js';
import { getFocusManager } from './ui/focus-manager.js';
import { getCommandPalette, isCommandPaletteKey } from './ui/command-palette.js';

// Get version from package.json
const require = createRequire(import.meta.url);
const { version } = require('../package.json');

// ============================================================================
// BRANDING
// ============================================================================

const BRAND = `
  ${gradient.primary('╭─────────────────────────────────────╮')}
  ${gradient.primary('│')}  ${colors.text('✦')} ${gradient.primary(
  'p a s s w o r d'
)}                  ${gradient.primary('│')}
  ${gradient.primary('│')}    ${gradient.primary('g e n e r a t o r')}  ${colors.dim(
  `v${version}`
)}        ${gradient.primary('│')}
  ${gradient.primary('╰─────────────────────────────────────╯')}
`;

// ============================================================================
// HELPERS
// ============================================================================

/* c8 ignore start */
const createReadlineInterface = () => {
  if (!process.stdin.isTTY) {
    console.log('');
    console.log(`  ${colors.error(icons.error)} ${colors.dim('requires a terminal')}`);
    console.log(`  ${colors.dim('try:')} ${colors.command('password-generator -p quick')}`);
    console.log('');
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  emitKeypressEvents(process.stdin);
  return rl;
};

const renderMenu = (options, selectedIndex) => {
  const lines = [];
  for (let i = 0; i < options.length; i++) {
    const isSelected = i === selectedIndex;
    const pointer = isSelected ? colors.primary(icons.pointer) : ' ';
    const num = colors.dim(`${i + 1}`);
    const text = isSelected ? colors.text(options[i].label) : colors.muted(options[i].label);
    const desc = options[i].desc ? colors.dim(` · ${options[i].desc}`) : '';
    lines.push(`  ${pointer} ${num} ${text}${desc}`);
  }
  return lines.join('\n');
};

const promptWithNavigation = (title, options, menuId = null) => {
  return new Promise((resolve) => {
    const focusManager = getFocusManager();
    const commandPalette = getCommandPalette();

    // Use saved index if available, otherwise start at 0
    const effectiveMenuId = menuId || title;
    let selectedIndex = focusManager.getSavedIndex(effectiveMenuId, 0);

    // Push focus state for this menu
    focusManager.push(effectiveMenuId, selectedIndex);

    const render = () => {
      console.clear();

      // Render command palette if open
      if (commandPalette.isOpen) {
        console.log(BRAND);
        console.log(commandPalette.render());
        return;
      }

      console.log(BRAND);
      console.log(`  ${colors.dim(title)}`);
      console.log('');
      console.log(renderMenu(options, selectedIndex));
      console.log('');
      console.log(`  ${colors.dim('↑↓/jk navigate · enter select · ctrl+k commands · esc quit')}`);
    };

    // Enable raw mode for arrow keys
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();

    // Using function declarations for hoisting (allows mutual references)
    function cleanup() {
      process.stdin.removeListener('keypress', handleKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      focusManager.pop();
    }

    function handleKeypress(str, key) {
      if (!key) {
        return;
      }

      // Handle command palette if open
      if (commandPalette.isOpen) {
        commandPalette.handleKeypress(str, key);
        render();
        return;
      }

      // Open command palette with Ctrl+K
      if (isCommandPaletteKey(key)) {
        commandPalette.open({
          onSelect: (cmd, result) => {
            // Handle command palette result
            if (result && result.quit) {
              cleanup();
              console.clear();
              console.log('');
              console.log(`  ${colors.dim('cancelled')}`);
              console.log('');
              process.exit(0);
            }
            render();
          },
          onClose: () => {
            render();
          },
        });
        render();
        return;
      }

      // Use keyboard bindings for navigation
      if (matchesBinding(key, 'up', defaultBindings)) {
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : options.length - 1;
        focusManager.updateIndex(selectedIndex);
        render();
      } else if (matchesBinding(key, 'down', defaultBindings)) {
        selectedIndex = selectedIndex < options.length - 1 ? selectedIndex + 1 : 0;
        focusManager.updateIndex(selectedIndex);
        render();
      } else if (matchesBinding(key, 'select', defaultBindings)) {
        cleanup();
        resolve(options[selectedIndex]);
      } else if (
        matchesBinding(key, 'cancel', defaultBindings) ||
        matchesBinding(key, 'quit', defaultBindings)
      ) {
        cleanup();
        console.clear();
        console.log('');
        console.log(`  ${colors.dim('cancelled')}`);
        console.log('');
        process.exit(0);
      } else if (str && /^[1-9]$/.test(str)) {
        const index = parseInt(str, 10) - 1;
        if (index < options.length) {
          cleanup();
          resolve(options[index]);
        }
      }
    }

    process.stdin.on('keypress', handleKeypress);
    render();
  });
};
/* c8 ignore stop */

// ============================================================================
// ONBOARDING FLOW - 2 STEPS
// ============================================================================

/* c8 ignore start */
export const runOnboarding = async () => {
  const rl = createReadlineInterface();

  try {
    // STEP 1: Choose preset (combines type + security level)
    const presetOptions = [
      { label: 'quick', desc: 'fast & simple', value: 'quick' },
      { label: 'secure', desc: 'maximum protection', value: 'secure' },
      { label: 'memorable', desc: 'easy to remember', value: 'memorable' },
      { label: 'quantum', desc: '256-bit entropy', value: 'quantum' },
    ];

    const preset = await promptWithNavigation(
      'choose a preset',
      presetOptions,
      'onboarding:preset'
    );
    const config = getPresetConfig(preset.value);

    // STEP 2: Choose length (chunk size) - skip for quantum (fixed at 43 for 256-bit entropy)
    if (preset.value !== 'quantum') {
      const lengthOptions = [
        { label: '8', desc: 'short', value: 8 },
        { label: '16', desc: 'default', value: 16 },
        { label: '24', desc: 'long', value: 24 },
        { label: '32', desc: 'extra long', value: 32 },
      ];

      const lengthChoice = await promptWithNavigation('length', lengthOptions, 'onboarding:length');
      config.length = lengthChoice.value;
    }

    // STEP 3: Choose separator
    const separatorOptions = [
      { label: '-', desc: 'hyphen (default)', value: '-' },
      { label: '_', desc: 'underscore', value: '_' },
      { label: '.', desc: 'dot', value: '.' },
      { label: '(none)', desc: 'no separator', value: '' },
    ];

    const separatorChoice = await promptWithNavigation(
      'separator',
      separatorOptions,
      'onboarding:separator'
    );
    config.separator = separatorChoice.value;

    // STEP 4: Clipboard option
    const clipboardOptions = [
      { label: 'copy to clipboard', desc: 'auto-copy', value: true },
      { label: 'display only', desc: 'more secure', value: false },
    ];

    const clipboardChoice = await promptWithNavigation(
      'clipboard',
      clipboardOptions,
      'onboarding:clipboard'
    );
    const clipboard = clipboardChoice.value;

    // Show result
    console.clear();
    console.log(BRAND);
    console.log(`  ${colors.success(icons.success)} ${colors.dim('ready')}`);
    console.log('');
    console.log(`  ${colors.muted(icons.pointer)} preset      ${colors.command(preset.value)}`);
    console.log(
      `  ${colors.muted(icons.pointer)} length      ${colors.text(String(config.length))}`
    );
    console.log(
      `  ${colors.muted(icons.pointer)} separator   ${
        config.separator ? colors.text(`"${config.separator}"`) : colors.dim('none')
      }`
    );
    console.log(
      `  ${colors.muted(icons.pointer)} clipboard   ${
        clipboard ? colors.success('yes') : colors.dim('no')
      }`
    );
    console.log('');

    CommandLearningPresenter.displayCommandLearningPanel(config, clipboard, preset.value);

    console.log(`  ${colors.dim('generating...')}`);
    console.log('');

    return { config, clipboard, preset: preset.value };
  } finally {
    rl.close();
  }
};
/* c8 ignore stop */

export const isFirstRun = (args) => {
  const nonInteractiveArgs = args.filter(
    (arg) => arg !== '--interactive' && arg !== 'password-generator'
  );
  return nonInteractiveArgs.length === 0;
};

// ============================================================================
// CLASS-BASED API (for backward compatibility)
// ============================================================================

export class OnboardingFlow {
  constructor() {
    this.selectedIndex = 0;
    this.currentStep = 0;
    this.config = {};
    this.clipboard = false;
    this.preset = null;
  }

  start(onComplete) {
    this.onComplete = onComplete;
    this.runFlow();
  }

  async runFlow() {
    try {
      const result = await runOnboarding();
      /* c8 ignore next 3 - Success path requires TTY (runOnboarding is c8-ignored) */
      if (this.onComplete) {
        this.onComplete(result.config);
      }
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }
}

export function startOnboarding(onComplete) {
  const flow = new OnboardingFlow();
  flow.start(onComplete);
}
