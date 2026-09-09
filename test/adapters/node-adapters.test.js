// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import { mkdir, rm, access, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

// Import adapters under test
import { NodeConsoleLogger, LogLevel } from '../../src/adapters/node/console-logger.js';
import { NodeFsStorage } from '../../src/adapters/node/fs-storage.js';
import { NodeSystemClock } from '../../src/adapters/node/system-clock.js';

describe('Node.js Adapters', () => {
  describe('NodeConsoleLogger', () => {
    let logger;
    let consoleStubs;

    beforeEach(() => {
      consoleStubs = {
        debug: sinon.stub(console, 'debug'),
        info: sinon.stub(console, 'info'),
        warn: sinon.stub(console, 'warn'),
        error: sinon.stub(console, 'error'),
      };
    });

    afterEach(() => {
      sinon.restore();
    });

    describe('constructor', () => {
      it('should create logger with default options', () => {
        logger = new NodeConsoleLogger();
        expect(logger.level).to.equal(LogLevel.INFO);
        expect(logger.timestamps).to.be.false;
        expect(logger.prefix).to.equal('');
      });

      it('should create logger with custom level', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.DEBUG });
        expect(logger.level).to.equal(LogLevel.DEBUG);
      });

      it('should create logger with custom prefix', () => {
        logger = new NodeConsoleLogger({ prefix: 'MyApp' });
        expect(logger.prefix).to.equal('MyApp');
      });

      it('should create logger with timestamps enabled', () => {
        logger = new NodeConsoleLogger({ timestamps: true });
        expect(logger.timestamps).to.be.true;
      });

      it('should create logger with all custom options', () => {
        logger = new NodeConsoleLogger({
          level: LogLevel.WARN,
          timestamps: true,
          prefix: 'Test',
        });
        expect(logger.level).to.equal(LogLevel.WARN);
        expect(logger.timestamps).to.be.true;
        expect(logger.prefix).to.equal('Test');
      });
    });

    describe('_format', () => {
      it('should format message without timestamp or prefix', () => {
        logger = new NodeConsoleLogger();
        const formatted = logger._format('INFO', 'test message');
        expect(formatted).to.equal('[INFO] test message');
      });

      it('should format message with prefix', () => {
        logger = new NodeConsoleLogger({ prefix: 'MyApp' });
        const formatted = logger._format('DEBUG', 'test message');
        expect(formatted).to.equal('[DEBUG] [MyApp] test message');
      });

      it('should format message with timestamp', () => {
        logger = new NodeConsoleLogger({ timestamps: true });
        const formatted = logger._format('WARN', 'test message');
        // Should match pattern: [ISO_DATE] [WARN] test message
        expect(formatted).to.match(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\] \[WARN\] test message$/
        );
      });

      it('should format message with both timestamp and prefix', () => {
        logger = new NodeConsoleLogger({ timestamps: true, prefix: 'App' });
        const formatted = logger._format('ERROR', 'test');
        expect(formatted).to.match(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z\] \[ERROR\] \[App\] test$/
        );
      });
    });

    describe('debug', () => {
      it('should log debug message when level is DEBUG', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.DEBUG });
        logger.debug('debug message');
        expect(consoleStubs.debug.calledOnce).to.be.true;
        expect(consoleStubs.debug.firstCall.args[0]).to.include('debug message');
      });

      it('should not log debug message when level is INFO', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.INFO });
        logger.debug('debug message');
        expect(consoleStubs.debug.called).to.be.false;
      });

      it('should log debug message with metadata', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.DEBUG });
        const metadata = { key: 'value' };
        logger.debug('debug message', metadata);
        expect(consoleStubs.debug.calledOnce).to.be.true;
        expect(consoleStubs.debug.firstCall.args[1]).to.deep.equal(metadata);
      });

      it('should not include metadata when empty object', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.DEBUG });
        logger.debug('debug message', {});
        expect(consoleStubs.debug.calledOnce).to.be.true;
        expect(consoleStubs.debug.firstCall.args).to.have.lengthOf(1);
      });
    });

    describe('info', () => {
      it('should log info message when level is DEBUG', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.DEBUG });
        logger.info('info message');
        expect(consoleStubs.info.calledOnce).to.be.true;
      });

      it('should log info message when level is INFO', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.INFO });
        logger.info('info message');
        expect(consoleStubs.info.calledOnce).to.be.true;
      });

      it('should not log info message when level is WARN', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.WARN });
        logger.info('info message');
        expect(consoleStubs.info.called).to.be.false;
      });

      it('should log info message with metadata', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.INFO });
        const metadata = { count: 42, items: ['a', 'b'] };
        logger.info('info message', metadata);
        expect(consoleStubs.info.calledOnce).to.be.true;
        expect(consoleStubs.info.firstCall.args[1]).to.deep.equal(metadata);
      });
    });

    describe('warn', () => {
      it('should log warn message when level is DEBUG', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.DEBUG });
        logger.warn('warn message');
        expect(consoleStubs.warn.calledOnce).to.be.true;
      });

      it('should log warn message when level is WARN', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.WARN });
        logger.warn('warn message');
        expect(consoleStubs.warn.calledOnce).to.be.true;
      });

      it('should not log warn message when level is ERROR', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.ERROR });
        logger.warn('warn message');
        expect(consoleStubs.warn.called).to.be.false;
      });

      it('should log warn message with metadata', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.WARN });
        const metadata = { warning: 'low memory' };
        logger.warn('warn message', metadata);
        expect(consoleStubs.warn.calledOnce).to.be.true;
        expect(consoleStubs.warn.firstCall.args[1]).to.deep.equal(metadata);
      });
    });

    describe('error', () => {
      it('should log error message at any level except SILENT', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.ERROR });
        logger.error('error message');
        expect(consoleStubs.error.calledOnce).to.be.true;
      });

      it('should not log error message when level is SILENT', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.SILENT });
        logger.error('error message');
        expect(consoleStubs.error.called).to.be.false;
      });

      it('should log error message with Error object', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.ERROR });
        const error = new Error('Test error');
        logger.error('error occurred', error);
        expect(consoleStubs.error.calledOnce).to.be.true;
        expect(consoleStubs.error.firstCall.args[1]).to.equal(error);
      });

      it('should log error message without Error object', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.ERROR });
        logger.error('error message', null);
        expect(consoleStubs.error.calledOnce).to.be.true;
        expect(consoleStubs.error.firstCall.args).to.have.lengthOf(1);
      });
    });

    describe('setLevel', () => {
      it('should change log level', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.INFO });
        expect(logger.level).to.equal(LogLevel.INFO);

        logger.setLevel(LogLevel.DEBUG);
        expect(logger.level).to.equal(LogLevel.DEBUG);

        logger.debug('now visible');
        expect(consoleStubs.debug.calledOnce).to.be.true;
      });

      it('should allow setting level to SILENT', () => {
        logger = new NodeConsoleLogger({ level: LogLevel.DEBUG });
        logger.setLevel(LogLevel.SILENT);

        logger.debug('hidden');
        logger.info('hidden');
        logger.warn('hidden');
        logger.error('hidden');

        expect(consoleStubs.debug.called).to.be.false;
        expect(consoleStubs.info.called).to.be.false;
        expect(consoleStubs.warn.called).to.be.false;
        expect(consoleStubs.error.called).to.be.false;
      });
    });

    describe('LogLevel enum', () => {
      it('should have correct values', () => {
        expect(LogLevel.DEBUG).to.equal(0);
        expect(LogLevel.INFO).to.equal(1);
        expect(LogLevel.WARN).to.equal(2);
        expect(LogLevel.ERROR).to.equal(3);
        expect(LogLevel.SILENT).to.equal(4);
      });
    });
  });

  describe('NodeFsStorage', () => {
    let storage;
    let testDir;

    beforeEach(async () => {
      // Create a unique test directory for each test
      testDir = join(tmpdir(), `pwd-gen-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
      await mkdir(testDir, { recursive: true });
      storage = new NodeFsStorage({ basePath: testDir });
    });

    afterEach(async () => {
      // Clean up test directory
      try {
        await rm(testDir, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    });

    describe('constructor', () => {
      it('should create storage with default options', () => {
        const defaultStorage = new NodeFsStorage();
        expect(defaultStorage.basePath).to.equal(process.cwd());
        expect(defaultStorage.encoding).to.equal('utf8');
      });

      it('should create storage with custom basePath', () => {
        expect(storage.basePath).to.equal(testDir);
      });

      it('should create storage with custom encoding', () => {
        const customStorage = new NodeFsStorage({ encoding: 'ascii' });
        expect(customStorage.encoding).to.equal('ascii');
      });
    });

    describe('_resolvePath', () => {
      it('should sanitize path to prevent traversal', () => {
        const path = storage._resolvePath('../../../etc/passwd');
        expect(path).to.not.include('..');
        expect(path).to.include('______etc_passwd');
      });

      it('should keep alphanumeric and safe characters', () => {
        const path = storage._resolvePath('my-file_v1.2.txt');
        expect(path).to.equal(join(testDir, 'my-file_v1.2.txt'));
      });

      it('should replace special characters with underscore', () => {
        const path = storage._resolvePath('file:with/special*chars');
        expect(path).to.equal(join(testDir, 'file_with_special_chars'));
      });
    });

    describe('readFile', () => {
      it('should read existing file', async () => {
        const content = 'test content';
        await writeFile(join(testDir, 'test.txt'), content);

        const result = await storage.readFile('test.txt');
        expect(result).to.equal(content);
      });

      it('should return null for non-existent file', async () => {
        const result = await storage.readFile('nonexistent.txt');
        expect(result).to.be.null;
      });

      it('should handle sanitized paths', async () => {
        await writeFile(join(testDir, 'test_file'), 'content');
        const result = await storage.readFile('test/file');
        expect(result).to.equal('content');
      });
    });

    describe('writeFile', () => {
      it('should write content to file', async () => {
        await storage.writeFile('output.txt', 'written content');

        const filePath = join(testDir, 'output.txt');
        await access(filePath); // Should not throw
      });

      it('should overwrite existing file', async () => {
        await storage.writeFile('overwrite.txt', 'original');
        await storage.writeFile('overwrite.txt', 'updated');

        const result = await storage.readFile('overwrite.txt');
        expect(result).to.equal('updated');
      });

      it('should write empty content', async () => {
        await storage.writeFile('empty.txt', '');

        const result = await storage.readFile('empty.txt');
        expect(result).to.equal('');
      });
    });

    describe('exists', () => {
      it('should return true for existing file', async () => {
        await storage.writeFile('exists.txt', 'content');

        const result = await storage.exists('exists.txt');
        expect(result).to.be.true;
      });

      it('should return false for non-existent file', async () => {
        const result = await storage.exists('not-there.txt');
        expect(result).to.be.false;
      });
    });

    describe('delete', () => {
      it('should delete existing file and return true', async () => {
        await storage.writeFile('to-delete.txt', 'content');
        expect(await storage.exists('to-delete.txt')).to.be.true;

        const result = await storage.delete('to-delete.txt');
        expect(result).to.be.true;
        expect(await storage.exists('to-delete.txt')).to.be.false;
      });

      it('should return false for non-existent file', async () => {
        const result = await storage.delete('nonexistent.txt');
        expect(result).to.be.false;
      });
    });

    describe('setBasePath', () => {
      it('should change base path', async () => {
        const newDir = join(tmpdir(), `pwd-gen-new-${Date.now()}`);
        await mkdir(newDir, { recursive: true });

        try {
          storage.setBasePath(newDir);
          expect(storage.basePath).to.equal(newDir);

          await storage.writeFile('new-path.txt', 'content');
          await access(join(newDir, 'new-path.txt')); // Should not throw
        } finally {
          await rm(newDir, { recursive: true, force: true });
        }
      });
    });

    describe('_ensureDir', () => {
      it('should create directory if it does not exist', async () => {
        const nestedDir = join(testDir, 'nested', 'deep');
        const filePath = join(nestedDir, 'file.txt');

        await storage._ensureDir(filePath);
        await access(nestedDir); // Should not throw
      });

      it('should not fail if directory already exists', async () => {
        const existingDir = testDir;
        const filePath = join(existingDir, 'file.txt');

        // Should not throw
        await storage._ensureDir(filePath);
        await storage._ensureDir(filePath);
      });
    });

    describe('error handling', () => {
      it('should throw non-ENOENT errors on readFile', async () => {
        // Use invalid path that causes a different error than ENOENT
        // Setting basePath to a file instead of directory causes ENOTDIR
        const filePath = join(testDir, 'regular-file.txt');
        await writeFile(filePath, 'content');

        const badStorage = new NodeFsStorage({ basePath: filePath });

        try {
          // Trying to read from a path where basePath is a file (not directory)
          // will cause an error other than ENOENT
          await badStorage.readFile('subfile');
          expect.fail('Should have thrown');
        } catch (error) {
          // Should throw an error (ENOTDIR or similar), not return null
          expect(error).to.be.instanceOf(Error);
          expect(error.code).to.not.equal('ENOENT');
        }
      });

      it('should throw non-ENOENT errors on delete', async () => {
        // Use invalid path that causes a different error than ENOENT
        const filePath = join(testDir, 'regular-file2.txt');
        await writeFile(filePath, 'content');

        const badStorage = new NodeFsStorage({ basePath: filePath });

        try {
          await badStorage.delete('subfile');
          expect.fail('Should have thrown');
        } catch (error) {
          expect(error).to.be.instanceOf(Error);
          expect(error.code).to.not.equal('ENOENT');
        }
      });
    });

    describe('integration', () => {
      it('should handle full lifecycle: write, read, exists, delete', async () => {
        const key = 'lifecycle-test';
        const content = 'test data';

        // Write
        await storage.writeFile(key, content);

        // Read
        const readContent = await storage.readFile(key);
        expect(readContent).to.equal(content);

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
    });
  });

  describe('NodeSystemClock', () => {
    let clock;

    beforeEach(() => {
      clock = new NodeSystemClock();
    });

    describe('now', () => {
      it('should return current timestamp in milliseconds', () => {
        const before = Date.now();
        const result = clock.now();
        const after = Date.now();

        expect(result).to.be.a('number');
        expect(result).to.be.at.least(before);
        expect(result).to.be.at.most(after);
      });

      it('should return different values over time', async () => {
        const first = clock.now();
        await new Promise((resolve) => setTimeout(resolve, 10));
        const second = clock.now();

        expect(second).to.be.greaterThan(first);
      });
    });

    describe('performanceNow', () => {
      it('should return high-resolution timestamp', () => {
        const result = clock.performanceNow();

        expect(result).to.be.a('number');
        expect(result).to.be.at.least(0);
      });

      it('should return increasing values', async () => {
        const first = clock.performanceNow();
        await new Promise((resolve) => setTimeout(resolve, 5));
        const second = clock.performanceNow();

        expect(second).to.be.greaterThan(first);
      });

      it('should have sub-millisecond precision', () => {
        const values = [];
        for (let i = 0; i < 100; i++) {
          values.push(clock.performanceNow());
        }

        // At least some values should differ by less than 1ms
        let hasFractionalDiff = false;
        for (let i = 1; i < values.length; i++) {
          const diff = values[i] - values[i - 1];
          if (diff > 0 && diff < 1) {
            hasFractionalDiff = true;
            break;
          }
        }
        expect(hasFractionalDiff).to.be.true;
      });
    });

    describe('toISOString', () => {
      it('should return valid ISO 8601 string', () => {
        const result = clock.toISOString();

        expect(result).to.be.a('string');
        expect(result).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      });

      it('should return current time', () => {
        const before = new Date().toISOString();
        const result = clock.toISOString();
        const after = new Date().toISOString();

        // Compare date parts (ignore milliseconds for comparison)
        const beforeDate = new Date(before);
        const resultDate = new Date(result);
        const afterDate = new Date(after);

        expect(resultDate.getTime()).to.be.at.least(beforeDate.getTime() - 1000);
        expect(resultDate.getTime()).to.be.at.most(afterDate.getTime() + 1000);
      });
    });

    describe('toLocaleString', () => {
      it('should return locale-formatted string with default options', () => {
        const result = clock.toLocaleString();

        expect(result).to.be.a('string');
        expect(result.length).to.be.greaterThan(0);
      });

      it('should accept custom locale', () => {
        const result = clock.toLocaleString('de-DE');

        expect(result).to.be.a('string');
        // German format typically uses dots for date separators
        expect(result.length).to.be.greaterThan(0);
      });

      it('should accept custom options', () => {
        const result = clock.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        expect(result).to.be.a('string');
        // Should contain day of week and month name
        expect(result.length).to.be.greaterThan(10);
      });
    });

    describe('fromTimestamp', () => {
      it('should create Date from timestamp', () => {
        const timestamp = 1609459200000; // 2021-01-01T00:00:00.000Z
        const result = clock.fromTimestamp(timestamp);

        expect(result).to.be.instanceOf(Date);
        expect(result.getTime()).to.equal(timestamp);
      });

      it('should handle current timestamp', () => {
        const now = Date.now();
        const result = clock.fromTimestamp(now);

        expect(result.getTime()).to.equal(now);
      });

      it('should handle zero timestamp', () => {
        const result = clock.fromTimestamp(0);

        expect(result.getTime()).to.equal(0);
        expect(result.toISOString()).to.equal('1970-01-01T00:00:00.000Z');
      });
    });

    describe('measure', () => {
      it('should measure async function execution time', async () => {
        const asyncFn = async () => {
          await new Promise((resolve) => setTimeout(resolve, 50));
          return 'done';
        };

        const { result, elapsed } = await clock.measure(asyncFn);

        expect(result).to.equal('done');
        expect(elapsed).to.be.a('number');
        expect(elapsed).to.be.at.least(40); // Allow some margin
        expect(elapsed).to.be.at.most(200); // Upper bound for CI environments
      });

      it('should measure fast function accurately', async () => {
        const asyncFn = async () => 42;

        const { result, elapsed } = await clock.measure(asyncFn);

        expect(result).to.equal(42);
        expect(elapsed).to.be.at.least(0);
        expect(elapsed).to.be.lessThan(50); // Should be very fast
      });

      it('should handle async function that throws', async () => {
        const error = new Error('Test error');
        const asyncFn = async () => {
          throw error;
        };

        try {
          await clock.measure(asyncFn);
          expect.fail('Should have thrown');
        } catch (e) {
          expect(e).to.equal(error);
        }
      });

      it('should return elapsed time even for instant functions', async () => {
        const asyncFn = async () => null;

        const { result, elapsed } = await clock.measure(asyncFn);

        expect(result).to.be.null;
        expect(elapsed).to.be.a('number');
        expect(elapsed).to.be.at.least(0);
      });
    });
  });
});
