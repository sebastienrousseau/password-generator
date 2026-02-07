// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import {
  generateBase64Chunk,
  generateBase64Password,
  calculateBase64PasswordEntropy,
} from "../../src/generators/base64.js";
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

describe("Generators: base64", () => {
  describe("generateBase64Chunk", () => {
    it("should generate a string of specified length", async () => {
      const mock = new MockRandomGenerator([0, 1, 2, 3, 4, 5, 6, 7]);
      const result = await generateBase64Chunk(8, mock);
      expect(result).to.have.lengthOf(8);
    });

    it("should only contain BASE64 characters", async () => {
      const mock = new MockRandomGenerator([0, 10, 20, 30, 40, 50, 60, 63]);
      const result = await generateBase64Chunk(8, mock);
      for (const char of result) {
        expect(BASE64_CHARSET).to.include(char);
      }
    });

    it("should use random generator to select characters", async () => {
      // Sequence [0, 1, 2] maps to characters A, B, C
      const mock = new MockRandomGenerator([0, 1, 2]);
      const result = await generateBase64Chunk(3, mock);
      expect(result).to.equal("ABC");
    });

    it("should generate deterministic output with same sequence", async () => {
      const sequence = [5, 10, 15, 20, 25];
      const mock1 = new MockRandomGenerator(sequence);
      const mock2 = new MockRandomGenerator(sequence);

      const result1 = await generateBase64Chunk(5, mock1);
      const result2 = await generateBase64Chunk(5, mock2);

      expect(result1).to.equal(result2);
    });

    it("should throw RangeError for zero length", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateBase64Chunk(0, mock);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should throw RangeError for negative length", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateBase64Chunk(-5, mock);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should throw RangeError for non-integer length", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateBase64Chunk(5.5, mock);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should handle length of 1", async () => {
      const mock = new MockRandomGenerator([0]);
      const result = await generateBase64Chunk(1, mock);
      expect(result).to.have.lengthOf(1);
      expect(result).to.equal("A");
    });

    it("should handle large lengths", async () => {
      const sequence = Array.from({ length: 100 }, (_, i) => i % 64);
      const mock = new MockRandomGenerator(sequence);
      const result = await generateBase64Chunk(100, mock);
      expect(result).to.have.lengthOf(100);
    });

    it("should generate all possible BASE64 characters", async () => {
      const sequence = Array.from({ length: 64 }, (_, i) => i);
      const mock = new MockRandomGenerator(sequence);
      const result = await generateBase64Chunk(64, mock);
      expect(result).to.equal(BASE64_CHARSET);
    });
  });

  describe("generateBase64Password", () => {
    it("should generate password with single chunk", async () => {
      const mock = new MockRandomGenerator([0, 1, 2, 3]);
      const result = await generateBase64Password(
        { length: 4, iteration: 1, separator: "-" },
        mock
      );
      expect(result).to.equal("ABCD");
    });

    it("should generate password with multiple chunks separated by separator", async () => {
      const mock = new MockRandomGenerator([0, 1, 2, 3, 4, 5, 6, 7]);
      const result = await generateBase64Password(
        { length: 4, iteration: 2, separator: "-" },
        mock
      );
      expect(result).to.equal("ABCD-EFGH");
    });

    it("should use custom separator", async () => {
      const mock = new MockRandomGenerator([0, 1, 2, 3, 4, 5]);
      const result = await generateBase64Password(
        { length: 3, iteration: 2, separator: "." },
        mock
      );
      expect(result).to.equal("ABC.DEF");
    });

    it("should use empty separator", async () => {
      const mock = new MockRandomGenerator([0, 1, 2, 3]);
      const result = await generateBase64Password(
        { length: 2, iteration: 2, separator: "" },
        mock
      );
      expect(result).to.equal("ABCD");
    });

    it("should use multi-character separator", async () => {
      const mock = new MockRandomGenerator([0, 1, 2, 3, 4, 5]);
      const result = await generateBase64Password(
        { length: 3, iteration: 2, separator: " :: " },
        mock
      );
      expect(result).to.equal("ABC :: DEF");
    });

    it("should generate deterministic output", async () => {
      const sequence = [10, 20, 30, 40, 50, 60];
      const mock1 = new MockRandomGenerator(sequence);
      const mock2 = new MockRandomGenerator(sequence);

      const result1 = await generateBase64Password(
        { length: 3, iteration: 2, separator: "-" },
        mock1
      );
      const result2 = await generateBase64Password(
        { length: 3, iteration: 2, separator: "-" },
        mock2
      );

      expect(result1).to.equal(result2);
    });

    it("should throw RangeError for zero length", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateBase64Password(
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
        await generateBase64Password(
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
        await generateBase64Password(
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
        await generateBase64Password(
          { length: 4, iteration: -2, separator: "-" },
          mock
        );
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should throw RangeError for non-integer length", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateBase64Password(
          { length: 4.5, iteration: 1, separator: "-" },
          mock
        );
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should throw RangeError for non-integer iteration", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateBase64Password(
          { length: 4, iteration: 1.5, separator: "-" },
          mock
        );
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should handle many iterations", async () => {
      const sequence = Array.from({ length: 100 }, (_, i) => i);
      const mock = new MockRandomGenerator(sequence);
      const result = await generateBase64Password(
        { length: 4, iteration: 5, separator: "-" },
        mock
      );

      const chunks = result.split("-");
      expect(chunks).to.have.lengthOf(5);
      chunks.forEach(chunk => {
        expect(chunk).to.have.lengthOf(4);
      });
    });
  });

  describe("calculateBase64PasswordEntropy", () => {
    it("should calculate entropy for single character", () => {
      const entropy = calculateBase64PasswordEntropy({ length: 1, iteration: 1 });
      expect(entropy).to.equal(6); // log2(64) = 6 bits
    });

    it("should calculate entropy for 16 characters", () => {
      const entropy = calculateBase64PasswordEntropy({ length: 16, iteration: 1 });
      expect(entropy).to.equal(96); // 16 * 6 = 96 bits
    });

    it("should scale with iteration count", () => {
      const entropy = calculateBase64PasswordEntropy({ length: 16, iteration: 4 });
      expect(entropy).to.equal(384); // 16 * 6 * 4 = 384 bits
    });

    it("should calculate correct entropy for various configurations", () => {
      expect(calculateBase64PasswordEntropy({ length: 8, iteration: 1 })).to.equal(48);
      expect(calculateBase64PasswordEntropy({ length: 8, iteration: 2 })).to.equal(96);
      expect(calculateBase64PasswordEntropy({ length: 12, iteration: 3 })).to.equal(216);
      expect(calculateBase64PasswordEntropy({ length: 20, iteration: 1 })).to.equal(120);
    });

    it("should be based on BASE64_CHARSET length", () => {
      const bitsPerChar = Math.log2(BASE64_CHARSET.length);
      const entropy = calculateBase64PasswordEntropy({ length: 10, iteration: 2 });
      expect(entropy).to.equal(10 * 2 * bitsPerChar);
    });

    it("should match strong password entropy calculation", () => {
      // Base64 and strong passwords use the same charset
      const config = { length: 16, iteration: 4 };
      const base64Entropy = calculateBase64PasswordEntropy(config);
      expect(base64Entropy).to.equal(384);
    });

    it("should handle large configurations", () => {
      const entropy = calculateBase64PasswordEntropy({ length: 100, iteration: 10 });
      expect(entropy).to.equal(6000); // 100 * 10 * 6 = 6000 bits
    });

    it("should handle fractional entropy results correctly", () => {
      // Each character contributes exactly 6 bits (log2(64) = 6)
      const entropy = calculateBase64PasswordEntropy({ length: 5, iteration: 3 });
      expect(entropy).to.equal(90); // 5 * 3 * 6 = 90 bits
    });
  });
});
