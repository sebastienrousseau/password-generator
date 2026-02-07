// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it } from "mocha";
import {
  PASSWORD_TYPES,
  GENERATION_STRATEGIES,
  VALID_PASSWORD_TYPES,
  isValidPasswordType,
  PASSWORD_TYPE_METADATA,
  validatePasswordTypeConfig,
  getExpectedEntropy,
} from "../../src/domain/password-types.js";

describe("Domain: password-types", () => {
  describe("PASSWORD_TYPES", () => {
    it("should have STRONG type", () => {
      expect(PASSWORD_TYPES.STRONG).to.equal("strong");
    });

    it("should have BASE64 type", () => {
      expect(PASSWORD_TYPES.BASE64).to.equal("base64");
    });

    it("should have MEMORABLE type", () => {
      expect(PASSWORD_TYPES.MEMORABLE).to.equal("memorable");
    });

    it("should have QUANTUM type", () => {
      expect(PASSWORD_TYPES.QUANTUM).to.equal("quantum-resistant");
    });

    it("should have exactly 4 types", () => {
      expect(Object.keys(PASSWORD_TYPES)).to.have.lengthOf(4);
    });
  });

  describe("GENERATION_STRATEGIES", () => {
    it("should have BASE64 strategy", () => {
      expect(GENERATION_STRATEGIES.BASE64).to.equal("base64");
    });

    it("should have BASE64_CHUNK strategy", () => {
      expect(GENERATION_STRATEGIES.BASE64_CHUNK).to.equal("base64-chunk");
    });

    it("should have SYLLABLE strategy", () => {
      expect(GENERATION_STRATEGIES.SYLLABLE).to.equal("syllable");
    });

    it("should have DICTIONARY strategy", () => {
      expect(GENERATION_STRATEGIES.DICTIONARY).to.equal("dictionary");
    });
  });

  describe("VALID_PASSWORD_TYPES", () => {
    it("should be an array", () => {
      expect(VALID_PASSWORD_TYPES).to.be.an("array");
    });

    it("should contain strong, base64, memorable, and quantum-resistant", () => {
      expect(VALID_PASSWORD_TYPES).to.include("strong");
      expect(VALID_PASSWORD_TYPES).to.include("base64");
      expect(VALID_PASSWORD_TYPES).to.include("memorable");
      expect(VALID_PASSWORD_TYPES).to.include("quantum-resistant");
    });

    it("should have exactly 4 types", () => {
      expect(VALID_PASSWORD_TYPES).to.have.lengthOf(4);
    });
  });

  describe("isValidPasswordType", () => {
    it("should return true for 'strong'", () => {
      expect(isValidPasswordType("strong")).to.be.true;
    });

    it("should return true for 'base64'", () => {
      expect(isValidPasswordType("base64")).to.be.true;
    });

    it("should return true for 'memorable'", () => {
      expect(isValidPasswordType("memorable")).to.be.true;
    });

    it("should return true for 'quantum-resistant'", () => {
      expect(isValidPasswordType("quantum-resistant")).to.be.true;
    });

    it("should return false for 'invalid'", () => {
      expect(isValidPasswordType("invalid")).to.be.false;
    });

    it("should return false for empty string", () => {
      expect(isValidPasswordType("")).to.be.false;
    });

    it("should return false for null", () => {
      expect(isValidPasswordType(null)).to.be.false;
    });

    it("should return false for undefined", () => {
      expect(isValidPasswordType(undefined)).to.be.false;
    });

    it("should return false for numbers", () => {
      expect(isValidPasswordType(123)).to.be.false;
    });

    it("should be case sensitive", () => {
      expect(isValidPasswordType("STRONG")).to.be.false;
      expect(isValidPasswordType("Strong")).to.be.false;
    });
  });

  describe("PASSWORD_TYPE_METADATA", () => {
    describe("STRONG metadata", () => {
      const metadata = PASSWORD_TYPE_METADATA.strong;

      it("should have a name", () => {
        expect(metadata.name).to.equal("Strong Password");
      });

      it("should have a description", () => {
        expect(metadata.description).to.be.a("string");
        expect(metadata.description.length).to.be.greaterThan(0);
      });

      it("should have minLength of 1", () => {
        expect(metadata.minLength).to.equal(1);
      });

      it("should have maxLength of 1024", () => {
        expect(metadata.maxLength).to.equal(1024);
      });

      it("should have entropyPerUnit of 6", () => {
        expect(metadata.entropyPerUnit).to.equal(6);
      });

      it("should have unitType of 'character'", () => {
        expect(metadata.unitType).to.equal("character");
      });

      it("should have a valid pattern regex", () => {
        expect(metadata.pattern).to.be.instanceOf(RegExp);
        expect(metadata.pattern.test("ABCabc123+/")).to.be.true;
      });

      it("should have useCases array", () => {
        expect(metadata.useCases).to.be.an("array");
        expect(metadata.useCases.length).to.be.greaterThan(0);
      });
    });

    describe("BASE64 metadata", () => {
      const metadata = PASSWORD_TYPE_METADATA.base64;

      it("should have a name", () => {
        expect(metadata.name).to.equal("Base64 Password");
      });

      it("should have minLength of 1", () => {
        expect(metadata.minLength).to.equal(1);
      });

      it("should have maxLength of 1024", () => {
        expect(metadata.maxLength).to.equal(1024);
      });

      it("should have entropyPerUnit of 6", () => {
        expect(metadata.entropyPerUnit).to.equal(6);
      });

      it("should have unitType of 'character'", () => {
        expect(metadata.unitType).to.equal("character");
      });
    });

    describe("MEMORABLE metadata", () => {
      const metadata = PASSWORD_TYPE_METADATA.memorable;

      it("should have a name", () => {
        expect(metadata.name).to.equal("Memorable Password");
      });

      it("should have minLength of 1", () => {
        expect(metadata.minLength).to.equal(1);
      });

      it("should have maxLength of 20", () => {
        expect(metadata.maxLength).to.equal(20);
      });

      it("should have null entropyPerUnit (depends on dictionary)", () => {
        expect(metadata.entropyPerUnit).to.be.null;
      });

      it("should have unitType of 'word'", () => {
        expect(metadata.unitType).to.equal("word");
      });

      it("should have null pattern", () => {
        expect(metadata.pattern).to.be.null;
      });
    });

    describe("QUANTUM metadata", () => {
      const metadata = PASSWORD_TYPE_METADATA["quantum-resistant"];

      it("should have a name", () => {
        expect(metadata.name).to.equal("Quantum-Resistant Password");
      });

      it("should have a description", () => {
        expect(metadata.description).to.be.a("string");
        expect(metadata.description.length).to.be.greaterThan(0);
      });

      it("should have minLength of 32", () => {
        expect(metadata.minLength).to.equal(32);
      });

      it("should have maxLength of 128", () => {
        expect(metadata.maxLength).to.equal(128);
      });

      it("should have entropyPerUnit of 6", () => {
        expect(metadata.entropyPerUnit).to.equal(6);
      });

      it("should have unitType of 'character'", () => {
        expect(metadata.unitType).to.equal("character");
      });

      it("should have a valid pattern regex", () => {
        expect(metadata.pattern).to.be.instanceOf(RegExp);
        expect(metadata.pattern.test("ABCabc123+/")).to.be.true;
      });

      it("should have useCases array", () => {
        expect(metadata.useCases).to.be.an("array");
        expect(metadata.useCases.length).to.be.greaterThan(0);
      });
    });
  });

  describe("validatePasswordTypeConfig", () => {
    describe("invalid type", () => {
      it("should return invalid for unknown type", () => {
        const result = validatePasswordTypeConfig("unknown", {});
        expect(result.isValid).to.be.false;
        expect(result.errors).to.have.lengthOf(1);
        expect(result.errors[0]).to.include("Invalid password type");
      });
    });

    describe("iteration validation", () => {
      it("should accept valid positive integer iteration", () => {
        const result = validatePasswordTypeConfig("strong", {
          iteration: 4,
          length: 16,
        });
        expect(result.isValid).to.be.true;
        expect(result.errors).to.have.lengthOf(0);
      });

      it("should reject zero iteration", () => {
        const result = validatePasswordTypeConfig("strong", {
          iteration: 0,
          length: 16,
        });
        expect(result.isValid).to.be.false;
        expect(result.errors.some(e => e.includes("Iteration"))).to.be.true;
      });

      it("should reject negative iteration", () => {
        const result = validatePasswordTypeConfig("strong", {
          iteration: -1,
          length: 16,
        });
        expect(result.isValid).to.be.false;
        expect(result.errors.some(e => e.includes("Iteration"))).to.be.true;
      });

      it("should reject non-integer iteration", () => {
        const result = validatePasswordTypeConfig("strong", {
          iteration: 1.5,
          length: 16,
        });
        expect(result.isValid).to.be.false;
        expect(result.errors.some(e => e.includes("Iteration"))).to.be.true;
      });

      it("should accept undefined iteration", () => {
        const result = validatePasswordTypeConfig("strong", {
          length: 16,
        });
        expect(result.isValid).to.be.true;
      });
    });

    describe("length validation for strong/base64", () => {
      it("should accept valid length", () => {
        const result = validatePasswordTypeConfig("strong", {
          length: 16,
          iteration: 1,
        });
        expect(result.isValid).to.be.true;
      });

      it("should accept minimum length of 1", () => {
        const result = validatePasswordTypeConfig("strong", {
          length: 1,
          iteration: 1,
        });
        expect(result.isValid).to.be.true;
      });

      it("should accept maximum length of 1024", () => {
        const result = validatePasswordTypeConfig("strong", {
          length: 1024,
          iteration: 1,
        });
        expect(result.isValid).to.be.true;
      });

      it("should reject zero length", () => {
        const result = validatePasswordTypeConfig("strong", {
          length: 0,
          iteration: 1,
        });
        expect(result.isValid).to.be.false;
        expect(result.errors.some(e => e.includes("Length"))).to.be.true;
      });

      it("should reject negative length", () => {
        const result = validatePasswordTypeConfig("strong", {
          length: -5,
          iteration: 1,
        });
        expect(result.isValid).to.be.false;
      });

      it("should reject length exceeding maximum", () => {
        const result = validatePasswordTypeConfig("strong", {
          length: 1025,
          iteration: 1,
        });
        expect(result.isValid).to.be.false;
        expect(result.errors.some(e => e.includes("exceed"))).to.be.true;
      });

      it("should reject non-integer length", () => {
        const result = validatePasswordTypeConfig("base64", {
          length: 16.5,
          iteration: 1,
        });
        expect(result.isValid).to.be.false;
      });
    });

    describe("length validation for memorable", () => {
      it("should not validate length for memorable type", () => {
        const result = validatePasswordTypeConfig("memorable", {
          length: 100, // This is ignored for memorable
          iteration: 4,
        });
        expect(result.isValid).to.be.true;
      });

      it("should accept memorable without length", () => {
        const result = validatePasswordTypeConfig("memorable", {
          iteration: 4,
        });
        expect(result.isValid).to.be.true;
      });
    });

    describe("length validation for quantum-resistant", () => {
      it("should accept valid length for quantum-resistant", () => {
        const result = validatePasswordTypeConfig("quantum-resistant", {
          length: 43,
          iteration: 1,
        });
        expect(result.isValid).to.be.true;
      });

      it("should accept minimum length of 32", () => {
        const result = validatePasswordTypeConfig("quantum-resistant", {
          length: 32,
          iteration: 1,
        });
        expect(result.isValid).to.be.true;
      });

      it("should accept maximum length of 128", () => {
        const result = validatePasswordTypeConfig("quantum-resistant", {
          length: 128,
          iteration: 1,
        });
        expect(result.isValid).to.be.true;
      });

      it("should reject length below minimum of 32", () => {
        const result = validatePasswordTypeConfig("quantum-resistant", {
          length: 16,
          iteration: 1,
        });
        expect(result.isValid).to.be.false;
        expect(result.errors.some(e => e.includes("at least"))).to.be.true;
      });

      it("should reject length exceeding maximum of 128", () => {
        const result = validatePasswordTypeConfig("quantum-resistant", {
          length: 200,
          iteration: 1,
        });
        expect(result.isValid).to.be.false;
        expect(result.errors.some(e => e.includes("exceed"))).to.be.true;
      });
    });

    describe("multiple errors", () => {
      it("should collect multiple validation errors", () => {
        const result = validatePasswordTypeConfig("strong", {
          length: -1,
          iteration: 0,
        });
        expect(result.isValid).to.be.false;
        expect(result.errors.length).to.be.greaterThan(1);
      });
    });
  });

  describe("getExpectedEntropy", () => {
    describe("strong type", () => {
      it("should calculate entropy correctly", () => {
        const entropy = getExpectedEntropy("strong", {
          length: 16,
          iteration: 1,
        });
        expect(entropy).to.equal(96); // 16 * 6 * 1
      });

      it("should scale with iteration", () => {
        const entropy = getExpectedEntropy("strong", {
          length: 16,
          iteration: 4,
        });
        expect(entropy).to.equal(384); // 16 * 6 * 4
      });

      it("should use default length of 16", () => {
        const entropy = getExpectedEntropy("strong", {
          iteration: 1,
        });
        expect(entropy).to.equal(96);
      });

      it("should use default iteration of 1", () => {
        const entropy = getExpectedEntropy("strong", {
          length: 16,
        });
        expect(entropy).to.equal(96);
      });
    });

    describe("base64 type", () => {
      it("should calculate entropy correctly", () => {
        const entropy = getExpectedEntropy("base64", {
          length: 20,
          iteration: 2,
        });
        expect(entropy).to.equal(240); // 20 * 6 * 2
      });
    });

    describe("memorable type", () => {
      it("should calculate entropy using default dictionary size", () => {
        const entropy = getExpectedEntropy("memorable", {
          iteration: 4,
        });
        const expected = 4 * Math.log2(7776);
        expect(entropy).to.be.closeTo(expected, 0.0001);
      });

      it("should use custom dictionary size", () => {
        const entropy = getExpectedEntropy("memorable", {
          iteration: 4,
          dictionarySize: 10000,
        });
        const expected = 4 * Math.log2(10000);
        expect(entropy).to.be.closeTo(expected, 0.0001);
      });
    });

    describe("quantum-resistant type", () => {
      it("should calculate entropy correctly", () => {
        const entropy = getExpectedEntropy("quantum-resistant", {
          length: 43,
          iteration: 1,
        });
        expect(entropy).to.equal(258); // 43 * 6 * 1
      });

      it("should scale with iteration", () => {
        const entropy = getExpectedEntropy("quantum-resistant", {
          length: 43,
          iteration: 2,
        });
        expect(entropy).to.equal(516); // 43 * 6 * 2
      });
    });

    describe("unknown type", () => {
      it("should return 0 for unknown type", () => {
        const entropy = getExpectedEntropy("unknown", {
          length: 16,
          iteration: 1,
        });
        expect(entropy).to.equal(0);
      });

      it("should return 0 for null metadata", () => {
        const entropy = getExpectedEntropy("nonexistent", {});
        expect(entropy).to.equal(0);
      });
    });
  });
});
