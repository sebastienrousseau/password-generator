// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it } from 'mocha';
import { CRYPTO_ERRORS, PASSWORD_ERRORS, PORT_ERRORS } from '../src/errors.js';

describe('Errors', () => {
  describe('CRYPTO_ERRORS', () => {
    describe('MUST_BE_POSITIVE_INTEGER', () => {
      it('should be a function', () => {
        expect(CRYPTO_ERRORS.MUST_BE_POSITIVE_INTEGER).to.be.a('function');
      });

      it('should include parameter name in message', () => {
        const message = CRYPTO_ERRORS.MUST_BE_POSITIVE_INTEGER('byteLength');
        expect(message).to.include('byteLength');
        expect(message).to.include('positive integer');
      });

      it('should work with different parameter names', () => {
        expect(CRYPTO_ERRORS.MUST_BE_POSITIVE_INTEGER('length')).to.include('length');
        expect(CRYPTO_ERRORS.MUST_BE_POSITIVE_INTEGER('count')).to.include('count');
        expect(CRYPTO_ERRORS.MUST_BE_POSITIVE_INTEGER('size')).to.include('size');
      });
    });

    describe('EMPTY_CHARSET', () => {
      it('should be a string', () => {
        expect(CRYPTO_ERRORS.EMPTY_CHARSET).to.be.a('string');
      });

      it('should mention character set', () => {
        expect(CRYPTO_ERRORS.EMPTY_CHARSET.toLowerCase()).to.include('character set');
      });

      it('should mention empty', () => {
        expect(CRYPTO_ERRORS.EMPTY_CHARSET.toLowerCase()).to.include('empty');
      });
    });

    describe('INVALID_BYTE_LENGTH', () => {
      it('should be a string', () => {
        expect(CRYPTO_ERRORS.INVALID_BYTE_LENGTH).to.be.a('string');
      });

      it('should mention byte length', () => {
        expect(CRYPTO_ERRORS.INVALID_BYTE_LENGTH.toLowerCase()).to.include('byte length');
      });

      it('should mention positive integer', () => {
        expect(CRYPTO_ERRORS.INVALID_BYTE_LENGTH.toLowerCase()).to.include('positive integer');
      });
    });
  });

  describe('PASSWORD_ERRORS', () => {
    describe('TYPE_REQUIRED', () => {
      it('should be a string', () => {
        expect(PASSWORD_ERRORS.TYPE_REQUIRED).to.be.a('string');
      });

      it('should mention type is required', () => {
        expect(PASSWORD_ERRORS.TYPE_REQUIRED.toLowerCase()).to.include('type');
        expect(PASSWORD_ERRORS.TYPE_REQUIRED.toLowerCase()).to.include('required');
      });
    });

    describe('UNKNOWN_TYPE', () => {
      it('should be a function', () => {
        expect(PASSWORD_ERRORS.UNKNOWN_TYPE).to.be.a('function');
      });

      it('should include provided type in message', () => {
        const message = PASSWORD_ERRORS.UNKNOWN_TYPE('foobar');
        expect(message).to.include('foobar');
      });

      it('should include valid types when provided', () => {
        const validTypes = ['strong', 'base64', 'memorable'];
        const message = PASSWORD_ERRORS.UNKNOWN_TYPE('invalid', validTypes);
        expect(message).to.include('strong');
        expect(message).to.include('base64');
        expect(message).to.include('memorable');
      });

      it('should use default valid types when not provided', () => {
        const message = PASSWORD_ERRORS.UNKNOWN_TYPE('invalid');
        expect(message).to.include('strong');
        expect(message).to.include('base64');
        expect(message).to.include('memorable');
      });

      it('should indicate it is an unknown type', () => {
        const message = PASSWORD_ERRORS.UNKNOWN_TYPE('test');
        expect(message.toLowerCase()).to.include('unknown');
      });
    });

    describe('INVALID_ITERATION', () => {
      it('should be a string', () => {
        expect(PASSWORD_ERRORS.INVALID_ITERATION).to.be.a('string');
      });

      it('should mention iteration', () => {
        expect(PASSWORD_ERRORS.INVALID_ITERATION.toLowerCase()).to.include('iteration');
      });

      it('should mention positive integer', () => {
        expect(PASSWORD_ERRORS.INVALID_ITERATION.toLowerCase()).to.include('positive integer');
      });
    });

    describe('INVALID_LENGTH', () => {
      it('should be a string', () => {
        expect(PASSWORD_ERRORS.INVALID_LENGTH).to.be.a('string');
      });

      it('should mention length', () => {
        expect(PASSWORD_ERRORS.INVALID_LENGTH.toLowerCase()).to.include('length');
      });

      it('should mention positive integer', () => {
        expect(PASSWORD_ERRORS.INVALID_LENGTH.toLowerCase()).to.include('positive integer');
      });
    });

    describe('SEPARATOR_REQUIRED', () => {
      it('should be a string', () => {
        expect(PASSWORD_ERRORS.SEPARATOR_REQUIRED).to.be.a('string');
      });

      it('should mention separator', () => {
        expect(PASSWORD_ERRORS.SEPARATOR_REQUIRED.toLowerCase()).to.include('separator');
      });

      it('should mention required', () => {
        expect(PASSWORD_ERRORS.SEPARATOR_REQUIRED.toLowerCase()).to.include('required');
      });
    });
  });

  describe('PORT_ERRORS', () => {
    describe('MISSING_PORTS', () => {
      it('should be a function', () => {
        expect(PORT_ERRORS.MISSING_PORTS).to.be.a('function');
      });

      it('should list missing ports', () => {
        const message = PORT_ERRORS.MISSING_PORTS(
          ['randomGenerator', 'logger'],
          ['randomGenerator', 'logger', 'storage']
        );
        expect(message).to.include('randomGenerator');
        expect(message).to.include('logger');
      });

      it('should list required ports', () => {
        const message = PORT_ERRORS.MISSING_PORTS(
          ['randomGenerator'],
          ['randomGenerator', 'storage']
        );
        expect(message).to.include('storage');
      });

      it('should indicate ports are missing', () => {
        const message = PORT_ERRORS.MISSING_PORTS(['test'], ['test']);
        expect(message.toLowerCase()).to.include('missing');
      });
    });

    describe('INVALID_PORT', () => {
      it('should be a function', () => {
        expect(PORT_ERRORS.INVALID_PORT).to.be.a('function');
      });

      it('should include port name', () => {
        const message = PORT_ERRORS.INVALID_PORT('randomGenerator', 'RandomGeneratorPort');
        expect(message).to.include('randomGenerator');
      });

      it('should include expected class', () => {
        const message = PORT_ERRORS.INVALID_PORT('logger', 'LoggerPort');
        expect(message).to.include('LoggerPort');
      });

      it('should indicate missing methods', () => {
        const message = PORT_ERRORS.INVALID_PORT('storage', 'StoragePort');
        expect(message.toLowerCase()).to.include('missing');
        expect(message.toLowerCase()).to.include('methods');
      });
    });

    describe('UNKNOWN_PORT_TYPE', () => {
      it('should be a function', () => {
        expect(PORT_ERRORS.UNKNOWN_PORT_TYPE).to.be.a('function');
      });

      it('should include port name', () => {
        const message = PORT_ERRORS.UNKNOWN_PORT_TYPE('myPort', 'MyPortClass');
        expect(message).to.include('myPort');
      });

      it('should include expected class', () => {
        const message = PORT_ERRORS.UNKNOWN_PORT_TYPE('testPort', 'TestPortClass');
        expect(message).to.include('TestPortClass');
      });

      it('should indicate unknown type', () => {
        const message = PORT_ERRORS.UNKNOWN_PORT_TYPE('test', 'TestClass');
        expect(message.toLowerCase()).to.include('unknown');
      });
    });
  });
});
