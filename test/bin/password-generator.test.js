import { PasswordGenerator } from '../../src/bin/password-generator.js';
import { expect } from 'chai';
import { exec } from 'child_process';
import assert from 'assert';

describe('PasswordGenerator', function () {
  it('should be a function', function () {
    expect(PasswordGenerator).to.be.a('function');
  });

  it('should generate a strong password', async function () {
    const result = await PasswordGenerator({
      type: 'strong',
      length: 12,
      iteration: 3,
      separator: '-',
    });
    expect(result).to.be.a('string');
    const chunks = result.split('-');
    expect(chunks).to.have.lengthOf(3);
    chunks.forEach((chunk) => expect(chunk).to.have.lengthOf(12));
  });

  it('should generate a base64 password', async function () {
    const result = await PasswordGenerator({
      type: 'base64',
      length: 8,
      iteration: 2,
      separator: '.',
    });
    expect(result).to.be.a('string');
    expect(result).to.include('.');
  });

  it('should generate a memorable password', async function () {
    const result = await PasswordGenerator({
      type: 'memorable',
      iteration: 4,
      separator: '-',
    });
    expect(result).to.be.a('string');
    const words = result.split('-');
    expect(words).to.have.lengthOf(4);
  });

  it('should throw an error when type is missing', async function () {
    await assert.rejects(
      () => PasswordGenerator({}),
      { message: 'Password type is required' }
    );
  });

  it('should throw an error for an unknown type', async function () {
    await assert.rejects(
      () => PasswordGenerator({ type: 'unknown', length: 8, iteration: 2, separator: '-' }),
      (error) => error.message.includes('Unknown password type: "unknown"')
    );
  });

  it('should rethrow generator errors for valid types with invalid params', async function () {
    await assert.rejects(
      () => PasswordGenerator({ type: 'strong', length: -1, iteration: 0, separator: '-' }),
      RangeError
    );
  });
});

