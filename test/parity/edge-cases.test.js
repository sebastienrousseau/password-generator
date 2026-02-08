// Copyright (c) 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Edge Case Parity Tests between CLI and Web UI.
 *
 * These tests verify that CLI and Web UI produce identical results for edge cases
 * that may not be covered in the main parity tests.
 *
 * @module parity/edge-cases.test
 */

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { createService } from '../../packages/core/src/service.js';
import {
  MemoryDictionary,
  DEFAULT_WORD_LIST,
} from '../../packages/core/src/ports/DictionaryPort.js';
import { CLIController } from '../../src/cli/CLIController.js';
import { WebUIController } from '../../src/ui/web/controllers/WebUIController.js';
import { FormState } from '../../src/ui/web/state/FormState.js';
import {
  MockRandomGenerator,
  PARITY_SEEDS,
} from '../../packages/core/test/parity/MockRandomGenerator.js';
import {
  EDGE_CASE_PARITY_TESTS,
} from '../../packages/core/test/parity/fixtures.js';

describe('Edge Case Parity Tests', () => {
  /**
   * Creates deterministic adapters for comparison.
   */
  function createDeterministicAdapters() {
    const createMock = () => MockRandomGenerator.incrementing(0, 1000);

    const cliMock = createMock();
    const cliService = createService(
      {},
      {
        randomGenerator: cliMock,
        dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
      }
    );
    const cliController = new CLIController(cliService);

    const webController = new WebUIController({
      randomGenerator: createMock(),
    });

    return { cli: cliController, web: webController };
  }

  /**
   * Helper to convert config to FormState.
   */
  function configToFormState(config) {
    return new FormState({
      type: config.type || '',
      length: config.length !== undefined ? String(config.length) : '',
      iteration: config.iteration !== undefined ? String(config.iteration) : '',
      separator: config.separator !== undefined ? config.separator : '-',
    });
  }

  // =========================================================================
  // EDGE CASE GENERATION PARITY
  // =========================================================================
  describe('Edge Case Generation Parity', () => {
    EDGE_CASE_PARITY_TESTS.forEach((testCase) => {
      it(`[${testCase.id}] ${testCase.description}`, async () => {
        const adapters = createDeterministicAdapters();

        const cliPassword = await adapters.cli.getService().generate(testCase.config);

        const formState = configToFormState(testCase.config);
        const webResult = await adapters.web.generate(formState);

        // Both should produce identical passwords
        expect(cliPassword).to.equal(webResult.password);

        // Check expected pattern if provided
        if (testCase.expectedPattern) {
          expect(cliPassword).to.match(testCase.expectedPattern);
          expect(webResult.password).to.match(testCase.expectedPattern);
        }

        // Check expected separator if provided
        if (testCase.expectedSeparator !== undefined) {
          if (testCase.expectedSeparator === '') {
            // Empty separator - should not contain default separator
            expect(cliPassword).to.not.include('-');
            expect(webResult.password).to.not.include('-');
          } else {
            // Should contain the expected separator
            expect(cliPassword).to.include(testCase.expectedSeparator);
            expect(webResult.password).to.include(testCase.expectedSeparator);
          }
        }
      });
    });
  });

  // =========================================================================
  // ADDITIONAL EDGE CASES
  // =========================================================================
  describe('Additional Edge Cases', () => {
    it('should handle very long separators identically', async () => {
      const adapters = createDeterministicAdapters();
      const config = {
        type: 'strong',
        length: 4,
        iteration: 2,
        separator: '---SEPARATOR---',
      };

      const cliPassword = await adapters.cli.getService().generate(config);
      const formState = configToFormState(config);
      const webResult = await adapters.web.generate(formState);

      expect(cliPassword).to.equal(webResult.password);
      expect(cliPassword).to.include('---SEPARATOR---');
    });

    it('should handle newline separator identically', async () => {
      const adapters = createDeterministicAdapters();
      const config = {
        type: 'strong',
        length: 4,
        iteration: 2,
        separator: '\n',
      };

      const cliPassword = await adapters.cli.getService().generate(config);
      const formState = configToFormState(config);
      const webResult = await adapters.web.generate(formState);

      expect(cliPassword).to.equal(webResult.password);
      expect(cliPassword).to.include('\n');
    });

    it('should handle tab separator identically', async () => {
      const adapters = createDeterministicAdapters();
      const config = {
        type: 'strong',
        length: 4,
        iteration: 2,
        separator: '\t',
      };

      const cliPassword = await adapters.cli.getService().generate(config);
      const formState = configToFormState(config);
      const webResult = await adapters.web.generate(formState);

      expect(cliPassword).to.equal(webResult.password);
      expect(cliPassword).to.include('\t');
    });

    it('should handle maximum iterations identically', async () => {
      const adapters = createDeterministicAdapters();
      const config = {
        type: 'strong',
        length: 4,
        iteration: 10, // High iteration count
        separator: '-',
      };

      const cliPassword = await adapters.cli.getService().generate(config);
      const formState = configToFormState(config);
      const webResult = await adapters.web.generate(formState);

      expect(cliPassword).to.equal(webResult.password);

      // Should have 9 separators for 10 iterations
      const separatorCount = (cliPassword.match(/-/g) || []).length;
      expect(separatorCount).to.equal(9);
    });

    it('should handle maximum length identically', async () => {
      const adapters = createDeterministicAdapters();
      const config = {
        type: 'strong',
        length: 1024, // Maximum allowed length
        iteration: 1,
        separator: '-',
      };

      const cliPassword = await adapters.cli.getService().generate(config);
      const formState = configToFormState(config);
      const webResult = await adapters.web.generate(formState);

      expect(cliPassword).to.equal(webResult.password);
      expect(cliPassword.length).to.equal(1024);
    });
  });

  // =========================================================================
  // VALIDATION EDGE CASES
  // =========================================================================
  describe('Validation Edge Cases', () => {
    it('should validate empty separator identically', () => {
      const adapters = createDeterministicAdapters();
      const config = { type: 'strong', length: 16, iteration: 4, separator: '' };

      const cliResult = adapters.cli.getService().validateConfig(config);
      const formState = configToFormState(config);
      const webResult = adapters.web.validate(formState);

      expect(cliResult.isValid).to.equal(webResult.isValid);
      expect(cliResult.isValid).to.be.true; // Empty separator should be valid
    });

    it('should validate special character separators identically', () => {
      const specialSeparators = ['@', '#', '$', '%', '^', '&', '*', '(', ')', '+', '='];

      specialSeparators.forEach((sep) => {
        const adapters = createDeterministicAdapters();
        const config = { type: 'strong', length: 16, iteration: 2, separator: sep };

        const cliResult = adapters.cli.getService().validateConfig(config);
        const formState = configToFormState(config);
        const webResult = adapters.web.validate(formState);

        expect(cliResult.isValid).to.equal(webResult.isValid);
        expect(cliResult.isValid).to.be.true; // Special chars should be valid separators
      });
    });

    it('should validate Unicode separators identically', () => {
      const unicodeSeparators = ['·', '•', '⋅', '⭐', '🔥'];

      unicodeSeparators.forEach((sep) => {
        const adapters = createDeterministicAdapters();
        const config = { type: 'strong', length: 8, iteration: 2, separator: sep };

        const cliResult = adapters.cli.getService().validateConfig(config);
        const formState = configToFormState(config);
        const webResult = adapters.web.validate(formState);

        expect(cliResult.isValid).to.equal(webResult.isValid);
        expect(cliResult.isValid).to.be.true; // Unicode should be valid separators
      });
    });
  });

  // =========================================================================
  // ENTROPY EDGE CASES
  // =========================================================================
  describe('Entropy Edge Cases', () => {
    it('should calculate entropy for edge case configs identically', () => {
      const edgeConfigs = [
        { type: 'strong', length: 1, iteration: 1, separator: '' },
        { type: 'base64', length: 1024, iteration: 1, separator: '-' },
        { type: 'memorable', iteration: 10, separator: '🔥' },
      ];

      edgeConfigs.forEach((config) => {
        const adapters = createDeterministicAdapters();

        const cliEntropy = adapters.cli.getService().calculateEntropy(config);
        const formState = configToFormState(config);
        const webEntropy = adapters.web.calculateEntropy(formState);

        expect(cliEntropy.totalBits).to.equal(webEntropy.totalBits);
        expect(cliEntropy.securityLevel).to.equal(webEntropy.securityLevel);
      });
    });
  });
});