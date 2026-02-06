// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import sinon from 'sinon';
import { CLIController, createCLIController } from '../../src/cli/CLIController.js';

describe('CLIController', () => {
  let controller;
  let mockPasswordGenerator;
  let originalExit;
  let originalConsoleLog;
  let originalConsoleError;

  beforeEach(() => {
    mockPasswordGenerator = sinon.stub().resolves('mock-password');
    controller = new CLIController(mockPasswordGenerator);

    // Mock process.exit
    originalExit = process.exit;
    process.exit = sinon.stub();

    // Mock console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    console.log = sinon.stub();
    console.error = sinon.stub();
  });

  afterEach(() => {
    process.exit = originalExit;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    sinon.restore();
  });

  describe('Constructor', () => {
    it('should initialize with a password generator function', () => {
      expect(controller.passwordGenerator).to.equal(mockPasswordGenerator);
      expect(controller.program).to.exist;
    });

    it('should setup commander program with correct options', () => {
      const program = controller.getProgram();
      expect(program.name()).to.equal('password-generator');
      expect(program.description()).to.include('fast, simple and powerful utility');
    });
  });

  describe('processConfiguration', () => {
    it('should delegate to config service', () => {
      // Test that the method exists and can be called
      expect(controller.processConfiguration).to.be.a('function');

      // Test with valid preset
      const result = controller.processConfiguration('quick', {
        type: 'strong'
      });

      // Should return a valid configuration object
      expect(result).to.be.an('object');
      expect(result.type).to.equal('strong');
    });
  });

  describe('handleCliAction', () => {
    it('should generate password with valid options', async () => {
      const opts = {
        preset: 'quick',
        clipboard: false,
        audit: false,
        learn: false
      };

      await controller.handleCliAction(opts);

      expect(mockPasswordGenerator.called).to.be.true;
    });

    it('should handle learn option', async () => {
      const opts = {
        type: 'strong',
        iteration: 3,
        separator: '-',
        learn: true
      };

      await controller.handleCliAction(opts);

      expect(mockPasswordGenerator.called).to.be.true;
    });

    it('should handle errors gracefully', async () => {
      mockPasswordGenerator.rejects(new Error('Test error'));

      const opts = {
        type: 'strong',
        iteration: 3,
        separator: '-'
      };

      await controller.handleCliAction(opts);

      expect(console.error.calledWith('Error: Test error')).to.be.true;
      expect(process.exit.calledWith(1)).to.be.true;
    });
  });

  describe('handleNoArguments', () => {
    it('should delegate to CLI service for non-TTY help', () => {
      const originalIsTTY = process.stdin.isTTY;
      process.stdin.isTTY = false;

      // Should not throw when calling handleNoArguments
      expect(() => controller.handleNoArguments()).to.not.throw();

      process.stdin.isTTY = originalIsTTY;
    });
  });

  describe('run', () => {
    it('should parse arguments when provided', async () => {
      const parseStub = sinon.stub(controller.program, 'parse');

      await controller.run(['-p', 'quick']);

      expect(parseStub.called).to.be.true;
    });

    it('should handle no arguments', async () => {
      const originalIsTTY = process.stdin.isTTY;
      process.stdin.isTTY = false;

      await controller.run([]);

      process.stdin.isTTY = originalIsTTY;
    });
  });

  describe('getProgram', () => {
    it('should return the Commander program instance', () => {
      const program = controller.getProgram();
      expect(program.name()).to.equal('password-generator');
    });
  });
});

describe('createCLIController', () => {
  it('should create a new CLIController instance', () => {
    const mockGenerator = () => {};
    const controller = createCLIController(mockGenerator);

    expect(controller).to.be.instanceOf(CLIController);
    expect(controller.passwordGenerator).to.equal(mockGenerator);
  });
});