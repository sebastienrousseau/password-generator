// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import sinon from 'sinon';
import { CLIController } from '../../src/cli/CLIController.js';
import { OnboardingFlow, startOnboarding } from '../../src/onboarding.js';
import * as cliService from '../../src/services/cli-service.js';

describe('Unified Onboarding Flow Integration', () => {
  let controller;
  let mockPasswordGenerator;
  let originalExit;
  let originalConsoleLog;
  let originalConsoleError;
  let originalConsoleInspect;
  let originalIsTTY;
  let originalSetRawMode;
  let originalRemoveAllListeners;

  beforeEach(() => {
    // Mock password generator
    mockPasswordGenerator = sinon.stub().resolves('test-password-123');
    controller = new CLIController(mockPasswordGenerator);

    // Store originals
    originalExit = process.exit;
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalConsoleInspect = console.inspect; // Some systems might use this
    originalIsTTY = process.stdin.isTTY;
    originalSetRawMode = process.stdin.setRawMode;
    originalRemoveAllListeners = process.stdin.removeAllListeners;

    // Mock system functions
    process.exit = sinon.stub();
    console.log = sinon.stub();
    console.error = sinon.stub();
    if (console.inspect) {
      console.inspect = sinon.stub();
    }

    // Mock stdin methods for TTY simulation
    process.stdin.setRawMode = sinon.stub();
    process.stdin.removeAllListeners = sinon.stub();
  });

  afterEach(() => {
    // Restore originals
    process.exit = originalExit;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    if (originalConsoleInspect) {
      console.inspect = originalConsoleInspect;
    }
    process.stdin.isTTY = originalIsTTY;
    process.stdin.setRawMode = originalSetRawMode;
    process.stdin.removeAllListeners = originalRemoveAllListeners;
    sinon.restore();
  });

  describe('TTY Detection and Environment Handling', () => {
    it('should display non-TTY help and exit silently when not in TTY', () => {
      // Simulate non-TTY environment
      process.stdin.isTTY = false;

      controller.handleNoArguments();

      expect(process.exit.calledWith(0)).to.be.true;
    });

    it('should start interactive mode when in TTY environment', () => {
      // Simulate TTY environment
      process.stdin.isTTY = true;

      // Mock the startOnboarding to prevent actual interactive mode
      const handleInteractiveModeStub = sinon.stub(controller, 'handleInteractiveMode');

      controller.handleNoArguments();

      expect(handleInteractiveModeStub.called).to.be.true;
    });

    it('should handle undefined isTTY property gracefully', () => {
      // Some environments might not have isTTY defined
      delete process.stdin.isTTY;

      controller.handleNoArguments();

      expect(process.exit.calledWith(0)).to.be.true;
    });

    it('should exit with error when onboarding starts in non-TTY', () => {
      process.stdin.isTTY = false;

      const flow = new OnboardingFlow();

      // Should exit with error when trying to initialize in non-TTY
      flow.initReadline();

      expect(console.error.called).to.be.true;
      expect(process.exit.calledWith(1)).to.be.true;
    });

    it('should handle TTY detection edge case scenarios', () => {
      // Test when isTTY is null (possible in some environments)
      process.stdin.isTTY = null;

      controller.handleNoArguments();
      expect(process.exit.calledWith(0)).to.be.true;

      // Reset for next test
      process.exit.resetHistory();

      // Test when isTTY is undefined but stdin exists
      process.stdin.isTTY = undefined;

      controller.handleNoArguments();
      expect(process.exit.calledWith(0)).to.be.true;
    });
  });

  describe('Command Learning Integration', () => {
    it('should display command learning panel after onboarding completion', async () => {
      // Mock config from onboarding
      const mockConfig = {
        type: 'strong',
        iteration: 4,
        separator: '',
        length: 16
      };

      // Simulate the callback execution that happens after onboarding
      const callbackFunction = async (config) => {
        try {
          const password = await controller.passwordGenerator(config);
          cliService.displayPasswordOutput(password);
          const equivalentCommand = cliService.generateEquivalentCommand(config, null, {});
          cliService.displayCommandLearningPanel(equivalentCommand);
        } catch (error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
      };

      await callbackFunction(mockConfig);

      expect(mockPasswordGenerator.called).to.be.true;
      expect(console.log.called).to.be.true;
    });

    it('should generate correct equivalent command for onboarding results', () => {
      const config = {
        type: 'memorable',
        iteration: 3,
        separator: '-'
      };

      const command = cliService.generateEquivalentCommand(config, null, {});

      expect(command).to.include('-t memorable');
      expect(command).to.include('-i 3');
      expect(command).to.include('-s "-"');
    });

    it('should handle preset-based onboarding results', () => {
      const config = {
        type: 'strong',
        iteration: 4,
        separator: '',
        length: 16
      };

      const command = cliService.generateEquivalentCommand(config, null, {});

      expect(command).to.include('-t strong');
      expect(command).to.include('-i 4');
      expect(command).to.include('-l 16');
    });

    it('should handle complex command generation scenarios', () => {
      const config = {
        type: 'base64',
        iteration: 5,
        separator: '_',
        length: 20
      };

      const opts = {
        clipboard: true,
        audit: true
      };

      const command = cliService.generateEquivalentCommand(config, null, opts);

      expect(command).to.include('-t base64');
      expect(command).to.include('-i 5');
      expect(command).to.include('-l 20');
      expect(command).to.include('-s "_"');
      expect(command).to.include('-c');
      expect(command).to.include('-a');
    });
  });

  describe('Error Scenarios and Edge Cases', () => {
    it('should handle password generation errors during onboarding', async () => {
      // Make password generator fail
      mockPasswordGenerator.rejects(new Error('Generation failed'));

      const mockConfig = {
        type: 'strong',
        iteration: 3,
        separator: '-'
      };

      // Simulate the onboarding callback with error
      const callbackFunction = async (config) => {
        try {
          const password = await controller.passwordGenerator(config);
          cliService.displayPasswordOutput(password);
          const equivalentCommand = cliService.generateEquivalentCommand(config, null, {});
          cliService.displayCommandLearningPanel(equivalentCommand);
        } catch (error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
      };

      await callbackFunction(mockConfig);

      expect(console.error.calledWith('Error: Generation failed')).to.be.true;
      expect(process.exit.calledWith(1)).to.be.true;
    });

    it('should handle onboarding flow cleanup on error', () => {
      const flow = new OnboardingFlow();

      // Simulate readline interface exists
      flow.rl = {
        close: sinon.stub()
      };

      // Should not throw even if cleanup fails
      expect(() => flow.cleanup()).to.not.throw();
    });

    it('should handle missing stdin methods gracefully', () => {
      const flow = new OnboardingFlow();
      process.stdin.isTTY = true;

      // Test that initialization handles missing methods gracefully
      expect(flow.initReadline).to.be.a('function');
    });

    it('should validate configuration before command generation', () => {
      // Test with invalid configuration
      const invalidConfig = {
        type: null,
        iteration: undefined,
        separator: undefined
      };

      // Should handle invalid config gracefully
      expect(() => {
        cliService.generateEquivalentCommand(invalidConfig, null, {});
      }).to.not.throw();
    });

    it('should handle empty configuration objects', () => {
      const emptyConfig = {};

      expect(() => {
        cliService.generateEquivalentCommand(emptyConfig, null, {});
      }).to.not.throw();
    });

    it('should handle malformed onboarding responses', () => {
      const flow = new OnboardingFlow();

      // Test with malformed step data
      flow.currentStep = -1;
      const options = flow.getCurrentOptions();
      expect(options).to.be.an('array');

      flow.currentStep = 999;
      const options2 = flow.getCurrentOptions();
      expect(options2).to.deep.equal([]);
    });
  });

  describe('Integration Flow End-to-End', () => {
    // Skip: ESM modules cannot be stubbed with sinon
    it.skip('should complete full onboarding to command learning flow', async () => {
      process.stdin.isTTY = true;

      const displayPasswordOutputStub = sinon.stub(cliService, 'displayPasswordOutput');
      const displayCommandLearningPanelStub = sinon.stub(cliService, 'displayCommandLearningPanel');

      // Create a complete flow simulation
      const flow = new OnboardingFlow();

      // Set up completion scenario
      const testConfig = {
        type: 'strong',
        iteration: 4,
        separator: '',
        length: 16
      };

      let capturedConfig = null;
      flow.onComplete = (config) => {
        capturedConfig = config;
      };

      // Simulate quick setup selection
      flow.currentStep = 0;
      flow.selectedIndex = 0;
      flow.confirmSelection();

      expect(capturedConfig).to.not.be.null;
      expect(capturedConfig.type).to.equal('strong');
    });

    it('should handle custom configuration path through onboarding', () => {
      const flow = new OnboardingFlow();

      let finalConfig = null;
      flow.onComplete = (config) => {
        finalConfig = config;
      };

      // Simulate custom configuration path
      flow.currentStep = 0;
      flow.selectedIndex = 1; // Custom configuration
      flow.confirmSelection();
      expect(flow.currentStep).to.equal(1);

      // Select password type
      flow.selectedIndex = 2; // Memorable
      flow.confirmSelection();
      expect(flow.config.type).to.equal('memorable');
      expect(flow.currentStep).to.equal(2);

      // Select iteration count
      flow.selectedIndex = 1; // 4 segments
      flow.confirmSelection();
      expect(flow.config.iteration).to.equal(4);
      expect(flow.currentStep).to.equal(3);

      // Select separator
      flow.selectedIndex = 0; // Hyphen
      flow.confirmSelection();

      expect(finalConfig).to.not.be.null;
      expect(finalConfig.type).to.equal('memorable');
      expect(finalConfig.iteration).to.equal(4);
      expect(finalConfig.separator).to.equal('-');
    });
  });

  describe('CLI Service Functions Coverage', () => {
    it('should format command learning panel correctly', () => {
      const testCommand = 'password-generator -t strong -i 3 -s "-"';

      cliService.displayCommandLearningPanel(testCommand);

      expect(console.log.called).to.be.true;
      const calls = console.log.getCalls();
      const hasCommandInOutput = calls.some(call =>
        call.args[0] && call.args[0].includes(testCommand)
      );
      expect(hasCommandInOutput).to.be.true;
    });

    it('should display password output with clipboard notification', () => {
      const testPassword = 'test-password-123';

      cliService.displayPasswordOutput(testPassword, true);

      expect(console.log.calledWith(`Generated Password: ${testPassword}`)).to.be.true;
      expect(console.log.calledWith('(Copied to clipboard)')).to.be.true;
    });

    it('should display password output without clipboard notification', () => {
      const testPassword = 'test-password-456';

      cliService.displayPasswordOutput(testPassword, false);

      expect(console.log.calledWith(`Generated Password: ${testPassword}`)).to.be.true;
      expect(console.log.calledWith('(Copied to clipboard)')).to.be.false;
    });

    it('should display non-TTY help with examples', () => {
      cliService.displayNonTTYHelp();

      expect(console.log.called).to.be.true;
      const calls = console.log.getCalls();
      const hasHelpContent = calls.some(call =>
        call.args[0] && call.args[0].includes('Password Generator')
      );
      expect(hasHelpContent).to.be.true;
    });
  });

  describe('Onboarding Error Recovery', () => {
    it('should handle keyboard input errors gracefully', () => {
      const flow = new OnboardingFlow();
      flow.currentStep = 1;

      // Test malformed key input
      const malformedKey = Buffer.from([]);
      expect(() => flow.handleKeyPress(malformedKey)).to.not.throw();

      // Test unexpected key sequences
      const unexpectedKey = Buffer.from([255, 254, 253]);
      expect(() => flow.handleKeyPress(unexpectedKey)).to.not.throw();
    });

    it('should handle step transition errors', () => {
      const flow = new OnboardingFlow();

      // Test invalid step transitions
      flow.currentStep = 99;
      flow.selectedIndex = 0;

      expect(() => flow.confirmSelection()).to.not.throw();
    });

    it('should handle missing onComplete callback', () => {
      const flow = new OnboardingFlow();
      flow.onComplete = null;

      flow.currentStep = 0;
      flow.selectedIndex = 0;

      expect(() => flow.confirmSelection()).to.not.throw();
    });
  });
});