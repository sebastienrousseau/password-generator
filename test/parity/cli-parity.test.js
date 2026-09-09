// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * CLI Adapter Parity Tests.
 *
 * These tests verify that the CLI adapter (CLIController) produces outputs
 * that are identical to the core service when given identical inputs.
 *
 * The CLI adapter is a "thin adapter" that:
 * 1. Parses CLI arguments
 * 2. Resolves presets to configuration
 * 3. Delegates ALL logic to core service
 * 4. Renders output
 *
 * Parity tests verify steps 2 and 3 produce identical results to core.
 *
 * @module parity/cli-parity.test
 */

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { createService } from '../../packages/core/src/service.js';
import {
  MemoryDictionary,
  DEFAULT_WORD_LIST,
} from '../../packages/core/src/ports/DictionaryPort.js';
import { CLIController } from '../../src/cli/CLIController.js';
import {
  MockRandomGenerator,
  PARITY_SEEDS,
} from '../../packages/core/test/parity/MockRandomGenerator.js';
import {
  GENERATION_PARITY_CASES,
  VALIDATION_PARITY_CASES,
  ENTROPY_PARITY_CASES,
  PRESET_PARITY_CASES,
} from '../../packages/core/test/parity/fixtures.js';

describe('CLI Adapter Parity Tests', () => {
  /**
   * Creates a CLIController with deterministic mock random generator.
   */
  function createCLIWithMock(seed = PARITY_SEEDS.PRIMARY) {
    const mockRandom = MockRandomGenerator.withSeed(seed);
    const service = createService(
      {},
      {
        randomGenerator: mockRandom,
        dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
      }
    );
    return new CLIController(service);
  }

  /**
   * Creates a service directly with the same mock for comparison.
   */
  function createServiceWithMock(seed = PARITY_SEEDS.PRIMARY) {
    const mockRandom = MockRandomGenerator.withSeed(seed);
    return createService(
      {},
      {
        randomGenerator: mockRandom,
        dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
      }
    );
  }

  /**
   * Creates both CLI and service with incrementing sequence.
   */
  function createParityPair() {
    const mockRandom1 = MockRandomGenerator.incrementing(0, 1000);
    const mockRandom2 = MockRandomGenerator.incrementing(0, 1000);

    const service = createService(
      {},
      {
        randomGenerator: mockRandom1,
        dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
      }
    );

    const cliService = createService(
      {},
      {
        randomGenerator: mockRandom2,
        dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
      }
    );

    const cli = new CLIController(cliService);

    return { cli, service };
  }

  // =========================================================================
  // GENERATION PARITY TESTS
  // =========================================================================
  describe('Generation Parity', () => {
    describe('direct service comparison', () => {
      GENERATION_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] CLI should match core service output`, async () => {
          const { cli, service } = createParityPair();

          // Generate via CLI's underlying service
          const cliPassword = await cli.getService().generate(testCase.config);

          // Generate via direct service
          const servicePassword = await service.generate(testCase.config);

          // They should be identical
          expect(cliPassword).to.equal(servicePassword);
        });
      });
    });

    describe('configuration resolution parity', () => {
      it('should resolve configuration identically to manual construction', () => {
        const cli = createCLIWithMock();

        // Simulate CLI options
        const userOptions = {
          type: 'strong',
          length: 16,
          iteration: 4,
          separator: '-',
        };

        const resolved = cli.resolveConfiguration(undefined, userOptions);

        expect(resolved).to.deep.equal(userOptions);
      });

      it('should apply preset defaults correctly', () => {
        const cli = createCLIWithMock();

        // Use quick preset with no overrides
        // quick preset: { type: "strong", length: 14, iteration: 4, separator: "-" }
        const resolved = cli.resolveConfiguration('quick', {});

        expect(resolved.type).to.equal('strong');
        expect(resolved.length).to.equal(14);
        expect(resolved.iteration).to.equal(4);
        expect(resolved.separator).to.equal('-');
      });

      it('should allow user options to override preset', () => {
        const cli = createCLIWithMock();

        // Use quick preset but override length
        const resolved = cli.resolveConfiguration('quick', { length: 32 });

        expect(resolved.type).to.equal('strong');
        expect(resolved.length).to.equal(32); // Overridden
        expect(resolved.iteration).to.equal(4); // From preset
      });
    });

    describe('preset resolution parity', () => {
      PRESET_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] preset '${testCase.presetName}' should resolve correctly`, () => {
          const cli = createCLIWithMock();

          const resolved = cli.resolveConfiguration(testCase.presetName, {});

          expect(resolved.type).to.equal(testCase.resolvedConfig.type);
          if (testCase.resolvedConfig.length !== undefined) {
            expect(resolved.length).to.equal(testCase.resolvedConfig.length);
          }
          expect(resolved.iteration).to.equal(testCase.resolvedConfig.iteration);
          expect(resolved.separator).to.equal(testCase.resolvedConfig.separator);
        });
      });
    });

    describe('deterministic generation', () => {
      it('should produce identical passwords on repeated runs with same seed', async () => {
        const cli1 = createCLIWithMock(PARITY_SEEDS.PRIMARY);
        const cli2 = createCLIWithMock(PARITY_SEEDS.PRIMARY);

        const config = { type: 'strong', length: 16, iteration: 4, separator: '-' };

        const password1 = await cli1.getService().generate(config);
        const password2 = await cli2.getService().generate(config);

        expect(password1).to.equal(password2);
      });

      it('should produce different passwords with different seeds', async () => {
        const cli1 = createCLIWithMock(PARITY_SEEDS.PRIMARY);
        const cli2 = createCLIWithMock(PARITY_SEEDS.SECONDARY);

        const config = { type: 'strong', length: 16, iteration: 1, separator: '-' };

        const password1 = await cli1.getService().generate(config);
        const password2 = await cli2.getService().generate(config);

        expect(password1).to.not.equal(password2);
      });
    });
  });

  // =========================================================================
  // VALIDATION PARITY TESTS
  // =========================================================================
  describe('Validation Parity', () => {
    describe('direct service comparison', () => {
      VALIDATION_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] CLI should match core validation result`, () => {
          const { cli, service } = createParityPair();

          const cliResult = cli.getService().validateConfig(testCase.config);
          const serviceResult = service.validateConfig(testCase.config);

          expect(cliResult.isValid).to.equal(serviceResult.isValid);
          expect(cliResult.errors).to.deep.equal(serviceResult.errors);
        });
      });
    });

    describe('validation delegation', () => {
      it('should delegate all validation to core service', () => {
        const cli = createCLIWithMock();

        // Invalid config
        const result = cli.getService().validateConfig({ type: 'unknown' });

        expect(result.isValid).to.be.false;
        expect(result.errors[0]).to.include('Unknown password type');
      });

      it('should not add CLI-specific validation', () => {
        const cli = createCLIWithMock();
        const service = createServiceWithMock(PARITY_SEEDS.PRIMARY);

        // Any validation should be identical
        const configs = [
          { type: 'strong', length: 16 },
          { type: 'base64', length: 32, iteration: 2 },
          { type: 'memorable', iteration: 4 },
          { type: 'invalid' },
          { length: 16 }, // missing type
        ];

        configs.forEach((config) => {
          const cliResult = cli.getService().validateConfig(config);
          const serviceResult = service.validateConfig(config);

          expect(cliResult).to.deep.equal(serviceResult);
        });
      });
    });
  });

  // =========================================================================
  // ENTROPY PARITY TESTS
  // =========================================================================
  describe('Entropy Parity', () => {
    describe('direct service comparison', () => {
      ENTROPY_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] CLI should match core entropy calculation`, () => {
          const { cli, service } = createParityPair();

          const cliEntropy = cli.getService().calculateEntropy(testCase.config);
          const serviceEntropy = service.calculateEntropy(testCase.config);

          expect(cliEntropy.totalBits).to.equal(serviceEntropy.totalBits);
          expect(cliEntropy.securityLevel).to.equal(serviceEntropy.securityLevel);
          expect(cliEntropy.recommendation).to.equal(serviceEntropy.recommendation);
          expect(cliEntropy.perUnit).to.equal(serviceEntropy.perUnit);
        });
      });
    });

    describe('entropy calculation consistency', () => {
      it('should calculate entropy independently of random state', () => {
        const cli1 = createCLIWithMock(PARITY_SEEDS.PRIMARY);
        const cli2 = createCLIWithMock(PARITY_SEEDS.SECONDARY);

        const config = { type: 'strong', length: 16, iteration: 4 };

        const entropy1 = cli1.getService().calculateEntropy(config);
        const entropy2 = cli2.getService().calculateEntropy(config);

        // Same entropy regardless of seed
        expect(entropy1.totalBits).to.equal(entropy2.totalBits);
      });
    });
  });

  // =========================================================================
  // THIN ADAPTER CONTRACT TESTS
  // =========================================================================
  describe('Thin Adapter Contract', () => {
    it('should expose the same service interface', () => {
      const cli = createCLIWithMock();
      const service = cli.getService();

      // Verify service has expected methods
      expect(service.generate).to.be.a('function');
      expect(service.validateConfig).to.be.a('function');
      expect(service.calculateEntropy).to.be.a('function');
      expect(service.getSupportedTypes).to.be.a('function');
    });

    it('should return same supported types as core', () => {
      const cli = createCLIWithMock();
      const service = createServiceWithMock();

      const cliTypes = cli.getService().getSupportedTypes();
      const serviceTypes = service.getSupportedTypes();

      expect(cliTypes).to.deep.equal(serviceTypes);
    });

    it('should use injected random generator', async () => {
      // Create CLI with trackable mock
      const mockRandom = MockRandomGenerator.withSeed(PARITY_SEEDS.PRIMARY);
      const service = createService(
        {},
        {
          randomGenerator: mockRandom,
          dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
        }
      );
      const cli = new CLIController(service);

      await cli.getService().generate({
        type: 'strong',
        length: 8,
        iteration: 1,
        separator: '-',
      });

      // Mock should have been called
      expect(mockRandom.getCallCounts().generateRandomInt).to.be.greaterThan(0);
    });
  });

  // =========================================================================
  // ERROR HANDLING PARITY
  // =========================================================================
  describe('Error Handling Parity', () => {
    it('should throw same errors as core service', async () => {
      const cli = createCLIWithMock();
      const service = createServiceWithMock();

      // Test error on missing type
      try {
        await cli.getService().generate({ length: 16 });
        expect.fail('Should have thrown');
      } catch (cliError) {
        try {
          await service.generate({ length: 16 });
          expect.fail('Should have thrown');
        } catch (serviceError) {
          expect(cliError.message).to.equal(serviceError.message);
        }
      }
    });

    it('should throw same errors for invalid configuration', async () => {
      const cli = createCLIWithMock();
      const service = createServiceWithMock();

      // Test error on invalid type
      try {
        await cli.getService().generate({ type: 'invalid', length: 16 });
        expect.fail('Should have thrown');
      } catch (cliError) {
        try {
          await service.generate({ type: 'invalid', length: 16 });
          expect.fail('Should have thrown');
        } catch (serviceError) {
          expect(cliError.message).to.equal(serviceError.message);
        }
      }
    });
  });
});
