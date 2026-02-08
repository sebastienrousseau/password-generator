// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * CommandLearningPresenter - Minimal Crush-inspired design
 */

import { colors, gradient, icons } from '../ui/theme.js';

export class CommandLearningPresenter {
  /**
   * Generate equivalent CLI command
   */
  static generateEquivalentCommand(config, preset, clipboard) {
    let cliCommand = 'password-generator';

    if (preset) {
      cliCommand += ` -p ${preset}`;
    } else {
      cliCommand += ` --type ${config.type}`;
      if (config.length) {
        cliCommand += ` --length ${config.length}`;
      }
      cliCommand += ` --iteration ${config.iteration}`;
      if (config.separator && config.separator !== '-') {
        cliCommand += ` --separator "${config.separator}"`;
      }
    }

    if (clipboard) {
      cliCommand += ' -c';
    }

    return cliCommand;
  }

  /**
   * Generate command breakdown
   */
  static generateCommandBreakdown(config, preset, clipboard) {
    const breakdown = [];

    if (preset) {
      breakdown.push({ flag: `-p ${preset}`, desc: `${preset} preset` });
    } else {
      breakdown.push({ flag: `--type ${config.type}`, desc: 'password type' });
      if (config.length) {
        breakdown.push({ flag: `--length ${config.length}`, desc: 'chunk length' });
      }
      breakdown.push({
        flag: `--iteration ${config.iteration}`,
        desc: `${config.type === 'memorable' ? 'words' : 'chunks'}`,
      });
      if (config.separator && config.separator !== '-') {
        breakdown.push({ flag: `--separator "${config.separator}"`, desc: 'separator' });
      }
    }

    if (clipboard) {
      breakdown.push({ flag: '-c', desc: 'copy to clipboard' });
    }

    return breakdown;
  }

  /**
   * Display minimal command learning panel
   */
  static displayCommandLearningPanel(config, clipboard, preset) {
    const command = this.generateEquivalentCommand(config, preset, clipboard);
    const breakdown = this.generateCommandBreakdown(config, preset, clipboard);

    console.log('');
    console.log(`  ${gradient.primary('command')}`);
    console.log('');
    console.log(`  ${colors.command(command)}`);
    console.log('');

    if (breakdown.length > 0) {
      console.log(`  ${colors.dim('breakdown')}`);
      console.log('');
      for (const { flag, desc } of breakdown) {
        console.log(
          `  ${colors.muted(icons.pointer)} ${colors.command(flag.padEnd(24))} ${colors.dim(desc)}`
        );
      }
      console.log('');
    }
  }

  /**
   * Display next steps (minimal)
   */
  static displayNextSteps(preset) {
    console.log(`  ${colors.dim('next')}`);
    console.log('');
    console.log(
      `  ${colors.muted(icons.pointer)} ${colors.dim('use')} ${colors.command(
        '--help'
      )} ${colors.dim('for all options')}`
    );
    console.log(
      `  ${colors.muted(icons.pointer)} ${colors.dim('use')} ${colors.command(
        '--audit'
      )} ${colors.dim('for security details')}`
    );
    if (preset) {
      console.log(
        `  ${colors.muted(icons.pointer)} ${colors.dim('use')} ${colors.command(
          `-p ${preset}`
        )} ${colors.dim('for quick access')}`
      );
    }
    console.log('');
  }

  /**
   * Display full command learning (panel + next steps)
   */
  static displayFullCommandLearning(config, clipboard, preset) {
    this.displayCommandLearningPanel(config, clipboard, preset);
    this.displayNextSteps(preset);
  }

  /**
   * Get command data for programmatic access
   */
  static getCommandData(config, clipboard, preset) {
    return {
      command: this.generateEquivalentCommand(config, preset, clipboard),
      breakdown: this.generateCommandBreakdown(config, preset, clipboard),
      preset,
      config,
      clipboard,
    };
  }
}
