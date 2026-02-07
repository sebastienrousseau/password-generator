// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";

// Mock Web Crypto API for Node.js test environment
if (typeof global !== 'undefined' && !global.crypto) {
  const { webcrypto } = await import('crypto');
  global.crypto = webcrypto;
}

// Mock btoa for Node.js test environment
if (typeof global !== 'undefined' && !global.btoa) {
  global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
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

describe("Web Adapters", () => {
  describe("WebCryptoRandom", () => {
    let WebCryptoRandom;

    beforeEach(async () => {
      const module = await import("../../src/adapters/web/WebCryptoRandom.js");
      WebCryptoRandom = module.default;
    });

    describe("randomBytes", () => {
      it("should generate random bytes of correct length", () => {
        const bytes = WebCryptoRandom.randomBytes(16);
        expect(bytes).to.be.instanceOf(Uint8Array);
        expect(bytes.length).to.equal(16);
      });

      it("should throw error for invalid size", () => {
        expect(() => WebCryptoRandom.randomBytes(0)).to.throw(RangeError);
        expect(() => WebCryptoRandom.randomBytes(-1)).to.throw(RangeError);
        expect(() => WebCryptoRandom.randomBytes("invalid")).to.throw(RangeError);
      });

      it("should generate different values on multiple calls", () => {
        const bytes1 = WebCryptoRandom.randomBytes(16);
        const bytes2 = WebCryptoRandom.randomBytes(16);

        // Convert to arrays for comparison
        const arr1 = Array.from(bytes1);
        const arr2 = Array.from(bytes2);

        expect(arr1).to.not.deep.equal(arr2);
      });
    });

    describe("randomInt", () => {
      it("should generate random integer within bounds", () => {
        for (let i = 0; i < 100; i++) {
          const value = WebCryptoRandom.randomInt(10);
          expect(value).to.be.a('number');
          expect(value).to.be.at.least(0);
          expect(value).to.be.below(10);
          expect(Number.isInteger(value)).to.be.true;
        }
      });

      it("should throw error for invalid max", () => {
        expect(() => WebCryptoRandom.randomInt(0)).to.throw(RangeError);
        expect(() => WebCryptoRandom.randomInt(-1)).to.throw(RangeError);
        expect(() => WebCryptoRandom.randomInt("invalid")).to.throw(RangeError);
      });

      it("should generate values across the full range", () => {
        const values = new Set();
        const max = 4;

        // Generate many values to ensure we hit different numbers
        for (let i = 0; i < 1000; i++) {
          values.add(WebCryptoRandom.randomInt(max));
        }

        // Should have at least 3 different values out of 4 possible
        expect(values.size).to.be.at.least(3);
      });
    });

    describe("bytesToBase64", () => {
      it("should convert bytes to base64 string", () => {
        const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
        const base64 = WebCryptoRandom.bytesToBase64(bytes);
        expect(base64).to.be.a('string');
        expect(base64).to.equal('SGVsbG8=');
      });

      it("should handle empty array", () => {
        const bytes = new Uint8Array([]);
        const base64 = WebCryptoRandom.bytesToBase64(bytes);
        expect(base64).to.equal('');
      });
    });
  });

  describe("WebConsoleLogger", () => {
    let WebConsoleLogger, logger;

    beforeEach(async () => {
      const module = await import("../../src/adapters/web/WebConsoleLogger.js");
      WebConsoleLogger = module.WebConsoleLogger;
      logger = module.logger;
    });

    it("should create logger instance with default config", () => {
      const customLogger = new WebConsoleLogger();
      expect(customLogger.config.enabled).to.be.true;
      expect(customLogger.config.timestamp).to.be.true;
    });

    it("should create logger with custom config", () => {
      const customLogger = new WebConsoleLogger({
        enabled: false,
        prefix: 'TestApp'
      });
      expect(customLogger.config.enabled).to.be.false;
      expect(customLogger.config.prefix).to.equal('TestApp');
    });

    it("should format messages correctly", () => {
      const customLogger = new WebConsoleLogger({ timestamp: false, prefix: 'Test' });
      const formatted = customLogger._formatMessage('INFO', 'test message');
      expect(formatted).to.equal('[Test] INFO: test message');
    });

    it("should respect log levels", () => {
      const customLogger = new WebConsoleLogger({
        level: 2, // WARN
        enabled: true
      });

      expect(customLogger._shouldLog(0)).to.be.false; // DEBUG
      expect(customLogger._shouldLog(1)).to.be.false; // INFO
      expect(customLogger._shouldLog(2)).to.be.true;  // WARN
      expect(customLogger._shouldLog(3)).to.be.true;  // ERROR
    });
  });

  describe("WebLocalStorage", () => {
    let WebLocalStorage, storage;

    beforeEach(async () => {
      // Clear localStorage before each test
      localStorage.clear();

      const module = await import("../../src/adapters/web/WebLocalStorage.js");
      WebLocalStorage = module.WebLocalStorage;
      storage = new WebLocalStorage({ prefix: 'test_' });
    });

    it("should store and retrieve data", () => {
      const testData = { key: 'value', number: 42 };

      const stored = storage.setItem('test_key', testData);
      expect(stored).to.be.true;

      const retrieved = storage.getItem('test_key');
      expect(retrieved).to.deep.equal(testData);
    });

    it("should return default value for non-existent keys", () => {
      const result = storage.getItem('non_existent', 'default');
      expect(result).to.equal('default');
    });

    it("should remove items correctly", () => {
      storage.setItem('remove_me', 'test');
      expect(storage.hasItem('remove_me')).to.be.true;

      const removed = storage.removeItem('remove_me');
      expect(removed).to.be.true;
      expect(storage.hasItem('remove_me')).to.be.false;
    });

    it("should clear all prefixed items", () => {
      storage.setItem('item1', 'value1');
      storage.setItem('item2', 'value2');

      expect(storage.getAllKeys()).to.include('item1');
      expect(storage.getAllKeys()).to.include('item2');

      const cleared = storage.clear();
      expect(cleared).to.be.true;
      expect(storage.getAllKeys()).to.be.empty;
    });

    it("should handle serialization errors gracefully", () => {
      // Create a circular reference that can't be serialized
      const circular = {};
      circular.self = circular;

      const stored = storage.setItem('circular', circular);
      expect(stored).to.be.false;
    });

    it("should provide usage information", () => {
      storage.setItem('usage_test', 'some data');

      const usage = storage.getUsageInfo();
      expect(usage.available).to.be.true;
      expect(usage.itemCount).to.be.at.least(1);
      expect(usage.usedSize).to.be.at.least(1);
    });
  });
});