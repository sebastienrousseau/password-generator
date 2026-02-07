// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it } from "mocha";

// Import all exports from domain/index.js
import * as Domain from "../../src/domain/index.js";

describe("Domain: index exports", () => {
  describe("Charset exports", () => {
    it("should export BASE64_CHARSET", () => {
      expect(Domain.BASE64_CHARSET).to.be.a("string");
      expect(Domain.BASE64_CHARSET).to.have.lengthOf(64);
    });

    it("should export VOWELS", () => {
      expect(Domain.VOWELS).to.be.a("string");
      expect(Domain.VOWELS).to.equal("aeiou");
    });

    it("should export CONSONANTS", () => {
      expect(Domain.CONSONANTS).to.be.a("string");
      expect(Domain.CONSONANTS).to.have.lengthOf(21);
    });

    it("should export CHARACTER_SET_METADATA", () => {
      expect(Domain.CHARACTER_SET_METADATA).to.be.an("object");
      expect(Domain.CHARACTER_SET_METADATA.BASE64).to.be.an("object");
      expect(Domain.CHARACTER_SET_METADATA.VOWELS).to.be.an("object");
      expect(Domain.CHARACTER_SET_METADATA.CONSONANTS).to.be.an("object");
    });
  });

  describe("Entropy calculator exports", () => {
    it("should export ENTROPY_CONSTANTS", () => {
      expect(Domain.ENTROPY_CONSTANTS).to.be.an("object");
    });

    it("should export calculateBase64Entropy", () => {
      expect(Domain.calculateBase64Entropy).to.be.a("function");
    });

    it("should export calculateBase64ChunkEntropy", () => {
      expect(Domain.calculateBase64ChunkEntropy).to.be.a("function");
    });

    it("should export calculateDictionaryEntropy", () => {
      expect(Domain.calculateDictionaryEntropy).to.be.a("function");
    });

    it("should export calculateCharsetEntropy", () => {
      expect(Domain.calculateCharsetEntropy).to.be.a("function");
    });

    it("should export calculateSyllableEntropy", () => {
      expect(Domain.calculateSyllableEntropy).to.be.a("function");
    });

    it("should export getSecurityLevel", () => {
      expect(Domain.getSecurityLevel).to.be.a("function");
    });

    it("should export getSecurityRecommendation", () => {
      expect(Domain.getSecurityRecommendation).to.be.a("function");
    });

    it("should export calculateTotalEntropy", () => {
      expect(Domain.calculateTotalEntropy).to.be.a("function");
    });
  });

  describe("Password types exports", () => {
    it("should export PASSWORD_TYPES", () => {
      expect(Domain.PASSWORD_TYPES).to.be.an("object");
      expect(Domain.PASSWORD_TYPES.STRONG).to.equal("strong");
      expect(Domain.PASSWORD_TYPES.BASE64).to.equal("base64");
      expect(Domain.PASSWORD_TYPES.MEMORABLE).to.equal("memorable");
    });

    it("should export GENERATION_STRATEGIES", () => {
      expect(Domain.GENERATION_STRATEGIES).to.be.an("object");
    });

    it("should export VALID_PASSWORD_TYPES", () => {
      expect(Domain.VALID_PASSWORD_TYPES).to.be.an("array");
    });

    it("should export isValidPasswordType", () => {
      expect(Domain.isValidPasswordType).to.be.a("function");
    });

    it("should export PASSWORD_TYPE_METADATA", () => {
      expect(Domain.PASSWORD_TYPE_METADATA).to.be.an("object");
    });

    it("should export validatePasswordTypeConfig", () => {
      expect(Domain.validatePasswordTypeConfig).to.be.a("function");
    });

    it("should export getExpectedEntropy", () => {
      expect(Domain.getExpectedEntropy).to.be.a("function");
    });
  });

  describe("Base64 generation exports", () => {
    it("should export validatePositiveInteger", () => {
      expect(Domain.validatePositiveInteger).to.be.a("function");
    });

    it("should export isValidBase64", () => {
      expect(Domain.isValidBase64).to.be.a("function");
    });

    it("should export splitString", () => {
      expect(Domain.splitString).to.be.a("function");
    });

    it("should export calculateBase64Length", () => {
      expect(Domain.calculateBase64Length).to.be.a("function");
    });

    it("should export calculateRequiredByteLength", () => {
      expect(Domain.calculateRequiredByteLength).to.be.a("function");
    });

    it("should export BASE64_DOMAIN_RULES", () => {
      expect(Domain.BASE64_DOMAIN_RULES).to.be.an("object");
    });
  });

  describe("Functional verification", () => {
    it("should have working charset exports", () => {
      expect(Domain.BASE64_CHARSET.charAt(0)).to.equal("A");
      expect(Domain.BASE64_CHARSET.charAt(63)).to.equal("/");
    });

    it("should have working entropy calculator exports", () => {
      expect(Domain.calculateBase64Entropy(16)).to.equal(128);
      expect(Domain.getSecurityLevel(128)).to.include("STRONG");
    });

    it("should have working password types exports", () => {
      expect(Domain.isValidPasswordType("strong")).to.be.true;
      expect(Domain.isValidPasswordType("invalid")).to.be.false;
    });

    it("should have working base64 generation exports", () => {
      expect(() => Domain.validatePositiveInteger(1, "test")).to.not.throw();
      expect(Domain.isValidBase64("ABC=")).to.be.true;
      expect(Domain.splitString("ABCD", 2)).to.deep.equal(["AB", "CD"]);
    });
  });
});
