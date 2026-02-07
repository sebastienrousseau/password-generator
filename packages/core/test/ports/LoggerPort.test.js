// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it } from "mocha";
import {
  LoggerPort,
  LOGGER_REQUIRED_METHODS,
  LOGGER_OPTIONAL_METHODS,
  NoOpLogger,
} from "../../src/ports/LoggerPort.js";

describe("Ports: LoggerPort", () => {
  describe("LoggerPort base class", () => {
    let port;

    beforeEach(() => {
      port = new LoggerPort();
    });

    it("should be a class", () => {
      expect(LoggerPort).to.be.a("function");
      expect(port).to.be.instanceOf(LoggerPort);
    });

    describe("debug", () => {
      it("should throw Error indicating method must be implemented", () => {
        expect(() => port.debug("test")).to.throw(Error, "must be implemented");
      });

      it("should accept optional metadata parameter", () => {
        expect(() => port.debug("test", {})).to.throw(Error, "must be implemented");
      });
    });

    describe("info", () => {
      it("should throw Error indicating method must be implemented", () => {
        expect(() => port.info("test")).to.throw(Error, "must be implemented");
      });

      it("should accept optional metadata parameter", () => {
        expect(() => port.info("test", { key: "value" })).to.throw(Error, "must be implemented");
      });
    });

    describe("warn", () => {
      it("should throw Error indicating method must be implemented", () => {
        expect(() => port.warn("test")).to.throw(Error, "must be implemented");
      });

      it("should accept optional metadata parameter", () => {
        expect(() => port.warn("test", {})).to.throw(Error, "must be implemented");
      });
    });

    describe("error", () => {
      it("should throw Error indicating method must be implemented", () => {
        expect(() => port.error("test")).to.throw(Error, "must be implemented");
      });

      it("should accept optional error parameter", () => {
        expect(() => port.error("test", new Error("inner"))).to.throw(Error, "must be implemented");
      });
    });
  });

  describe("LOGGER_REQUIRED_METHODS", () => {
    it("should be an array", () => {
      expect(LOGGER_REQUIRED_METHODS).to.be.an("array");
    });

    it("should contain info", () => {
      expect(LOGGER_REQUIRED_METHODS).to.include("info");
    });

    it("should contain error", () => {
      expect(LOGGER_REQUIRED_METHODS).to.include("error");
    });

    it("should have exactly 2 required methods", () => {
      expect(LOGGER_REQUIRED_METHODS).to.have.lengthOf(2);
    });
  });

  describe("LOGGER_OPTIONAL_METHODS", () => {
    it("should be an array", () => {
      expect(LOGGER_OPTIONAL_METHODS).to.be.an("array");
    });

    it("should contain debug", () => {
      expect(LOGGER_OPTIONAL_METHODS).to.include("debug");
    });

    it("should contain warn", () => {
      expect(LOGGER_OPTIONAL_METHODS).to.include("warn");
    });

    it("should have exactly 2 optional methods", () => {
      expect(LOGGER_OPTIONAL_METHODS).to.have.lengthOf(2);
    });
  });

  describe("NoOpLogger", () => {
    let logger;

    beforeEach(() => {
      logger = new NoOpLogger();
    });

    it("should be a class", () => {
      expect(NoOpLogger).to.be.a("function");
    });

    it("should extend LoggerPort", () => {
      expect(logger).to.be.instanceOf(LoggerPort);
    });

    describe("debug", () => {
      it("should not throw", () => {
        expect(() => logger.debug("test message")).to.not.throw();
      });

      it("should accept metadata", () => {
        expect(() => logger.debug("test", { key: "value" })).to.not.throw();
      });

      it("should return undefined", () => {
        expect(logger.debug("test")).to.be.undefined;
      });
    });

    describe("info", () => {
      it("should not throw", () => {
        expect(() => logger.info("test message")).to.not.throw();
      });

      it("should accept metadata", () => {
        expect(() => logger.info("test", { count: 5 })).to.not.throw();
      });

      it("should return undefined", () => {
        expect(logger.info("test")).to.be.undefined;
      });
    });

    describe("warn", () => {
      it("should not throw", () => {
        expect(() => logger.warn("warning message")).to.not.throw();
      });

      it("should accept metadata", () => {
        expect(() => logger.warn("warning", { level: "high" })).to.not.throw();
      });

      it("should return undefined", () => {
        expect(logger.warn("test")).to.be.undefined;
      });
    });

    describe("error", () => {
      it("should not throw", () => {
        expect(() => logger.error("error message")).to.not.throw();
      });

      it("should accept error object", () => {
        expect(() => logger.error("error", new Error("test"))).to.not.throw();
      });

      it("should return undefined", () => {
        expect(logger.error("test")).to.be.undefined;
      });
    });

    it("should be suitable for production use", () => {
      // NoOpLogger should silently ignore all log calls
      const logger = new NoOpLogger();
      logger.debug("debug");
      logger.info("info");
      logger.warn("warn");
      logger.error("error");
      // If we got here, it works
      expect(true).to.be.true;
    });
  });

  describe("Custom implementation example", () => {
    class ArrayLogger extends LoggerPort {
      constructor() {
        super();
        this.logs = [];
      }

      debug(message, metadata = {}) {
        this.logs.push({ level: "debug", message, metadata });
      }

      info(message, metadata = {}) {
        this.logs.push({ level: "info", message, metadata });
      }

      warn(message, metadata = {}) {
        this.logs.push({ level: "warn", message, metadata });
      }

      error(message, error = null) {
        this.logs.push({ level: "error", message, error });
      }
    }

    it("should be able to create custom implementation", () => {
      const logger = new ArrayLogger();
      expect(logger).to.be.instanceOf(LoggerPort);
    });

    it("should capture log messages", () => {
      const logger = new ArrayLogger();
      logger.info("test message", { key: "value" });
      expect(logger.logs).to.have.lengthOf(1);
      expect(logger.logs[0].level).to.equal("info");
      expect(logger.logs[0].message).to.equal("test message");
      expect(logger.logs[0].metadata).to.deep.equal({ key: "value" });
    });

    it("should capture all log levels", () => {
      const logger = new ArrayLogger();
      logger.debug("debug msg");
      logger.info("info msg");
      logger.warn("warn msg");
      logger.error("error msg", new Error("test"));

      expect(logger.logs).to.have.lengthOf(4);
      expect(logger.logs.map(l => l.level)).to.deep.equal(["debug", "info", "warn", "error"]);
    });
  });
});
