// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it } from 'mocha';

// Import everything from the main entry point
import * as Core from '../src/index.js';

describe('Index exports', () => {
  describe('Service exports', () => {
    it('should export createService', () => {
      expect(Core.createService).to.be.a('function');
    });

    it('should export createQuickService', () => {
      expect(Core.createQuickService).to.be.a('function');
    });
  });

  describe('Error exports', () => {
    it('should export CRYPTO_ERRORS', () => {
      expect(Core.CRYPTO_ERRORS).to.be.an('object');
      expect(Core.CRYPTO_ERRORS.MUST_BE_POSITIVE_INTEGER).to.be.a('function');
      expect(Core.CRYPTO_ERRORS.EMPTY_CHARSET).to.be.a('string');
      expect(Core.CRYPTO_ERRORS.INVALID_BYTE_LENGTH).to.be.a('string');
    });

    it('should export PASSWORD_ERRORS', () => {
      expect(Core.PASSWORD_ERRORS).to.be.an('object');
      expect(Core.PASSWORD_ERRORS.TYPE_REQUIRED).to.be.a('string');
      expect(Core.PASSWORD_ERRORS.UNKNOWN_TYPE).to.be.a('function');
      expect(Core.PASSWORD_ERRORS.INVALID_ITERATION).to.be.a('string');
      expect(Core.PASSWORD_ERRORS.INVALID_LENGTH).to.be.a('string');
      expect(Core.PASSWORD_ERRORS.SEPARATOR_REQUIRED).to.be.a('string');
    });

    it('should export PORT_ERRORS', () => {
      expect(Core.PORT_ERRORS).to.be.an('object');
      expect(Core.PORT_ERRORS.MISSING_PORTS).to.be.a('function');
      expect(Core.PORT_ERRORS.INVALID_PORT).to.be.a('function');
      expect(Core.PORT_ERRORS.UNKNOWN_PORT_TYPE).to.be.a('function');
    });
  });

  describe('Domain exports', () => {
    describe('Charset exports', () => {
      it('should export BASE64_CHARSET', () => {
        expect(Core.BASE64_CHARSET).to.be.a('string');
        expect(Core.BASE64_CHARSET).to.have.lengthOf(64);
      });

      it('should export VOWELS', () => {
        expect(Core.VOWELS).to.be.a('string');
        expect(Core.VOWELS).to.have.lengthOf(5);
      });

      it('should export CONSONANTS', () => {
        expect(Core.CONSONANTS).to.be.a('string');
        expect(Core.CONSONANTS).to.have.lengthOf(21);
      });

      it('should export CHARACTER_SET_METADATA', () => {
        expect(Core.CHARACTER_SET_METADATA).to.be.an('object');
        expect(Core.CHARACTER_SET_METADATA.BASE64).to.be.an('object');
        expect(Core.CHARACTER_SET_METADATA.VOWELS).to.be.an('object');
        expect(Core.CHARACTER_SET_METADATA.CONSONANTS).to.be.an('object');
      });
    });

    describe('Entropy calculator exports', () => {
      it('should export ENTROPY_CONSTANTS', () => {
        expect(Core.ENTROPY_CONSTANTS).to.be.an('object');
        expect(Core.ENTROPY_CONSTANTS.BASE64_BITS_PER_CHAR).to.equal(6);
      });

      it('should export calculateBase64Entropy', () => {
        expect(Core.calculateBase64Entropy).to.be.a('function');
        expect(Core.calculateBase64Entropy(16)).to.equal(128);
      });

      it('should export calculateBase64ChunkEntropy', () => {
        expect(Core.calculateBase64ChunkEntropy).to.be.a('function');
        expect(Core.calculateBase64ChunkEntropy(16)).to.equal(96);
      });

      it('should export calculateDictionaryEntropy', () => {
        expect(Core.calculateDictionaryEntropy).to.be.a('function');
      });

      it('should export calculateCharsetEntropy', () => {
        expect(Core.calculateCharsetEntropy).to.be.a('function');
      });

      it('should export calculateSyllableEntropy', () => {
        expect(Core.calculateSyllableEntropy).to.be.a('function');
      });

      it('should export getSecurityLevel', () => {
        expect(Core.getSecurityLevel).to.be.a('function');
        expect(Core.getSecurityLevel(128)).to.include('STRONG');
      });

      it('should export getSecurityRecommendation', () => {
        expect(Core.getSecurityRecommendation).to.be.a('function');
        expect(Core.getSecurityRecommendation(128)).to.be.a('string');
      });

      it('should export calculateTotalEntropy', () => {
        expect(Core.calculateTotalEntropy).to.be.a('function');
      });
    });

    describe('Password types exports', () => {
      it('should export PASSWORD_TYPES', () => {
        expect(Core.PASSWORD_TYPES).to.be.an('object');
        expect(Core.PASSWORD_TYPES.STRONG).to.equal('strong');
        expect(Core.PASSWORD_TYPES.BASE64).to.equal('base64');
        expect(Core.PASSWORD_TYPES.MEMORABLE).to.equal('memorable');
      });

      it('should export GENERATION_STRATEGIES', () => {
        expect(Core.GENERATION_STRATEGIES).to.be.an('object');
      });

      it('should export VALID_PASSWORD_TYPES', () => {
        expect(Core.VALID_PASSWORD_TYPES).to.be.an('array');
        expect(Core.VALID_PASSWORD_TYPES).to.have.lengthOf(8);
      });

      it('should export isValidPasswordType', () => {
        expect(Core.isValidPasswordType).to.be.a('function');
        expect(Core.isValidPasswordType('strong')).to.be.true;
        expect(Core.isValidPasswordType('invalid')).to.be.false;
      });

      it('should export PASSWORD_TYPE_METADATA', () => {
        expect(Core.PASSWORD_TYPE_METADATA).to.be.an('object');
      });

      it('should export validatePasswordTypeConfig', () => {
        expect(Core.validatePasswordTypeConfig).to.be.a('function');
      });

      it('should export getExpectedEntropy', () => {
        expect(Core.getExpectedEntropy).to.be.a('function');
      });
    });

    describe('Base64 generation exports', () => {
      it('should export validatePositiveInteger', () => {
        expect(Core.validatePositiveInteger).to.be.a('function');
      });

      it('should export isValidBase64', () => {
        expect(Core.isValidBase64).to.be.a('function');
        expect(Core.isValidBase64('ABC=')).to.be.true;
      });

      it('should export splitString', () => {
        expect(Core.splitString).to.be.a('function');
        expect(Core.splitString('ABCD', 2)).to.deep.equal(['AB', 'CD']);
      });

      it('should export calculateBase64Length', () => {
        expect(Core.calculateBase64Length).to.be.a('function');
      });

      it('should export calculateRequiredByteLength', () => {
        expect(Core.calculateRequiredByteLength).to.be.a('function');
      });

      it('should export BASE64_DOMAIN_RULES', () => {
        expect(Core.BASE64_DOMAIN_RULES).to.be.an('object');
        expect(Core.BASE64_DOMAIN_RULES.CHARSET_SIZE).to.equal(64);
      });
    });
  });

  describe('Port exports', () => {
    it('should export RandomGeneratorPort', () => {
      expect(Core.RandomGeneratorPort).to.be.a('function');
    });

    it('should export LoggerPort', () => {
      expect(Core.LoggerPort).to.be.a('function');
    });

    it('should export StoragePort', () => {
      expect(Core.StoragePort).to.be.a('function');
    });

    it('should export ClockPort', () => {
      expect(Core.ClockPort).to.be.a('function');
    });

    it('should export DictionaryPort', () => {
      expect(Core.DictionaryPort).to.be.a('function');
    });

    it('should export NoOpLogger', () => {
      expect(Core.NoOpLogger).to.be.a('function');
      const logger = new Core.NoOpLogger();
      expect(logger).to.be.instanceOf(Core.LoggerPort);
    });

    it('should export MemoryStorage', () => {
      expect(Core.MemoryStorage).to.be.a('function');
      const storage = new Core.MemoryStorage();
      expect(storage).to.be.instanceOf(Core.StoragePort);
    });

    it('should export FixedClock', () => {
      expect(Core.FixedClock).to.be.a('function');
      const clock = new Core.FixedClock();
      expect(clock).to.be.instanceOf(Core.ClockPort);
    });

    it('should export MemoryDictionary', () => {
      expect(Core.MemoryDictionary).to.be.a('function');
      const dict = new Core.MemoryDictionary([]);
      expect(dict).to.be.instanceOf(Core.DictionaryPort);
    });

    it('should export DEFAULT_WORD_LIST', () => {
      expect(Core.DEFAULT_WORD_LIST).to.be.an('array');
      expect(Core.DEFAULT_WORD_LIST.length).to.be.greaterThan(0);
    });

    it('should export validatePorts', () => {
      expect(Core.validatePorts).to.be.a('function');
    });

    it('should export PORT_SCHEMA', () => {
      expect(Core.PORT_SCHEMA).to.be.an('object');
      expect(Core.PORT_SCHEMA.randomGenerator).to.be.an('object');
      expect(Core.PORT_SCHEMA.randomGenerator.required).to.be.true;
    });
  });

  describe('Generator exports', () => {
    it('should export generate', () => {
      expect(Core.generate).to.be.a('function');
    });

    it('should export getGenerator', () => {
      expect(Core.getGenerator).to.be.a('function');
    });

    it('should export GENERATOR_REGISTRY', () => {
      expect(Core.GENERATOR_REGISTRY).to.be.an('object');
      expect(Core.GENERATOR_REGISTRY.strong).to.be.an('object');
      expect(Core.GENERATOR_REGISTRY.base64).to.be.an('object');
      expect(Core.GENERATOR_REGISTRY.memorable).to.be.an('object');
    });

    it('should export generateStrongPassword', () => {
      expect(Core.generateStrongPassword).to.be.a('function');
    });

    it('should export generateBase64Password', () => {
      expect(Core.generateBase64Password).to.be.a('function');
    });

    it('should export generateMemorablePassword', () => {
      expect(Core.generateMemorablePassword).to.be.a('function');
    });

    it('should export generatePassphrase', () => {
      expect(Core.generatePassphrase).to.be.a('function');
    });

    it('should export calculateStrongPasswordEntropy', () => {
      expect(Core.calculateStrongPasswordEntropy).to.be.a('function');
    });

    it('should export calculateBase64PasswordEntropy', () => {
      expect(Core.calculateBase64PasswordEntropy).to.be.a('function');
    });

    it('should export calculateMemorablePasswordEntropy', () => {
      expect(Core.calculateMemorablePasswordEntropy).to.be.a('function');
    });
  });

  describe('Integration: Full workflow', () => {
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

    it('should create service and generate password using exports', async () => {
      const mock = new MockRandomGenerator(Array.from({ length: 100 }, (_, i) => i));
      const service = Core.createService(
        {},
        {
          randomGenerator: mock,
          dictionary: new Core.MemoryDictionary(Core.DEFAULT_WORD_LIST),
        }
      );

      const password = await service.generate({
        type: 'strong',
        length: 16,
        iteration: 4,
        separator: '-',
      });

      expect(password.split('-')).to.have.lengthOf(4);
    });

    it('should use quick service with exports', async () => {
      const mock = new MockRandomGenerator(Array.from({ length: 100 }, (_, i) => i));
      const service = Core.createQuickService(mock);

      const password = await service.generate({
        type: 'base64',
        length: 8,
        iteration: 1,
        separator: '-',
      });

      expect(password).to.have.lengthOf(8);
    });

    it('should validate ports using exports', () => {
      const mock = new MockRandomGenerator([0]);
      const result = Core.validatePorts({
        randomGenerator: mock,
        logger: new Core.NoOpLogger(),
      });

      expect(result.isValid).to.be.true;
    });
  });
});
