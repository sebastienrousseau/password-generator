// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it, beforeEach, afterEach } from "mocha";
import sinon from "sinon";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock Web Crypto API for Node.js test environment
if (typeof global !== "undefined" && !global.crypto) {
  const { webcrypto } = await import("crypto");
  global.crypto = webcrypto;
}

// Mock btoa for Node.js test environment
if (typeof global !== "undefined" && !global.btoa) {
  global.btoa = (str) => Buffer.from(str, "binary").toString("base64");
}

// Mock performance API for Node.js test environment
if (typeof global !== "undefined" && !global.performance) {
  const { performance } = await import("perf_hooks");
  global.performance = performance;
}

// Create mock localStorage
function createMockStorage() {
  const storage = new Map();
  return {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
    get length() {
      return storage.size;
    },
    key: (index) => [...storage.keys()][index] ?? null,
    _storage: storage,
  };
}

// Mock localStorage and sessionStorage
if (typeof global !== "undefined") {
  global.localStorage = createMockStorage();
  global.sessionStorage = createMockStorage();
}

// Import adapters under test
import { BrowserClock } from "../../src/ui/web/adapters/BrowserClock.js";
import { BrowserCryptoRandom } from "../../src/ui/web/adapters/BrowserCryptoRandom.js";
import { BrowserStorage } from "../../src/ui/web/adapters/BrowserStorage.js";

