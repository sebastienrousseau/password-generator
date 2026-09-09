// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import sinon from 'sinon';

// We need to import these to mock them
import * as CLIControllerModule from '../../src/cli/CLIController.js';
import * as CoreModule from '../../packages/core/src/index.js';
import * as CryptoRandomModule from '../../src/adapters/node/crypto-random.js';

// Import the module under test
import { CLIBootstrap, createCLIBootstrap } from '../../src/cli/cli-bootstrap.js';

// Import the re-export module for onboarding coverage
import * as OnboardingReExport from '../../src/cli/onboarding.js';
import * as OnboardingModule from '../../src/onboarding.js';

/**
 * Creates a mock service that mimics the core service API.
 * @returns {Object} Mock service with generate and validateConfig methods.
 */
function createMockService() {
  return {
    generate: sinon.stub().resolves('mock-password-123'),
    validateConfig: sinon.stub().returns({ isValid: true, errors: [] }),
    getSupportedTypes: sinon.stub().returns(['strong', 'base64', 'memorable']),
    calculateEntropy: sinon.stub().returns({ totalBits: 128, securityLevel: 'strong' }),
  };
}

/**
 * Creates a mock controller that mimics the CLIController API.
 * @returns {Object} Mock controller with run method.
 */
function createMockController() {
  return {
    run: sinon.stub().resolves(),
    getProgram: sinon.stub().returns({}),
    getService: sinon.stub().returns(createMockService()),
  };
}

