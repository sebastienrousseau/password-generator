// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import { createService, createQuickService } from "../src/service.js";
import { MemoryDictionary, DEFAULT_WORD_LIST } from "../src/ports/DictionaryPort.js";
import { NoOpLogger } from "../src/ports/LoggerPort.js";
import { MemoryStorage } from "../src/ports/StoragePort.js";
import { FixedClock } from "../src/ports/ClockPort.js";

/**
 * Mock RandomGenerator for deterministic testing
 */
class MockRandomGenerator {
  constructor(sequence = []) {
    this.sequence = sequence;
    this.index = 0;
  }

  async generateRandomInt(max) {
    const value = this.sequence[this.index++ % this.sequence.length];
    return value % max;
  }

  async generateRandomBytes(byteLength) {
    const bytes = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = this.sequence[this.index++ % this.sequence.length];
    }
    return bytes;
  }
}

describe("Service", () => {
  describe("createService", () => {
    describe("initialization", () => {
      it("should create service with required port only", () => {
        const mock = new MockRandomGenerator([0]);
        const service = createService({}, { randomGenerator: mock });
        expect(service).to.be.an("object");
      });

      it("should create service with all ports", () => {
        const mock = new MockRandomGenerator([0]);
        const service = createService({}, {
          randomGenerator: mock,
          logger: new NoOpLogger(),
          storage: new MemoryStorage(),
          clock: new FixedClock(),
          dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
        });
        expect(service).to.be.an("object");
      });

      it("should fill in default ports for optional ones", () => {
        const mock = new MockRandomGenerator([0]);
        const service = createService({}, { randomGenerator: mock });
        const ports = service.getPorts();

        expect(ports.randomGenerator).to.equal(mock);
        expect(ports.logger).to.be.instanceOf(NoOpLogger);
        expect(ports.storage).to.be.instanceOf(MemoryStorage);
        expect(ports.clock).to.be.instanceOf(FixedClock);
        expect(ports.dictionary).to.be.instanceOf(MemoryDictionary);
      });

      it("should validate ports by default", () => {
        expect(() => createService({}, {})).to.throw(Error, "Port validation failed");
      });

      it("should skip validation when validateOnInit is false", () => {
        // This would normally fail, but with validateOnInit: false it passes
        expect(() => createService({ validateOnInit: false }, {})).to.not.throw();
      });

      it("should throw when randomGenerator is missing", () => {
        expect(() => createService({}, { logger: new NoOpLogger() })).to.throw(
          Error,
          "validation failed"
        );
      });

      it("should throw when randomGenerator is invalid", () => {
        expect(() => createService({}, { randomGenerator: {} })).to.throw(
          Error,
          "validation failed"
        );
      });
    });

    describe("generate", () => {
      let service;

      beforeEach(() => {
        const mock = new MockRandomGenerator(Array.from({ length: 100 }, (_, i) => i));
        service = createService({}, {
          randomGenerator: mock,
          dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
        });
      });

      it("should generate strong password", async () => {
        const password = await service.generate({
          type: "strong",
          length: 16,
          iteration: 1,
          separator: "-",
        });

        expect(password).to.have.lengthOf(16);
      });

      it("should generate strong password with multiple chunks", async () => {
        const mock = new MockRandomGenerator(Array.from({ length: 100 }, (_, i) => i));
        const svc = createService({}, { randomGenerator: mock });

        const password = await svc.generate({
          type: "strong",
          length: 8,
          iteration: 4,
          separator: "-",
        });

        const chunks = password.split("-");
        expect(chunks).to.have.lengthOf(4);
        chunks.forEach(chunk => expect(chunk).to.have.lengthOf(8));
      });

      it("should generate base64 password", async () => {
        const password = await service.generate({
          type: "base64",
          length: 20,
          iteration: 1,
          separator: "-",
        });

        expect(password).to.have.lengthOf(20);
      });

      it("should generate memorable password", async () => {
        const password = await service.generate({
          type: "memorable",
          iteration: 4,
          separator: "-",
        });

        const words = password.split("-");
        expect(words).to.have.lengthOf(4);
        words.forEach(word => {
          expect(DEFAULT_WORD_LIST).to.include(word);
        });
      });

      it("should use default length of 16", async () => {
        const password = await service.generate({
          type: "strong",
          iteration: 1,
          separator: "-",
        });

        expect(password).to.have.lengthOf(16);
      });

      it("should use default iteration of 1", async () => {
        const password = await service.generate({
          type: "strong",
          length: 8,
          separator: "-",
        });

        expect(password).to.have.lengthOf(8);
        expect(password).to.not.include("-");
      });

      it("should use default separator of -", async () => {
        const mock = new MockRandomGenerator(Array.from({ length: 100 }, (_, i) => i));
        const svc = createService({}, { randomGenerator: mock });

        const password = await svc.generate({
          type: "strong",
          length: 4,
          iteration: 2,
        });

        expect(password).to.include("-");
      });

      it("should throw when type is missing", async () => {
        try {
          await service.generate({ length: 16 });
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.include("type is required");
        }
      });

      it("should throw for unknown type", async () => {
        try {
          await service.generate({ type: "unknown" });
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.include("Unknown password type");
        }
      });

      it("should throw for invalid length", async () => {
        try {
          await service.generate({
            type: "strong",
            length: 0,
            iteration: 1,
          });
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.include("Length");
        }
      });

      it("should throw for invalid iteration", async () => {
        try {
          await service.generate({
            type: "strong",
            length: 16,
            iteration: 0,
          });
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.include("Iteration");
        }
      });

      it("should throw for length exceeding maximum", async () => {
        try {
          await service.generate({
            type: "strong",
            length: 2000,
            iteration: 1,
          });
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.include("exceed");
        }
      });
    });

    describe("generateMultiple", () => {
      let service;

      beforeEach(() => {
        const mock = new MockRandomGenerator(Array.from({ length: 1000 }, (_, i) => i));
        service = createService({}, {
          randomGenerator: mock,
          dictionary: new MemoryDictionary(DEFAULT_WORD_LIST),
        });
      });

      it("should generate multiple passwords", async () => {
        const passwords = await service.generateMultiple([
          { type: "strong", length: 8, iteration: 1, separator: "-" },
          { type: "base64", length: 16, iteration: 1, separator: "-" },
        ]);

        expect(passwords).to.have.lengthOf(2);
        expect(passwords[0]).to.have.lengthOf(8);
        expect(passwords[1]).to.have.lengthOf(16);
      });

      it("should generate empty array for empty input", async () => {
        const passwords = await service.generateMultiple([]);
        expect(passwords).to.deep.equal([]);
      });

      it("should generate multiple memorable passwords", async () => {
        const passwords = await service.generateMultiple([
          { type: "memorable", iteration: 3, separator: "-" },
          { type: "memorable", iteration: 4, separator: "_" },
        ]);

        expect(passwords).to.have.lengthOf(2);
        expect(passwords[0].split("-")).to.have.lengthOf(3);
        expect(passwords[1].split("_")).to.have.lengthOf(4);
      });
    });

    describe("calculateEntropy", () => {
      let service;

      beforeEach(() => {
        const mock = new MockRandomGenerator([0]);
        service = createService({}, { randomGenerator: mock });
      });

      it("should calculate entropy for strong password", () => {
        const result = service.calculateEntropy({
          type: "strong",
          length: 16,
          iteration: 4,
        });

        expect(result.totalBits).to.equal(384); // 16 * 4 * 6
        expect(result.securityLevel).to.include("EXCELLENT");
        expect(result.recommendation).to.include("Excellent");
        expect(result.perUnit).to.equal(6); // 6 bits per character (log2(64))
      });

      it("should calculate entropy for base64 password", () => {
        const result = service.calculateEntropy({
          type: "base64",
          length: 16,
          iteration: 1,
        });

        expect(result.totalBits).to.equal(96);
        expect(result.securityLevel).to.include("GOOD");
      });

      it("should calculate entropy for memorable password", () => {
        const result = service.calculateEntropy({
          type: "memorable",
          iteration: 4,
        });

        expect(result.totalBits).to.be.closeTo(51.7, 0.2);
        expect(result.perUnit).to.be.closeTo(12.9, 0.2);
      });

      it("should use default values", () => {
        const result = service.calculateEntropy({
          type: "strong",
        });

        expect(result.totalBits).to.equal(96); // 16 * 1 * 6
      });
    });

    describe("validateConfig", () => {
      let service;

      beforeEach(() => {
        const mock = new MockRandomGenerator([0]);
        service = createService({}, { randomGenerator: mock });
      });

      it("should return valid for correct config", () => {
        const result = service.validateConfig({
          type: "strong",
          length: 16,
          iteration: 4,
        });

        expect(result.isValid).to.be.true;
        expect(result.errors).to.have.lengthOf(0);
      });

      it("should return invalid when type is missing", () => {
        const result = service.validateConfig({
          length: 16,
        });

        expect(result.isValid).to.be.false;
        expect(result.errors).to.have.lengthOf(1);
        expect(result.errors[0]).to.include("type is required");
      });

      it("should return invalid for unknown type", () => {
        const result = service.validateConfig({
          type: "invalid",
        });

        expect(result.isValid).to.be.false;
        expect(result.errors[0]).to.include("Unknown password type");
      });

      it("should return invalid for bad length", () => {
        const result = service.validateConfig({
          type: "strong",
          length: -5,
        });

        expect(result.isValid).to.be.false;
      });

      it("should return invalid for bad iteration", () => {
        const result = service.validateConfig({
          type: "base64",
          iteration: 0,
        });

        expect(result.isValid).to.be.false;
      });

      it("should validate memorable type without length", () => {
        const result = service.validateConfig({
          type: "memorable",
          iteration: 4,
        });

        expect(result.isValid).to.be.true;
      });
    });

    describe("getSupportedTypes", () => {
      let service;

      beforeEach(() => {
        const mock = new MockRandomGenerator([0]);
        service = createService({}, { randomGenerator: mock });
      });

      it("should return array of supported types", () => {
        const types = service.getSupportedTypes();
        expect(types).to.be.an("array");
      });

      it("should include strong, base64, and memorable", () => {
        const types = service.getSupportedTypes();
        expect(types).to.include("strong");
        expect(types).to.include("base64");
        expect(types).to.include("memorable");
      });

      it("should return a copy not the original", () => {
        const types1 = service.getSupportedTypes();
        const types2 = service.getSupportedTypes();
        expect(types1).to.not.equal(types2);
        expect(types1).to.deep.equal(types2);
      });
    });

    describe("getGenerator", () => {
      let service;

      beforeEach(() => {
        const mock = new MockRandomGenerator([0]);
        service = createService({}, { randomGenerator: mock });
      });

      it("should return generator for strong type", () => {
        const generator = service.getGenerator("strong");
        expect(generator).to.be.an("object");
        expect(generator.generate).to.be.a("function");
        expect(generator.calculateEntropy).to.be.a("function");
      });

      it("should return generator for base64 type", () => {
        const generator = service.getGenerator("base64");
        expect(generator).to.be.an("object");
        expect(generator.generate).to.be.a("function");
      });

      it("should return generator for memorable type", () => {
        const generator = service.getGenerator("memorable");
        expect(generator).to.be.an("object");
        expect(generator.generate).to.be.a("function");
      });

      it("should return null for unknown type", () => {
        const generator = service.getGenerator("unknown");
        expect(generator).to.be.null;
      });
    });

    describe("getPorts", () => {
      it("should return all resolved ports", () => {
        const mock = new MockRandomGenerator([0]);
        const logger = new NoOpLogger();
        const storage = new MemoryStorage();
        const clock = new FixedClock();
        const dictionary = new MemoryDictionary([]);

        const service = createService({}, {
          randomGenerator: mock,
          logger,
          storage,
          clock,
          dictionary,
        });

        const ports = service.getPorts();

        expect(ports.randomGenerator).to.equal(mock);
        expect(ports.logger).to.equal(logger);
        expect(ports.storage).to.equal(storage);
        expect(ports.clock).to.equal(clock);
        expect(ports.dictionary).to.equal(dictionary);
      });

      it("should return a copy not the original", () => {
        const mock = new MockRandomGenerator([0]);
        const service = createService({}, { randomGenerator: mock });

        const ports1 = service.getPorts();
        const ports2 = service.getPorts();

        expect(ports1).to.not.equal(ports2);
        expect(ports1.randomGenerator).to.equal(ports2.randomGenerator);
      });
    });
  });

  describe("createQuickService", () => {
    it("should create service with just randomGenerator", () => {
      const mock = new MockRandomGenerator([0, 1, 2, 3]);
      const service = createQuickService(mock);
      expect(service).to.be.an("object");
    });

    it("should be able to generate passwords", async () => {
      const mock = new MockRandomGenerator(Array.from({ length: 100 }, (_, i) => i));
      const service = createQuickService(mock);

      const password = await service.generate({
        type: "strong",
        length: 8,
        iteration: 1,
        separator: "-",
      });

      expect(password).to.have.lengthOf(8);
    });

    it("should have default ports", () => {
      const mock = new MockRandomGenerator([0]);
      const service = createQuickService(mock);
      const ports = service.getPorts();

      expect(ports.logger).to.be.instanceOf(NoOpLogger);
      expect(ports.storage).to.be.instanceOf(MemoryStorage);
      expect(ports.clock).to.be.instanceOf(FixedClock);
      expect(ports.dictionary).to.be.instanceOf(MemoryDictionary);
    });
  });
});