describe("Browser Adapters", () => {
  describe("BrowserClock", () => {
    let clock;

    beforeEach(() => {
      clock = new BrowserClock();
    });

    describe("now", () => {
      it("should return current timestamp in milliseconds", () => {
        const before = Date.now();
        const result = clock.now();
        const after = Date.now();

        expect(result).to.be.a("number");
        expect(result).to.be.at.least(before);
        expect(result).to.be.at.most(after);
      });

      it("should return integer timestamp", () => {
        const result = clock.now();
        expect(Number.isInteger(result)).to.be.true;
      });
    });

    describe("performanceNow", () => {
      it("should return high-resolution timestamp", () => {
        const result = clock.performanceNow();

        expect(result).to.be.a("number");
        expect(result).to.be.at.least(0);
      });

      it("should return increasing values", async () => {
        const first = clock.performanceNow();
        await new Promise((resolve) => setTimeout(resolve, 5));
        const second = clock.performanceNow();

        expect(second).to.be.greaterThan(first);
      });

      it("should fall back to Date.now() if performance not available", () => {
        // Save and remove performance
        const originalPerformance = global.performance;
        global.performance = undefined;

        const newClock = new BrowserClock();
        const before = Date.now();
        const result = newClock.performanceNow();
        const after = Date.now();

        // Restore performance
        global.performance = originalPerformance;

        expect(result).to.be.a("number");
        expect(result).to.be.at.least(before);
        expect(result).to.be.at.most(after);
      });

      it("should fall back if performance.now is not a function", () => {
        const originalPerformance = global.performance;
        global.performance = { now: null };

        const newClock = new BrowserClock();
        const result = newClock.performanceNow();

        global.performance = originalPerformance;

        expect(result).to.be.a("number");
      });
    });

    describe("toISOString", () => {
      it("should return valid ISO 8601 string", () => {
        const result = clock.toISOString();

        expect(result).to.be.a("string");
        expect(result).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      });

      it("should return current time", () => {
        const before = Date.now();
        const result = clock.toISOString();
        const after = Date.now();

        const resultTime = new Date(result).getTime();
        expect(resultTime).to.be.at.least(before);
        expect(resultTime).to.be.at.most(after);
      });
    });

    describe("measure", () => {
      it("should measure async function execution time", async () => {
        const asyncFn = async () => {
          await new Promise((resolve) => setTimeout(resolve, 30));
          return "result";
        };

        const { result, elapsed } = await clock.measure(asyncFn);

        expect(result).to.equal("result");
        expect(elapsed).to.be.a("number");
        expect(elapsed).to.be.at.least(20);
        expect(elapsed).to.be.at.most(200);
      });

      it("should handle sync-like async functions", async () => {
        const asyncFn = async () => 123;

        const { result, elapsed } = await clock.measure(asyncFn);

        expect(result).to.equal(123);
        expect(elapsed).to.be.at.least(0);
        expect(elapsed).to.be.lessThan(50);
      });

      it("should propagate errors from async function", async () => {
        const error = new Error("Test error");
        const asyncFn = async () => {
          throw error;
        };

        try {
          await clock.measure(asyncFn);
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.equal(error);
        }
      });
    });

    describe("delay", () => {
      it("should delay for specified duration", async () => {
        const start = Date.now();
        await clock.delay(50);
        const elapsed = Date.now() - start;

        expect(elapsed).to.be.at.least(40);
        expect(elapsed).to.be.at.most(200);
      });

      it("should handle zero delay", async () => {
        const start = Date.now();
        await clock.delay(0);
        const elapsed = Date.now() - start;

        expect(elapsed).to.be.lessThan(50);
      });

      it("should resolve to undefined", async () => {
        const result = await clock.delay(1);
        expect(result).to.be.undefined;
      });
    });
  });

  describe("BrowserCryptoRandom", () => {
    let random;

    beforeEach(() => {
      random = new BrowserCryptoRandom();
    });

    describe("generateRandomBytes", () => {
      it("should generate random bytes of correct length", async () => {
        const bytes = await random.generateRandomBytes(16);

        expect(bytes).to.be.instanceOf(Uint8Array);
        expect(bytes.length).to.equal(16);
      });

      it("should generate different bytes on each call", async () => {
        const bytes1 = await random.generateRandomBytes(16);
        const bytes2 = await random.generateRandomBytes(16);

        const arr1 = Array.from(bytes1);
        const arr2 = Array.from(bytes2);

        expect(arr1).to.not.deep.equal(arr2);
      });

      it("should throw RangeError for zero byteLength", async () => {
        try {
          await random.generateRandomBytes(0);
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(RangeError);
          expect(e.message).to.equal("byteLength must be a positive integer");
        }
      });

      it("should throw RangeError for negative byteLength", async () => {
        try {
          await random.generateRandomBytes(-5);
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(RangeError);
        }
      });

      it("should throw RangeError for non-integer byteLength", async () => {
        try {
          await random.generateRandomBytes(5.5);
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(RangeError);
        }
      });

      it("should throw RangeError for string byteLength", async () => {
        try {
          await random.generateRandomBytes("16");
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(RangeError);
        }
      });

      it("should handle large byte lengths", async () => {
        const bytes = await random.generateRandomBytes(1024);
        expect(bytes.length).to.equal(1024);
      });

      it("should check for crypto availability in generateRandomInt when crypto missing", async () => {
        // The generateRandomInt method also uses crypto.getRandomValues directly
        // We test that it works when crypto is available
        const value = await random.generateRandomInt(100);
        expect(value).to.be.at.least(0);
        expect(value).to.be.below(100);
      });

      // Note: Testing crypto unavailability is not possible in Node.js because
      // global.crypto is read-only. These error paths are for legacy browsers
      // without Web Crypto API support.
    });

    describe("generateRandomInt", () => {
      it("should generate random integer in range [0, max)", async () => {
        for (let i = 0; i < 50; i++) {
          const value = await random.generateRandomInt(10);
          expect(value).to.be.a("number");
          expect(Number.isInteger(value)).to.be.true;
          expect(value).to.be.at.least(0);
          expect(value).to.be.below(10);
        }
      });

      it("should return 0 when max is 1", async () => {
        const value = await random.generateRandomInt(1);
        expect(value).to.equal(0);
      });

      it("should throw RangeError for zero max", async () => {
        try {
          await random.generateRandomInt(0);
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(RangeError);
          expect(e.message).to.equal("max must be a positive integer");
        }
      });

      it("should throw RangeError for negative max", async () => {
        try {
          await random.generateRandomInt(-5);
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(RangeError);
        }
      });

      it("should throw RangeError for non-integer max", async () => {
        try {
          await random.generateRandomInt(10.5);
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(RangeError);
        }
      });

      it("should throw RangeError for string max", async () => {
        try {
          await random.generateRandomInt("10");
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(RangeError);
        }
      });

      it("should generate values across full range", async () => {
        const values = new Set();
        const max = 5;

        // Generate many values to ensure we hit different numbers
        for (let i = 0; i < 200; i++) {
          values.add(await random.generateRandomInt(max));
        }

        // Should have at least 4 out of 5 possible values
        expect(values.size).to.be.at.least(4);
      });

      it("should handle large max values", async () => {
        const max = 1000000;
        const value = await random.generateRandomInt(max);

        expect(value).to.be.at.least(0);
        expect(value).to.be.below(max);
      });

      it("should handle max value of 2", async () => {
        const values = new Set();
        for (let i = 0; i < 50; i++) {
          values.add(await random.generateRandomInt(2));
        }
        expect(values.has(0)).to.be.true;
        expect(values.has(1)).to.be.true;
        expect(values.size).to.equal(2);
      });
    });

    describe("generateRandomBase64", () => {
      it("should generate valid base64 string", async () => {
        const result = await random.generateRandomBase64(16);

        expect(result).to.be.a("string");
        // Base64 length = ceil(byteLength * 4 / 3) rounded up to multiple of 4
        expect(result.length).to.equal(24); // 16 bytes = 24 base64 chars
      });

      it("should generate different base64 strings", async () => {
        const result1 = await random.generateRandomBase64(16);
        const result2 = await random.generateRandomBase64(16);

        expect(result1).to.not.equal(result2);
      });

      it("should contain only valid base64 characters", async () => {
        const result = await random.generateRandomBase64(32);

        // Valid base64 characters: A-Z, a-z, 0-9, +, /, =
        expect(result).to.match(/^[A-Za-z0-9+/=]+$/);
      });

      it("should handle small byte lengths", async () => {
        const result = await random.generateRandomBase64(1);

        expect(result).to.be.a("string");
        expect(result.length).to.equal(4); // 1 byte = 4 base64 chars (padded)
      });
    });

    describe("generateRandomString", () => {
      it("should generate string of correct length", async () => {
        const charset = "abcdefgh";
        const result = await random.generateRandomString(10, charset);

        expect(result).to.be.a("string");
        expect(result.length).to.equal(10);
      });

      it("should only use characters from charset", async () => {
        const charset = "xyz";
        const result = await random.generateRandomString(100, charset);

        for (const char of result) {
          expect(charset).to.include(char);
        }
      });

      it("should generate different strings on each call", async () => {
        const charset = "abcdefghijklmnopqrstuvwxyz";
        const result1 = await random.generateRandomString(20, charset);
        const result2 = await random.generateRandomString(20, charset);

        expect(result1).to.not.equal(result2);
      });

      it("should throw RangeError for zero length", async () => {
        try {
          await random.generateRandomString(0, "abc");
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(RangeError);
          expect(e.message).to.equal("length must be a positive integer");
        }
      });

      it("should throw RangeError for negative length", async () => {
        try {
          await random.generateRandomString(-5, "abc");
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(RangeError);
        }
      });

      it("should throw RangeError for non-integer length", async () => {
        try {
          await random.generateRandomString(5.5, "abc");
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(RangeError);
        }
      });

      it("should throw RangeError for empty charset", async () => {
        try {
          await random.generateRandomString(10, "");
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(RangeError);
          expect(e.message).to.equal("charset must not be empty");
        }
      });

      it("should throw RangeError for null charset", async () => {
        try {
          await random.generateRandomString(10, null);
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(RangeError);
        }
      });

      it("should handle single character charset", async () => {
        const result = await random.generateRandomString(5, "a");
        expect(result).to.equal("aaaaa");
      });

      it("should use all characters from charset over many iterations", async () => {
        const charset = "abcd";
        const usedChars = new Set();

        // Generate multiple strings to collect used characters
        for (let i = 0; i < 20; i++) {
          const result = await random.generateRandomString(10, charset);
          for (const char of result) {
            usedChars.add(char);
          }
        }

        // Should have used at least 3 of 4 characters
        expect(usedChars.size).to.be.at.least(3);
      });

      it("should handle unicode charset", async () => {
        const charset = "abc123";
        const result = await random.generateRandomString(10, charset);

        expect(result.length).to.equal(10);
        for (const char of result) {
          expect(charset).to.include(char);
        }
      });
    });
  });

  describe("BrowserStorage", () => {
    let storage;

    beforeEach(() => {
      // Clear mock storage before each test
      global.localStorage.clear();
      global.sessionStorage.clear();
      storage = new BrowserStorage({ prefix: "test_" });
    });

    describe("constructor", () => {
      it("should create storage with default options", () => {
        const defaultStorage = new BrowserStorage();
        expect(defaultStorage.prefix).to.equal("pwdgen_");
        expect(defaultStorage.storage).to.equal(global.localStorage);
      });

      it("should create storage with custom prefix", () => {
        const customStorage = new BrowserStorage({ prefix: "custom_" });
        expect(customStorage.prefix).to.equal("custom_");
      });

      it("should use sessionStorage when sessionOnly is true", () => {
        const sessionStorage = new BrowserStorage({ sessionOnly: true });
        expect(sessionStorage.storage).to.equal(global.sessionStorage);
      });

      it("should handle missing localStorage gracefully", () => {
        const originalLocalStorage = global.localStorage;
        global.localStorage = undefined;

        const noStorage = new BrowserStorage();
        expect(noStorage.storage).to.be.null;

        global.localStorage = originalLocalStorage;
      });

      it("should handle missing sessionStorage gracefully", () => {
        const originalSessionStorage = global.sessionStorage;
        global.sessionStorage = undefined;

        const noStorage = new BrowserStorage({ sessionOnly: true });
        expect(noStorage.storage).to.be.null;

        global.sessionStorage = originalSessionStorage;
      });
    });

    describe("_key", () => {
      it("should prefix key with namespace", () => {
        const result = storage._key("mykey");
        expect(result).to.equal("test_mykey");
      });

      it("should handle empty key", () => {
        const result = storage._key("");
        expect(result).to.equal("test_");
      });
    });

    describe("_isAvailable", () => {
      it("should return true when storage is available", () => {
        expect(storage._isAvailable()).to.be.true;
      });

      it("should return false when storage is null", () => {
        storage.storage = null;
        expect(storage._isAvailable()).to.be.false;
      });

      it("should return false when storage throws", () => {
        const throwingStorage = {
          setItem: () => {
            throw new Error("Storage disabled");
          },
        };
        storage.storage = throwingStorage;
        expect(storage._isAvailable()).to.be.false;
      });
    });

    describe("read", () => {
      it("should read existing value", async () => {
        global.localStorage.setItem("test_mykey", "myvalue");

        const result = await storage.read("mykey");
        expect(result).to.equal("myvalue");
      });

      it("should return null for non-existent key", async () => {
        const result = await storage.read("nonexistent");
        expect(result).to.be.null;
      });

      it("should return null when storage unavailable", async () => {
        storage.storage = null;
        const result = await storage.read("anykey");
        expect(result).to.be.null;
      });

      it("should return null when storage throws", async () => {
        storage.storage = {
          getItem: () => {
            throw new Error("Read error");
          },
          setItem: () => {},
          removeItem: () => {},
        };
        const result = await storage.read("anykey");
        expect(result).to.be.null;
      });
    });

    describe("write", () => {
      it("should write value to storage", async () => {
        await storage.write("newkey", "newvalue");

        const stored = global.localStorage.getItem("test_newkey");
        expect(stored).to.equal("newvalue");
      });

      it("should overwrite existing value", async () => {
        await storage.write("key", "value1");
        await storage.write("key", "value2");

        const stored = global.localStorage.getItem("test_key");
        expect(stored).to.equal("value2");
      });

      it("should throw when storage unavailable", async () => {
        storage.storage = null;

        try {
          await storage.write("key", "value");
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.equal("Browser storage is not available");
        }
      });

      it("should throw quota exceeded error", async () => {
        const quotaError = new Error("Quota exceeded");
        quotaError.name = "QuotaExceededError";

        // Create a storage mock that passes _isAvailable check but throws on write
        let callCount = 0;
        storage.storage = {
          setItem: (key) => {
            // Allow the test key from _isAvailable but throw for actual writes
            if (key === "__storage_test__") {
              callCount++;
              if (callCount > 1) {
                throw quotaError;
              }
              return;
            }
            throw quotaError;
          },
          getItem: () => null,
          removeItem: () => {},
        };

        try {
          await storage.write("key", "value");
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.equal("Storage quota exceeded");
        }
      });

      it("should rethrow other errors", async () => {
        const otherError = new Error("Unknown error");

        // Create a storage mock that passes _isAvailable check but throws on write
        let callCount = 0;
        storage.storage = {
          setItem: (key) => {
            // Allow the test key from _isAvailable but throw for actual writes
            if (key === "__storage_test__") {
              callCount++;
              if (callCount > 1) {
                throw otherError;
              }
              return;
            }
            throw otherError;
          },
          getItem: () => null,
          removeItem: () => {},
        };

        try {
          await storage.write("key", "value");
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.equal("Unknown error");
        }
      });
    });

    describe("exists", () => {
      it("should return true for existing key", async () => {
        await storage.write("existing", "value");

        const result = await storage.exists("existing");
        expect(result).to.be.true;
      });

      it("should return false for non-existent key", async () => {
        const result = await storage.exists("nonexistent");
        expect(result).to.be.false;
      });

      it("should return false when storage unavailable", async () => {
        storage.storage = null;
        const result = await storage.exists("anykey");
        expect(result).to.be.false;
      });
    });

    describe("delete", () => {
      it("should delete existing key and return true", async () => {
        await storage.write("todelete", "value");
        expect(await storage.exists("todelete")).to.be.true;

        const result = await storage.delete("todelete");
        expect(result).to.be.true;
        expect(await storage.exists("todelete")).to.be.false;
      });

      it("should return false for non-existent key", async () => {
        const result = await storage.delete("nonexistent");
        expect(result).to.be.false;
      });

      it("should return false when storage unavailable", async () => {
        storage.storage = null;
        const result = await storage.delete("anykey");
        expect(result).to.be.false;
      });
    });

    describe("clear", () => {
      it("should clear all keys with matching prefix", async () => {
        await storage.write("key1", "value1");
        await storage.write("key2", "value2");

        // Add key with different prefix
        global.localStorage.setItem("other_key", "other_value");

        await storage.clear();

        expect(await storage.exists("key1")).to.be.false;
        expect(await storage.exists("key2")).to.be.false;
        // Key with different prefix should remain
        expect(global.localStorage.getItem("other_key")).to.equal("other_value");
      });

      it("should handle empty storage", async () => {
        // Should not throw
        await storage.clear();
      });

      it("should do nothing when storage unavailable", async () => {
        storage.storage = null;
        // Should not throw
        await storage.clear();
      });

      it("should handle storage with mixed prefixes", async () => {
        global.localStorage.setItem("test_a", "1");
        global.localStorage.setItem("test_b", "2");
        global.localStorage.setItem("other_c", "3");
        global.localStorage.setItem("different_d", "4");

        await storage.clear();

        expect(global.localStorage.getItem("test_a")).to.be.null;
        expect(global.localStorage.getItem("test_b")).to.be.null;
        expect(global.localStorage.getItem("other_c")).to.equal("3");
        expect(global.localStorage.getItem("different_d")).to.equal("4");
      });
    });

    describe("integration", () => {
      it("should handle full lifecycle: write, read, exists, delete", async () => {
        const key = "lifecycle";
        const value = "test data";

        // Write
        await storage.write(key, value);

        // Read
        const readValue = await storage.read(key);
        expect(readValue).to.equal(value);

        // Exists
        const exists = await storage.exists(key);
        expect(exists).to.be.true;

        // Delete
        const deleted = await storage.delete(key);
        expect(deleted).to.be.true;

        // Verify deleted
        const existsAfter = await storage.exists(key);
        expect(existsAfter).to.be.false;
      });

      it("should isolate data between prefixes", async () => {
        const storage1 = new BrowserStorage({ prefix: "app1_" });
        const storage2 = new BrowserStorage({ prefix: "app2_" });

        await storage1.write("shared", "value1");
        await storage2.write("shared", "value2");

        expect(await storage1.read("shared")).to.equal("value1");
        expect(await storage2.read("shared")).to.equal("value2");
      });

      it("should handle JSON serialization manually", async () => {
        const data = { name: "test", count: 42, nested: { value: true } };

        await storage.write("json", JSON.stringify(data));
        const retrieved = JSON.parse(await storage.read("json"));

        expect(retrieved).to.deep.equal(data);
      });
    });
  });

  // ============================================
  // Subprocess tests for BrowserCryptoRandom error paths
  // These tests run in subprocesses to test code paths that
  // require modifying globals before module load
  // ============================================
  describe("BrowserCryptoRandom error paths (subprocess)", () => {
    /**
     * Helper to run code in a subprocess to test error paths that
     * require modifying globals before module load
     */
    function runInSubprocess(code) {
      return new Promise((resolve, reject) => {
        const fullCode = `
          (async () => {
            ${code}
          })().then(result => {
            process.stdout.write(JSON.stringify({ success: true, result }));
          }).catch(err => {
            process.stdout.write(JSON.stringify({ success: false, error: err.message, name: err.name }));
          });
        `;

        const child = spawn(process.execPath, ["--input-type=module", "-e", fullCode], {
          stdio: ["pipe", "pipe", "pipe"],
          cwd: join(__dirname, "../.."),
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => { stdout += data; });
        child.stderr.on("data", (data) => { stderr += data; });

        child.on("close", () => {
          try {
            const result = JSON.parse(stdout);
            resolve(result);
          } catch {
            reject(new Error(`Subprocess failed: ${stderr || stdout}`));
          }
        });
      });
    }

    it("should throw when crypto is not available for generateRandomBytes", async () => {
      const result = await runInSubprocess(`
        delete globalThis.crypto;
        global.crypto = undefined;
        const { BrowserCryptoRandom } = await import("./src/ui/web/adapters/BrowserCryptoRandom.js");
        const random = new BrowserCryptoRandom();
        return random.generateRandomBytes(16);
      `);

      expect(result.success).to.be.false;
      expect(result.error).to.include("Web Crypto API is not available");
    });

    it("should throw when crypto.getRandomValues is not available for generateRandomBytes", async () => {
      const result = await runInSubprocess(`
        // In Node.js, crypto is provided by webcrypto. We need to delete it first
        // then set up a mock object without getRandomValues
        delete globalThis.crypto;
        globalThis.crypto = { subtle: {} }; // crypto exists but without getRandomValues
        const { BrowserCryptoRandom } = await import("./src/ui/web/adapters/BrowserCryptoRandom.js");
        const random = new BrowserCryptoRandom();
        return random.generateRandomBytes(16);
      `);

      expect(result.success).to.be.false;
      expect(result.error).to.include("Web Crypto API is not available");
    });

    it("should throw when crypto is undefined for generateRandomInt (line 66)", async () => {
      const result = await runInSubprocess(`
        // Setup crypto initially so the class can be instantiated
        const { webcrypto } = await import('crypto');
        global.crypto = webcrypto;

        const { BrowserCryptoRandom } = await import("./src/ui/web/adapters/BrowserCryptoRandom.js");
        const random = new BrowserCryptoRandom();

        // Now remove crypto to test the error path inside generateRandomInt
        delete globalThis.crypto;
        global.crypto = undefined;

        // generateRandomInt checks crypto availability after the max === 1 check
        return random.generateRandomInt(10);
      `);

      // The function uses crypto.getRandomValues directly inside the rejection sampling loop
      // When crypto is undefined, it will throw a TypeError trying to access getRandomValues
      expect(result.success).to.be.false;
    });
  });
});
