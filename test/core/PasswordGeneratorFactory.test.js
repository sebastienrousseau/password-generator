// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { PasswordGeneratorFactory } from "../../src/core/PasswordGeneratorFactory.js";

describe("PasswordGeneratorFactory", function () {
  beforeEach(function () {
    // Clear cache before each test
    PasswordGeneratorFactory.clearCache();
  });

  describe("createGenerator", function () {
    it("should create a generator for strong type", async function () {
      const generator = await PasswordGeneratorFactory.createGenerator("strong");
      expect(generator).to.have.property("type", "strong");
      expect(generator).to.have.property("isAsync", false);
      expect(generator).to.have.property("generate").that.is.a("function");
    });

    it("should create a generator for base64 type", async function () {
      const generator = await PasswordGeneratorFactory.createGenerator("base64");
      expect(generator).to.have.property("type", "base64");
      expect(generator).to.have.property("isAsync", false);
    });

    it("should create a generator for memorable type", async function () {
      const generator = await PasswordGeneratorFactory.createGenerator("memorable");
      expect(generator).to.have.property("type", "memorable");
      expect(generator).to.have.property("isAsync", true);
    });

    it("should throw error for missing type", async function () {
      try {
        await PasswordGeneratorFactory.createGenerator();
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("type is required");
      }
    });

    it("should throw error for invalid type", async function () {
      try {
        await PasswordGeneratorFactory.createGenerator("invalid");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Unknown password type");
      }
    });
  });

  describe("generate", function () {
    it("should generate a strong password directly", async function () {
      const password = await PasswordGeneratorFactory.generate({
        type: "strong",
        length: 12,
        iteration: 2,
        separator: "-"
      });
      expect(password).to.be.a("string");
      expect(password).to.include("-");
    });

    it("should generate a base64 password directly", async function () {
      const password = await PasswordGeneratorFactory.generate({
        type: "base64",
        length: 16,
        iteration: 2,
        separator: "-"
      });
      expect(password).to.be.a("string");
    });

    it("should generate a memorable password directly", async function () {
      const password = await PasswordGeneratorFactory.generate({
        type: "memorable",
        iteration: 3,
        separator: "-"
      });
      expect(password).to.be.a("string");
    });

    it("should throw error for missing type in config", async function () {
      try {
        await PasswordGeneratorFactory.generate({
          length: 12,
          iteration: 2,
          separator: "-"
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("type is required");
      }
    });

    it("should throw error for invalid config object", async function () {
      try {
        await PasswordGeneratorFactory.generate(null);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Configuration must be an object");
      }
    });

    it("should throw error for missing length on strong type", async function () {
      try {
        await PasswordGeneratorFactory.generate({
          type: "strong",
          iteration: 2,
          separator: "-"
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("requires a positive integer \"length\"");
      }
    });

    it("should throw error for missing iteration", async function () {
      try {
        await PasswordGeneratorFactory.generate({
          type: "strong",
          length: 12,
          separator: "-"
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("requires a positive integer \"iteration\"");
      }
    });

    it("should throw error for missing separator", async function () {
      try {
        await PasswordGeneratorFactory.generate({
          type: "memorable",
          iteration: 3
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("requires a string \"separator\"");
      }
    });
  });

  describe("isSupported", function () {
    it("should return true for supported types", function () {
      expect(PasswordGeneratorFactory.isSupported("strong")).to.be.true;
      expect(PasswordGeneratorFactory.isSupported("base64")).to.be.true;
      expect(PasswordGeneratorFactory.isSupported("memorable")).to.be.true;
    });

    it("should return false for unsupported types", function () {
      expect(PasswordGeneratorFactory.isSupported("invalid")).to.be.false;
      expect(PasswordGeneratorFactory.isSupported("")).to.be.false;
      expect(PasswordGeneratorFactory.isSupported(null)).to.be.false;
    });
  });

  describe("getSupportedTypes", function () {
    it("should return all supported types", function () {
      const types = PasswordGeneratorFactory.getSupportedTypes();
      expect(types).to.be.an("array");
      expect(types).to.include("strong");
      expect(types).to.include("base64");
      expect(types).to.include("memorable");
    });
  });

  describe("clearCache", function () {
    it("should clear the module cache", async function () {
      // Load a module to populate the cache
      await PasswordGeneratorFactory.createGenerator("strong");

      // Clear the cache
      PasswordGeneratorFactory.clearCache();

      // Should still work after cache clear
      const generator = await PasswordGeneratorFactory.createGenerator("strong");
      expect(generator).to.have.property("type", "strong");
    });
  });

  describe("registerType", function () {
    afterEach(function () {
      // Clean up registered type
      PasswordGeneratorFactory.unregisterType("custom");
    });

    it("should register a new type", function () {
      PasswordGeneratorFactory.registerType("custom", "../lib/strong-password.js", false);
      expect(PasswordGeneratorFactory.getSupportedTypes()).to.include("custom");
    });

    it("should register an async type", function () {
      PasswordGeneratorFactory.registerType("custom", "../lib/memorable-password.js", true);
      expect(PasswordGeneratorFactory.getSupportedTypes()).to.include("custom");
    });

    it("should throw error for empty type", function () {
      try {
        PasswordGeneratorFactory.registerType("", "../lib/strong-password.js");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Type must be a non-empty string");
      }
    });

    it("should throw error for null type", function () {
      try {
        PasswordGeneratorFactory.registerType(null, "../lib/strong-password.js");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Type must be a non-empty string");
      }
    });

    it("should throw error for empty module path", function () {
      try {
        PasswordGeneratorFactory.registerType("custom", "");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Module path must be a non-empty string");
      }
    });

    it("should throw error for null module path", function () {
      try {
        PasswordGeneratorFactory.registerType("custom", null);
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("Module path must be a non-empty string");
      }
    });

    it("should throw error for already registered type", function () {
      try {
        PasswordGeneratorFactory.registerType("strong", "../lib/strong-password.js");
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error.message).to.include("is already registered");
      }
    });
  });

  describe("unregisterType", function () {
    it("should unregister a registered type", function () {
      PasswordGeneratorFactory.registerType("custom", "../lib/strong-password.js");
      const result = PasswordGeneratorFactory.unregisterType("custom");
      expect(result).to.be.true;
      expect(PasswordGeneratorFactory.getSupportedTypes()).to.not.include("custom");
    });

    it("should return false for non-existent type", function () {
      const result = PasswordGeneratorFactory.unregisterType("nonexistent");
      expect(result).to.be.false;
    });
  });

  describe("generator generate method", function () {
    it("should generate password using the generator object", async function () {
      const generator = await PasswordGeneratorFactory.createGenerator("strong");
      const password = await generator.generate({
        length: 12,
        iteration: 2,
        separator: "-"
      });
      expect(password).to.be.a("string");
      expect(password.length).to.be.greaterThan(0);
    });

    it("should generate memorable password using the generator object", async function () {
      const generator = await PasswordGeneratorFactory.createGenerator("memorable");
      const password = await generator.generate({
        iteration: 3,
        separator: "-"
      });
      expect(password).to.be.a("string");
      expect(password).to.include("-");
    });
  });

  describe("module caching", function () {
    it("should return cached module on second call", async function () {
      PasswordGeneratorFactory.clearCache();

      // First call loads the module
      const generator1 = await PasswordGeneratorFactory.createGenerator("strong");

      // Second call should use cached module
      const generator2 = await PasswordGeneratorFactory.createGenerator("strong");

      expect(generator1.type).to.equal(generator2.type);
    });
  });
});