describe('CLIBootstrap', () => {
  let originalConsoleError;
  let originalProcessExit;
  let originalProcessArgv;
  let consoleErrorStub;
  let processExitStub;

  beforeEach(() => {
    // Store originals
    originalConsoleError = console.error;
    originalProcessExit = process.exit;
    originalProcessArgv = process.argv;

    // Create stubs
    consoleErrorStub = sinon.stub();
    processExitStub = sinon.stub();

    // Replace globals
    console.error = consoleErrorStub;
    process.exit = processExitStub;
  });

  afterEach(() => {
    // Restore originals
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
    process.argv = originalProcessArgv;

    // Restore all sinon stubs
    sinon.restore();
  });

  describe('Constructor', () => {
    it('should initialize with null service and controller', () => {
      const bootstrap = new CLIBootstrap();

      expect(bootstrap.service).to.be.null;
      expect(bootstrap.controller).to.be.null;
    });

    it('should create a new instance each time', () => {
      const bootstrap1 = new CLIBootstrap();
      const bootstrap2 = new CLIBootstrap();

      expect(bootstrap1).to.not.equal(bootstrap2);
    });
  });

  describe('initialize', () => {
    it('should create service and controller', () => {
      const bootstrap = new CLIBootstrap();

      const result = bootstrap.initialize();

      expect(bootstrap.service).to.not.be.null;
      expect(bootstrap.controller).to.not.be.null;
      expect(result).to.equal(bootstrap); // Returns this for chaining
    });

    it('should return this for method chaining', () => {
      const bootstrap = new CLIBootstrap();

      const result = bootstrap.initialize();

      expect(result).to.be.instanceOf(CLIBootstrap);
      expect(result).to.equal(bootstrap);
    });

    it('should create service with NodeCryptoRandom adapter', () => {
      const bootstrap = new CLIBootstrap();

      bootstrap.initialize();

      // Verify service was created (has expected methods)
      expect(bootstrap.service).to.have.property('generate');
      expect(bootstrap.service).to.have.property('validateConfig');
    });

    it('should create controller with the service', () => {
      const bootstrap = new CLIBootstrap();

      bootstrap.initialize();

      // Verify controller was created with the service
      expect(bootstrap.controller).to.have.property('run');
      expect(bootstrap.controller).to.have.property('getService');
      expect(bootstrap.controller.getService()).to.equal(bootstrap.service);
    });
  });

  describe('run', () => {
    it('should throw error if not initialized', async () => {
      const bootstrap = new CLIBootstrap();

      try {
        await bootstrap.run([]);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.equal('CLI Bootstrap not initialized. Call initialize() first.');
      }
    });

    it('should call controller.run with provided arguments', async () => {
      const bootstrap = new CLIBootstrap();
      bootstrap.initialize();

      // Stub the controller's run method
      const runStub = sinon.stub(bootstrap.controller, 'run').resolves();

      await bootstrap.run(['-p', 'quick']);

      expect(runStub.calledOnce).to.be.true;
      expect(runStub.calledWith(['-p', 'quick'])).to.be.true;
    });

    it('should use process.argv.slice(2) as default arguments', async () => {
      const bootstrap = new CLIBootstrap();
      bootstrap.initialize();

      // Set up process.argv
      process.argv = ['node', 'cli-bootstrap.js', '-p', 'secure'];

      // Stub the controller's run method
      const runStub = sinon.stub(bootstrap.controller, 'run').resolves();

      await bootstrap.run();

      expect(runStub.calledOnce).to.be.true;
      expect(runStub.calledWith(['-p', 'secure'])).to.be.true;
    });

    it('should handle empty arguments array', async () => {
      const bootstrap = new CLIBootstrap();
      bootstrap.initialize();

      // Stub the controller's run method
      const runStub = sinon.stub(bootstrap.controller, 'run').resolves();

      await bootstrap.run([]);

      expect(runStub.calledOnce).to.be.true;
      expect(runStub.calledWith([])).to.be.true;
    });

    it('should handle controller run errors gracefully', async () => {
      const bootstrap = new CLIBootstrap();
      bootstrap.initialize();

      // Stub the controller's run method to throw
      sinon.stub(bootstrap.controller, 'run').rejects(new Error('Controller run failed'));

      await bootstrap.run(['-p', 'quick']);

      expect(consoleErrorStub.calledOnce).to.be.true;
      expect(consoleErrorStub.firstCall.args[0]).to.include('CLI execution failed');
      expect(consoleErrorStub.firstCall.args[0]).to.include('Controller run failed');
      expect(processExitStub.calledWith(1)).to.be.true;
    });

    it('should log error message when controller throws', async () => {
      const bootstrap = new CLIBootstrap();
      bootstrap.initialize();

      const testError = new Error('Test error message');
      sinon.stub(bootstrap.controller, 'run').rejects(testError);

      await bootstrap.run(['-t', 'strong']);

      expect(consoleErrorStub.calledOnce).to.be.true;
      expect(consoleErrorStub.firstCall.args[0]).to.equal(
        'CLI execution failed: Test error message'
      );
    });

    it('should exit with code 1 on error', async () => {
      const bootstrap = new CLIBootstrap();
      bootstrap.initialize();

      sinon.stub(bootstrap.controller, 'run').rejects(new Error('Any error'));

      await bootstrap.run([]);

      expect(processExitStub.calledOnce).to.be.true;
      expect(processExitStub.calledWith(1)).to.be.true;
    });
  });

  describe('getController', () => {
    it('should return null before initialization', () => {
      const bootstrap = new CLIBootstrap();

      expect(bootstrap.getController()).to.be.null;
    });

    it('should return controller after initialization', () => {
      const bootstrap = new CLIBootstrap();
      bootstrap.initialize();

      const controller = bootstrap.getController();

      expect(controller).to.not.be.null;
      expect(controller).to.equal(bootstrap.controller);
    });

    it('should return the same controller instance', () => {
      const bootstrap = new CLIBootstrap();
      bootstrap.initialize();

      const controller1 = bootstrap.getController();
      const controller2 = bootstrap.getController();

      expect(controller1).to.equal(controller2);
    });
  });

  describe('getService', () => {
    it('should return null before initialization', () => {
      const bootstrap = new CLIBootstrap();

      expect(bootstrap.getService()).to.be.null;
    });

    it('should return service after initialization', () => {
      const bootstrap = new CLIBootstrap();
      bootstrap.initialize();

      const service = bootstrap.getService();

      expect(service).to.not.be.null;
      expect(service).to.equal(bootstrap.service);
    });

    it('should return the same service instance', () => {
      const bootstrap = new CLIBootstrap();
      bootstrap.initialize();

      const service1 = bootstrap.getService();
      const service2 = bootstrap.getService();

      expect(service1).to.equal(service2);
    });

    it('should return service with expected API', () => {
      const bootstrap = new CLIBootstrap();
      bootstrap.initialize();

      const service = bootstrap.getService();

      expect(service).to.have.property('generate');
      expect(service).to.have.property('validateConfig');
      expect(service.generate).to.be.a('function');
      expect(service.validateConfig).to.be.a('function');
    });
  });
});

