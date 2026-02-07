// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * @fileoverview CLI integration tests for quantum-resistant mode
 *
 * Tests CLI preset and type flags for quantum-resistant password generation.
 */

import { expect } from 'chai';
import { spawn } from 'child_process';
import { join } from 'path';

const CLI_PATH = join(process.cwd(), 'src', 'bin', 'password-generator.js');
const TIMEOUT = 5000;

/**
 * Helper function to run CLI commands and capture output
 * @param {string[]} args - CLI arguments
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
 */
function runCLI(args) {
  return new Promise((resolve) => {
    const child = spawn('node', [CLI_PATH, ...args], {
      stdio: 'pipe',
      timeout: 5000
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code || 0
      });
    });

    child.on('error', (error) => {
      resolve({
        stdout,
        stderr: stderr + error.message,
        exitCode: 1
      });
    });
  });
}

describe('CLI Quantum-Resistant Integration', () => {

  describe('Quantum Preset Flag (-p quantum)', () => {

    it('should accept -p quantum flag', async function() {
      this.timeout(TIMEOUT);

      const result = await runCLI(['-p', 'quantum']);

      expect(result.exitCode).to.equal(0);
      expect(result.stdout).to.not.be.empty;
    });

    it('should generate high-entropy password with quantum preset', async function() {
      this.timeout(TIMEOUT);

      const result = await runCLI(['-p', 'quantum']);

      expect(result.exitCode).to.equal(0);
      // Should show high entropy (256+ bits)
      expect(result.stdout).to.match(/\d+-bit/);
    });
  });

  describe('Quantum-Resistant Type (-t quantum-resistant)', () => {

    it('should accept -t quantum-resistant flag', async function() {
      this.timeout(TIMEOUT);

      const result = await runCLI(['-t', 'quantum-resistant', '-l', '43', '-i', '2', '-s', '-']);

      expect(result.exitCode).to.equal(0);
      expect(result.stdout).to.not.be.empty;
    });

    it('should generate high-entropy password with quantum-resistant type', async function() {
      this.timeout(TIMEOUT);

      const result = await runCLI(['-t', 'quantum-resistant', '-l', '50', '-i', '1', '-s', '']);

      expect(result.exitCode).to.equal(0);
      // Check password length is at least 50 chars
      expect(result.stdout).to.match(/[A-Za-z0-9+/]{50,}/);
    });

    it('should reject length below minimum for quantum-resistant', async function() {
      this.timeout(TIMEOUT);

      const result = await runCLI(['-t', 'quantum-resistant', '-l', '20', '-i', '1', '-s', '']);

      expect(result.exitCode).to.equal(1);
      expect(result.stderr).to.include('Length');
    });
  });

  describe('Quantum with Audit Mode', () => {

    it('should show audit report with quantum preset', async function() {
      this.timeout(TIMEOUT);

      const result = await runCLI(['-p', 'quantum', '-a']);

      expect(result.exitCode).to.equal(0);
      expect(result.stdout).to.include('security audit');
    });

    it('should show entropy information in audit mode', async function() {
      this.timeout(TIMEOUT);

      const result = await runCLI(['-t', 'quantum-resistant', '-l', '44', '-i', '1', '-s', '', '-a']);

      expect(result.exitCode).to.equal(0);
      // Entropy is shown as "XXX-bit" in the output
      expect(result.stdout).to.match(/\d+-bit/);
    });
  });

  describe('Quantum with Learn Mode', () => {

    it('should show equivalent command in learn mode', async function() {
      this.timeout(TIMEOUT);

      const result = await runCLI(['-p', 'quantum', '--learn']);

      expect(result.exitCode).to.equal(0);
      expect(result.stdout).to.include('-p quantum');
    });
  });

  describe('Quantum with Clipboard', () => {

    it('should copy quantum password to clipboard', async function() {
      this.timeout(TIMEOUT);

      const result = await runCLI(['-p', 'quantum', '-c']);

      expect(result.exitCode).to.equal(0);
      expect(result.stdout).to.include('copied');
    });
  });

  describe('Output Consistency', () => {

    it('should produce consistent output format', async function() {
      this.timeout(TIMEOUT);

      const results = [];
      for (let i = 0; i < 3; i++) {
        const result = await runCLI(['-p', 'quantum']);
        expect(result.exitCode).to.equal(0);
        results.push(result.stdout);
      }

      // All should show strength indicator
      results.forEach(output => {
        expect(output).to.match(/●/);
        expect(output).to.match(/\d+-bit/);
      });
    });

    it('should respect separator parameter', async function() {
      this.timeout(TIMEOUT);

      const result = await runCLI(['-t', 'quantum-resistant', '-l', '43', '-i', '2', '-s', '@']);

      expect(result.exitCode).to.equal(0);
      expect(result.stdout).to.include('@');
    });
  });
});
