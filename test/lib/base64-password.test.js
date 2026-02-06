import { expect } from "chai";
import {
  generateRandomBase64String,
  splitBase64String,
  generatePassword,
} from "../../src/lib/base64-password.js";

describe("Base64 Password Generator", () => {
  describe("generateRandomBase64String", () => {
    it("should return a string", () => {
      const result = generateRandomBase64String(16);
      expect(result).to.be.a("string");
    });

    it("should contain only base64 characters", () => {
      const result = generateRandomBase64String(32);
      expect(result).to.match(/^[A-Za-z0-9+/=]+$/);
    });

    it("should generate different strings on each call", () => {
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        results.add(generateRandomBase64String(16));
      }
      expect(results.size).to.be.greaterThan(1);
    });
  });

  describe("splitBase64String", () => {
    it("should split a string into chunks of the specified length", () => {
      const result = splitBase64String("abcdefghijkl", 4);
      expect(result).to.deep.equal(["abcd", "efgh", "ijkl"]);
    });

    it("should handle strings not evenly divisible", () => {
      const result = splitBase64String("abcde", 2);
      expect(result).to.deep.equal(["ab", "cd", "e"]);
    });

    it("should return an empty array for an empty string", () => {
      const result = splitBase64String("", 4);
      expect(result).to.deep.equal([]);
    });
  });

  describe("generatePassword", () => {
    it("should return a string", () => {
      const result = generatePassword({ length: 8, iteration: 3, separator: "-" });
      expect(result).to.be.a("string");
    });

    it("should contain the correct number of chunks", () => {
      const result = generatePassword({ length: 8, iteration: 4, separator: "-" });
      const chunks = result.split("-");
      expect(chunks).to.have.lengthOf(4);
    });

    it("should use the specified separator", () => {
      const result = generatePassword({ length: 8, iteration: 2, separator: "." });
      expect(result).to.include(".");
    });

    it("should produce chunks of the specified length", () => {
      const length = 10;
      const result = generatePassword({ length, iteration: 3, separator: "-" });
      const chunks = result.split("-");
      chunks.forEach((chunk) => {
        expect(chunk).to.have.lengthOf(length);
      });
    });

    it("should work with a single iteration", () => {
      const result = generatePassword({ length: 16, iteration: 1, separator: "-" });
      expect(result).to.not.include("-");
    });

    it("should throw RangeError for length < 1", () => {
      expect(() => generatePassword({ length: 0, iteration: 3, separator: "-" }))
        .to.throw(RangeError, "The length argument must be a positive integer");
    });

    it("should throw RangeError for non-integer length", () => {
      expect(() => generatePassword({ length: 1.5, iteration: 3, separator: "-" }))
        .to.throw(RangeError, "The length argument must be a positive integer");
    });

    it("should throw RangeError for iteration < 1", () => {
      expect(() => generatePassword({ length: 8, iteration: 0, separator: "-" }))
        .to.throw(RangeError, "The iteration argument must be a positive integer");
    });

    it("should throw RangeError for non-integer iteration", () => {
      expect(() => generatePassword({ length: 8, iteration: 2.5, separator: "-" }))
        .to.throw(RangeError, "The iteration argument must be a positive integer");
    });
  });
});
