// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import {
  generateChunk,
  generateStrongPassword,
  calculateStrongPasswordEntropy,
} from "../../src/generators/strong.js";
import { BASE64_CHARSET } from "../../src/domain/charset.js";

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

describe("Generators: strong", () => {
  describe("generateChunk", () => {
    it("should generate a string of specified length", async () => {
      const mock = new MockRandomGenerator([0, 1, 2, 3, 4, 5, 6, 7]);
      const result = await generateChunk(8, mock);
      expect(result).to.have.lengthOf(8);
    });

    it("should only contain BASE64 characters", async () => {
      const mock = new MockRandomGenerator([0, 10, 20, 30, 40, 50, 60, 63]);
      const result = await generateChunk(8, mock);
      for (const char of result) {
        expect(BASE64_CHARSET).to.include(char);
      }
    });

    it("should use random generator to select characters", async () => {
      // Sequence [0, 1, 2] maps to characters A, B, C
      const mock = new MockRandomGenerator([0, 1, 2]);
      const result = await generateChunk(3, mock);
      expect(result).to.equal("ABC");
    });

    it("should generate deterministic output with same sequence", async () => {
      const sequence = [5, 10, 15, 20, 25];
      const mock1 = new MockRandomGenerator(sequence);
      const mock2 = new MockRandomGenerator(sequence);

      const result1 = await generateChunk(5, mock1);
      const result2 = await generateChunk(5, mock2);

      expect(result1).to.equal(result2);
    });

    it("should throw RangeError for zero length", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateChunk(0, mock);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should throw RangeError for negative length", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateChunk(-5, mock);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should throw RangeError for non-integer length", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateChunk(5.5, mock);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should handle length of 1", async () => {
      const mock = new MockRandomGenerator([0]);
      const result = await generateChunk(1, mock);
      expect(result).to.have.lengthOf(1);
      expect(result).to.equal("A");
    });

    it("should handle large lengths", async () => {
      const sequence = Array.from({ length: 100 }, (_, i) => i % 64);
      const mock = new MockRandomGenerator(sequence);
      const result = await generateChunk(100, mock);
      expect(result).to.have.lengthOf(100);
    });

    it("should wrap index in BASE64_CHARSET", async () => {
      // Index 63 is the last character '/'
      const mock = new MockRandomGenerator([63]);
      const result = await generateChunk(1, mock);
      expect(result).to.equal("/");
    });

    it("should modulo wrap large random values", async () => {
      // 64 % 64 = 0, so maps to 'A'
      const mock = new MockRandomGenerator([64]);
      const result = await generateChunk(1, mock);
      expect(result).to.equal("A");
    });
  });

  describe("generateStrongPassword", () => {
    it("should generate password with single chunk", async () => {
      const mock = new MockRandomGenerator([0, 1, 2, 3]);
      const result = await generateStrongPassword(
        { length: 4, iteration: 1, separator: "-" },
        mock
      );
      expect(result).to.equal("ABCD");
    });

    it("should generate password with multiple chunks separated by separator", async () => {
      const mock = new MockRandomGenerator([0, 1, 2, 3, 4, 5, 6, 7]);
      const result = await generateStrongPassword(
        { length: 4, iteration: 2, separator: "-" },
        mock
      );
      expect(result).to.equal("ABCD-EFGH");
    });

    it("should use custom separator", async () => {
      const mock = new MockRandomGenerator([0, 1, 2, 3, 4, 5]);
      const result = await generateStrongPassword(
        { length: 3, iteration: 2, separator: "_" },
        mock
      );
      expect(result).to.equal("ABC_DEF");
    });

    it("should use empty separator", async () => {
      const mock = new MockRandomGenerator([0, 1, 2, 3]);
      const result = await generateStrongPassword(
        { length: 2, iteration: 2, separator: "" },
        mock
      );
      expect(result).to.equal("ABCD");
    });

    it("should generate deterministic output", async () => {
      const sequence = [10, 20, 30, 40, 50, 60];
      const mock1 = new MockRandomGenerator(sequence);
      const mock2 = new MockRandomGenerator(sequence);

      const result1 = await generateStrongPassword(
        { length: 3, iteration: 2, separator: "-" },
        mock1
      );
      const result2 = await generateStrongPassword(
        { length: 3, iteration: 2, separator: "-" },
        mock2
      );

      expect(result1).to.equal(result2);
    });

    it("should throw RangeError for zero length", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateStrongPassword(
          { length: 0, iteration: 1, separator: "-" },
          mock
        );
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should throw RangeError for zero iteration", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateStrongPassword(
          { length: 4, iteration: 0, separator: "-" },
          mock
        );
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should throw RangeError for negative length", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateStrongPassword(
          { length: -5, iteration: 1, separator: "-" },
          mock
        );
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should throw RangeError for negative iteration", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateStrongPassword(
          { length: 4, iteration: -2, separator: "-" },
          mock
        );
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should handle 4 iterations (typical use case)", async () => {
      const sequence = Array.from({ length: 64 }, (_, i) => i);
      const mock = new MockRandomGenerator(sequence);
      const result = await generateStrongPassword(
        { length: 16, iteration: 4, separator: "-" },
        mock
      );

      const chunks = result.split("-");
      expect(chunks).to.have.lengthOf(4);
      chunks.forEach(chunk => {
        expect(chunk).to.have.lengthOf(16);
      });
    });
  });

  describe("calculateStrongPasswordEntropy", () => {
    it("should calculate entropy for single character", () => {
      const entropy = calculateStrongPasswordEntropy({ length: 1, iteration: 1 });
      expect(entropy).to.equal(6); // log2(64) = 6 bits
    });

    it("should calculate entropy for 16 characters", () => {
      const entropy = calculateStrongPasswordEntropy({ length: 16, iteration: 1 });
      expect(entropy).to.equal(96); // 16 * 6 = 96 bits
    });

    it("should scale with iteration count", () => {
      const entropy = calculateStrongPasswordEntropy({ length: 16, iteration: 4 });
      expect(entropy).to.equal(384); // 16 * 6 * 4 = 384 bits
    });

    it("should calculate correct entropy for various configurations", () => {
      expect(calculateStrongPasswordEntropy({ length: 8, iteration: 1 })).to.equal(48);
      expect(calculateStrongPasswordEntropy({ length: 8, iteration: 2 })).to.equal(96);
      expect(calculateStrongPasswordEntropy({ length: 12, iteration: 3 })).to.equal(216);
    });

    it("should be based on BASE64_CHARSET length", () => {
      const bitsPerChar = Math.log2(BASE64_CHARSET.length);
      const entropy = calculateStrongPasswordEntropy({ length: 10, iteration: 2 });
      expect(entropy).to.equal(10 * 2 * bitsPerChar);
    });
  });
});
