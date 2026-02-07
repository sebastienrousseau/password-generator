// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";

// Mock Web Crypto API for Node.js test environment
if (typeof global !== 'undefined' && !global.crypto) {
  const { webcrypto } = await import('crypto');
  global.crypto = webcrypto;
}

// Mock localStorage for Node.js test environment
if (typeof global !== 'undefined' && !global.localStorage) {
  const storage = new Map();
  global.localStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
    get length() { return storage.size; },
    key: (index) => [...storage.keys()][index] || null,
  };
}

import { WebUIController, createWebUIController } from "../../controllers/WebUIController.js";
import { FormState } from "../../state/FormState.js";
import { ValidationViewModel } from "../../view-models/ValidationViewModel.js";
import { PasswordViewModel } from "../../view-models/PasswordViewModel.js";
import { EntropyViewModel } from "../../view-models/EntropyViewModel.js";

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

/**
 * Mock Storage for testing
 */
class MockStorage {
  constructor() {
    this.data = new Map();
  }

  get(key, defaultValue = null) {
    return this.data.has(key) ? this.data.get(key) : defaultValue;
  }

  set(key, value) {
    this.data.set(key, value);
    return true;
  }

  remove(key) {
    return this.data.delete(key);
  }

  clear() {
    this.data.clear();
    return true;
  }

  has(key) {
    return this.data.has(key);
  }
}

/**
 * Mock Clock for testing
 */
class MockClock {
  constructor(fixedTime = new Date("2024-01-01T00:00:00Z")) {
    this.fixedTime = fixedTime;
  }

  now() {
    return this.fixedTime;
  }

  timestamp() {
    return this.fixedTime.getTime();
  }
}