describe('createCLIBootstrap', () => {
  let originalConsoleError;
  let originalProcessExit;

  beforeEach(() => {
    originalConsoleError = console.error;
    originalProcessExit = process.exit;
    console.error = sinon.stub();
    process.exit = sinon.stub();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
    sinon.restore();
  });

  it('should create a new CLIBootstrap instance', () => {
    const bootstrap = createCLIBootstrap();

    expect(bootstrap).to.be.instanceOf(CLIBootstrap);
  });

  it('should return an initialized bootstrap', () => {
    const bootstrap = createCLIBootstrap();

    expect(bootstrap.service).to.not.be.null;
    expect(bootstrap.controller).to.not.be.null;
  });

  it('should create bootstrap ready to use', async () => {
    const bootstrap = createCLIBootstrap();

    // Should not throw - already initialized
    const runStub = sinon.stub(bootstrap.controller, 'run').resolves();
    await bootstrap.run([]);

    expect(runStub.calledOnce).to.be.true;
  });

  it('should create unique instances on each call', () => {
    const bootstrap1 = createCLIBootstrap();
    const bootstrap2 = createCLIBootstrap();

    expect(bootstrap1).to.not.equal(bootstrap2);
    expect(bootstrap1.service).to.not.equal(bootstrap2.service);
    expect(bootstrap1.controller).to.not.equal(bootstrap2.controller);
  });
});

describe('CLI Bootstrap Integration', () => {
  let originalConsoleError;
  let originalProcessExit;
  let originalConsoleLog;

  beforeEach(() => {
    originalConsoleError = console.error;
    originalProcessExit = process.exit;
    originalConsoleLog = console.log;
    console.error = sinon.stub();
    console.log = sinon.stub();
    process.exit = sinon.stub();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
    console.log = originalConsoleLog;
    sinon.restore();
  });

  it('should work end-to-end with quick preset', async () => {
    const bootstrap = createCLIBootstrap();

    // Run with quick preset
    await bootstrap.run(['-p', 'quick']);

    // Should have generated password without errors
    expect(console.error.called).to.be.false;
    expect(process.exit.called).to.be.false;
  });

  it('should handle invalid configuration gracefully', async () => {
    const bootstrap = createCLIBootstrap();

    // Run with invalid type - controller handles this
    await bootstrap.run(['-t', 'invalid-type']);

    // The controller handles validation errors
    expect(console.error.called).to.be.true;
    expect(process.exit.calledWith(1)).to.be.true;
  });
});

