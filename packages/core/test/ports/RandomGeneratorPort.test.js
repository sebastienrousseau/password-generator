// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import {
  RandomGeneratorPort,
  RANDOM_GENERATOR_REQUIRED_METHODS,
  RANDOM_GENERATOR_OPTIONAL_METHODS,
} from "../../src/ports/RandomGeneratorPort.js";

describe("Ports: RandomGeneratorPort", () => {
  describe("RandomGeneratorPort base class", () => {
    let port;

    beforeEach(() => {
      port = new RandomGeneratorPort();
    });

    it("should be a class", () => {
      expect(RandomGeneratorPort).to.be.a("function");
      expect(port).to.be.instanceOf(RandomGeneratorPort);
    });

    describe("generateRandomBytes", () => {
      it("should throw Error indicating method must be implemented", async () => {
        try {
          await port.generateRandomBytes(16);
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.include("must be implemented");
          expect(e.message).to.include("generateRandomBytes");
        }
      });
    });

    describe("generateRandomInt", () => {
      it("should throw Error indicating method must be implemented", async () => {
        try {
          await port.generateRandomInt(100);
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.include("must be implemented");
          expect(e.message).to.include("generateRandomInt");
        }
      });
    });

    describe("generateRandomBase64", () => {
      it("should throw Error indicating method must be implemented", async () => {
        try {
          await port.generateRandomBase64(16);
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.include("must be implemented");
          expect(e.message).to.include("generateRandomBase64");
        }
      });
    });

    describe("generateRandomString", () => {
      it("should throw Error indicating method must be implemented", async () => {
        try {
          await port.generateRandomString(10, "abc");
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.include("must be implemented");
          expect(e.message).to.include("generateRandomString");
        }
      });
    });
  });

  describe("RANDOM_GENERATOR_REQUIRED_METHODS", () => {
    it("should be an array", () => {
      expect(RANDOM_GENERATOR_REQUIRED_METHODS).to.be.an("array");
    });

    it("should contain generateRandomBytes", () => {
      expect(RANDOM_GENERATOR_REQUIRED_METHODS).to.include("generateRandomBytes");
    });

    it("should contain generateRandomInt", () => {
      expect(RANDOM_GENERATOR_REQUIRED_METHODS).to.include("generateRandomInt");
    });

    it("should have exactly 2 required methods", () => {
      expect(RANDOM_GENERATOR_REQUIRED_METHODS).to.have.lengthOf(2);
    });
  });

  describe("RANDOM_GENERATOR_OPTIONAL_METHODS", () => {
    it("should be an array", () => {
      expect(RANDOM_GENERATOR_OPTIONAL_METHODS).to.be.an("array");
    });

    it("should contain generateRandomBase64", () => {
      expect(RANDOM_GENERATOR_OPTIONAL_METHODS).to.include("generateRandomBase64");
    });

    it("should contain generateRandomString", () => {
      expect(RANDOM_GENERATOR_OPTIONAL_METHODS).to.include("generateRandomString");
    });

    it("should have exactly 2 optional methods", () => {
      expect(RANDOM_GENERATOR_OPTIONAL_METHODS).to.have.lengthOf(2);
    });
  });

  describe("Mock implementation example", () => {
    class MockRandomGenerator extends RandomGeneratorPort {
      constructor(sequence = []) {
        super();
        this.sequence = sequence;
        this.index = 0;
      }

      async generateRandomBytes(byteLength) {
        const bytes = new Uint8Array(byteLength);
        for (let i = 0; i < byteLength; i++) {
          bytes[i] = this.sequence[this.index++ % this.sequence.length];
        }
        return bytes;
      }

      async generateRandomInt(max) {
        return this.sequence[this.index++ % this.sequence.length] % max;
      }

      async generateRandomBase64(byteLength) {
        const bytes = await this.generateRandomBytes(byteLength);
        // Simple mock - just return fixed string
        return "AAAA";
      }

      async generateRandomString(length, charset) {
        let result = "";
        for (let i = 0; i < length; i++) {
          const idx = await this.generateRandomInt(charset.length);
          result += charset[idx];
        }
        return result;
      }
    }

    it("should be able to create mock implementation", () => {
      const mock = new MockRandomGenerator([0, 1, 2, 3]);
      expect(mock).to.be.instanceOf(RandomGeneratorPort);
    });

    it("should generate deterministic random bytes", async () => {
      const mock = new MockRandomGenerator([10, 20, 30, 40]);
      const bytes = await mock.generateRandomBytes(4);
      expect(bytes).to.deep.equal(new Uint8Array([10, 20, 30, 40]));
    });

    it("should generate deterministic random integers", async () => {
      const mock = new MockRandomGenerator([5, 15, 25]);
      expect(await mock.generateRandomInt(10)).to.equal(5);
      expect(await mock.generateRandomInt(10)).to.equal(5); // 15 % 10
      expect(await mock.generateRandomInt(10)).to.equal(5); // 25 % 10
    });

    it("should wrap around sequence", async () => {
      const mock = new MockRandomGenerator([1, 2]);
      expect(await mock.generateRandomInt(100)).to.equal(1);
      expect(await mock.generateRandomInt(100)).to.equal(2);
      expect(await mock.generateRandomInt(100)).to.equal(1); // Wraps
    });

    it("should generate deterministic random strings", async () => {
      const mock = new MockRandomGenerator([0, 1, 2]);
      const result = await mock.generateRandomString(3, "ABC");
      expect(result).to.equal("ABC");
    });
  });
});
