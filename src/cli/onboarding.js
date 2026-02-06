// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { createInterface } from 'readline';
import { VALID_PASSWORD_TYPES, PRESET_PROFILES } from '../config.js';

/**
 * Interactive onboarding flow for password generator
 */
export class OnboardingFlow {
  constructor() {
    this.currentStep = 0;
    this.totalSteps = 4;
    this.selectedIndex = 0;
    this.config = {};
    this.rl = null;
    this.showingExamples = false;
  }

  /**
   * Initialize readline interface with keyboard handling
   */
  initReadline() {
    // Check if we're in a TTY environment
    if (!process.stdin.isTTY) {
      console.error('Interactive mode requires a terminal (TTY). Please run this in a terminal.');
      process.exit(1);
    }

    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
    });

    // Enable raw mode for key detection
    process.stdin.setRawMode(true);
    process.stdin.resume();

    // Handle keyboard input
    process.stdin.on('data', this.handleKeyPress.bind(this));
  }

  /**
   * Clean up readline interface
   */
  cleanup() {
    if (this.rl) {
      process.stdin.setRawMode(false);
      process.stdin.removeAllListeners('data');
      this.rl.close();
      this.rl = null;
    }
  }

  /**
   * Handle keyboard input
   */
  handleKeyPress(key) {
    const keyStr = key.toString();

    // ESC key (27)
    if (key[0] === 27) {
      if (this.showingExamples) {
        this.showingExamples = false;
        this.renderCurrentStep();
        return;
      }
      if (this.currentStep > 0) {
        this.currentStep--;
        this.selectedIndex = 0;
        this.renderCurrentStep();
      } else {
        this.exitOnboarding();
      }
      return;
    }

    // Enter key (13)
    if (key[0] === 13) {
      if (this.showingExamples) {
        this.showingExamples = false;
        this.renderCurrentStep();
        return;
      }
      this.confirmSelection();
      return;
    }

    // Space key (32)
    if (key[0] === 32) {
      this.showExamples();
      return;
    }

    // Arrow keys
    if (key[0] === 27 && key[1] === 91) {
      if (key[2] === 65) { // Up arrow
        this.navigateUp();
      } else if (key[2] === 66) { // Down arrow
        this.navigateDown();
      }
      return;
    }

    // Number keys (1-3)
    const num = parseInt(keyStr);
    if (num >= 1 && num <= 3 && !this.showingExamples) {
      const options = this.getCurrentOptions();
      if (num <= options.length) {
        this.selectedIndex = num - 1;
        this.renderCurrentStep();
      }
    }

    // Ctrl+C
    if (key[0] === 3) {
      this.exitOnboarding();
    }
  }

  /**
   * Navigate up in the current options
   */
  navigateUp() {
    if (this.showingExamples) return;

    const options = this.getCurrentOptions();
    this.selectedIndex = this.selectedIndex > 0
      ? this.selectedIndex - 1
      : options.length - 1;
    this.renderCurrentStep();
  }

  /**
   * Navigate down in the current options
   */
  navigateDown() {
    if (this.showingExamples) return;

    const options = this.getCurrentOptions();
    this.selectedIndex = this.selectedIndex < options.length - 1
      ? this.selectedIndex + 1
      : 0;
    this.renderCurrentStep();
  }

  /**
   * Get options for the current step
   */
  getCurrentOptions() {
    switch (this.currentStep) {
      case 0:
        return ['Quick Setup (Recommended)', 'Custom Configuration', 'Learn More'];
      case 1:
        return ['Quick & Simple', 'Maximum Security', 'Easy to Remember'];
      case 2:
        return ['3 segments', '4 segments', '5 segments'];
      case 3:
        return ['Hyphen (-)', 'Underscore (_)', 'No separator'];
      default:
        return [];
    }
  }

  /**
   * Confirm the current selection
   */
  confirmSelection() {
    const options = this.getCurrentOptions();
    const selected = options[this.selectedIndex];

    switch (this.currentStep) {
      case 0:
        if (this.selectedIndex === 0) {
          // Quick setup - use secure preset
          this.config = { ...PRESET_PROFILES.secure };
          this.completeOnboarding();
        } else if (this.selectedIndex === 1) {
          // Custom configuration
          this.currentStep = 1;
          this.selectedIndex = 0;
        } else {
          // Learn more
          this.showLearnMore();
        }
        break;
      case 1:
        // Password type selection
        const typeMap = ['strong', 'strong', 'memorable'];
        this.config.type = typeMap[this.selectedIndex];
        this.currentStep = 2;
        this.selectedIndex = 0;
        break;
      case 2:
        // Iteration count
        this.config.iteration = 3 + this.selectedIndex;
        this.currentStep = 3;
        this.selectedIndex = 0;
        break;
      case 3:
        // Separator
        const separatorMap = ['-', '_', ''];
        this.config.separator = separatorMap[this.selectedIndex];
        // Set defaults based on type
        if (this.config.type === 'strong' || this.config.type === 'base64') {
          this.config.length = this.selectedIndex === 1 ? 16 : 12; // More secure if maximum security was chosen
        }
        this.completeOnboarding();
        break;
    }

    this.renderCurrentStep();
  }

  /**
   * Show examples for the current step
   */
  showExamples() {
    this.showingExamples = true;
    this.clearScreen();

    console.log('📚 Examples\n');

    switch (this.currentStep) {
      case 1:
        console.log('Strong Password Examples:');
        console.log('• Kx9#mP2$vL4@nR8!');
        console.log('• 7z$eQ1@pW9#xT3&');
        console.log('');
        console.log('Memorable Password Examples:');
        console.log('• twilight-meadow-dancing-river');
        console.log('• cosmic-forest-gentle-breeze');
        break;
      case 2:
        console.log('Segment Examples:');
        console.log('3 segments: strong-pass-word');
        console.log('4 segments: very-strong-pass-word');
        console.log('5 segments: ultra-very-strong-pass-word');
        break;
      case 3:
        console.log('Separator Examples:');
        console.log('Hyphen: word-word-word');
        console.log('Underscore: word_word_word');
        console.log('None: wordwordword');
        break;
      default:
        console.log('No examples available for this step.');
    }

    console.log('\nPress SPACE or ENTER to go back');
  }

  /**
   * Show learn more information
   */
  showLearnMore() {
    this.clearScreen();
    console.log('🔐 About Password Security\n');
    console.log('Strong passwords are your first line of defense against cyber attacks.');
    console.log('This generator uses cryptographically secure random number generation');
    console.log('to create passwords that are both secure and practical.\n');
    console.log('Password Types:');
    console.log('• Strong: Random characters with high entropy');
    console.log('• Memorable: Readable words that are easier to remember');
    console.log('• Base64: Encoded random data for API keys and tokens\n');
    console.log('Press ENTER to continue with setup...');

    // Wait for enter key
    this.rl.once('line', () => {
      this.currentStep = 1;
      this.selectedIndex = 0;
      this.renderCurrentStep();
    });
  }

  /**
   * Complete the onboarding process
   */
  completeOnboarding() {
    this.clearScreen();
    console.log('✅ Configuration Complete!\n');
    console.log('Your password settings:');
    console.log(`• Type: ${this.config.type}`);
    console.log(`• Segments: ${this.config.iteration}`);
    console.log(`• Separator: "${this.config.separator || 'none'}"`);
    if (this.config.length) {
      console.log(`• Length: ${this.config.length} characters per segment`);
    }
    console.log('\nGenerating your password...\n');

    this.cleanup();

    // Return the configuration to the main program
    this.onComplete(this.config);
  }

  /**
   * Exit the onboarding process
   */
  exitOnboarding() {
    this.clearScreen();
    console.log('👋 Setup cancelled. You can still use the command line options:');
    console.log('  password-generator --help');
    this.cleanup();
    process.exit(0);
  }

  /**
   * Generate progress indicator
   */
  getProgressIndicator() {
    const indicators = [];
    for (let i = 0; i < this.totalSteps; i++) {
      if (i <= this.currentStep) {
        indicators.push('●');
      } else {
        indicators.push('○');
      }
    }
    return indicators.join('') + ` (${this.currentStep + 1}/${this.totalSteps})`;
  }

  /**
   * Clear the console screen
   */
  clearScreen() {
    console.clear();
  }

  /**
   * Render the current step
   */
  renderCurrentStep() {
    if (this.showingExamples) return;

    this.clearScreen();

    // Header
    console.log('🔐 Password Generator Setup');
    console.log('═'.repeat(50));
    console.log('');

    // Progress indicator
    console.log(`Progress: ${this.getProgressIndicator()}`);
    console.log('');

    // Step content
    const stepTitles = [
      'Welcome! How would you like to proceed?',
      'Choose your password style:',
      'How many segments do you want?',
      'Choose a separator between segments:'
    ];

    console.log(stepTitles[this.currentStep]);
    console.log('');

    // Options
    const options = this.getCurrentOptions();
    options.forEach((option, index) => {
      const prefix = this.selectedIndex === index ? '→' : ' ';
      const number = index + 1;
      console.log(`${prefix} ${number}. ${option}`);
    });

    // Controls
    console.log('');
    console.log('Controls:');
    console.log('• ↑↓ or 1-3: Navigate');
    console.log('• ENTER: Select');
    console.log('• SPACE: Show examples');
    console.log('• ESC: Go back');
    console.log('• Ctrl+C: Exit');
  }

  /**
   * Start the onboarding flow
   */
  start(onCompleteCallback) {
    this.onComplete = onCompleteCallback;
    this.initReadline();
    this.renderCurrentStep();
  }
}

/**
 * Start the interactive onboarding flow
 * @param {Function} onComplete Callback function called when onboarding is complete
 */
export function startOnboarding(onComplete) {
  const flow = new OnboardingFlow();
  flow.start(onComplete);
}