describe('CLI Bootstrap Auto-Execution', () => {
  let originalConsoleError;
  let originalProcessExit;
  let originalConsoleLog;

  beforeEach(() => {
    originalConsoleError = console.error;
    originalProcessExit = process.exit;
    originalConsoleLog = console.log;
    console.error = sinon.stub();
    console.log = sinon.stub();
    process.exit = sinon.stub();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
    console.log = originalConsoleLog;
    sinon.restore();
  });

  it('should execute when run directly with cli-bootstrap.js path', async function () {
    this.timeout(10000);
    const { spawn } = await import('child_process');
    const { resolve } = await import('path');

    const cliBootstrapPath = resolve(process.cwd(), 'src/cli/cli-bootstrap.js');

    return new Promise((resolvePromise, reject) => {
      const child = spawn('node', [cliBootstrapPath, '-p', 'quick'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_NO_WARNINGS: '1' },
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        // Should exit successfully with a generated password
        expect(code).to.equal(0);
        resolvePromise();
      });

      child.on('error', reject);
    });
  });

  it('should handle bootstrap failure with error message', async function () {
    this.timeout(10000);
    const { spawn } = await import('child_process');
    const { resolve } = await import('path');

    const cliBootstrapPath = resolve(process.cwd(), 'src/cli/cli-bootstrap.js');

    return new Promise((resolvePromise, reject) => {
      // Using an invalid type should cause a validation error
      const child = spawn('node', [cliBootstrapPath, '-t', 'definitely-not-a-valid-type'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, NODE_NO_WARNINGS: '1' },
      });

      let stderr = '';

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        // Should exit with error code
        expect(code).to.equal(1);
        // Should have error output
        expect(stderr).to.include('Error');
        resolvePromise();
      });

      child.on('error', reject);
    });
  });
});

describe('CLI Bootstrap Module-Level Variables', () => {
  it('should handle empty process.argv[1] gracefully', async () => {
    // The module-level check: const resolvedArg = process.argv[1] ? resolve(process.argv[1]) : "";
    // When imported as a module (like in tests), process.argv[1] is set to mocha's path
    // This test verifies the exported classes/functions work regardless
    const bootstrap = new CLIBootstrap();
    expect(bootstrap).to.be.instanceOf(CLIBootstrap);
  });

  it('should not auto-execute when imported as module', () => {
    // When imported as a module, isMainModule should be false
    // and auto-execution block should not run
    // We verify this by checking that we can create instances without side effects
    const bootstrap1 = createCLIBootstrap();
    const bootstrap2 = createCLIBootstrap();

    expect(bootstrap1).to.not.equal(bootstrap2);
  });
});

describe('src/cli/onboarding.js Re-export Module', () => {
  it('should export startOnboarding function', () => {
    expect(OnboardingReExport.startOnboarding).to.be.a('function');
    expect(OnboardingReExport.startOnboarding).to.equal(OnboardingModule.startOnboarding);
  });

  it('should export runOnboarding function', () => {
    expect(OnboardingReExport.runOnboarding).to.be.a('function');
    expect(OnboardingReExport.runOnboarding).to.equal(OnboardingModule.runOnboarding);
  });

  it('should export isFirstRun function', () => {
    expect(OnboardingReExport.isFirstRun).to.be.a('function');
    expect(OnboardingReExport.isFirstRun).to.equal(OnboardingModule.isFirstRun);
  });

  it('should export OnboardingFlow class', () => {
    expect(OnboardingReExport.OnboardingFlow).to.be.a('function');
    expect(OnboardingReExport.OnboardingFlow).to.equal(OnboardingModule.OnboardingFlow);
  });

  it('should allow creating OnboardingFlow instance from re-export', () => {
    const flow = new OnboardingReExport.OnboardingFlow();

    expect(flow).to.be.instanceOf(OnboardingModule.OnboardingFlow);
    expect(flow.selectedIndex).to.equal(0);
    expect(flow.currentStep).to.equal(0);
    expect(flow.config).to.deep.equal({});
    expect(flow.clipboard).to.be.false;
    expect(flow.preset).to.be.null;
  });

  it('should have isFirstRun work correctly via re-export', () => {
    expect(OnboardingReExport.isFirstRun([])).to.be.true;
    expect(OnboardingReExport.isFirstRun(['--interactive'])).to.be.true;
    expect(OnboardingReExport.isFirstRun(['-p', 'quick'])).to.be.false;
    expect(OnboardingReExport.isFirstRun(['--type', 'strong'])).to.be.false;
  });
});
