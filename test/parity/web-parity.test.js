// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Web UI Adapter Parity Tests.
 *
 * These tests verify that the Web UI adapter (WebUIController) produces outputs
 * that are identical to the core service when given identical inputs.
 *
 * The Web adapter is a "thin adapter" that:
 * 1. Captures UI form state
 * 2. Maps form state to core config
 * 3. Delegates ALL logic to core service
 * 4. Transforms results to view models
 *
 * Parity tests verify steps 2 and 3 produce identical results to core.
 *
 * @module parity/web-parity.test
 */

import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import { createService } from "../../packages/core/src/service.js";
import { MemoryDictionary, DEFAULT_WORD_LIST } from "../../packages/core/src/ports/DictionaryPort.js";
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
} from "../../packages/core/test/parity/fixtures.js";

describe("Web UI Adapter Parity Tests", () => {
  /**
   * Creates a WebUIController with deterministic mock random generator.
   */
  function createWebControllerWithMock(seed = PARITY_SEEDS.PRIMARY) {
    const mockRandom = MockRandomGenerator.withSeed(seed);
    return new WebUIController({
      randomGenerator: mockRandom,
    });
  }

  /**
   * Creates a service directly with the same mock for comparison.
   */
  function createServiceWithMock(seed = PARITY_SEEDS.PRIMARY) {
    const mockRandom = MockRandomGenerator.withSeed(seed);
    return createService({}, {
      randomGenerator: mockRandom,
      dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
    });
  }

  /**
   * Creates both Web controller and service with incrementing sequence.
   */
  function createParityPair() {
    const mockRandom1 = MockRandomGenerator.incrementing(0, 1000);
    const mockRandom2 = MockRandomGenerator.incrementing(0, 1000);

    const service = createService({}, {
      randomGenerator: mockRandom1,
      dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
    });

    const webController = new WebUIController({
      randomGenerator: mockRandom2,
    });

    return { webController, service };
  }

  /**
   * Converts a config object to FormState for web controller.
   */
  function configToFormState(config) {
    return new FormState({
      type: config.type || "",
      length: config.length !== undefined ? String(config.length) : "",
      iteration: config.iteration !== undefined ? String(config.iteration) : "",
      separator: config.separator !== undefined ? config.separator : "-",
    });
  }

  // =========================================================================
  // GENERATION PARITY TESTS
  // =========================================================================
  describe("Generation Parity", () => {
    describe("direct service comparison", () => {
      GENERATION_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] Web should match core service output`, async () => {
          const { webController, service } = createParityPair();

          // Generate via web controller
          const formState = configToFormState(testCase.config);
          const webResult = await webController.generate(formState);
          const webPassword = webResult.password;

          // Generate via direct service
          const servicePassword = await service.generate(testCase.config);

          // They should be identical
          expect(webPassword).to.equal(servicePassword);
        });
      });
    });

    describe("state mapping parity", () => {
      it("should map FormState to core config correctly", () => {
        const mapper = new StateToCoreMapper();

        const formState = new FormState({
          type: "strong",
          length: "16",
          iteration: "4",
          separator: "-",
        });

        const config = mapper.toConfig(formState);

        expect(config).to.deep.equal({
          type: "strong",
          length: 16,
          iteration: 4,
          separator: "-",
        });
      });

      it("should handle string to number conversion correctly", () => {
        const mapper = new StateToCoreMapper();

        const formState = new FormState({
          type: "base64",
          length: "32",
          iteration: "2",
          separator: "/",
        });

        const config = mapper.toConfig(formState);

        expect(config.length).to.equal(32);
        expect(config.length).to.be.a("number");
        expect(config.iteration).to.equal(2);
        expect(config.iteration).to.be.a("number");
      });

      it("should handle empty values correctly", () => {
        const mapper = new StateToCoreMapper();

        const formState = new FormState({
          type: "memorable",
          length: "",
          iteration: "4",
          separator: "-",
        });

        const config = mapper.toConfig(formState);

        expect(config.type).to.equal("memorable");
        expect(config.length).to.be.undefined;
        expect(config.iteration).to.equal(4);
      });
    });

    describe("deterministic generation", () => {
      it("should produce identical passwords on repeated runs with same seed", async () => {
        const web1 = createWebControllerWithMock(PARITY_SEEDS.PRIMARY);
        const web2 = createWebControllerWithMock(PARITY_SEEDS.PRIMARY);

        const formState = configToFormState({
          type: "strong",
          length: 16,
          iteration: 4,
          separator: "-",
        });

        const result1 = await web1.generate(formState);
        const result2 = await web2.generate(formState);

        expect(result1.password).to.equal(result2.password);
      });

      it("should produce different passwords with different seeds", async () => {
        const web1 = createWebControllerWithMock(PARITY_SEEDS.PRIMARY);
        const web2 = createWebControllerWithMock(PARITY_SEEDS.SECONDARY);

        const formState = configToFormState({
          type: "strong",
          length: 16,
          iteration: 1,
          separator: "-",
        });

        const result1 = await web1.generate(formState);
        const result2 = await web2.generate(formState);

        expect(result1.password).to.not.equal(result2.password);
      });
    });
  });

  // =========================================================================
  // VALIDATION PARITY TESTS
  // =========================================================================
  describe("Validation Parity", () => {
    describe("direct service comparison", () => {
      VALIDATION_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] Web should match core validation result`, () => {
          const { webController, service } = createParityPair();

          const formState = configToFormState(testCase.config);
          const webResult = webController.validate(formState);
          const serviceResult = service.validateConfig(testCase.config);

          expect(webResult.isValid).to.equal(serviceResult.isValid);

          // Compare error presence
          if (!serviceResult.isValid) {
            expect(webResult.errors.length).to.be.greaterThan(0);
          }
        });
      });
    });

    describe("validation delegation", () => {
      it("should delegate all validation to core service", () => {
        const webController = createWebControllerWithMock();

        const formState = configToFormState({ type: "unknown" });
        const result = webController.validate(formState);

        expect(result.isValid).to.be.false;
      });

      it("should not add Web-specific validation", () => {
        const webController = createWebControllerWithMock();
        const service = createServiceWithMock();

        // Any validation should be identical (in terms of isValid)
        const configs = [
          { type: "strong", length: 16, iteration: 1 },
          { type: "base64", length: 32, iteration: 2 },
          { type: "memorable", iteration: 4 },
          { type: "invalid" },
        ];

        configs.forEach((config) => {
          const formState = configToFormState(config);
          const webResult = webController.validate(formState);
          const serviceResult = service.validateConfig(config);

          expect(webResult.isValid).to.equal(serviceResult.isValid);
        });
      });
    });

    describe("ValidationViewModel transformation", () => {
      it("should transform validation result to view model", () => {
        const webController = createWebControllerWithMock();

        const formState = configToFormState({
          type: "strong",
          length: 16,
          iteration: 4,
        });

        const result = webController.validate(formState);

        // Should have view model properties
        expect(result).to.have.property("isValid");
        expect(result).to.have.property("errors");
        expect(result.isValid).to.be.true;
      });
    });
  });

  // =========================================================================
  // ENTROPY PARITY TESTS
  // =========================================================================
  describe("Entropy Parity", () => {
    describe("direct service comparison", () => {
      ENTROPY_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] Web should match core entropy calculation`, () => {
          const { webController, service } = createParityPair();

          const formState = configToFormState(testCase.config);
          const webEntropy = webController.calculateEntropy(formState);
          const serviceEntropy = service.calculateEntropy(testCase.config);

          expect(webEntropy.totalBits).to.equal(serviceEntropy.totalBits);
        });
      });
    });

    describe("EntropyViewModel transformation", () => {
      it("should transform entropy result to view model", () => {
        const webController = createWebControllerWithMock();

        const formState = configToFormState({
          type: "strong",
          length: 16,
          iteration: 4,
        });

        const result = webController.calculateEntropy(formState);

        // Should have view model properties
        expect(result).to.have.property("totalBits");
        expect(result.totalBits).to.equal(384);
      });
    });
  });

  // =========================================================================
  // THIN ADAPTER CONTRACT TESTS
  // =========================================================================
  describe("Thin Adapter Contract", () => {
    it("should expose the same service interface", () => {
      const webController = createWebControllerWithMock();
      const service = webController.getService();

      // Verify service has expected methods
      expect(service.generate).to.be.a("function");
      expect(service.validateConfig).to.be.a("function");
      expect(service.calculateEntropy).to.be.a("function");
      expect(service.getSupportedTypes).to.be.a("function");
    });

    it("should return same supported types as core", () => {
      const webController = createWebControllerWithMock();
      const service = createServiceWithMock();

      const webTypes = webController.getSupportedTypes();
      const serviceTypes = service.getSupportedTypes();

      expect(webTypes).to.deep.equal(serviceTypes);
    });

    it("should use injected random generator", async () => {
      const mockRandom = MockRandomGenerator.withSeed(PARITY_SEEDS.PRIMARY);
      const webController = new WebUIController({
        randomGenerator: mockRandom,
      });

      const formState = configToFormState({
        type: "strong",
        length: 8,
        iteration: 1,
        separator: "-",
      });

      await webController.generate(formState);

      // Mock should have been called
      expect(mockRandom.getCallCounts().generateRandomInt).to.be.greaterThan(0);
    });

    it("should provide mapper for state transformation", () => {
      const webController = createWebControllerWithMock();
      const mapper = webController.getMapper();

      expect(mapper).to.be.instanceOf(StateToCoreMapper);
    });
  });

  // =========================================================================
  // FORM STATE ROUND-TRIP TESTS
  // =========================================================================
  describe("Form State Round-Trip", () => {
    it("should preserve config through FormState transformation", () => {
      const mapper = new StateToCoreMapper();

      const originalConfig = {
        type: "strong",
        length: 16,
        iteration: 4,
        separator: "-",
      };

      // Config -> FormState -> Config
      const formState = mapper.toFormState(originalConfig);
      const recoveredConfig = mapper.toConfig(formState);

      expect(recoveredConfig).to.deep.equal(originalConfig);
    });

    it("should handle all password types in round-trip", () => {
      const mapper = new StateToCoreMapper();

      const configs = [
        { type: "strong", length: 16, iteration: 4, separator: "-" },
        { type: "base64", length: 32, iteration: 2, separator: "/" },
        { type: "memorable", iteration: 4, separator: "_" },
      ];

      configs.forEach((config) => {
        const formState = mapper.toFormState(config);
        const recovered = mapper.toConfig(formState);

        expect(recovered.type).to.equal(config.type);
        if (config.length !== undefined) {
          expect(recovered.length).to.equal(config.length);
        }
        expect(recovered.iteration).to.equal(config.iteration);
        expect(recovered.separator).to.equal(config.separator);
      });
    });
  });

  // =========================================================================
  // ERROR HANDLING PARITY
  // =========================================================================
  describe("Error Handling Parity", () => {
    it("should throw errors for invalid configurations", async () => {
      const webController = createWebControllerWithMock();

      const formState = configToFormState({ type: "invalid" });

      try {
        await webController.generate(formState);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error.message).to.include("Unknown password type");
      }
    });

    it("should validate before generating", async () => {
      const webController = createWebControllerWithMock();

      const formState = configToFormState({ type: "strong", length: 0 });

      try {
        await webController.generate(formState);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error.message).to.include("Length");
      }
    });
  });

  // =========================================================================
  // PASSWORD VIEW MODEL TESTS
  // =========================================================================
  describe("PasswordViewModel", () => {
    it("should include password in view model", async () => {
      const webController = createWebControllerWithMock();

      const formState = configToFormState({
        type: "strong",
        length: 16,
        iteration: 4,
        separator: "-",
      });

      const result = await webController.generate(formState);

      expect(result).to.have.property("password");
      expect(result.password).to.be.a("string");
      expect(result.password.length).to.be.greaterThan(0);
    });

    it("should include entropy info in view model", async () => {
      const webController = createWebControllerWithMock();

      const formState = configToFormState({
        type: "strong",
        length: 16,
        iteration: 4,
        separator: "-",
      });

      const result = await webController.generate(formState);

      // PasswordViewModel transforms entropyInfo into entropyBits and securityLevel
      expect(result).to.have.property("entropyBits");
      expect(result).to.have.property("securityLevel");
      expect(result.entropyBits).to.equal(384); // 16 * 4 * 6 bits
    });
  });
});
