// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { isFirstRun, runOnboarding } from '../../src/onboarding.js';

describe('Onboarding Utils Module', function () {
  // Store original values
  let originalStdin;
  let originalLog;
  let originalClear;
  let originalError;
  let originalExit;

  beforeEach(function () {
    originalStdin = process.stdin;
    originalLog = console.log;
    originalClear = console.clear;
    originalError = console.error;
    originalExit = process.exit;

    // Mock console methods
    console.log = () => {};
    console.clear = () => {};
    console.error = () => {};
  });

  afterEach(function () {
    console.log = originalLog;
    console.clear = originalClear;
    console.error = originalError;
    process.exit = originalExit;
  });

  describe('isFirstRun', function () {
    it('should return true when no arguments are provided', function () {
      expect(isFirstRun([])).to.be.true;
    });

    it('should return true when only --interactive flag is provided', function () {
      expect(isFirstRun(['--interactive'])).to.be.true;
    });

    it('should return false when -i flag is provided (iteration)', function () {
      expect(isFirstRun(['-i'])).to.be.false;
    });

    it('should return true when only password-generator is provided', function () {
      expect(isFirstRun(['password-generator'])).to.be.true;
    });

    it('should return true when interactive flags combined', function () {
      expect(isFirstRun(['--interactive'])).to.be.true;
      expect(isFirstRun(['password-generator', '--interactive'])).to.be.true;
    });

    it('should return false when other arguments are provided', function () {
      expect(isFirstRun(['--type', 'strong'])).to.be.false;
      expect(isFirstRun(['-t', 'base64'])).to.be.false;
      expect(isFirstRun(['--length', '16'])).to.be.false;
    });

    it('should return false when interactive flag combined with other args', function () {
      expect(isFirstRun(['--interactive', '--type', 'strong'])).to.be.false;
      expect(isFirstRun(['--interactive', '-l', '20'])).to.be.false;
    });

    it('should return false for preset arguments', function () {
      expect(isFirstRun(['-p', 'quick'])).to.be.false;
      expect(isFirstRun(['--preset', 'secure'])).to.be.false;
    });

    it('should return false for clipboard flag', function () {
      expect(isFirstRun(['-c'])).to.be.false;
      expect(isFirstRun(['--clipboard'])).to.be.false;
    });

    it('should return false for audit flag', function () {
      expect(isFirstRun(['-a'])).to.be.false;
      expect(isFirstRun(['--audit'])).to.be.false;
    });

    it('should return false for help flag', function () {
      expect(isFirstRun(['--help'])).to.be.false;
      expect(isFirstRun(['-h'])).to.be.false;
    });

    it('should return false for version flag', function () {
      expect(isFirstRun(['--version'])).to.be.false;
      expect(isFirstRun(['-v'])).to.be.false;
    });

    it('should return false for separator argument', function () {
      expect(isFirstRun(['-s', '-'])).to.be.false;
      expect(isFirstRun(['--separator', '_'])).to.be.false;
    });

    it('should return false for iteration argument', function () {
      expect(isFirstRun(['-i', '3'])).to.be.false;
      expect(isFirstRun(['--iteration', '5'])).to.be.false;
    });

    it('should handle mixed valid and invalid args', function () {
      expect(isFirstRun(['password-generator', '-t', 'strong'])).to.be.false;
      expect(isFirstRun(['--interactive', '-p', 'quick'])).to.be.false;
    });
  });

  describe('runOnboarding', function () {
    it('should be a function', function () {
      expect(runOnboarding).to.be.a('function');
    });

    it('should return a promise', function () {
      // Mock stdin for non-TTY environment
      const mockStdin = {
        isTTY: false,
        on: () => {},
        removeListener: () => {},
        setRawMode: () => {},
        resume: () => {},
      };

      // We can't fully test runOnboarding without TTY, but we verify it's async
      expect(runOnboarding.constructor.name).to.equal('AsyncFunction');
    });
  });
});
