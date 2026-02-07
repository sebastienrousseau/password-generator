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

/**
 * Comprehensive tests for web adapters to achieve 100% coverage:
 * - WebConsoleLogger.js
 * - webcrypto-random.js (WebCryptoRandom.js)
 * - index.js
 */

// Setup mock crypto for tests
if (typeof global !== "undefined" && !global.crypto) {
  const { webcrypto } = await import("crypto");
  global.crypto = webcrypto;
}

// Setup mock btoa for tests
if (typeof global !== "undefined" && !global.btoa) {
  global.btoa = (str) => Buffer.from(str, "binary").toString("base64");
}

// Mock localStorage for Node.js test environment
if (typeof global !== "undefined" && !global.localStorage) {
  const storage = new Map();
  global.localStorage = {
    getItem: (key) => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
    clear: () => storage.clear(),
    get length() {
      return storage.size;
    },
    key: (index) => [...storage.keys()][index] || null,
  };
}

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

describe("Web Console and Crypto Adapters - Full Coverage", () => {
  // ============================================
  // WebConsoleLogger.js Tests
  // ============================================
  describe("WebConsoleLogger", () => {
    let WebConsoleLogger, LogLevel, logger, webConsole;
    let consoleStub;

    beforeEach(async () => {
      // Fresh import for each test
      const module = await import(
        "../../src/adapters/web/WebConsoleLogger.js"
      );
      WebConsoleLogger = module.WebConsoleLogger;
      LogLevel = module.LogLevel;
      logger = module.logger;
      webConsole = module.webConsole;

      // Create console stubs
      consoleStub = {
        log: sinon.stub(),
        info: sinon.stub(),
        warn: sinon.stub(),
        error: sinon.stub(),
        debug: sinon.stub(),
        group: sinon.stub(),
        groupEnd: sinon.stub(),
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    describe("LogLevel constants", () => {
      it("should export correct log level values", () => {
        expect(LogLevel.DEBUG).to.equal(0);
        expect(LogLevel.INFO).to.equal(1);
        expect(LogLevel.WARN).to.equal(2);
        expect(LogLevel.ERROR).to.equal(3);
      });
    });

    describe("constructor", () => {
      it("should create logger with default configuration", () => {
        const customLogger = new WebConsoleLogger();
        expect(customLogger.config.enabled).to.be.true;
        expect(customLogger.config.level).to.equal(LogLevel.INFO);
        expect(customLogger.config.timestamp).to.be.true;
        expect(customLogger.config.colors).to.be.true;
        expect(customLogger.config.prefix).to.equal("PwdGen");
      });

      it("should merge custom configuration with defaults", () => {
        const customLogger = new WebConsoleLogger({
          enabled: false,
          prefix: "MyApp",
          level: LogLevel.ERROR,
        });
        expect(customLogger.config.enabled).to.be.false;
        expect(customLogger.config.prefix).to.equal("MyApp");
        expect(customLogger.config.level).to.equal(LogLevel.ERROR);
        expect(customLogger.config.timestamp).to.be.true; // Still default
        expect(customLogger.config.colors).to.be.true; // Still default
      });
    });

    describe("_formatTimestamp", () => {
      it("should return formatted timestamp when enabled", () => {
        const customLogger = new WebConsoleLogger({ timestamp: true });
        const result = customLogger._formatTimestamp();

        expect(result).to.match(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\] $/);
      });

      it("should return empty string when timestamp is disabled", () => {
        const customLogger = new WebConsoleLogger({ timestamp: false });
        const result = customLogger._formatTimestamp();

        expect(result).to.equal("");
      });
    });

    describe("_formatMessage", () => {
      it("should format message with prefix and level", () => {
        const customLogger = new WebConsoleLogger({
          timestamp: false,
          prefix: "Test",
        });
        const result = customLogger._formatMessage("INFO", "test message");

        expect(result).to.equal("[Test] INFO: test message");
      });

      it("should format message without prefix when prefix is empty", () => {
        const customLogger = new WebConsoleLogger({
          timestamp: false,
          prefix: "",
        });
        const result = customLogger._formatMessage("WARN", "warning message");

        expect(result).to.equal("WARN: warning message");
      });

      it("should include timestamp when enabled", () => {
        const customLogger = new WebConsoleLogger({
          timestamp: true,
          prefix: "App",
        });
        const result = customLogger._formatMessage("DEBUG", "debug msg");

        expect(result).to.match(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\] \[App\] DEBUG: debug msg$/
        );
      });
    });

    describe("_shouldLog", () => {
      it("should return false when logger is disabled", () => {
        const customLogger = new WebConsoleLogger({
          enabled: false,
          level: LogLevel.DEBUG,
        });

        expect(customLogger._shouldLog(LogLevel.DEBUG)).to.be.false;
        expect(customLogger._shouldLog(LogLevel.ERROR)).to.be.false;
      });

      it("should return true for levels >= configured level when enabled", () => {
        const customLogger = new WebConsoleLogger({
          enabled: true,
          level: LogLevel.WARN,
        });

        expect(customLogger._shouldLog(LogLevel.DEBUG)).to.be.false;
        expect(customLogger._shouldLog(LogLevel.INFO)).to.be.false;
        expect(customLogger._shouldLog(LogLevel.WARN)).to.be.true;
        expect(customLogger._shouldLog(LogLevel.ERROR)).to.be.true;
      });

      it("should return true for all levels when level is DEBUG", () => {
        const customLogger = new WebConsoleLogger({
          enabled: true,
          level: LogLevel.DEBUG,
        });

        expect(customLogger._shouldLog(LogLevel.DEBUG)).to.be.true;
        expect(customLogger._shouldLog(LogLevel.INFO)).to.be.true;
        expect(customLogger._shouldLog(LogLevel.WARN)).to.be.true;
        expect(customLogger._shouldLog(LogLevel.ERROR)).to.be.true;
      });
    });

    describe("debug", () => {
      it("should not log when level is higher than DEBUG", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.INFO,
          colors: true,
        });

        // Stub console
        const originalConsoleDebug = console.debug;
        console.debug = consoleStub.debug;

        customLogger.debug("test debug");

        expect(consoleStub.debug.called).to.be.false;

        console.debug = originalConsoleDebug;
      });

      it("should log with colors when colors enabled and console.debug available", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.DEBUG,
          colors: true,
          timestamp: false,
          prefix: "Test",
        });

        const originalConsoleDebug = console.debug;
        console.debug = consoleStub.debug;

        customLogger.debug("colored debug", "extra arg");

        expect(consoleStub.debug.calledOnce).to.be.true;
        expect(consoleStub.debug.firstCall.args[0]).to.include("%c");
        expect(consoleStub.debug.firstCall.args[0]).to.include("DEBUG");
        expect(consoleStub.debug.firstCall.args[1]).to.equal("color: gray");
        expect(consoleStub.debug.firstCall.args[2]).to.equal("extra arg");

        console.debug = originalConsoleDebug;
      });

      it("should fall back to log() when colors disabled", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.DEBUG,
          colors: false,
          timestamp: false,
          prefix: "Test",
        });

        const logSpy = sinon.spy(customLogger, "log");

        customLogger.debug("no color debug", "arg1");

        expect(logSpy.calledOnce).to.be.true;
        expect(logSpy.firstCall.args[0]).to.include("DEBUG");

        logSpy.restore();
      });

      it("should fall back to log() when console.debug is not available", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.DEBUG,
          colors: true,
          timestamp: false,
        });

        const originalConsoleDebug = console.debug;
        console.debug = undefined;

        const logSpy = sinon.spy(customLogger, "log");

        customLogger.debug("fallback debug");

        expect(logSpy.calledOnce).to.be.true;

        logSpy.restore();
        console.debug = originalConsoleDebug;
      });
    });

    describe("info", () => {
      it("should not log when level is higher than INFO", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.WARN,
        });

        const originalConsoleInfo = console.info;
        console.info = consoleStub.info;

        customLogger.info("test info");

        expect(consoleStub.info.called).to.be.false;

        console.info = originalConsoleInfo;
      });

      it("should log with colors when colors enabled and console.info available", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.INFO,
          colors: true,
          timestamp: false,
          prefix: "Test",
        });

        const originalConsoleInfo = console.info;
        console.info = consoleStub.info;

        customLogger.info("colored info", "data");

        expect(consoleStub.info.calledOnce).to.be.true;
        expect(consoleStub.info.firstCall.args[0]).to.include("%c");
        expect(consoleStub.info.firstCall.args[1]).to.equal("color: blue");
        expect(consoleStub.info.firstCall.args[2]).to.equal("data");

        console.info = originalConsoleInfo;
      });

      it("should fall back to log() when colors disabled", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.INFO,
          colors: false,
          timestamp: false,
        });

        const logSpy = sinon.spy(customLogger, "log");

        customLogger.info("plain info");

        expect(logSpy.calledOnce).to.be.true;

        logSpy.restore();
      });

      it("should fall back to log() when console.info is not available", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.INFO,
          colors: true,
          timestamp: false,
        });

        const originalConsoleInfo = console.info;
        console.info = undefined;

        const logSpy = sinon.spy(customLogger, "log");

        customLogger.info("fallback info");

        expect(logSpy.calledOnce).to.be.true;

        logSpy.restore();
        console.info = originalConsoleInfo;
      });
    });

    describe("warn", () => {
      it("should not log when level is higher than WARN", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.ERROR,
        });

        const originalConsoleWarn = console.warn;
        console.warn = consoleStub.warn;

        customLogger.warn("test warn");

        expect(consoleStub.warn.called).to.be.false;

        console.warn = originalConsoleWarn;
      });

      it("should log with colors when colors enabled and console.warn available", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.WARN,
          colors: true,
          timestamp: false,
          prefix: "Test",
        });

        const originalConsoleWarn = console.warn;
        console.warn = consoleStub.warn;

        customLogger.warn("colored warn", "extra");

        expect(consoleStub.warn.calledOnce).to.be.true;
        expect(consoleStub.warn.firstCall.args[0]).to.include("%c");
        expect(consoleStub.warn.firstCall.args[1]).to.equal("color: orange");
        expect(consoleStub.warn.firstCall.args[2]).to.equal("extra");

        console.warn = originalConsoleWarn;
      });

      it("should log without colors when colors disabled and console.warn available", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.WARN,
          colors: false,
          timestamp: false,
          prefix: "Test",
        });

        const originalConsoleWarn = console.warn;
        console.warn = consoleStub.warn;

        customLogger.warn("plain warn", "arg");

        expect(consoleStub.warn.calledOnce).to.be.true;
        expect(consoleStub.warn.firstCall.args[0]).to.not.include("%c");
        expect(consoleStub.warn.firstCall.args[0]).to.include("WARN");
        expect(consoleStub.warn.firstCall.args[1]).to.equal("arg");

        console.warn = originalConsoleWarn;
      });

      it("should fall back to log() when console.warn is not available", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.WARN,
          colors: true,
          timestamp: false,
        });

        const originalConsoleWarn = console.warn;
        console.warn = undefined;

        const logSpy = sinon.spy(customLogger, "log");

        customLogger.warn("fallback warn");

        expect(logSpy.calledOnce).to.be.true;

        logSpy.restore();
        console.warn = originalConsoleWarn;
      });
    });

    describe("error", () => {
      it("should not log when disabled", () => {
        const customLogger = new WebConsoleLogger({
          enabled: false,
          level: LogLevel.ERROR,
        });

        const originalConsoleError = console.error;
        console.error = consoleStub.error;

        customLogger.error("test error");

        expect(consoleStub.error.called).to.be.false;

        console.error = originalConsoleError;
      });

      it("should log with colors when colors enabled and console.error available", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.ERROR,
          colors: true,
          timestamp: false,
          prefix: "Test",
        });

        const originalConsoleError = console.error;
        console.error = consoleStub.error;

        customLogger.error("colored error", { stack: "trace" });

        expect(consoleStub.error.calledOnce).to.be.true;
        expect(consoleStub.error.firstCall.args[0]).to.include("%c");
        expect(consoleStub.error.firstCall.args[1]).to.include("color: red");
        expect(consoleStub.error.firstCall.args[1]).to.include("font-weight: bold");
        expect(consoleStub.error.firstCall.args[2]).to.deep.equal({ stack: "trace" });

        console.error = originalConsoleError;
      });

      it("should log without colors when colors disabled and console.error available", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.ERROR,
          colors: false,
          timestamp: false,
          prefix: "Test",
        });

        const originalConsoleError = console.error;
        console.error = consoleStub.error;

        customLogger.error("plain error");

        expect(consoleStub.error.calledOnce).to.be.true;
        expect(consoleStub.error.firstCall.args[0]).to.not.include("%c");
        expect(consoleStub.error.firstCall.args[0]).to.include("ERROR");

        console.error = originalConsoleError;
      });

      it("should fall back to log() when console.error is not available", () => {
        const customLogger = new WebConsoleLogger({
          level: LogLevel.ERROR,
          colors: true,
          timestamp: false,
        });

        const originalConsoleError = console.error;
        console.error = undefined;

        const logSpy = sinon.spy(customLogger, "log");

        customLogger.error("fallback error");

        expect(logSpy.calledOnce).to.be.true;

        logSpy.restore();
        console.error = originalConsoleError;
      });
    });

    describe("log", () => {
      it("should call console.log when available", () => {
        const customLogger = new WebConsoleLogger();

        const originalConsoleLog = console.log;
        console.log = consoleStub.log;

        customLogger.log("test message", "arg1", "arg2");

        expect(consoleStub.log.calledOnce).to.be.true;
        expect(consoleStub.log.firstCall.args[0]).to.equal("test message");
        expect(consoleStub.log.firstCall.args[1]).to.equal("arg1");
        expect(consoleStub.log.firstCall.args[2]).to.equal("arg2");

        console.log = originalConsoleLog;
      });

      it("should be a no-op when console.log is not available", () => {
        const customLogger = new WebConsoleLogger();

        const originalConsoleLog = console.log;
        console.log = undefined;

        // Should not throw
        expect(() => customLogger.log("test")).to.not.throw();

        console.log = originalConsoleLog;
      });
    });

    describe("group", () => {
      it("should use console.group when available", () => {
        const customLogger = new WebConsoleLogger({
          timestamp: false,
          prefix: "Test",
        });

        const originalConsoleGroup = console.group;
        const originalConsoleGroupEnd = console.groupEnd;
        console.group = consoleStub.group;
        console.groupEnd = consoleStub.groupEnd;

        const callback = sinon.stub();

        customLogger.group("MyGroup", callback);

        expect(consoleStub.group.calledOnce).to.be.true;
        expect(consoleStub.group.firstCall.args[0]).to.include("GROUP");
        expect(consoleStub.group.firstCall.args[0]).to.include("MyGroup");
        expect(callback.calledOnce).to.be.true;
        expect(consoleStub.groupEnd.calledOnce).to.be.true;

        console.group = originalConsoleGroup;
        console.groupEnd = originalConsoleGroupEnd;
      });

      it("should call groupEnd even if callback throws", () => {
        const customLogger = new WebConsoleLogger({
          timestamp: false,
        });

        const originalConsoleGroup = console.group;
        const originalConsoleGroupEnd = console.groupEnd;
        console.group = consoleStub.group;
        console.groupEnd = consoleStub.groupEnd;

        const error = new Error("Callback error");
        const callback = () => {
          throw error;
        };

        expect(() => customLogger.group("ErrorGroup", callback)).to.throw(
          "Callback error"
        );

        expect(consoleStub.group.calledOnce).to.be.true;
        expect(consoleStub.groupEnd.calledOnce).to.be.true;

        console.group = originalConsoleGroup;
        console.groupEnd = originalConsoleGroupEnd;
      });

      it("should handle missing console.groupEnd gracefully", () => {
        const customLogger = new WebConsoleLogger({
          timestamp: false,
        });

        const originalConsoleGroup = console.group;
        const originalConsoleGroupEnd = console.groupEnd;
        console.group = consoleStub.group;
        console.groupEnd = undefined;

        const callback = sinon.stub();

        // Should not throw
        expect(() => customLogger.group("NoGroupEnd", callback)).to.not.throw();
        expect(callback.calledOnce).to.be.true;

        console.group = originalConsoleGroup;
        console.groupEnd = originalConsoleGroupEnd;
      });

      it("should fall back to info() when console.group is not available", () => {
        const customLogger = new WebConsoleLogger({
          timestamp: false,
          prefix: "",
          level: LogLevel.INFO,
        });

        const originalConsoleGroup = console.group;
        console.group = undefined;

        const infoSpy = sinon.spy(customLogger, "info");
        const callback = sinon.stub();

        customLogger.group("FallbackGroup", callback);

        expect(infoSpy.calledTwice).to.be.true;
        expect(infoSpy.firstCall.args[0]).to.include("--- FallbackGroup ---");
        expect(infoSpy.secondCall.args[0]).to.include("--- End FallbackGroup ---");
        expect(callback.calledOnce).to.be.true;

        infoSpy.restore();
        console.group = originalConsoleGroup;
      });
    });

    describe("configure", () => {
      it("should update configuration", () => {
        const customLogger = new WebConsoleLogger();

        expect(customLogger.config.enabled).to.be.true;
        expect(customLogger.config.level).to.equal(LogLevel.INFO);

        customLogger.configure({
          enabled: false,
          level: LogLevel.ERROR,
        });

        expect(customLogger.config.enabled).to.be.false;
        expect(customLogger.config.level).to.equal(LogLevel.ERROR);
      });

      it("should preserve existing configuration for non-specified options", () => {
        const customLogger = new WebConsoleLogger({
          prefix: "Original",
          colors: false,
        });

        customLogger.configure({
          timestamp: false,
        });

        expect(customLogger.config.prefix).to.equal("Original");
        expect(customLogger.config.colors).to.be.false;
        expect(customLogger.config.timestamp).to.be.false;
      });
    });

    describe("default logger instance", () => {
      it("should export a default logger instance", () => {
        expect(logger).to.be.instanceOf(WebConsoleLogger);
        expect(logger.config.enabled).to.be.true;
      });
    });

    describe("webConsole interface", () => {
      it("should provide log method", () => {
        const logSpy = sinon.spy(logger, "log");
        webConsole.log("test log", "arg");
        expect(logSpy.calledWith("test log", "arg")).to.be.true;
        logSpy.restore();
      });

      it("should provide info method", () => {
        const infoSpy = sinon.spy(logger, "info");
        webConsole.info("test info", "arg");
        expect(infoSpy.calledWith("test info", "arg")).to.be.true;
        infoSpy.restore();
      });

      it("should provide warn method", () => {
        const warnSpy = sinon.spy(logger, "warn");
        webConsole.warn("test warn", "arg");
        expect(warnSpy.calledWith("test warn", "arg")).to.be.true;
        warnSpy.restore();
      });

      it("should provide error method", () => {
        const errorSpy = sinon.spy(logger, "error");
        webConsole.error("test error", "arg");
        expect(errorSpy.calledWith("test error", "arg")).to.be.true;
        errorSpy.restore();
      });

      it("should provide debug method", () => {
        // Set level to DEBUG to ensure it logs
        logger.configure({ level: LogLevel.DEBUG });
        const debugSpy = sinon.spy(logger, "debug");
        webConsole.debug("test debug", "arg");
        expect(debugSpy.calledWith("test debug", "arg")).to.be.true;
        debugSpy.restore();
      });

      it("should provide group method", () => {
        const groupSpy = sinon.spy(logger, "group");
        const callback = () => {};
        webConsole.group("test group", callback);
        expect(groupSpy.calledWith("test group", callback)).to.be.true;
        groupSpy.restore();
      });
    });

    describe("default export", () => {
      it("should export WebConsoleLogger as default", async () => {
        const module = await import("../../src/adapters/web/WebConsoleLogger.js");
        expect(module.default).to.equal(module.WebConsoleLogger);
      });
    });
  });

  // ============================================
  // webcrypto-random.js (WebCryptoRandom.js) Tests
  // ============================================
  describe("WebCryptoRandom (webcrypto-random.js)", () => {
    let randomBytes, randomInt, bytesToBase64, WebCryptoRandom;

    beforeEach(async () => {
      const module = await import(
        "../../src/adapters/web/webcrypto-random.js"
      );
      randomBytes = module.randomBytes;
      randomInt = module.randomInt;
      bytesToBase64 = module.bytesToBase64;
      WebCryptoRandom = module.WebCryptoRandom;
    });

    describe("randomBytes", () => {
      it("should generate random bytes of correct length", () => {
        const bytes = randomBytes(16);
        expect(bytes).to.be.instanceOf(Uint8Array);
        expect(bytes.length).to.equal(16);
      });

      it("should generate bytes of length 1", () => {
        const bytes = randomBytes(1);
        expect(bytes).to.be.instanceOf(Uint8Array);
        expect(bytes.length).to.equal(1);
      });

      it("should generate large byte arrays", () => {
        const bytes = randomBytes(1024);
        expect(bytes).to.be.instanceOf(Uint8Array);
        expect(bytes.length).to.equal(1024);
      });

      it("should generate different values on multiple calls", () => {
        const bytes1 = randomBytes(32);
        const bytes2 = randomBytes(32);
        const arr1 = Array.from(bytes1);
        const arr2 = Array.from(bytes2);
        expect(arr1).to.not.deep.equal(arr2);
      });

      it("should throw RangeError for zero size", () => {
        expect(() => randomBytes(0)).to.throw(
          RangeError,
          "size must be a positive integer"
        );
      });

      it("should throw RangeError for negative size", () => {
        expect(() => randomBytes(-5)).to.throw(
          RangeError,
          "size must be a positive integer"
        );
      });

      it("should throw RangeError for non-integer size", () => {
        expect(() => randomBytes(2.5)).to.throw(
          RangeError,
          "size must be a positive integer"
        );
      });

      it("should throw RangeError for string size", () => {
        expect(() => randomBytes("16")).to.throw(
          RangeError,
          "size must be a positive integer"
        );
      });

      it("should throw RangeError for NaN", () => {
        expect(() => randomBytes(NaN)).to.throw(
          RangeError,
          "size must be a positive integer"
        );
      });

      it("should throw RangeError for null", () => {
        expect(() => randomBytes(null)).to.throw(
          RangeError,
          "size must be a positive integer"
        );
      });

      it("should throw RangeError for undefined", () => {
        expect(() => randomBytes(undefined)).to.throw(
          RangeError,
          "size must be a positive integer"
        );
      });
    });

    describe("randomInt", () => {
      it("should generate random integer within bounds", () => {
        for (let i = 0; i < 100; i++) {
          const value = randomInt(10);
          expect(value).to.be.a("number");
          expect(Number.isInteger(value)).to.be.true;
          expect(value).to.be.at.least(0);
          expect(value).to.be.below(10);
        }
      });

      it("should generate values across the full range", () => {
        const values = new Set();
        const max = 5;
        for (let i = 0; i < 500; i++) {
          values.add(randomInt(max));
        }
        expect(values.size).to.be.at.least(4);
      });

      it("should handle max of 1 (always return 0)", () => {
        for (let i = 0; i < 10; i++) {
          expect(randomInt(1)).to.equal(0);
        }
      });

      it("should handle max of 2", () => {
        const values = new Set();
        for (let i = 0; i < 100; i++) {
          values.add(randomInt(2));
        }
        expect(values.has(0)).to.be.true;
        expect(values.has(1)).to.be.true;
        expect(values.size).to.equal(2);
      });

      it("should handle max of 256 (single byte boundary)", () => {
        const values = new Set();
        for (let i = 0; i < 1000; i++) {
          const value = randomInt(256);
          expect(value).to.be.at.least(0);
          expect(value).to.be.below(256);
          values.add(value);
        }
        // Should have good distribution
        expect(values.size).to.be.at.least(100);
      });

      it("should handle max of 257 (requires 2 bytes)", () => {
        const values = new Set();
        for (let i = 0; i < 1000; i++) {
          const value = randomInt(257);
          expect(value).to.be.at.least(0);
          expect(value).to.be.below(257);
          values.add(value);
        }
        expect(values.size).to.be.at.least(100);
      });

      it("should handle large max values", () => {
        const max = 1000000;
        const value = randomInt(max);
        expect(value).to.be.at.least(0);
        expect(value).to.be.below(max);
      });

      it("should throw RangeError for zero max", () => {
        expect(() => randomInt(0)).to.throw(
          RangeError,
          "max must be a positive integer"
        );
      });

      it("should throw RangeError for negative max", () => {
        expect(() => randomInt(-10)).to.throw(
          RangeError,
          "max must be a positive integer"
        );
      });

      it("should throw RangeError for non-integer max", () => {
        expect(() => randomInt(5.5)).to.throw(
          RangeError,
          "max must be a positive integer"
        );
      });

      it("should throw RangeError for string max", () => {
        expect(() => randomInt("100")).to.throw(
          RangeError,
          "max must be a positive integer"
        );
      });

      it("should throw RangeError for null max", () => {
        expect(() => randomInt(null)).to.throw(
          RangeError,
          "max must be a positive integer"
        );
      });

      it("should throw RangeError for undefined max", () => {
        expect(() => randomInt(undefined)).to.throw(
          RangeError,
          "max must be a positive integer"
        );
      });
    });

    describe("bytesToBase64", () => {
      it("should convert bytes to base64 string", () => {
        const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
        const base64 = bytesToBase64(bytes);
        expect(base64).to.equal("SGVsbG8=");
      });

      it("should handle empty array", () => {
        const bytes = new Uint8Array([]);
        const base64 = bytesToBase64(bytes);
        expect(base64).to.equal("");
      });

      it("should produce valid base64 output", () => {
        const bytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        const base64 = bytesToBase64(bytes);
        expect(base64).to.match(/^[A-Za-z0-9+/=]+$/);
      });

      it("should handle single byte", () => {
        const bytes = new Uint8Array([65]); // "A"
        const base64 = bytesToBase64(bytes);
        expect(base64).to.equal("QQ==");
      });

      it("should handle two bytes", () => {
        const bytes = new Uint8Array([65, 66]); // "AB"
        const base64 = bytesToBase64(bytes);
        expect(base64).to.equal("QUI=");
      });

      it("should handle three bytes (no padding needed)", () => {
        const bytes = new Uint8Array([65, 66, 67]); // "ABC"
        const base64 = bytesToBase64(bytes);
        expect(base64).to.equal("QUJD");
      });

      it("should handle four bytes", () => {
        const bytes = new Uint8Array([65, 66, 67, 68]); // "ABCD"
        const base64 = bytesToBase64(bytes);
        expect(base64).to.equal("QUJDRA==");
      });

      it("should handle five bytes", () => {
        const bytes = new Uint8Array([65, 66, 67, 68, 69]); // "ABCDE"
        const base64 = bytesToBase64(bytes);
        expect(base64).to.equal("QUJDREU=");
      });

      it("should handle six bytes", () => {
        const bytes = new Uint8Array([65, 66, 67, 68, 69, 70]); // "ABCDEF"
        const base64 = bytesToBase64(bytes);
        expect(base64).to.equal("QUJDREVG");
      });

      it("should handle bytes with all values 0-255", () => {
        const bytes = new Uint8Array([0, 127, 255]);
        const base64 = bytesToBase64(bytes);
        expect(base64).to.be.a("string");
        expect(base64.length).to.be.greaterThan(0);
      });

      it("should handle random bytes correctly", () => {
        const bytes = randomBytes(32);
        const base64 = bytesToBase64(bytes);
        expect(base64).to.match(/^[A-Za-z0-9+/=]+$/);
        // 32 bytes = ceil(32 * 4 / 3) rounded to multiple of 4 = 44 chars
        expect(base64.length).to.equal(44);
      });
    });

    describe("WebCryptoRandom object", () => {
      it("should export randomBytes function", () => {
        expect(WebCryptoRandom.randomBytes).to.equal(randomBytes);
      });

      it("should export randomInt function", () => {
        expect(WebCryptoRandom.randomInt).to.equal(randomInt);
      });

      it("should export bytesToBase64 function", () => {
        expect(WebCryptoRandom.bytesToBase64).to.equal(bytesToBase64);
      });
    });

    describe("default export", () => {
      it("should export WebCryptoRandom as default", async () => {
        const module = await import(
          "../../src/adapters/web/webcrypto-random.js"
        );
        expect(module.default).to.equal(module.WebCryptoRandom);
      });
    });
  });

  // ============================================
  // index.js Tests
  // ============================================
  describe("Web Adapters Index", () => {
    let indexModule;

    beforeEach(async () => {
      indexModule = await import("../../src/adapters/web/index.js");
    });

    describe("re-exports from WebCryptoRandom", () => {
      it("should export WebCryptoRandom", () => {
        expect(indexModule.WebCryptoRandom).to.exist;
        expect(indexModule.WebCryptoRandom.randomBytes).to.be.a("function");
      });

      it("should export randomBytes", () => {
        expect(indexModule.randomBytes).to.be.a("function");
      });

      it("should export randomInt", () => {
        expect(indexModule.randomInt).to.be.a("function");
      });

      it("should export bytesToBase64", () => {
        expect(indexModule.bytesToBase64).to.be.a("function");
      });
    });

    describe("re-exports from WebConsoleLogger", () => {
      it("should export WebConsoleLogger class", () => {
        expect(indexModule.WebConsoleLogger).to.be.a("function");
      });

      it("should export LogLevel constants", () => {
        expect(indexModule.LogLevel).to.exist;
        expect(indexModule.LogLevel.DEBUG).to.equal(0);
        expect(indexModule.LogLevel.INFO).to.equal(1);
        expect(indexModule.LogLevel.WARN).to.equal(2);
        expect(indexModule.LogLevel.ERROR).to.equal(3);
      });

      it("should export logger instance", () => {
        expect(indexModule.logger).to.be.instanceOf(indexModule.WebConsoleLogger);
      });

      it("should export webConsole interface", () => {
        expect(indexModule.webConsole).to.exist;
        expect(indexModule.webConsole.log).to.be.a("function");
        expect(indexModule.webConsole.info).to.be.a("function");
        expect(indexModule.webConsole.warn).to.be.a("function");
        expect(indexModule.webConsole.error).to.be.a("function");
        expect(indexModule.webConsole.debug).to.be.a("function");
        expect(indexModule.webConsole.group).to.be.a("function");
      });
    });

    describe("re-exports from WebLocalStorage", () => {
      it("should export WebLocalStorage class", () => {
        expect(indexModule.WebLocalStorage).to.be.a("function");
      });

      it("should export StorageKeys constants", () => {
        expect(indexModule.StorageKeys).to.exist;
      });

      it("should export storage instance", () => {
        expect(indexModule.storage).to.exist;
      });

      it("should export webStorage interface", () => {
        expect(indexModule.webStorage).to.exist;
      });
    });

    describe("WebAdapters combined object", () => {
      it("should export WebAdapters object", () => {
        expect(indexModule.WebAdapters).to.exist;
      });

      describe("WebAdapters.crypto", () => {
        it("should have async randomBytes method", async () => {
          const bytes = await indexModule.WebAdapters.crypto.randomBytes(16);
          expect(bytes).to.be.instanceOf(Uint8Array);
          expect(bytes.length).to.equal(16);
        });

        it("should have async randomInt method", async () => {
          const value = await indexModule.WebAdapters.crypto.randomInt(100);
          expect(value).to.be.a("number");
          expect(value).to.be.at.least(0);
          expect(value).to.be.below(100);
        });
      });

      describe("WebAdapters.console", () => {
        it("should have async log method", async () => {
          // Should not throw
          await indexModule.WebAdapters.console.log("test message");
        });

        it("should have async info method", async () => {
          await indexModule.WebAdapters.console.info("test info");
        });

        it("should have async warn method", async () => {
          await indexModule.WebAdapters.console.warn("test warn");
        });

        it("should have async error method", async () => {
          await indexModule.WebAdapters.console.error("test error");
        });
      });

      describe("WebAdapters.storage", () => {
        beforeEach(() => {
          global.localStorage.clear();
        });

        it("should have async setItem method", async () => {
          const result = await indexModule.WebAdapters.storage.setItem(
            "testKey",
            { data: "value" }
          );
          expect(result).to.be.true;
        });

        it("should have async getItem method", async () => {
          await indexModule.WebAdapters.storage.setItem("getTest", {
            value: 123,
          });
          const result = await indexModule.WebAdapters.storage.getItem(
            "getTest"
          );
          expect(result).to.deep.equal({ value: 123 });
        });

        it("should have async getItem with default value", async () => {
          const result = await indexModule.WebAdapters.storage.getItem(
            "nonexistent",
            "default"
          );
          expect(result).to.equal("default");
        });

        it("should have async removeItem method", async () => {
          await indexModule.WebAdapters.storage.setItem("removeMe", "data");
          const result = await indexModule.WebAdapters.storage.removeItem(
            "removeMe"
          );
          expect(result).to.be.true;
        });

        it("should have async clear method", async () => {
          await indexModule.WebAdapters.storage.setItem("item1", "a");
          await indexModule.WebAdapters.storage.setItem("item2", "b");
          const result = await indexModule.WebAdapters.storage.clear();
          expect(result).to.be.true;
        });
      });
    });

    describe("default export", () => {
      it("should export WebAdapters as default", () => {
        expect(indexModule.default).to.equal(indexModule.WebAdapters);
      });
    });
  });

  // ============================================
  // Subprocess tests for error paths in WebCryptoRandom
  // These tests run in subprocesses to test code paths that
  // require modifying globals before module load
  // ============================================
  describe("WebCryptoRandom error paths (subprocess)", () => {
    it("should throw when crypto is not available for randomBytes", async () => {
      const result = await runInSubprocess(`
        delete globalThis.crypto;
        global.crypto = undefined;
        const { randomBytes } = await import("./src/adapters/web/WebCryptoRandom.js");
        return randomBytes(16);
      `);

      expect(result.success).to.be.false;
      expect(result.error).to.include("Web Crypto API is not available");
    });

    it("should throw when crypto is not available for randomInt", async () => {
      const result = await runInSubprocess(`
        delete globalThis.crypto;
        global.crypto = undefined;
        const { randomInt } = await import("./src/adapters/web/WebCryptoRandom.js");
        return randomInt(10);
      `);

      expect(result.success).to.be.false;
      expect(result.error).to.include("Web Crypto API is not available");
    });
  });
});
