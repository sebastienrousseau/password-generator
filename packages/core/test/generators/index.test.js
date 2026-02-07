// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it } from "mocha";
import {
  generate,
  getGenerator,
  GENERATOR_REGISTRY,
  generateChunk,
  generateStrongPassword,
  calculateStrongPasswordEntropy,
  generateBase64Chunk,
  generateBase64Password,
  calculateBase64PasswordEntropy,
  generateMemorablePassword,
  calculateMemorablePasswordEntropy,
  generatePassphrase,
} from "../../src/generators/index.js";
import { MemoryDictionary, DEFAULT_WORD_LIST } from "../../src/ports/DictionaryPort.js";

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

describe("Generators: index", () => {
  describe("GENERATOR_REGISTRY", () => {
    it("should have strong generator", () => {
      expect(GENERATOR_REGISTRY.strong).to.be.an("object");
      expect(GENERATOR_REGISTRY.strong.generate).to.be.a("function");
      expect(GENERATOR_REGISTRY.strong.calculateEntropy).to.be.a("function");
    });

    it("should have base64 generator", () => {
      expect(GENERATOR_REGISTRY.base64).to.be.an("object");
      expect(GENERATOR_REGISTRY.base64.generate).to.be.a("function");
      expect(GENERATOR_REGISTRY.base64.calculateEntropy).to.be.a("function");
    });

    it("should have memorable generator", () => {
      expect(GENERATOR_REGISTRY.memorable).to.be.an("object");
      expect(GENERATOR_REGISTRY.memorable.generate).to.be.a("function");
      expect(GENERATOR_REGISTRY.memorable.calculateEntropy).to.be.a("function");
    });

    it("should have exactly 3 generators", () => {
      expect(Object.keys(GENERATOR_REGISTRY)).to.have.lengthOf(3);
    });
  });

  describe("getGenerator", () => {
    it("should return strong generator", () => {
      const generator = getGenerator("strong");
      expect(generator).to.equal(GENERATOR_REGISTRY.strong);
    });

    it("should return base64 generator", () => {
      const generator = getGenerator("base64");
      expect(generator).to.equal(GENERATOR_REGISTRY.base64);
    });

    it("should return memorable generator", () => {
      const generator = getGenerator("memorable");
      expect(generator).to.equal(GENERATOR_REGISTRY.memorable);
    });

    it("should throw for invalid type", () => {
      expect(() => getGenerator("invalid")).to.throw(Error, "Unknown password type");
    });

    it("should throw with type name in error", () => {
      try {
        getGenerator("foobar");
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("foobar");
      }
    });
  });

  describe("generate", () => {
    describe("strong type", () => {
      it("should generate strong password", async () => {
        const mock = new MockRandomGenerator(Array.from({ length: 100 }, (_, i) => i));
        const result = await generate(
          { type: "strong", length: 8, iteration: 2, separator: "-" },
          { randomGenerator: mock }
        );

        expect(result.split("-")).to.have.lengthOf(2);
        expect(result.split("-")[0]).to.have.lengthOf(8);
      });
    });

    describe("base64 type", () => {
      it("should generate base64 password", async () => {
        const mock = new MockRandomGenerator(Array.from({ length: 100 }, (_, i) => i));
        const result = await generate(
          { type: "base64", length: 16, iteration: 1, separator: "-" },
          { randomGenerator: mock }
        );

        expect(result).to.have.lengthOf(16);
      });
    });

    describe("memorable type", () => {
      it("should generate memorable password", async () => {
        const mock = new MockRandomGenerator([0, 1, 2, 3]);
        const dict = new MemoryDictionary(DEFAULT_WORD_LIST);
        const result = await generate(
          { type: "memorable", iteration: 4, separator: "-" },
          { randomGenerator: mock, dictionary: dict }
        );

        expect(result.split("-")).to.have.lengthOf(4);
      });

      it("should throw when dictionary is missing", async () => {
        const mock = new MockRandomGenerator([0]);
        try {
          await generate(
            { type: "memorable", iteration: 4, separator: "-" },
            { randomGenerator: mock }
          );
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.include("DictionaryPort is required");
        }
      });
    });

    describe("invalid type", () => {
      it("should throw for unknown type", async () => {
        const mock = new MockRandomGenerator([0]);
        try {
          await generate(
            { type: "unknown", length: 8, iteration: 1, separator: "-" },
            { randomGenerator: mock }
          );
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.include("Unknown password type");
        }
      });
    });
  });

  describe("Re-exports from strong.js", () => {
    it("should export generateChunk", () => {
      expect(generateChunk).to.be.a("function");
    });

    it("should export generateStrongPassword", () => {
      expect(generateStrongPassword).to.be.a("function");
    });

    it("should export calculateStrongPasswordEntropy", () => {
      expect(calculateStrongPasswordEntropy).to.be.a("function");
    });
  });

  describe("Re-exports from base64.js", () => {
    it("should export generateBase64Chunk", () => {
      expect(generateBase64Chunk).to.be.a("function");
    });

    it("should export generateBase64Password", () => {
      expect(generateBase64Password).to.be.a("function");
    });

    it("should export calculateBase64PasswordEntropy", () => {
      expect(calculateBase64PasswordEntropy).to.be.a("function");
    });
  });

  describe("Re-exports from memorable.js", () => {
    it("should export generateMemorablePassword", () => {
      expect(generateMemorablePassword).to.be.a("function");
    });

    it("should export calculateMemorablePasswordEntropy", () => {
      expect(calculateMemorablePasswordEntropy).to.be.a("function");
    });

    it("should export generatePassphrase", () => {
      expect(generatePassphrase).to.be.a("function");
    });
  });
});
