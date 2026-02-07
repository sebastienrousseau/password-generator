// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import PasswordGeneratorFactory from "../../src/core/PasswordGeneratorFactory.js";
import { DefaultCryptoAdapter, MockCryptoAdapter } from "../../src/adapters/CryptoAdapter.js";

describe("PasswordGeneratorFactory - Dependency Injection", function () {
  beforeEach(function () {
    PasswordGeneratorFactory.clearCache();
  });

  describe("Default behavior (backward compatibility)", function () {
    it("should work without crypto adapter (legacy mode)", async function () {
      const config = {
        type: "strong",
        length: 8,
        iteration: 2,
        separator: "-",
      };

      const password = await PasswordGeneratorFactory.generate(config);
      expect(password).to.exist;
      expect(password).to.match(/^[A-Za-z0-9+/]+-[A-Za-z0-9+/]+$/);
    });

    it("should work with createGenerator without adapter", async function () {
      const generator = await PasswordGeneratorFactory.createGenerator("base64");
      const config = {
        type: "base64",
        length: 6,
        iteration: 2,
        separator: "_",
      };

      const password = await generator.generate(config);
      expect(password).to.exist;
      expect(password).to.match(/^[A-Za-z0-9+/]+_[A-Za-z0-9+/]+$/);
    });
  });

  describe("Dependency injection with DefaultCryptoAdapter", function () {
    it("should accept and use DefaultCryptoAdapter for strong passwords", async function () {
      const cryptoAdapter = new DefaultCryptoAdapter();
      const config = {
        type: "strong",
        length: 10,
        iteration: 3,
        separator: ".",
        cryptoAdapter,
      };

      const password = await PasswordGeneratorFactory.generate(config);
      expect(password).to.exist;
      expect(password).to.match(/^[A-Za-z0-9+/]+\.[A-Za-z0-9+/]+\.[A-Za-z0-9+/]+$/);
    });

    it("should accept and use DefaultCryptoAdapter for base64 passwords", async function () {
      const cryptoAdapter = new DefaultCryptoAdapter();
      const generator = await PasswordGeneratorFactory.createGenerator("base64", cryptoAdapter);
      const config = {
        type: "base64",
        length: 8,
        iteration: 2,
        separator: ":",
      };

      const password = await generator.generate(config);
      expect(password).to.exist;
      expect(password).to.match(/^[A-Za-z0-9+/]+:[A-Za-z0-9+/]+$/);
    });

    it("should accept and use DefaultCryptoAdapter for memorable passwords", async function () {
      const cryptoAdapter = new DefaultCryptoAdapter();
      const config = {
        type: "memorable",
        iteration: 3,
        separator: "-",
        cryptoAdapter,
      };

      const password = await PasswordGeneratorFactory.generate(config);
      expect(password).to.exist;
      expect(typeof password).to.equal("string");
      expect(password.split("-")).to.have.lengthOf(3);
    });
  });

  describe("Dependency injection with MockCryptoAdapter", function () {
    it("should produce predictable output with MockCryptoAdapter", async function () {
      const cryptoAdapter = new MockCryptoAdapter(123);
      const config = {
        type: "strong",
        length: 4,
        iteration: 2,
        separator: "-",
        cryptoAdapter,
      };

      const password1 = await PasswordGeneratorFactory.generate(config);

      // Reset the mock adapter to get the same sequence
      const cryptoAdapter2 = new MockCryptoAdapter(123);
      const config2 = { ...config, cryptoAdapter: cryptoAdapter2 };
      const password2 = await PasswordGeneratorFactory.generate(config2);

      expect(password1).to.equal(password2);
      expect(password1).to.match(/^[A-Za-z0-9+/]+-[A-Za-z0-9+/]+$/);
    });

    it("should produce different output with different mock seeds", async function () {
      const cryptoAdapter1 = new MockCryptoAdapter(100);
      const cryptoAdapter2 = new MockCryptoAdapter(200);

      const config1 = {
        type: "base64",
        length: 6,
        iteration: 2,
        separator: "_",
        cryptoAdapter: cryptoAdapter1,
      };

      const config2 = {
        type: "base64",
        length: 6,
        iteration: 2,
        separator: "_",
        cryptoAdapter: cryptoAdapter2,
      };

      const password1 = await PasswordGeneratorFactory.generate(config1);
      const password2 = await PasswordGeneratorFactory.generate(config2);

      expect(password1).to.not.equal(password2);
      expect(password1).to.match(/^[A-Za-z0-9+/]+_[A-Za-z0-9+/]+$/);
      expect(password2).to.match(/^[A-Za-z0-9+/]+_[A-Za-z0-9+/]+$/);
    });
  });

  describe("Module caching behavior", function () {
    it("should cache modules properly for default adapter", async function () {
      const generator1 = await PasswordGeneratorFactory.createGenerator("strong");
      const generator2 = await PasswordGeneratorFactory.createGenerator("strong");

      // Both generators should be created successfully
      expect(generator1).to.exist;
      expect(generator2).to.exist;
    });

    it("should not cache modules when custom adapter is provided", async function () {
      const adapter1 = new MockCryptoAdapter(1);
      const adapter2 = new MockCryptoAdapter(2);

      const generator1 = await PasswordGeneratorFactory.createGenerator("strong", adapter1);
      const generator2 = await PasswordGeneratorFactory.createGenerator("strong", adapter2);

      expect(generator1).to.exist;
      expect(generator2).to.exist;

      // Test that they produce different outputs due to different adapters
      const config = { type: "strong", length: 4, iteration: 1, separator: "" };

      const password1 = await generator1.generate(config);
      const password2 = await generator2.generate(config);

      expect(password1).to.not.equal(password2);
    });
  });

  describe("Error handling with adapters", function () {
    it("should handle validation errors from injected adapters", async function () {
      const cryptoAdapter = new DefaultCryptoAdapter();
      const config = {
        type: "strong",
        length: -5, // Invalid length
        iteration: 2,
        separator: "-",
        cryptoAdapter,
      };

      try {
        await PasswordGeneratorFactory.generate(config);
        expect.fail("Expected an error to be thrown");
      } catch (error) {
        expect(error.message).to.match(/positive integer/);
      }
    });

    it("should handle errors from custom adapter methods", async function () {
      // Create a mock adapter that throws errors
      const faultyAdapter = {
        validatePositiveInteger: () => { throw new Error("Custom validation error"); },
        generateBase64Chunk: () => "test",
      };

      const generator = await PasswordGeneratorFactory.createGenerator("strong", faultyAdapter);
      const config = { type: "strong", length: 4, iteration: 1, separator: "" };

      try {
        await generator.generate(config);
        expect.fail("Expected an error to be thrown");
      } catch (error) {
        expect(error.message).to.equal("Custom validation error");
      }
    });
  });

  describe("Integration with existing validation", function () {
    it("should still validate config structure before using adapter", async function () {
      const cryptoAdapter = new DefaultCryptoAdapter();
      const config = {
        // Missing required 'type' field
        length: 8,
        iteration: 2,
        separator: "-",
        cryptoAdapter,
      };

      try {
        await PasswordGeneratorFactory.generate(config);
        expect.fail("Expected an error to be thrown");
      } catch (error) {
        expect(error.message).to.match(/type.*required/i);
      }
    });

    it("should validate password type before using adapter", async function () {
      const cryptoAdapter = new DefaultCryptoAdapter();

      try {
        await PasswordGeneratorFactory.createGenerator("invalid-type", cryptoAdapter);
        expect.fail("Expected an error to be thrown");
      } catch (error) {
        expect(error.message).to.match(/unknown.*type/i);
      }
    });
  });
});
