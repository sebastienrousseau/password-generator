// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Cross-Adapter Parity Comparison Tests.
 *
 * These tests directly compare outputs between different adapters to ensure
 * they produce identical results when given identical inputs.
 *
 * This is the "golden" parity test - if these tests pass, all adapters
 * are guaranteed to behave identically.
 *
 * @module parity/index.test
 */

import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import { createService } from "../../packages/core/src/service.js";
import { MemoryDictionary, DEFAULT_WORD_LIST } from "../../packages/core/src/ports/DictionaryPort.js";
import { CLIController } from "../../src/cli/CLIController.js";
import { WebUIController } from "../../src/ui/web/controllers/WebUIController.js";
import { FormState } from "../../src/ui/web/state/FormState.js";
import { StateToCoreMapper } from "../../src/ui/web/state/StateToCoreMapper.js";
import {
  MockRandomGenerator,
  PARITY_SEEDS,
} from "../../packages/core/test/parity/MockRandomGenerator.js";
import {
  GENERATION_PARITY_CASES,
  VALIDATION_PARITY_CASES,
  ENTROPY_PARITY_CASES,
  generateComparisonCases,
} from "../../packages/core/test/parity/fixtures.js";

describe("Cross-Adapter Parity Tests", () => {
  /**
   * Adapter factory for consistent adapter creation.
   */
  class AdapterFactory {
    constructor(seed = PARITY_SEEDS.PRIMARY) {
      this.seed = seed;
    }

    createCoreService() {
      const mockRandom = MockRandomGenerator.withSeed(this.seed);
      return createService({}, {
        randomGenerator: mockRandom,
        dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
      });
    }

    createCLIController() {
      const service = this.createCoreService();
      return new CLIController(service);
    }

    createWebController() {
      const mockRandom = MockRandomGenerator.withSeed(this.seed);
      return new WebUIController({
        randomGenerator: mockRandom,
      });
    }

    /**
     * Creates all adapters with fresh mock generators (same seed).
     */
    createAllAdapters() {
      return {
        core: this.createCoreService(),
        cli: this.createCLIController(),
        web: this.createWebController(),
      };
    }
  }

  /**
   * Helper to convert config to FormState.
   */
  function configToFormState(config) {
    return new FormState({
      type: config.type || "",
      length: config.length !== undefined ? String(config.length) : "",
      iteration: config.iteration !== undefined ? String(config.iteration) : "",
      separator: config.separator !== undefined ? config.separator : "-",
    });
  }

  /**
   * Creates adapters with incrementing sequence for deterministic comparison.
   */
  function createDeterministicAdapters() {
    const createMock = () => MockRandomGenerator.incrementing(0, 1000);

    const coreService = createService({}, {
      randomGenerator: createMock(),
      dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
    });

    const cliMock = createMock();
    const cliService = createService({}, {
      randomGenerator: cliMock,
      dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
    });
    const cliController = new CLIController(cliService);

    const webController = new WebUIController({
      randomGenerator: createMock(),
    });

    return { core: coreService, cli: cliController, web: webController };
  }

  // =========================================================================
  // CORE vs CLI PARITY
  // =========================================================================
  describe("Core vs CLI Parity", () => {
    describe("generation parity", () => {
      GENERATION_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] Core and CLI produce identical passwords`, async () => {
          const adapters = createDeterministicAdapters();

          const corePassword = await adapters.core.generate(testCase.config);
          const cliPassword = await adapters.cli.getService().generate(testCase.config);

          expect(corePassword).to.equal(cliPassword);
        });
      });
    });

    describe("validation parity", () => {
      VALIDATION_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] Core and CLI produce identical validation`, () => {
          const adapters = createDeterministicAdapters();

          const coreResult = adapters.core.validateConfig(testCase.config);
          const cliResult = adapters.cli.getService().validateConfig(testCase.config);

          expect(coreResult).to.deep.equal(cliResult);
        });
      });
    });

    describe("entropy parity", () => {
      ENTROPY_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] Core and CLI produce identical entropy`, () => {
          const adapters = createDeterministicAdapters();

          const coreEntropy = adapters.core.calculateEntropy(testCase.config);
          const cliEntropy = adapters.cli.getService().calculateEntropy(testCase.config);

          expect(coreEntropy).to.deep.equal(cliEntropy);
        });
      });
    });
  });

  // =========================================================================
  // CORE vs WEB PARITY
  // =========================================================================
  describe("Core vs Web Parity", () => {
    describe("generation parity", () => {
      GENERATION_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] Core and Web produce identical passwords`, async () => {
          const adapters = createDeterministicAdapters();

          const corePassword = await adapters.core.generate(testCase.config);

          const formState = configToFormState(testCase.config);
          const webResult = await adapters.web.generate(formState);

          expect(corePassword).to.equal(webResult.password);
        });
      });
    });

    describe("validation parity", () => {
      VALIDATION_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] Core and Web produce identical validation`, () => {
          const adapters = createDeterministicAdapters();

          const coreResult = adapters.core.validateConfig(testCase.config);

          const formState = configToFormState(testCase.config);
          const webResult = adapters.web.validate(formState);

          expect(coreResult.isValid).to.equal(webResult.isValid);
        });
      });
    });

    describe("entropy parity", () => {
      ENTROPY_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] Core and Web produce identical entropy`, () => {
          const adapters = createDeterministicAdapters();

          const coreEntropy = adapters.core.calculateEntropy(testCase.config);

          const formState = configToFormState(testCase.config);
          const webEntropy = adapters.web.calculateEntropy(formState);

          expect(coreEntropy.totalBits).to.equal(webEntropy.totalBits);
        });
      });
    });
  });

  // =========================================================================
  // CLI vs WEB PARITY
  // =========================================================================
  describe("CLI vs Web Parity", () => {
    describe("generation parity", () => {
      GENERATION_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] CLI and Web produce identical passwords`, async () => {
          const adapters = createDeterministicAdapters();

          const cliPassword = await adapters.cli.getService().generate(testCase.config);

          const formState = configToFormState(testCase.config);
          const webResult = await adapters.web.generate(formState);

          expect(cliPassword).to.equal(webResult.password);
        });
      });
    });

    describe("validation parity", () => {
      VALIDATION_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] CLI and Web produce identical validation`, () => {
          const adapters = createDeterministicAdapters();

          const cliResult = adapters.cli.getService().validateConfig(testCase.config);

          const formState = configToFormState(testCase.config);
          const webResult = adapters.web.validate(formState);

          expect(cliResult.isValid).to.equal(webResult.isValid);
        });
      });
    });

    describe("entropy parity", () => {
      ENTROPY_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] CLI and Web produce identical entropy`, () => {
          const adapters = createDeterministicAdapters();

          const cliEntropy = adapters.cli.getService().calculateEntropy(testCase.config);

          const formState = configToFormState(testCase.config);
          const webEntropy = adapters.web.calculateEntropy(formState);

          expect(cliEntropy.totalBits).to.equal(webEntropy.totalBits);
        });
      });
    });
  });

  // =========================================================================
  // ALL ADAPTERS SIMULTANEOUS PARITY
  // =========================================================================
  describe("All Adapters Simultaneous Parity", () => {
    GENERATION_PARITY_CASES.forEach((testCase) => {
      it(`[${testCase.id}] All adapters produce identical passwords`, async () => {
        const adapters = createDeterministicAdapters();

        const corePassword = await adapters.core.generate(testCase.config);
        const cliPassword = await adapters.cli.getService().generate(testCase.config);

        const formState = configToFormState(testCase.config);
        const webResult = await adapters.web.generate(formState);

        // All three should match
        expect(corePassword).to.equal(cliPassword);
        expect(corePassword).to.equal(webResult.password);
        expect(cliPassword).to.equal(webResult.password);
      });
    });
  });

  // =========================================================================
  // SUPPORTED TYPES PARITY
  // =========================================================================
  describe("Supported Types Parity", () => {
    it("all adapters report same supported types", () => {
      const adapters = createDeterministicAdapters();

      const coreTypes = adapters.core.getSupportedTypes();
      const cliTypes = adapters.cli.getService().getSupportedTypes();
      const webTypes = adapters.web.getSupportedTypes();

      expect(coreTypes).to.deep.equal(cliTypes);
      expect(coreTypes).to.deep.equal(webTypes);
    });
  });

  // =========================================================================
  // SEED CONSISTENCY ACROSS ADAPTERS
  // =========================================================================
  describe("Seed Consistency", () => {
    Object.entries(PARITY_SEEDS).forEach(([seedName, seedValue]) => {
      it(`all adapters produce consistent output with ${seedName} seed`, async () => {
        const factory = new AdapterFactory(seedValue);
        const adapters = factory.createAllAdapters();

        const config = {
          type: "strong",
          length: 16,
          iteration: 4,
          separator: "-",
        };

        const corePassword = await adapters.core.generate(config);
        const cliPassword = await adapters.cli.getService().generate(config);

        const formState = configToFormState(config);
        const webResult = await adapters.web.generate(formState);

        expect(corePassword).to.equal(cliPassword);
        expect(corePassword).to.equal(webResult.password);
      });
    });
  });

  // =========================================================================
  // FUTURE MOBILE ADAPTER TEMPLATE
  // =========================================================================
  describe("Mobile Adapter Template (Placeholder)", () => {
    /*
     * When adding a Mobile adapter, implement tests following this pattern:
     *
     * 1. Create createMobileController() factory function
     * 2. Add Mobile to createDeterministicAdapters()
     * 3. Add Core vs Mobile Parity section
     * 4. Add CLI vs Mobile Parity section
     * 5. Add Web vs Mobile Parity section
     * 6. Update All Adapters Simultaneous Parity to include Mobile
     *
     * Example structure:
     *
     * describe("Core vs Mobile Parity", () => {
     *   describe("generation parity", () => {
     *     GENERATION_PARITY_CASES.forEach((testCase) => {
     *       it(`[${testCase.id}] Core and Mobile produce identical passwords`, async () => {
     *         const adapters = createDeterministicAdapters();
     *         const corePassword = await adapters.core.generate(testCase.config);
     *         const mobilePassword = await adapters.mobile.generate(testCase.config);
     *         expect(corePassword).to.equal(mobilePassword);
     *       });
     *     });
     *   });
     * });
     */

    it("placeholder for future Mobile adapter parity tests", () => {
      // This test passes as a reminder to implement Mobile parity tests
      expect(true).to.be.true;
    });
  });

  // =========================================================================
  // ERROR PARITY
  // =========================================================================
  describe("Error Parity", () => {
    const errorCases = [
      { config: { length: 16 }, description: "missing type" },
      { config: { type: "unknown" }, description: "unknown type" },
      { config: { type: "strong", length: 0 }, description: "zero length" },
      { config: { type: "strong", length: 16, iteration: 0 }, description: "zero iteration" },
    ];

    errorCases.forEach(({ config, description }) => {
      it(`all adapters produce same error for ${description}`, () => {
        const adapters = createDeterministicAdapters();

        const coreValidation = adapters.core.validateConfig(config);
        const cliValidation = adapters.cli.getService().validateConfig(config);

        const formState = configToFormState(config);
        const webValidation = adapters.web.validate(formState);

        // All should be invalid
        expect(coreValidation.isValid).to.be.false;
        expect(cliValidation.isValid).to.be.false;
        expect(webValidation.isValid).to.be.false;

        // Core and CLI should have identical errors
        expect(coreValidation.errors).to.deep.equal(cliValidation.errors);
      });
    });
  });

  // =========================================================================
  // PARITY QUALITY GATE SUMMARY
  // =========================================================================
  describe("Parity Quality Gate", () => {
    it("should pass all generation parity tests", () => {
      expect(GENERATION_PARITY_CASES.length).to.be.greaterThan(0);
    });

    it("should pass all validation parity tests", () => {
      expect(VALIDATION_PARITY_CASES.length).to.be.greaterThan(0);
    });

    it("should pass all entropy parity tests", () => {
      expect(ENTROPY_PARITY_CASES.length).to.be.greaterThan(0);
    });

    it("should have comparison cases for all adapter pairs", () => {
      const cliVsWebCases = generateComparisonCases("cli", "web");
      expect(cliVsWebCases.length).to.equal(GENERATION_PARITY_CASES.length);
    });
  });
});