describe("WebUIController", () => {
  let controller;
  let mockRandomGenerator;

  beforeEach(() => {
    // Create a deterministic sequence for random number generation
    mockRandomGenerator = new MockRandomGenerator(
      Array.from({ length: 200 }, (_, i) => i)
    );

    controller = new WebUIController({
      randomGenerator: mockRandomGenerator,
      storage: new MockStorage(),
      clock: new MockClock(),
    });
  });

  describe("constructor", () => {
    it("should create controller with default adapters when no options provided", () => {
      // This will use browser adapters which may not work in Node, so we test with mocks
      const ctrl = new WebUIController({
        randomGenerator: mockRandomGenerator,
      });

      expect(ctrl).to.be.instanceOf(WebUIController);
      expect(ctrl.service).to.be.an("object");
      expect(ctrl.stateToCoreMapper).to.be.an("object");
    });

    it("should create controller with custom adapters", () => {
      const storage = new MockStorage();
      const clock = new MockClock();

      const ctrl = new WebUIController({
        randomGenerator: mockRandomGenerator,
        storage,
        clock,
      });

      expect(ctrl.getService().getPorts().storage).to.equal(storage);
      expect(ctrl.getService().getPorts().clock).to.equal(clock);
    });

    it("should wire core service with provided adapters", () => {
      const ports = controller.getService().getPorts();

      expect(ports.randomGenerator).to.equal(mockRandomGenerator);
    });
  });

  describe("validate", () => {
    it("should return valid view model for valid form state", () => {
      const formState = new FormState({
        type: "strong",
        length: "16",
        iteration: "4",
        separator: "-",
      });

      const result = controller.validate(formState);

      expect(result).to.be.instanceOf(ValidationViewModel);
      expect(result.isValid).to.be.true;
      expect(result.errors).to.have.lengthOf(0);
    });

    it("should return invalid view model when type is missing", () => {
      const formState = new FormState({
        length: "16",
        iteration: "4",
      });

      const result = controller.validate(formState);

      expect(result.isValid).to.be.false;
      expect(result.errors.length).to.be.greaterThan(0);
      expect(result.hasTypeError).to.be.true;
    });

    it("should return invalid view model for unknown type", () => {
      const formState = new FormState({
        type: "unknown",
        length: "16",
        iteration: "4",
      });

      const result = controller.validate(formState);

      expect(result.isValid).to.be.false;
      expect(result.hasTypeError).to.be.true;
    });

    it("should return invalid view model for invalid length", () => {
      const formState = new FormState({
        type: "strong",
        length: "-5",
        iteration: "4",
      });

      const result = controller.validate(formState);

      expect(result.isValid).to.be.false;
      expect(result.hasLengthError).to.be.true;
    });

    it("should return invalid view model for invalid iteration", () => {
      const formState = new FormState({
        type: "strong",
        length: "16",
        iteration: "0",
      });

      const result = controller.validate(formState);

      expect(result.isValid).to.be.false;
      expect(result.hasIterationError).to.be.true;
    });

    it("should validate memorable type without length", () => {
      const formState = new FormState({
        type: "memorable",
        iteration: "4",
        separator: "-",
      });

      const result = controller.validate(formState);

      expect(result.isValid).to.be.true;
    });

    it("should map UI state to core config before validating", () => {
      // String values should be converted to numbers for core validation
      const formState = new FormState({
        type: "strong",
        length: "16",
        iteration: "4",
      });

      const result = controller.validate(formState);

      expect(result.isValid).to.be.true;
    });
  });

  describe("generate", () => {
    it("should generate password for valid form state", async () => {
      const formState = new FormState({
        type: "strong",
        length: "16",
        iteration: "1",
        separator: "-",
      });

      const result = await controller.generate(formState);

      expect(result).to.be.instanceOf(PasswordViewModel);
      expect(result.password).to.have.lengthOf(16);
      expect(result.type).to.equal("strong");
    });

    it("should generate password with multiple iterations", async () => {
      const formState = new FormState({
        type: "strong",
        length: "8",
        iteration: "4",
        separator: "-",
      });

      const result = await controller.generate(formState);

      expect(result.password).to.include("-");
      const chunks = result.password.split("-");
      expect(chunks).to.have.lengthOf(4);
    });

    it("should generate memorable password", async () => {
      const formState = new FormState({
        type: "memorable",
        iteration: "4",
        separator: "-",
      });

      const result = await controller.generate(formState);

      expect(result).to.be.instanceOf(PasswordViewModel);
      const words = result.password.split("-");
      expect(words).to.have.lengthOf(4);
    });

    it("should generate base64 password", async () => {
      const formState = new FormState({
        type: "base64",
        length: "20",
        iteration: "1",
        separator: "-",
      });

      const result = await controller.generate(formState);

      expect(result).to.be.instanceOf(PasswordViewModel);
      expect(result.password).to.have.lengthOf(20);
    });

    it("should include entropy info in result", async () => {
      const formState = new FormState({
        type: "strong",
        length: "16",
        iteration: "4",
        separator: "-",
      });

      const result = await controller.generate(formState);

      expect(result.entropyBits).to.be.a("number");
      expect(result.entropyBits).to.be.greaterThan(0);
      expect(result.securityLevel).to.be.a("string");
    });

    it("should include strength indicator", async () => {
      const formState = new FormState({
        type: "strong",
        length: "16",
        iteration: "4",
        separator: "-",
      });

      const result = await controller.generate(formState);

      expect(result.strengthIndicator).to.be.an("object");
      expect(result.strengthIndicator.level).to.be.a("string");
      expect(result.strengthIndicator.dots).to.be.a("number");
    });

    it("should throw error for invalid form state", async () => {
      const formState = new FormState({
        type: "unknown",
        length: "16",
        iteration: "1",
      });

      try {
        await controller.generate(formState);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.include("type");
      }
    });

    it("should throw error when type is missing", async () => {
      const formState = new FormState({
        length: "16",
        iteration: "1",
      });

      try {
        await controller.generate(formState);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
      }
    });

    it("should throw error for invalid length", async () => {
      const formState = new FormState({
        type: "strong",
        length: "0",
        iteration: "1",
      });

      try {
        await controller.generate(formState);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
      }
    });

    it("should validate before generating", async () => {
      const formState = new FormState({
        type: "strong",
        length: "-1",
        iteration: "1",
      });

      try {
        await controller.generate(formState);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
      }
    });
  });

  describe("calculateEntropy", () => {
    it("should calculate entropy for strong password config", () => {
      const formState = new FormState({
        type: "strong",
        length: "16",
        iteration: "4",
        separator: "-",
      });

      const result = controller.calculateEntropy(formState);

      expect(result).to.be.instanceOf(EntropyViewModel);
      expect(result.totalBits).to.be.a("number");
      expect(result.totalBits).to.be.greaterThan(0);
    });

    it("should calculate entropy for memorable password config", () => {
      const formState = new FormState({
        type: "memorable",
        iteration: "4",
        separator: "-",
      });

      const result = controller.calculateEntropy(formState);

      expect(result).to.be.instanceOf(EntropyViewModel);
      expect(result.totalBits).to.be.a("number");
    });

    it("should calculate entropy for base64 password config", () => {
      const formState = new FormState({
        type: "base64",
        length: "20",
        iteration: "1",
        separator: "-",
      });

      const result = controller.calculateEntropy(formState);

      expect(result).to.be.instanceOf(EntropyViewModel);
      expect(result.totalBits).to.be.a("number");
    });

    it("should include strength label and color", () => {
      const formState = new FormState({
        type: "strong",
        length: "16",
        iteration: "4",
        separator: "-",
      });

      const result = controller.calculateEntropy(formState);

      expect(result.strengthLabel).to.be.a("string");
      expect(result.strengthColor).to.be.a("string");
    });

    it("should include progress bar width", () => {
      const formState = new FormState({
        type: "strong",
        length: "16",
        iteration: "1",
        separator: "-",
      });

      const result = controller.calculateEntropy(formState);

      expect(result.progressBarWidth).to.match(/^\d+%$/);
    });
  });

  describe("getSupportedTypes", () => {
    it("should return array of supported password types", () => {
      const types = controller.getSupportedTypes();

      expect(types).to.be.an("array");
      expect(types.length).to.be.greaterThan(0);
    });

    it("should include strong, base64, and memorable", () => {
      const types = controller.getSupportedTypes();

      expect(types).to.include("strong");
      expect(types).to.include("base64");
      expect(types).to.include("memorable");
    });

    it("should return a copy of the types array", () => {
      const types1 = controller.getSupportedTypes();
      const types2 = controller.getSupportedTypes();

      expect(types1).to.not.equal(types2);
      expect(types1).to.deep.equal(types2);
    });
  });

  describe("getService", () => {
    it("should return the core service instance", () => {
      const service = controller.getService();

      expect(service).to.be.an("object");
      expect(service.generate).to.be.a("function");
      expect(service.validateConfig).to.be.a("function");
      expect(service.calculateEntropy).to.be.a("function");
    });

    it("should return the same service instance", () => {
      const service1 = controller.getService();
      const service2 = controller.getService();

      expect(service1).to.equal(service2);
    });
  });

  describe("getMapper", () => {
    it("should return the state mapper instance", () => {
      const mapper = controller.getMapper();

      expect(mapper).to.be.an("object");
      expect(mapper.toConfig).to.be.a("function");
      expect(mapper.toFormState).to.be.a("function");
    });

    it("should return the same mapper instance", () => {
      const mapper1 = controller.getMapper();
      const mapper2 = controller.getMapper();

      expect(mapper1).to.equal(mapper2);
    });
  });

  describe("createWebUIController factory", () => {
    it("should create a WebUIController instance", () => {
      const ctrl = createWebUIController({
        randomGenerator: mockRandomGenerator,
      });

      expect(ctrl).to.be.instanceOf(WebUIController);
    });

    it("should pass options to constructor", () => {
      const storage = new MockStorage();
      const ctrl = createWebUIController({
        randomGenerator: mockRandomGenerator,
        storage,
      });

      expect(ctrl.getService().getPorts().storage).to.equal(storage);
    });

    it("should work with empty options", () => {
      // When using real browser adapters this would fail in Node,
      // but with mocks it should work
      const ctrl = createWebUIController({
        randomGenerator: mockRandomGenerator,
      });

      expect(ctrl).to.be.instanceOf(WebUIController);
    });
  });

  describe("integration scenarios", () => {
    it("should validate and generate in sequence", async () => {
      const formState = new FormState({
        type: "strong",
        length: "16",
        iteration: "2",
        separator: "-",
      });

      // First validate
      const validation = controller.validate(formState);
      expect(validation.isValid).to.be.true;

      // Then generate
      const password = await controller.generate(formState);
      expect(password.password).to.include("-");
    });

    it("should calculate entropy before and after generation", async () => {
      const formState = new FormState({
        type: "strong",
        length: "16",
        iteration: "4",
        separator: "-",
      });

      // Calculate entropy before
      const entropyBefore = controller.calculateEntropy(formState);

      // Generate password
      const password = await controller.generate(formState);

      // Entropy from password should match calculated
      expect(password.entropyBits).to.equal(entropyBefore.totalBits);
    });

    it("should handle form state changes", async () => {
      const initialState = new FormState({
        type: "strong",
        length: "8",
        iteration: "1",
      });

      const updatedState = initialState.with({
        length: "16",
        iteration: "4",
      });

      const password1 = await controller.generate(initialState);

      // Reset mock for deterministic second generation
      mockRandomGenerator.index = 0;

      const password2 = await controller.generate(updatedState);

      expect(password1.length).to.equal(8);
      expect(password2.password).to.include("-");
    });
  });
});
