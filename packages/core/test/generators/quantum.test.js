// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * @fileoverview Comprehensive tests for quantum-resistant password generation
 *
 * This test suite validates:
 * - 256-bit entropy targets (NIST SP 800-63B recommendations)
 * - Correct entropy calculations
 * - Password generation with mock random generator
 * - Quantum security validation
 */

import { expect } from "chai";
import { describe, it } from "mocha";
import {
  generateQuantumChunk,
  generateQuantumPassword,
  calculateQuantumPasswordEntropy,
  validateQuantumSecurity,
  QUANTUM_MIN_LENGTH,
} from "../../src/generators/quantum.js";

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

describe("Quantum-Resistant Generator", () => {
  describe("QUANTUM_MIN_LENGTH", () => {
    it("should be at least 43 for 256-bit entropy with base64", () => {
      // log2(64) = 6 bits per char, 256/6 ≈ 42.67, ceil = 43
      expect(QUANTUM_MIN_LENGTH).to.be.at.least(43);
    });

    it("should be a positive integer", () => {
      expect(QUANTUM_MIN_LENGTH).to.be.a("number");
      expect(Number.isInteger(QUANTUM_MIN_LENGTH)).to.be.true;
      expect(QUANTUM_MIN_LENGTH).to.be.greaterThan(0);
    });
  });

  describe("generateQuantumChunk", () => {
    it("should generate a string of specified length", async () => {
      const mock = new MockRandomGenerator(Array.from({ length: 100 }, (_, i) => i));
      const result = await generateQuantumChunk(10, mock);
      expect(result).to.be.a("string");
      expect(result).to.have.lengthOf(10);
    });

    it("should generate different results with different random sequences", async () => {
      const mock1 = new MockRandomGenerator([0, 1, 2, 3, 4]);
      const mock2 = new MockRandomGenerator([5, 6, 7, 8, 9]);

      const result1 = await generateQuantumChunk(5, mock1);
      const result2 = await generateQuantumChunk(5, mock2);

      expect(result1).to.not.equal(result2);
    });

    it("should throw for non-positive length", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateQuantumChunk(0, mock);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("length");
      }
    });

    it("should throw for negative length", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateQuantumChunk(-5, mock);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("length");
      }
    });

    it("should use only base64 characters", async () => {
      const mock = new MockRandomGenerator(Array.from({ length: 100 }, (_, i) => i));
      const result = await generateQuantumChunk(50, mock);

      // Base64 charset: A-Z, a-z, 0-9, +, /
      const base64Regex = /^[A-Za-z0-9+/]+$/;
      expect(base64Regex.test(result)).to.be.true;
    });

    it("should generate quantum-minimum length password", async () => {
      const mock = new MockRandomGenerator(Array.from({ length: 100 }, (_, i) => i));
      const result = await generateQuantumChunk(QUANTUM_MIN_LENGTH, mock);
      expect(result).to.have.lengthOf(QUANTUM_MIN_LENGTH);
    });
  });

  describe("generateQuantumPassword", () => {
    it("should generate password with single iteration", async () => {
      const mock = new MockRandomGenerator(Array.from({ length: 100 }, (_, i) => i));
      const result = await generateQuantumPassword(
        { length: 43, iteration: 1, separator: "-" },
        mock
      );
      expect(result).to.have.lengthOf(43);
    });

    it("should generate password with multiple iterations", async () => {
      const mock = new MockRandomGenerator(Array.from({ length: 200 }, (_, i) => i));
      const result = await generateQuantumPassword(
        { length: 20, iteration: 3, separator: "-" },
        mock
      );

      const parts = result.split("-");
      expect(parts).to.have.lengthOf(3);
      expect(parts[0]).to.have.lengthOf(20);
      expect(parts[1]).to.have.lengthOf(20);
      expect(parts[2]).to.have.lengthOf(20);
    });

    it("should use specified separator", async () => {
      const mock = new MockRandomGenerator(Array.from({ length: 200 }, (_, i) => i));
      const result = await generateQuantumPassword(
        { length: 10, iteration: 2, separator: "---" },
        mock
      );
      expect(result).to.include("---");
    });

    it("should work with empty separator", async () => {
      const mock = new MockRandomGenerator(Array.from({ length: 200 }, (_, i) => i));
      const result = await generateQuantumPassword(
        { length: 10, iteration: 2, separator: "" },
        mock
      );
      expect(result).to.have.lengthOf(20);
      expect(result).to.not.include("-");
    });

    it("should throw for invalid length", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateQuantumPassword({ length: 0, iteration: 1, separator: "-" }, mock);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("length");
      }
    });

    it("should throw for invalid iteration", async () => {
      const mock = new MockRandomGenerator([0]);
      try {
        await generateQuantumPassword({ length: 43, iteration: 0, separator: "-" }, mock);
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("iteration");
      }
    });
  });

  describe("calculateQuantumPasswordEntropy", () => {
    it("should calculate entropy correctly for minimum quantum length", () => {
      const entropy = calculateQuantumPasswordEntropy({ length: 43, iteration: 1 });
      // 43 * 1 * 6 = 258 bits
      expect(entropy).to.equal(258);
    });

    it("should scale linearly with length", () => {
      const entropy1 = calculateQuantumPasswordEntropy({ length: 10, iteration: 1 });
      const entropy2 = calculateQuantumPasswordEntropy({ length: 20, iteration: 1 });
      expect(entropy2).to.equal(entropy1 * 2);
    });

    it("should scale linearly with iteration", () => {
      const entropy1 = calculateQuantumPasswordEntropy({ length: 10, iteration: 1 });
      const entropy2 = calculateQuantumPasswordEntropy({ length: 10, iteration: 3 });
      expect(entropy2).to.equal(entropy1 * 3);
    });

    it("should calculate 6 bits per character (base64)", () => {
      const entropy = calculateQuantumPasswordEntropy({ length: 1, iteration: 1 });
      expect(entropy).to.equal(6);
    });

    it("should meet 256-bit target for quantum-minimum config", () => {
      const entropy = calculateQuantumPasswordEntropy({
        length: QUANTUM_MIN_LENGTH,
        iteration: 1,
      });
      expect(entropy).to.be.at.least(256);
    });

    it("should exceed target with multiple iterations", () => {
      const entropy = calculateQuantumPasswordEntropy({
        length: QUANTUM_MIN_LENGTH,
        iteration: 2,
      });
      expect(entropy).to.be.at.least(512);
    });
  });

  describe("validateQuantumSecurity", () => {
    it("should return isQuantumSafe true for adequate config", () => {
      const result = validateQuantumSecurity({ length: 43, iteration: 1 });
      expect(result.isQuantumSafe).to.be.true;
    });

    it("should return isQuantumSafe false for inadequate config", () => {
      const result = validateQuantumSecurity({ length: 10, iteration: 1 });
      expect(result.isQuantumSafe).to.be.false;
    });

    it("should return correct entropy bits", () => {
      const result = validateQuantumSecurity({ length: 43, iteration: 1 });
      expect(result.entropyBits).to.equal(258);
    });

    it("should return recommended minimum length", () => {
      const result = validateQuantumSecurity({ length: 10, iteration: 1 });
      expect(result.recommendedMinLength).to.equal(QUANTUM_MIN_LENGTH);
    });

    it("should return 256-bit target", () => {
      const result = validateQuantumSecurity({ length: 10, iteration: 1 });
      expect(result.target).to.equal(256);
    });

    it("should mark short password with many iterations as safe if total entropy meets target", () => {
      // 20 * 3 * 6 = 360 bits > 256
      const result = validateQuantumSecurity({ length: 20, iteration: 3 });
      expect(result.isQuantumSafe).to.be.true;
      expect(result.entropyBits).to.equal(360);
    });

    it("should mark config just below threshold as unsafe", () => {
      // 42 * 1 * 6 = 252 bits < 256
      const result = validateQuantumSecurity({ length: 42, iteration: 1 });
      expect(result.isQuantumSafe).to.be.false;
      expect(result.entropyBits).to.equal(252);
    });

    it("should mark config just above threshold as safe", () => {
      // 43 * 1 * 6 = 258 bits >= 256
      const result = validateQuantumSecurity({ length: 43, iteration: 1 });
      expect(result.isQuantumSafe).to.be.true;
      expect(result.entropyBits).to.equal(258);
    });
  });

  describe("Integration tests", () => {
    it("should generate valid quantum-resistant password", async () => {
      const mock = new MockRandomGenerator(
        Array.from({ length: 200 }, () => Math.floor(Math.random() * 64))
      );
      const config = { length: QUANTUM_MIN_LENGTH, iteration: 1, separator: "-" };

      const password = await generateQuantumPassword(config, mock);
      const validation = validateQuantumSecurity(config);

      expect(password).to.have.lengthOf(QUANTUM_MIN_LENGTH);
      expect(validation.isQuantumSafe).to.be.true;
    });

    it("should generate multi-chunk quantum password", async () => {
      const mock = new MockRandomGenerator(
        Array.from({ length: 500 }, () => Math.floor(Math.random() * 64))
      );
      const config = { length: 32, iteration: 3, separator: "-" };

      const password = await generateQuantumPassword(config, mock);
      const validation = validateQuantumSecurity(config);

      expect(password.split("-")).to.have.lengthOf(3);
      // 32 * 3 * 6 = 576 bits
      expect(validation.entropyBits).to.equal(576);
      expect(validation.isQuantumSafe).to.be.true;
    });

    it("should calculate consistent entropy", () => {
      const configs = [
        { length: 43, iteration: 1 },
        { length: 64, iteration: 2 },
        { length: 32, iteration: 4 },
      ];

      configs.forEach((config) => {
        const calculated = calculateQuantumPasswordEntropy(config);
        const validated = validateQuantumSecurity(config);
        expect(calculated).to.equal(validated.entropyBits);
      });
    });
  });
});
