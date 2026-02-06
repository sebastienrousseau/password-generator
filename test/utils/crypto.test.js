import { expect } from "chai";
import {
  generateRandomBase64,
  generateBase64Chunk,
  splitString,
} from "../../src/utils/crypto.js";

describe("Crypto Utilities", () => {
  describe("generateRandomBase64", () => {
    it("should return a string", () => {
      const result = generateRandomBase64(16);
      expect(result).to.be.a("string");
    });

    it("should contain only base64 characters", () => {
      const result = generateRandomBase64(32);
      expect(result).to.match(/^[A-Za-z0-9+/=]+$/);
    });

    it("should generate different strings on each call", () => {
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        results.add(generateRandomBase64(16));
      }
      expect(results.size).to.be.greaterThan(1);
    });
  });

  describe("generateBase64Chunk", () => {
    it("should return a string of the exact specified length", () => {
      const length = 24;
      const result = generateBase64Chunk(length);
      expect(result).to.have.lengthOf(length);
    });

    it("should handle small lengths", () => {
      const result = generateBase64Chunk(1);
      expect(result).to.have.lengthOf(1);
    });

    it("should contain only base64 characters", () => {
      const result = generateBase64Chunk(32);
      expect(result).to.match(/^[A-Za-z0-9+/=]+$/);
    });
  });

  describe("splitString", () => {
    it("should split a string into chunks of the specified length", () => {
      const result = splitString("abcdefghijkl", 4);
      expect(result).to.deep.equal(["abcd", "efgh", "ijkl"]);
    });

    it("should handle strings not evenly divisible", () => {
      const result = splitString("abcde", 2);
      expect(result).to.deep.equal(["ab", "cd", "e"]);
    });

    it("should return an empty array for an empty string", () => {
      const result = splitString("", 4);
      expect(result).to.deep.equal([]);
    });
  });
});
