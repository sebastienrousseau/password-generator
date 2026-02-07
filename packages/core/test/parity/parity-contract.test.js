// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Core Service Parity Contract Tests.
 *
 * These tests define the CANONICAL behavior of the core service that all
 * adapters must match. The tests verify:
 *
 * 1. Generation Contract: Same config + same random sequence = same password
 * 2. Validation Contract: Same config = same validation result
 * 3. Entropy Contract: Same config = same entropy calculation
 *
 * IMPORTANT: If these tests fail, the contract has been broken and all
 * adapter implementations must be reviewed.
 *
 * @module parity/parity-contract.test
 */

import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import { createService } from "../../src/service.js";
import { MemoryDictionary, DEFAULT_WORD_LIST } from "../../src/ports/DictionaryPort.js";
import { MockRandomGenerator, PARITY_SEEDS } from "./MockRandomGenerator.js";
import {
  GENERATION_PARITY_CASES,
  VALIDATION_PARITY_CASES,
  ENTROPY_PARITY_CASES,
  EDGE_CASE_PARITY_TESTS,
} from "./fixtures.js";

describe("Parity Contract Tests", () => {
  /**
   * Helper to create a service with deterministic mock random generator.
   */
  function createParityService(seed = PARITY_SEEDS.PRIMARY) {
    const mockRandom = MockRandomGenerator.withSeed(seed);
    return createService({}, {
      randomGenerator: mockRandom,
      dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
    });
  }

  /**
   * Helper to create a service with an incrementing sequence.
   */
  function createSequenceService(start = 0, count = 1000) {
    const mockRandom = MockRandomGenerator.incrementing(start, count);
    return createService({}, {
      randomGenerator: mockRandom,
      dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
    });
  }

  // =========================================================================
  // GENERATION CONTRACT TESTS
  // =========================================================================
  describe("Generation Contract", () => {
    describe("determinism guarantee", () => {
      it("should produce identical output for identical inputs and random sequence", async () => {
        // Create two services with the same seed
        const service1 = createParityService(PARITY_SEEDS.PRIMARY);
        const service2 = createParityService(PARITY_SEEDS.PRIMARY);

        const config = {
          type: "strong",
          length: 16,
          iteration: 4,
          separator: "-",
        };

        const password1 = await service1.generate(config);
        const password2 = await service2.generate(config);

        expect(password1).to.equal(password2);
      });

      it("should produce different output for different seeds", async () => {
        const service1 = createParityService(PARITY_SEEDS.PRIMARY);
        const service2 = createParityService(PARITY_SEEDS.SECONDARY);

        const config = {
          type: "strong",
          length: 16,
          iteration: 1,
          separator: "-",
        };

        const password1 = await service1.generate(config);
        const password2 = await service2.generate(config);

        expect(password1).to.not.equal(password2);
      });

      it("should produce repeatable output on generator reset", async () => {
        const mockRandom = MockRandomGenerator.withSeed(PARITY_SEEDS.PRIMARY);
        const service = createService({}, {
          randomGenerator: mockRandom,
          dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
        });

        const config = {
          type: "strong",
          length: 8,
          iteration: 2,
          separator: "-",
        };

        const password1 = await service.generate(config);

        // Reset and regenerate
        mockRandom.reset();
        const password2 = await service.generate(config);

        expect(password1).to.equal(password2);
      });
    });

    describe("parity test cases", () => {
      GENERATION_PARITY_CASES.forEach((testCase) => {
        describe(`[${testCase.id}] ${testCase.description}`, () => {
          let service;

          beforeEach(() => {
            service = createSequenceService();
          });

          it("should generate password with correct structure", async () => {
            const password = await service.generate(testCase.config);

            // Verify it's a non-empty string
            expect(password).to.be.a("string");
            expect(password.length).to.be.greaterThan(0);

            // Verify chunk count if expected
            if (testCase.expectedChunks) {
              const separator = testCase.config.separator;
              const chunks = separator ? password.split(separator) : [password];
              expect(chunks.length).to.equal(testCase.expectedChunks);
            }

            // Verify each chunk length if applicable
            // Skip when separator is part of base64 charset (e.g., "/" or "+")
            const base64Separators = ["/", "+"];
            const separatorIsBase64Char = base64Separators.includes(testCase.config.separator);
            if (testCase.chunkLength && testCase.config.type !== "memorable" && !separatorIsBase64Char) {
              const chunks = password.split(testCase.config.separator);
              chunks.forEach((chunk) => {
                expect(chunk.length).to.equal(testCase.chunkLength);
              });
            }

            // Verify word count for memorable passwords
            if (testCase.expectedWordCount) {
              const words = password.split(testCase.config.separator);
              expect(words.length).to.equal(testCase.expectedWordCount);

              // Verify all words are from dictionary
              words.forEach((word) => {
                expect(DEFAULT_WORD_LIST).to.include(word);
              });
            }

            // Verify separator is used correctly
            if (testCase.expectedSeparator && testCase.config.iteration > 1) {
              expect(password).to.include(testCase.expectedSeparator);
            }
          });

          it("should produce reproducible output", async () => {
            const service1 = createSequenceService();
            const service2 = createSequenceService();

            const password1 = await service1.generate(testCase.config);
            const password2 = await service2.generate(testCase.config);

            expect(password1).to.equal(password2);
          });
        });
      });
    });

    describe("password type consistency", () => {
      it("should generate strong password with base64 characters only", async () => {
        const service = createSequenceService();
        const password = await service.generate({
          type: "strong",
          length: 100,
          iteration: 1,
          separator: "",
        });

        // Base64 charset: A-Za-z0-9+/
        expect(password).to.match(/^[A-Za-z0-9+/]+$/);
      });

      it("should generate base64 password with base64 characters only", async () => {
        const service = createSequenceService();
        const password = await service.generate({
          type: "base64",
          length: 100,
          iteration: 1,
          separator: "",
        });

        expect(password).to.match(/^[A-Za-z0-9+/]+$/);
      });

      it("should generate memorable password with dictionary words only", async () => {
        const service = createSequenceService();
        const password = await service.generate({
          type: "memorable",
          iteration: 5,
          separator: "-",
        });

        const words = password.split("-");
        words.forEach((word) => {
          expect(DEFAULT_WORD_LIST).to.include(word);
        });
      });
    });
  });

  // =========================================================================
  // VALIDATION CONTRACT TESTS
  // =========================================================================
  describe("Validation Contract", () => {
    let service;

    beforeEach(() => {
      service = createSequenceService();
    });

    describe("parity test cases", () => {
      VALIDATION_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] ${testCase.description}`, () => {
          const result = service.validateConfig(testCase.config);

          expect(result.isValid).to.equal(testCase.expected.isValid);

          if (testCase.expected.errors) {
            expect(result.errors).to.deep.equal(testCase.expected.errors);
          }

          if (testCase.expected.errorContains) {
            expect(result.errors.some((e) => e.includes(testCase.expected.errorContains))).to.be
              .true;
          }
        });
      });
    });

    describe("validation consistency", () => {
      it("should return identical results for identical inputs", () => {
        const config = { type: "strong", length: 16, iteration: 4 };

        const result1 = service.validateConfig(config);
        const result2 = service.validateConfig(config);

        expect(result1).to.deep.equal(result2);
      });

      it("should validate across all supported types", () => {
        const types = service.getSupportedTypes();

        types.forEach((type) => {
          const config = type === "memorable" ? { type, iteration: 4 } : { type, length: 16, iteration: 1 };

          const result = service.validateConfig(config);
          expect(result.isValid).to.be.true;
        });
      });
    });

    describe("validation edge cases", () => {
      it("should handle undefined config gracefully", () => {
        const result = service.validateConfig({});
        expect(result.isValid).to.be.false;
        expect(result.errors).to.have.length.greaterThan(0);
      });

      it("should handle null type", () => {
        const result = service.validateConfig({ type: null, length: 16 });
        expect(result.isValid).to.be.false;
      });

      it("should validate non-integer length", () => {
        const result = service.validateConfig({ type: "strong", length: 16.5 });
        expect(result.isValid).to.be.false;
      });

      it("should validate non-integer iteration", () => {
        const result = service.validateConfig({ type: "strong", length: 16, iteration: 1.5 });
        expect(result.isValid).to.be.false;
      });
    });
  });

  // =========================================================================
  // ENTROPY CONTRACT TESTS
  // =========================================================================
  describe("Entropy Contract", () => {
    let service;

    beforeEach(() => {
      service = createSequenceService();
    });

    describe("parity test cases", () => {
      ENTROPY_PARITY_CASES.forEach((testCase) => {
        it(`[${testCase.id}] ${testCase.description}`, () => {
          const result = service.calculateEntropy(testCase.config);

          // Verify total bits (exact or approximate)
          if (testCase.expected.totalBits !== undefined) {
            expect(result.totalBits).to.equal(testCase.expected.totalBits);
          }

          if (testCase.expected.totalBitsApprox !== undefined) {
            const tolerance = testCase.expected.tolerance || 0.1;
            expect(result.totalBits).to.be.closeTo(testCase.expected.totalBitsApprox, tolerance);
          }

          // Verify security level
          if (testCase.expected.securityLevelContains) {
            expect(result.securityLevel).to.include(testCase.expected.securityLevelContains);
          }
        });
      });
    });

    describe("entropy consistency", () => {
      it("should return identical results for identical inputs", () => {
        const config = { type: "strong", length: 16, iteration: 4 };

        const result1 = service.calculateEntropy(config);
        const result2 = service.calculateEntropy(config);

        expect(result1).to.deep.equal(result2);
      });

      it("should calculate entropy without random state dependency", () => {
        // Entropy calculation should not depend on random generator state
        const mockRandom = MockRandomGenerator.withSeed(PARITY_SEEDS.PRIMARY);
        const service1 = createService({}, {
          randomGenerator: mockRandom,
          dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
        });

        // Generate a password to consume random state
        service1.generate({ type: "strong", length: 16, iteration: 1, separator: "-" });

        const entropy1 = service1.calculateEntropy({ type: "strong", length: 16, iteration: 4 });

        // Create fresh service
        const service2 = createParityService(PARITY_SEEDS.SECONDARY);
        const entropy2 = service2.calculateEntropy({ type: "strong", length: 16, iteration: 4 });

        // Entropy should be identical regardless of random state
        expect(entropy1.totalBits).to.equal(entropy2.totalBits);
      });
    });

    describe("entropy calculation correctness", () => {
      it("should calculate 6 bits per character for base64 charset", () => {
        const result = service.calculateEntropy({
          type: "strong",
          length: 1,
          iteration: 1,
        });

        expect(result.totalBits).to.equal(6);
      });

      it("should scale linearly with length", () => {
        const result8 = service.calculateEntropy({ type: "strong", length: 8, iteration: 1 });
        const result16 = service.calculateEntropy({ type: "strong", length: 16, iteration: 1 });

        expect(result16.totalBits).to.equal(result8.totalBits * 2);
      });

      it("should scale linearly with iteration", () => {
        const result1 = service.calculateEntropy({ type: "strong", length: 16, iteration: 1 });
        const result4 = service.calculateEntropy({ type: "strong", length: 16, iteration: 4 });

        expect(result4.totalBits).to.equal(result1.totalBits * 4);
      });
    });
  });

  // =========================================================================
  // EDGE CASE CONTRACT TESTS
  // =========================================================================
  describe("Edge Case Contract", () => {
    EDGE_CASE_PARITY_TESTS.forEach((testCase) => {
      it(`[${testCase.id}] ${testCase.description}`, async () => {
        const service = createSequenceService();
        const password = await service.generate(testCase.config);

        if (testCase.expectedPattern) {
          expect(password).to.match(testCase.expectedPattern);
        }

        if (testCase.expectedSeparator && testCase.config.iteration > 1) {
          expect(password).to.include(testCase.expectedSeparator);
        }
      });
    });
  });

  // =========================================================================
  // CROSS-SEED CONSISTENCY TESTS
  // =========================================================================
  describe("Cross-Seed Consistency", () => {
    it("should maintain structural consistency across different seeds", async () => {
      const seeds = [
        PARITY_SEEDS.PRIMARY,
        PARITY_SEEDS.SECONDARY,
        PARITY_SEEDS.EDGE_CASE,
        PARITY_SEEDS.STRESS,
      ];

      const config = {
        type: "strong",
        length: 16,
        iteration: 4,
        separator: "-",
      };

      for (const seed of seeds) {
        const service = createParityService(seed);
        const password = await service.generate(config);

        const chunks = password.split("-");
        expect(chunks.length).to.equal(4);
        chunks.forEach((chunk) => {
          expect(chunk.length).to.equal(16);
          expect(chunk).to.match(/^[A-Za-z0-9+/]+$/);
        });
      }
    });
  });
});