describe('CLI Integration', function () {
  this.timeout(10000);

  it('should generate a strong password via CLI', function (done) {
    exec("node index.js -t strong -l 10 -i 2 -s '-'", (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('Generated Password:');
      expect(stdout).to.not.include('Copied to clipboard');
      done();
    });
  });

  it('should generate a base64 password via CLI', function (done) {
    exec("node index.js -t base64 -l 8 -i 3 -s '.'", (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('Generated Password:');
      done();
    });
  });

  it('should generate a memorable password via CLI', function (done) {
    exec("node index.js -t memorable -i 3 -s '-'", (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('Generated Password:');
      done();
    });
  });

  it('should copy to clipboard when --clipboard flag is provided', function (done) {
    exec("node index.js -t strong -l 8 -i 1 -s '-' --clipboard", (error, stdout, stderr) => {
      // clipboard may fail in headless environments, but the flag path is exercised
      if (error) {
        expect(stderr).to.include('Error');
      } else {
        expect(stdout).to.include('Generated Password:');
        expect(stdout).to.include('Copied to clipboard');
      }
      done();
    });
  });

  it('should exit with error for invalid type via CLI', function (done) {
    exec("node index.js -t invalid -i 2 -s '-'", (error, stdout, stderr) => {
      expect(error).to.not.be.null;
      expect(stderr).to.include('Error');
      done();
    });
  });

  it('should show help with --help flag', function (done) {
    exec('node index.js --help', (error, stdout) => {
      expect(error).to.be.null;
      expect(stdout).to.include('password-generator');
      expect(stdout).to.include('--type');
      expect(stdout).to.include('--clipboard');
      done();
    });
  });

  it('should exit silently with no arguments', function (done) {
    exec('node index.js', (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stderr).to.equal('');
      done();
    });
  });

  it('should generate password with quick preset', function (done) {
    exec('node index.js -p quick', (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('Generated Password:');
      done();
    });
  });

  it('should generate password with secure preset', function (done) {
    exec('node index.js -p secure', (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('Generated Password:');
      done();
    });
  });

  it('should generate password with memorable preset', function (done) {
    exec('node index.js -p memorable', (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('Generated Password:');
      done();
    });
  });

  it('should exit with error for invalid preset', function (done) {
    exec('node index.js -p invalid', (error, stdout, stderr) => {
      expect(error).to.not.be.null;
      expect(stderr).to.include('Invalid preset');
      done();
    });
  });

  it('should show learn panel with --learn flag', function (done) {
    exec("node index.js -t strong -l 10 -i 2 -s '-' --learn", (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('Generated Password:');
      expect(stdout).to.include('COMMAND LEARNING');
      expect(stdout).to.include('password-generator');
      done();
    });
  });

  it('should show audit report with --audit flag', function (done) {
    exec("node index.js -t strong -l 10 -i 2 -s '-' --audit", (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('Generated Password:');
      expect(stdout).to.include('SECURITY AUDIT REPORT');
      done();
    });
  });

  it('should combine preset with learn flag', function (done) {
    exec('node index.js -p quick --learn', (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('Generated Password:');
      expect(stdout).to.include('COMMAND LEARNING');
      expect(stdout).to.include('-p quick');
      done();
    });
  });

  it('should combine preset with audit flag', function (done) {
    exec('node index.js -p secure --audit', (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('Generated Password:');
      expect(stdout).to.include('SECURITY AUDIT REPORT');
      done();
    });
  });

  it('should allow preset override with custom type', function (done) {
    exec("node index.js -p quick -t base64", (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('Generated Password:');
      done();
    });
  });

  it('should allow preset override with custom iteration', function (done) {
    exec("node index.js -p quick -i 5", (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('Generated Password:');
      done();
    });
  });

  it('should allow preset override with custom length', function (done) {
    exec("node index.js -p quick -l 20", (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('Generated Password:');
      done();
    });
  });

  it('should allow preset override with custom separator', function (done) {
    exec("node index.js -p quick -s '_'", (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('Generated Password:');
      done();
    });
  });

  it('should show learn panel with clipboard flag', function (done) {
    exec("node index.js -t strong -l 10 -i 2 -s '-' --learn -c", (error, stdout, stderr) => {
      // May fail due to clipboard in headless environment
      if (error) {
        done();
      } else {
        expect(stdout).to.include('COMMAND LEARNING');
        expect(stdout).to.include('-c');
        done();
      }
    });
  });

  it('should show learn panel with audit flag', function (done) {
    exec("node index.js -t strong -l 10 -i 2 -s '-' --learn --audit", (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('COMMAND LEARNING');
      expect(stdout).to.include('-a');
      done();
    });
  });

  it('should exit with error when missing required options without preset', function (done) {
    exec("node index.js -t strong", (error, stdout, stderr) => {
      expect(error).to.not.be.null;
      expect(stderr).to.include('Missing required options');
      done();
    });
  });

  it('should exit with error when missing type without preset', function (done) {
    exec("node index.js -i 3 -s '-'", (error, stdout, stderr) => {
      expect(error).to.not.be.null;
      expect(stderr).to.include('Missing required options');
      expect(stderr).to.include('type');
      done();
    });
  });

  it('should exit with error for invalid type with preset override', function (done) {
    exec("node index.js -p quick -t invalid", (error, stdout, stderr) => {
      expect(error).to.not.be.null;
      expect(stderr).to.include('Invalid password type');
      done();
    });
  });

  it('should show learn with preset override iteration', function (done) {
    exec("node index.js -p quick -i 5 --learn", (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('COMMAND LEARNING');
      expect(stdout).to.include('-i 5');
      done();
    });
  });

  it('should show learn with preset override separator', function (done) {
    exec("node index.js -p quick -s '_' --learn", (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('COMMAND LEARNING');
      expect(stdout).to.include('-s "_"');
      done();
    });
  });

  it('should show learn with preset override type', function (done) {
    exec("node index.js -p quick -t base64 --learn", (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('COMMAND LEARNING');
      expect(stdout).to.include('-t base64');
      done();
    });
  });

  it('should show learn with preset override length', function (done) {
    exec("node index.js -p quick -l 20 --learn", (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stdout).to.include('COMMAND LEARNING');
      expect(stdout).to.include('-l 20');
      done();
    });
  });
});
