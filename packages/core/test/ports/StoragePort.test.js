// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import {
  StoragePort,
  STORAGE_REQUIRED_METHODS,
  STORAGE_OPTIONAL_METHODS,
  MemoryStorage,
} from '../../src/ports/StoragePort.js';

describe('Ports: StoragePort', () => {
  describe('StoragePort base class', () => {
    let port;

    beforeEach(() => {
      port = new StoragePort();
    });

    it('should be a class', () => {
      expect(StoragePort).to.be.a('function');
      expect(port).to.be.instanceOf(StoragePort);
    });

    describe('read', () => {
      it('should throw Error indicating method must be implemented', async () => {
        try {
          await port.read('key');
          expect.fail('Should have thrown');
        } catch (e) {
          expect(e.message).to.include('must be implemented');
          expect(e.message).to.include('read');
        }
      });
    });

    describe('write', () => {
      it('should throw Error indicating method must be implemented', async () => {
        try {
          await port.write('key', 'content');
          expect.fail('Should have thrown');
        } catch (e) {
          expect(e.message).to.include('must be implemented');
          expect(e.message).to.include('write');
        }
      });
    });

    describe('exists', () => {
      it('should throw Error indicating method must be implemented', async () => {
        try {
          await port.exists('key');
          expect.fail('Should have thrown');
        } catch (e) {
          expect(e.message).to.include('must be implemented');
          expect(e.message).to.include('exists');
        }
      });
    });

    describe('delete', () => {
      it('should throw Error indicating method must be implemented', async () => {
        try {
          await port.delete('key');
          expect.fail('Should have thrown');
        } catch (e) {
          expect(e.message).to.include('must be implemented');
          expect(e.message).to.include('delete');
        }
      });
    });
  });

  describe('STORAGE_REQUIRED_METHODS', () => {
    it('should be an array', () => {
      expect(STORAGE_REQUIRED_METHODS).to.be.an('array');
    });

    it('should contain read', () => {
      expect(STORAGE_REQUIRED_METHODS).to.include('read');
    });

    it('should contain write', () => {
      expect(STORAGE_REQUIRED_METHODS).to.include('write');
    });

    it('should have exactly 2 required methods', () => {
      expect(STORAGE_REQUIRED_METHODS).to.have.lengthOf(2);
    });
  });

  describe('STORAGE_OPTIONAL_METHODS', () => {
    it('should be an array', () => {
      expect(STORAGE_OPTIONAL_METHODS).to.be.an('array');
    });

    it('should contain exists', () => {
      expect(STORAGE_OPTIONAL_METHODS).to.include('exists');
    });

    it('should contain delete', () => {
      expect(STORAGE_OPTIONAL_METHODS).to.include('delete');
    });

    it('should have exactly 2 optional methods', () => {
      expect(STORAGE_OPTIONAL_METHODS).to.have.lengthOf(2);
    });
  });

  describe('MemoryStorage', () => {
    let storage;

    beforeEach(() => {
      storage = new MemoryStorage();
    });

    it('should be a class', () => {
      expect(MemoryStorage).to.be.a('function');
    });

    it('should extend StoragePort', () => {
      expect(storage).to.be.instanceOf(StoragePort);
    });

    it('should have an internal store Map', () => {
      expect(storage.store).to.be.instanceOf(Map);
    });

    describe('write', () => {
      it('should store a value', async () => {
        await storage.write('key1', 'value1');
        expect(storage.store.get('key1')).to.equal('value1');
      });

      it('should overwrite existing value', async () => {
        await storage.write('key1', 'value1');
        await storage.write('key1', 'value2');
        expect(storage.store.get('key1')).to.equal('value2');
      });

      it('should store multiple keys', async () => {
        await storage.write('key1', 'value1');
        await storage.write('key2', 'value2');
        expect(storage.store.size).to.equal(2);
      });

      it('should handle empty string values', async () => {
        await storage.write('key', '');
        expect(await storage.read('key')).to.equal('');
      });

      it('should handle complex string content', async () => {
        const content = 'Hello\nWorld\t!@#$%^&*()';
        await storage.write('key', content);
        expect(await storage.read('key')).to.equal(content);
      });
    });

    describe('read', () => {
      it('should return stored value', async () => {
        await storage.write('key', 'value');
        expect(await storage.read('key')).to.equal('value');
      });

      it('should return null for non-existent key', async () => {
        expect(await storage.read('nonexistent')).to.be.null;
      });

      it('should return null for undefined key', async () => {
        expect(await storage.read(undefined)).to.be.null;
      });
    });

    describe('exists', () => {
      it('should return true for existing key', async () => {
        await storage.write('key', 'value');
        expect(await storage.exists('key')).to.be.true;
      });

      it('should return false for non-existent key', async () => {
        expect(await storage.exists('nonexistent')).to.be.false;
      });

      it('should return true even for empty string value', async () => {
        await storage.write('key', '');
        expect(await storage.exists('key')).to.be.true;
      });
    });

    describe('delete', () => {
      it('should remove existing key', async () => {
        await storage.write('key', 'value');
        const result = await storage.delete('key');
        expect(result).to.be.true;
        expect(await storage.exists('key')).to.be.false;
      });

      it('should return false for non-existent key', async () => {
        const result = await storage.delete('nonexistent');
        expect(result).to.be.false;
      });

      it('should not affect other keys', async () => {
        await storage.write('key1', 'value1');
        await storage.write('key2', 'value2');
        await storage.delete('key1');
        expect(await storage.exists('key2')).to.be.true;
        expect(await storage.read('key2')).to.equal('value2');
      });
    });

    describe('clear', () => {
      it('should remove all keys', async () => {
        await storage.write('key1', 'value1');
        await storage.write('key2', 'value2');
        storage.clear();
        expect(storage.store.size).to.equal(0);
      });

      it('should be callable on empty storage', () => {
        expect(() => storage.clear()).to.not.throw();
      });
    });

    describe('async behavior', () => {
      it('should resolve write as promise', async () => {
        const result = storage.write('key', 'value');
        expect(result).to.be.instanceOf(Promise);
        await result;
      });

      it('should resolve read as promise', async () => {
        const result = storage.read('key');
        expect(result).to.be.instanceOf(Promise);
        await result;
      });

      it('should support async/await pattern', async () => {
        await storage.write('test', 'data');
        const data = await storage.read('test');
        expect(data).to.equal('data');
      });
    });
  });
});
