// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import sinon from 'sinon';
import { CLIController, createCLIController } from '../../src/cli/CLIController.js';

/**
 * Creates a mock service that mimics the core service API.
 * @returns {Object} Mock service with generate and validateConfig methods.
 */
function createMockService() {
  return {
    generate: sinon.stub().resolves('mock-password'),
    validateConfig: sinon.stub().returns({ isValid: true, errors: [] }),
    getSupportedTypes: sinon.stub().returns(['strong', 'base64', 'memorable']),
    calculateEntropy: sinon.stub().returns({ totalBits: 128, securityLevel: 'strong' }),
  };
}

describe('CLIController', () => {
  let controller;
  let mockService;
  let originalExit;
  let originalConsoleLog;
  let originalConsoleError;

  beforeEach(() => {
    mockService = createMockService();
    controller = new CLIController(mockService);

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
    it('should initialize with a service', () => {
      expect(controller.service).to.equal(mockService);
      expect(controller.program).to.exist;
    });

    it('should setup commander program with correct options', () => {
      const program = controller.getProgram();
      expect(program.name()).to.equal('password-generator');
      expect(program.description()).to.include('fast, simple and powerful utility');
    });
  });

  describe('resolveConfiguration', () => {
    it('should resolve preset to configuration', () => {
      // Test that the method exists and can be called
      expect(controller.resolveConfiguration).to.be.a('function');

      // Test with valid preset
      const result = controller.resolveConfiguration('quick', {
        type: 'strong',
      });

      // Should return a valid configuration object with user override
      expect(result).to.be.an('object');
      expect(result.type).to.equal('strong');
    });

    it('should use preset defaults when no user options provided', () => {
      const result = controller.resolveConfiguration('quick', {});

      expect(result).to.be.an('object');
      expect(result.type).to.equal('strong');
      expect(result.length).to.equal(14);
      expect(result.iteration).to.equal(4);
      expect(result.separator).to.equal('-');
    });

    it('should throw error for invalid preset', () => {
      expect(() => controller.resolveConfiguration('invalid', {})).to.throw(
        "Invalid preset 'invalid'. Valid presets: quick, secure, memorable"
      );
    });
  });

  describe('handleCliAction', () => {
    it('should generate password with valid options', async () => {
      const opts = {
        preset: 'quick',
        clipboard: false,
        audit: false,
        learn: false,
      };

      await controller.handleCliAction(opts);

      expect(mockService.validateConfig.called).to.be.true;
      expect(mockService.generate.called).to.be.true;
    });

    it('should handle learn option', async () => {
      const opts = {
        type: 'strong',
        iteration: 3,
        separator: '-',
        learn: true,
      };

      await controller.handleCliAction(opts);

      expect(mockService.generate.called).to.be.true;
    });

    it('should handle errors gracefully', async () => {
      mockService.generate.rejects(new Error('Test error'));

      const opts = {
        type: 'strong',
        iteration: 3,
        separator: '-',
      };

      await controller.handleCliAction(opts);

      expect(console.error.calledWith('Error: Test error')).to.be.true;
      expect(process.exit.calledWith(1)).to.be.true;
    });

    it('should handle validation errors from service', async () => {
      mockService.validateConfig.returns({
        isValid: false,
        errors: ['Invalid type'],
      });

      const opts = {
        type: 'invalid',
        iteration: 3,
        separator: '-',
      };

      await controller.handleCliAction(opts);

      expect(console.error.called).to.be.true;
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

  describe('getService', () => {
    it('should return the core service instance', () => {
      const service = controller.getService();
      expect(service).to.equal(mockService);
    });
  });
});

describe('createCLIController', () => {
  it('should create a new CLIController instance', () => {
    const mockService = createMockService();
    const controller = createCLIController(mockService);

    expect(controller).to.be.instanceOf(CLIController);
    expect(controller.service).to.equal(mockService);
  });
});
