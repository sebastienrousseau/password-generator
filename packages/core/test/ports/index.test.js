// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  validatePorts,
  createPortsWithDefaults,
  PORT_SCHEMA,
  RandomGeneratorPort,
  LoggerPort,
  StoragePort,
  ClockPort,
  DictionaryPort,
  NoOpLogger,
  MemoryStorage,
  FixedClock,
  MemoryDictionary,
  DEFAULT_WORD_LIST,
  RANDOM_GENERATOR_REQUIRED_METHODS,
  RANDOM_GENERATOR_OPTIONAL_METHODS,
  LOGGER_REQUIRED_METHODS,
  LOGGER_OPTIONAL_METHODS,
  STORAGE_REQUIRED_METHODS,
  STORAGE_OPTIONAL_METHODS,
  CLOCK_REQUIRED_METHODS,
  CLOCK_OPTIONAL_METHODS,
  DICTIONARY_REQUIRED_METHODS,
} from '../../src/ports/index.js';

/**
 * Mock RandomGenerator for testing
 */
class MockRandomGenerator extends RandomGeneratorPort {
  async generateRandomBytes(byteLength) {
    return new Uint8Array(byteLength);
  }

  async generateRandomInt(max) {
    return 0;
  }
}

describe('Ports: index (validatePorts & createPortsWithDefaults)', () => {
  describe('PORT_SCHEMA', () => {
    it('should define randomGenerator as required', () => {
      expect(PORT_SCHEMA.randomGenerator).to.be.an('object');
      expect(PORT_SCHEMA.randomGenerator.required).to.be.true;
      expect(PORT_SCHEMA.randomGenerator.portClass).to.equal('RandomGeneratorPort');
    });

    it('should define logger as optional', () => {
      expect(PORT_SCHEMA.logger).to.be.an('object');
      expect(PORT_SCHEMA.logger.required).to.be.false;
    });

    it('should define storage as optional', () => {
      expect(PORT_SCHEMA.storage).to.be.an('object');
      expect(PORT_SCHEMA.storage.required).to.be.false;
    });

    it('should define clock as optional', () => {
      expect(PORT_SCHEMA.clock).to.be.an('object');
      expect(PORT_SCHEMA.clock.required).to.be.false;
    });

    it('should define dictionary as optional', () => {
      expect(PORT_SCHEMA.dictionary).to.be.an('object');
      expect(PORT_SCHEMA.dictionary.required).to.be.false;
    });

    it('should specify required methods for each port', () => {
      expect(PORT_SCHEMA.randomGenerator.requiredMethods).to.include('generateRandomBytes');
      expect(PORT_SCHEMA.randomGenerator.requiredMethods).to.include('generateRandomInt');
      expect(PORT_SCHEMA.logger.requiredMethods).to.include('info');
      expect(PORT_SCHEMA.logger.requiredMethods).to.include('error');
      expect(PORT_SCHEMA.storage.requiredMethods).to.include('read');
      expect(PORT_SCHEMA.storage.requiredMethods).to.include('write');
      expect(PORT_SCHEMA.clock.requiredMethods).to.include('now');
      expect(PORT_SCHEMA.clock.requiredMethods).to.include('performanceNow');
      expect(PORT_SCHEMA.dictionary.requiredMethods).to.include('loadDictionary');
    });
  });

  describe('validatePorts', () => {
    describe('with valid ports', () => {
      it('should return valid for complete port configuration', () => {
        const result = validatePorts({
          randomGenerator: new MockRandomGenerator(),
          logger: new NoOpLogger(),
          storage: new MemoryStorage(),
          clock: new FixedClock(),
          dictionary: new MemoryDictionary([]),
        });

        expect(result.isValid).to.be.true;
        expect(result.errors).to.have.lengthOf(0);
      });

      it('should return valid for minimal required ports', () => {
        const result = validatePorts({
          randomGenerator: new MockRandomGenerator(),
        });

        expect(result.isValid).to.be.true;
      });

      it('should return valid with subset of optional ports', () => {
        const result = validatePorts({
          randomGenerator: new MockRandomGenerator(),
          logger: new NoOpLogger(),
        });

        expect(result.isValid).to.be.true;
      });
    });

    describe('with invalid input', () => {
      it('should return invalid for null ports', () => {
        const result = validatePorts(null);
        expect(result.isValid).to.be.false;
        expect(result.errors).to.have.lengthOf(1);
        expect(result.errors[0]).to.include('must be an object');
      });

      it('should return invalid for undefined ports', () => {
        const result = validatePorts(undefined);
        expect(result.isValid).to.be.false;
        expect(result.errors[0]).to.include('must be an object');
      });

      it('should return invalid for non-object ports', () => {
        const result = validatePorts('not an object');
        expect(result.isValid).to.be.false;
      });
    });

    describe('with missing required ports', () => {
      it('should return invalid when randomGenerator is missing', () => {
        const result = validatePorts({});
        expect(result.isValid).to.be.false;
        expect(result.errors.some((e) => e.includes('Missing required ports'))).to.be.true;
      });

      it('should list missing port in error message', () => {
        const result = validatePorts({
          logger: new NoOpLogger(),
        });
        expect(result.isValid).to.be.false;
        expect(result.errors.some((e) => e.includes('randomGenerator'))).to.be.true;
      });
    });

    describe('with invalid port implementations', () => {
      it('should return invalid for port missing required methods', () => {
        const result = validatePorts({
          randomGenerator: {}, // Missing required methods
        });

        expect(result.isValid).to.be.false;
        expect(result.errors.some((e) => e.includes('Missing required methods'))).to.be.true;
      });

      it('should return invalid for logger missing methods', () => {
        const result = validatePorts({
          randomGenerator: new MockRandomGenerator(),
          logger: { info: () => {} }, // Missing error method
        });

        expect(result.isValid).to.be.false;
      });

      it('should return invalid for storage missing methods', () => {
        const result = validatePorts({
          randomGenerator: new MockRandomGenerator(),
          storage: { read: () => {} }, // Missing write method
        });

        expect(result.isValid).to.be.false;
      });

      it('should return invalid for clock missing methods', () => {
        const result = validatePorts({
          randomGenerator: new MockRandomGenerator(),
          clock: { now: () => {} }, // Missing performanceNow
        });

        expect(result.isValid).to.be.false;
      });

      it('should return invalid for dictionary missing methods', () => {
        const result = validatePorts({
          randomGenerator: new MockRandomGenerator(),
          dictionary: { loadDictionary: () => {} }, // Missing other methods
        });

        expect(result.isValid).to.be.false;
      });
    });

    describe('with null optional ports', () => {
      it('should skip validation for null optional port', () => {
        const result = validatePorts({
          randomGenerator: new MockRandomGenerator(),
          logger: null,
        });

        // Should be valid since logger is optional and null is allowed
        expect(result.isValid).to.be.true;
      });

      it('should report error for null required port', () => {
        const result = validatePorts({
          randomGenerator: null,
        });

        expect(result.isValid).to.be.false;
      });
    });

    describe('with unknown ports', () => {
      it('should ignore unknown ports', () => {
        const result = validatePorts({
          randomGenerator: new MockRandomGenerator(),
          unknownPort: { foo: () => {} },
        });

        // Should pass validation - unknown ports are just ignored
        expect(result.isValid).to.be.true;
      });
    });
  });

  describe('createPortsWithDefaults', () => {
    it('should keep provided randomGenerator', () => {
      const mock = new MockRandomGenerator();
      const ports = createPortsWithDefaults({ randomGenerator: mock });
      expect(ports.randomGenerator).to.equal(mock);
    });

    it('should create default NoOpLogger when not provided', () => {
      const mock = new MockRandomGenerator();
      const ports = createPortsWithDefaults({ randomGenerator: mock });
      expect(ports.logger).to.be.instanceOf(NoOpLogger);
    });

    it('should create default MemoryStorage when not provided', () => {
      const mock = new MockRandomGenerator();
      const ports = createPortsWithDefaults({ randomGenerator: mock });
      expect(ports.storage).to.be.instanceOf(MemoryStorage);
    });

    it('should create default FixedClock when not provided', () => {
      const mock = new MockRandomGenerator();
      const ports = createPortsWithDefaults({ randomGenerator: mock });
      expect(ports.clock).to.be.instanceOf(FixedClock);
    });

    it('should create default MemoryDictionary with DEFAULT_WORD_LIST', () => {
      const mock = new MockRandomGenerator();
      const ports = createPortsWithDefaults({ randomGenerator: mock });
      expect(ports.dictionary).to.be.instanceOf(MemoryDictionary);
    });

    it('should use provided logger', () => {
      const mock = new MockRandomGenerator();
      const logger = new NoOpLogger();
      const ports = createPortsWithDefaults({
        randomGenerator: mock,
        logger,
      });
      expect(ports.logger).to.equal(logger);
    });

    it('should use provided storage', () => {
      const mock = new MockRandomGenerator();
      const storage = new MemoryStorage();
      const ports = createPortsWithDefaults({
        randomGenerator: mock,
        storage,
      });
      expect(ports.storage).to.equal(storage);
    });

    it('should use provided clock', () => {
      const mock = new MockRandomGenerator();
      const clock = new FixedClock(12345);
      const ports = createPortsWithDefaults({
        randomGenerator: mock,
        clock,
      });
      expect(ports.clock).to.equal(clock);
    });

    it('should use provided dictionary', () => {
      const mock = new MockRandomGenerator();
      const dictionary = new MemoryDictionary(['custom', 'words']);
      const ports = createPortsWithDefaults({
        randomGenerator: mock,
        dictionary,
      });
      expect(ports.dictionary).to.equal(dictionary);
    });
  });

  describe('Re-exports', () => {
    it('should re-export port classes', () => {
      expect(RandomGeneratorPort).to.be.a('function');
      expect(LoggerPort).to.be.a('function');
      expect(StoragePort).to.be.a('function');
      expect(ClockPort).to.be.a('function');
      expect(DictionaryPort).to.be.a('function');
    });

    it('should re-export default implementations', () => {
      expect(NoOpLogger).to.be.a('function');
      expect(MemoryStorage).to.be.a('function');
      expect(FixedClock).to.be.a('function');
      expect(MemoryDictionary).to.be.a('function');
    });

    it('should re-export DEFAULT_WORD_LIST', () => {
      expect(DEFAULT_WORD_LIST).to.be.an('array');
    });

    it('should re-export method constants', () => {
      expect(RANDOM_GENERATOR_REQUIRED_METHODS).to.be.an('array');
      expect(RANDOM_GENERATOR_OPTIONAL_METHODS).to.be.an('array');
      expect(LOGGER_REQUIRED_METHODS).to.be.an('array');
      expect(LOGGER_OPTIONAL_METHODS).to.be.an('array');
      expect(STORAGE_REQUIRED_METHODS).to.be.an('array');
      expect(STORAGE_OPTIONAL_METHODS).to.be.an('array');
      expect(CLOCK_REQUIRED_METHODS).to.be.an('array');
      expect(CLOCK_OPTIONAL_METHODS).to.be.an('array');
      expect(DICTIONARY_REQUIRED_METHODS).to.be.an('array');
    });
  });
});
