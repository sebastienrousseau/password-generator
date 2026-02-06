// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * CommandLearningPresenter - Handles display of equivalent CLI commands and command breakdown
 *
 * This presenter extracts command learning functionality from the onboarding flow,
 * allowing users to understand the CLI equivalent of their interactive configuration choices.
 */
export class CommandLearningPresenter {
  /**
   * Generate equivalent CLI command based on configuration
   * @param {Object} config - Password generation configuration
   * @param {string|null} preset - Preset name if used
   * @param {boolean} clipboard - Whether clipboard is enabled
   * @returns {string} Complete CLI command string
   */
  static generateEquivalentCommand(config, preset, clipboard) {
    let cliCommand = "password-generator";

    if (preset) {
      cliCommand += ` -p ${preset}`;
    } else {
      // Custom configuration command building
      cliCommand += ` --type ${config.type}`;
      if (config.length) {
        cliCommand += ` --length ${config.length}`;
      }
      cliCommand += ` --iteration ${config.iteration}`;
      if (config.separator && config.separator !== "-") {
        cliCommand += ` --separator "${config.separator}"`;
      }
    }

    if (clipboard) {
      cliCommand += " -c";
    }

    return cliCommand;
  }

  /**
   * Generate command breakdown explanation
   * @param {Object} config - Password generation configuration
   * @param {string|null} preset - Preset name if used
   * @param {boolean} clipboard - Whether clipboard is enabled
   * @returns {string[]} Array of explanation lines
   */
  static generateCommandBreakdown(config, preset, clipboard) {
    const breakdown = [];

    if (preset) {
      breakdown.push(`   -p ${preset}    Use the '${preset}' preset configuration`);
    } else {
      breakdown.push(`   --type ${config.type}    Password type selection`);
      if (config.length) {
        breakdown.push(`   --length ${config.length}     ${config.type === "memorable" ? "Word" : "Chunk"} length`);
      }
      breakdown.push(`   --iteration ${config.iteration}   Number of ${config.type === "memorable" ? "words" : "chunks"}`);
      if (config.separator && config.separator !== "-") {
        breakdown.push(`   --separator "${config.separator}"   Custom separator character`);
      }
    }

    if (clipboard) {
      breakdown.push("   -c               Copy to clipboard");
    }

    return breakdown;
  }

  /**
   * Display the complete command learning panel
   * @param {Object} config - Password generation configuration
   * @param {boolean} clipboard - Whether clipboard is enabled
   * @param {string|null} preset - Preset name if used
   */
  static displayCommandLearningPanel(config, clipboard, preset) {
    console.log("\n💻 Command Learning Panel:");
    console.log("─".repeat(30));
    console.log("🎓 Next time, skip the setup and use this direct CLI command:");

    const cliCommand = this.generateEquivalentCommand(config, preset, clipboard);
    console.log(`\n   ${cliCommand}\n`);

    console.log("📚 Command breakdown:");
    const breakdown = this.generateCommandBreakdown(config, preset, clipboard);
    breakdown.forEach(line => console.log(line));
  }

  /**
   * Display next steps and additional information
   * @param {string|null} preset - Preset name if used
   */
  static displayNextSteps(preset) {
    console.log("\n🚀 Next Steps:");
    console.log("─".repeat(15));
    console.log("• Your password will be generated with these settings");
    console.log("• Use --help to see all available CLI options");
    console.log("• Run with --audit to see detailed security information");

    if (preset) {
      console.log(`• Use -p ${preset} flag for quick access to this preset`);
    }
  }

  /**
   * Display the complete command learning section (panel + next steps)
   * @param {Object} config - Password generation configuration
   * @param {boolean} clipboard - Whether clipboard is enabled
   * @param {string|null} preset - Preset name if used
   */
  static displayFullCommandLearning(config, clipboard, preset) {
    this.displayCommandLearningPanel(config, clipboard, preset);
    this.displayNextSteps(preset);
  }

  /**
   * Get equivalent command as object with breakdown for programmatic access
   * @param {Object} config - Password generation configuration
   * @param {boolean} clipboard - Whether clipboard is enabled
   * @param {string|null} preset - Preset name if used
   * @returns {Object} Command data with command string and breakdown
   */
  static getCommandData(config, clipboard, preset) {
    return {
      command: this.generateEquivalentCommand(config, preset, clipboard),
      breakdown: this.generateCommandBreakdown(config, preset, clipboard),
      preset,
      config,
      clipboard
    };
  }
}
