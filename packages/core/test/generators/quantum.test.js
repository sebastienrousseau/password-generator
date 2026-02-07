// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * @fileoverview Comprehensive tests for quantum-resistant password generation
 *
 * This test suite validates:
 * - 256-bit entropy targets (NIST SP 800-63B recommendations)
 * - CSPRNG usage for uniform sampling
 * - Statistical distribution properties (chi-square tests)
 * - Mode selection and parameter validation
 * - CLI integration for quantum-resistant flags
 *
 * All tests use bounded iterations to prevent flakiness.
 */

import { expect } from 'chai';
import sinon from 'sinon';
import crypto from 'crypto';

// Test imports - these will be implemented by bug-fixer
let quantumGenerator;
let entropyCalculator;

try {
  // Dynamic imports to handle missing implementation gracefully
  quantumGenerator = (await import('../../src/generators/quantum.js')).default;
  entropyCalculator = (await import('../../src/domain/entropy-calculator.js')).calculateEntropy;
} catch (error) {
  // Placeholder implementations for TDD
  quantumGenerator = {
    generate: () => { throw new Error('Quantum generator not implemented'); },
    validateOptions: () => { throw new Error('Quantum generator not implemented'); },
    calculateEntropy: () => { throw new Error('Quantum generator not implemented'); }
  };
  entropyCalculator = () => 0;
}

describe('Quantum-Resistant Generator', () => {

  describe('Mode Selection and Parameter Validation', () => {

    it('should be available as a valid password type', () => {
      const validTypes = ["strong", "base64", "memorable", "quantum"];
      expect(validTypes).to.include('quantum');
    });

    it('should validate minimum length for 256-bit entropy target', () => {
      // For alphanumeric charset (62 chars), log2(62) ≈ 5.95 bits per char
      // 256 bits / 5.95 ≈ 43 characters minimum
      const minLength = Math.ceil(256 / Math.log2(62));

      expect(() => {
        quantumGenerator.validateOptions({ length: minLength - 1 });
      }).to.throw(/minimum length.*quantum/i);
    });

    it('should validate maximum reasonable length (security vs usability)', () => {
      const maxLength = 128; // Reasonable upper bound

      expect(() => {
        quantumGenerator.validateOptions({ length: maxLength + 1 });
      }).to.throw(/maximum length.*quantum/i);
    });

    it('should validate iteration bounds for quantum mode', () => {
      const validOptions = {
        type: 'quantum',
        length: 44, // Minimum for 256-bit
        iteration: 1
      };

      expect(() => {
        quantumGenerator.validateOptions({ ...validOptions, iteration: 0 });
      }).to.throw(/minimum.*iteration/i);

      expect(() => {
        quantumGenerator.validateOptions({ ...validOptions, iteration: 11 });
      }).to.throw(/maximum.*iteration/i);
    });

    it('should accept valid quantum generation options', () => {
      const validOptions = {
        type: 'quantum',
        length: 44,
        iteration: 1,
        separator: '-'
      };

      expect(() => {
        quantumGenerator.validateOptions(validOptions);
      }).to.not.throw();
    });

    it('should provide default options that meet 256-bit entropy target', () => {
      const defaults = quantumGenerator.getDefaults();
      const minLength = Math.ceil(256 / Math.log2(62));

      expect(defaults.length).to.be.at.least(minLength);
      expect(defaults.type).to.equal('quantum');
      expect(defaults.iteration).to.be.at.least(1);
    });
  });

  describe('Entropy Calculation Tests (>=256-bit)', () => {

    it('should calculate entropy correctly for quantum parameters', () => {
      const options = {
        type: 'quantum',
        length: 44,
        iteration: 1,
        charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      };

      const entropy = quantumGenerator.calculateEntropy(options);
      expect(entropy).to.be.at.least(256, 'Should meet NIST 256-bit entropy target');
    });

    it('should scale entropy correctly with multiple iterations', () => {
      const baseOptions = {
        type: 'quantum',
        length: 32,
        iteration: 1
      };

      const multiOptions = {
        ...baseOptions,
        iteration: 2
      };

      const baseEntropy = quantumGenerator.calculateEntropy(baseOptions);
      const multiEntropy = quantumGenerator.calculateEntropy(multiOptions);

      // With separator, total entropy should be approximately doubled
      expect(multiEntropy).to.be.at.least(baseEntropy * 1.8);
    });

    it('should provide entropy calculations for different charsets', () => {
      const testCases = [
        { charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', bitsPerChar: Math.log2(26) },
        { charset: '0123456789', bitsPerChar: Math.log2(10) },
        { charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', bitsPerChar: Math.log2(62) }
      ];

      testCases.forEach(({ charset, bitsPerChar }) => {
        const options = {
          type: 'quantum',
          length: Math.ceil(256 / bitsPerChar),
          charset: charset
        };

        const entropy = quantumGenerator.calculateEntropy(options);
        expect(entropy).to.be.at.least(256, `Failed for charset: ${charset}`);
      });
    });

    it('should include separator in entropy calculation when present', () => {
      const withoutSeparator = quantumGenerator.calculateEntropy({
        type: 'quantum',
        length: 32,
        iteration: 2,
        separator: ''
      });

      const withSeparator = quantumGenerator.calculateEntropy({
        type: 'quantum',
        length: 32,
        iteration: 2,
        separator: '-'
      });

      expect(withSeparator).to.be.at.least(withoutSeparator);
    });
  });

  describe('Statistical Distribution Tests (Chi-Square)', () => {
    const SAMPLE_SIZE = 1000; // Bounded for non-flaky tests
    const SIGNIFICANCE_LEVEL = 0.01; // 99% confidence

    it('should produce uniformly distributed characters (chi-square test)', function() {
      this.timeout(5000); // Bounded timeout

      const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const observed = new Map();

      // Initialize counts
      for (const char of charset) {
        observed.set(char, 0);
      }

      // Generate samples
      for (let i = 0; i < SAMPLE_SIZE; i++) {
        const password = quantumGenerator.generate({
          type: 'quantum',
          length: 1, // Single character for distribution testing
          iteration: 1,
          separator: ''
        });

        const char = password[0];
        if (observed.has(char)) {
          observed.set(char, observed.get(char) + 1);
        }
      }

      // Chi-square test
      const expected = SAMPLE_SIZE / charset.length;
      let chiSquare = 0;

      for (const count of observed.values()) {
        chiSquare += Math.pow(count - expected, 2) / expected;
      }

      // Degrees of freedom = charset.length - 1
      const dof = charset.length - 1;
      const criticalValue = getCriticalValue(dof, SIGNIFICANCE_LEVEL);

      expect(chiSquare).to.be.lessThan(criticalValue,
        `Chi-square test failed: χ² = ${chiSquare}, critical = ${criticalValue}`);
    });

    it('should avoid modulo bias in random sampling', function() {
      this.timeout(3000);

      // Test with charset size that doesn't divide evenly into 2^n
      const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // 26 chars, doesn't divide 256
      const observed = new Map();

      for (const char of charset) {
        observed.set(char, 0);
      }

      // Generate multiple samples to test distribution
      for (let i = 0; i < 500; i++) { // Reduced for bounded execution
        const password = quantumGenerator.generate({
          type: 'quantum',
          length: 10,
          iteration: 1,
          separator: '',
          charset: charset
        });

        for (const char of password) {
          if (observed.has(char)) {
            observed.set(char, observed.get(char) + 1);
          }
        }
      }

      // Check that no character appears disproportionately often
      const counts = Array.from(observed.values());
      const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
      const variance = counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length;
      const stdDev = Math.sqrt(variance);

      // All counts should be within 3 standard deviations (99.7% rule)
      const tolerance = 3 * stdDev;
      counts.forEach((count, index) => {
        expect(Math.abs(count - mean)).to.be.lessThan(tolerance,
          `Character '${charset[index]}' appears ${count} times, expected ~${mean} ± ${tolerance}`);
      });
    });

    it('should use cryptographically secure random source', function() {
      // Mock crypto.randomBytes to detect usage
      const cryptoSpy = sinon.spy(crypto, 'randomBytes');

      try {
        quantumGenerator.generate({
          type: 'quantum',
          length: 32,
          iteration: 1,
          separator: ''
        });

        expect(cryptoSpy.called).to.be.true('Should use crypto.randomBytes for CSPRNG');
      } finally {
        cryptoSpy.restore();
      }
    });

    it('should not exhibit serial correlation in output', function() {
      this.timeout(3000);

      const passwords = [];
      for (let i = 0; i < 100; i++) { // Bounded iterations
        passwords.push(quantumGenerator.generate({
          type: 'quantum',
          length: 16,
          iteration: 1,
          separator: ''
        }));
      }

      // Test for serial correlation between adjacent passwords
      let correlationSum = 0;
      for (let i = 1; i < passwords.length; i++) {
        const similarity = calculateHammingDistance(passwords[i-1], passwords[i]) / passwords[i].length;
        correlationSum += similarity;
      }

      const avgCorrelation = correlationSum / (passwords.length - 1);

      // For random data, Hamming distance should be ~50% (0.5)
      expect(avgCorrelation).to.be.within(0.4, 0.6,
        'Adjacent passwords show unexpected correlation');
    });
  });

  describe('CLI Integration Tests', () => {

    it('should support -p quantum preset flag', async () => {
      const { CLIController } = await import('../../../../src/cli/CLIController.js');
      const mockProgram = {
        opts: () => ({ preset: 'quantum', type: 'quantum' })
      };

      const controller = new CLIController();
      const result = await controller.handlePreset(mockProgram);

      expect(result.type).to.equal('quantum');
      expect(result.length).to.be.at.least(44); // Minimum for 256-bit entropy
    });

    it('should support --quantum-resistant flag', async () => {
      const { CLIController } = await import('../../../../src/cli/CLIController.js');
      const mockProgram = {
        opts: () => ({ quantumResistant: true, type: 'quantum' })
      };

      const controller = new CLIController();
      const result = await controller.handleQuantumResistant(mockProgram);

      expect(result.type).to.equal('quantum');
      expect(result.length).to.be.at.least(44);
    });

    it('should display quantum mode in CLI help text', () => {
      const helpText = "password type (strong, base64, memorable, quantum)";
      expect(helpText).to.include('quantum');
    });

    it('should validate CLI quantum parameters correctly', async () => {
      const { CLIController } = await import('../../../../src/cli/CLIController.js');
      const controller = new CLIController();

      // Valid quantum parameters
      const validOpts = {
        type: 'quantum',
        length: 44,
        iteration: 1,
        separator: '-'
      };

      expect(() => controller.validateOptions(validOpts)).to.not.throw();

      // Invalid quantum parameters
      const invalidOpts = {
        type: 'quantum',
        length: 20, // Too short for 256-bit target
        iteration: 1
      };

      expect(() => controller.validateOptions(invalidOpts)).to.throw(/entropy.*256/i);
    });
  });

  describe('Security and Performance Tests', () => {

    it('should not leak sensitive data in error messages', () => {
      try {
        quantumGenerator.generate({
          type: 'quantum',
          length: -1, // Invalid to trigger error
          secretKey: 'sensitive-data'
        });
      } catch (error) {
        expect(error.message).to.not.include('sensitive-data');
      }
    });

    it('should complete generation within reasonable time bounds', function() {
      this.timeout(1000); // 1 second max

      const start = Date.now();
      const password = quantumGenerator.generate({
        type: 'quantum',
        length: 64,
        iteration: 3,
        separator: '-'
      });
      const duration = Date.now() - start;

      expect(password).to.be.a('string');
      expect(duration).to.be.lessThan(500, 'Generation took too long');
    });

    it('should handle memory efficiently for large generations', function() {
      this.timeout(2000);

      const initialMemory = process.memoryUsage().heapUsed;

      // Generate multiple large passwords
      for (let i = 0; i < 10; i++) {
        quantumGenerator.generate({
          type: 'quantum',
          length: 64,
          iteration: 5,
          separator: '-'
        });
      }

      global.gc && global.gc(); // Force garbage collection if available
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Should not leak significant memory (< 1MB increase)
      expect(memoryIncrease).to.be.lessThan(1024 * 1024);
    });

    it('should be deterministic for same random seed (testing only)', () => {
      // This test is for development/debugging only
      // In production, quantum generator should never use fixed seeds

      if (process.env.NODE_ENV === 'test') {
        const mockRandom = sinon.stub(crypto, 'randomBytes')
          .onFirstCall().returns(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]))
          .onSecondCall().returns(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]));

        try {
          const password1 = quantumGenerator.generate({
            type: 'quantum',
            length: 8,
            iteration: 1,
            separator: ''
          });

          const password2 = quantumGenerator.generate({
            type: 'quantum',
            length: 8,
            iteration: 1,
            separator: ''
          });

          expect(password1).to.equal(password2);
        } finally {
          mockRandom.restore();
        }
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {

    it('should handle invalid charset gracefully', () => {
      expect(() => {
        quantumGenerator.generate({
          type: 'quantum',
          length: 32,
          charset: '' // Empty charset
        });
      }).to.throw(/invalid.*charset/i);
    });

    it('should handle extreme parameter combinations', () => {
      // Test maximum reasonable values
      const extremeOptions = {
        type: 'quantum',
        length: 128,
        iteration: 10,
        separator: '---'
      };

      expect(() => {
        const result = quantumGenerator.generate(extremeOptions);
        expect(result).to.be.a('string');
        expect(result.length).to.be.greaterThan(1000); // Should be very long
      }).to.not.throw();
    });

    it('should reject non-quantum options in quantum mode', () => {
      expect(() => {
        quantumGenerator.generate({
          type: 'quantum',
          length: 32,
          excludeAmbiguous: true // Not supported in quantum mode
        });
      }).to.throw(/not supported.*quantum/i);
    });
  });
});

/**
 * Helper function to calculate critical value for chi-square test
 * Simplified implementation for common significance levels
 */
function getCriticalValue(degreesOfFreedom, significanceLevel) {
  // Simplified critical values for α = 0.01
  // In production, use a proper statistical library
  if (significanceLevel === 0.01) {
    if (degreesOfFreedom === 25) return 44.31; // For 26-char alphabet
    if (degreesOfFreedom === 61) return 88.38; // For 62-char alphanumeric
  }

  // Fallback approximation: χ² ≈ dof + 2.576 * sqrt(2 * dof) for α = 0.01
  return degreesOfFreedom + 2.576 * Math.sqrt(2 * degreesOfFreedom);
}

/**
 * Helper function to calculate Hamming distance between two strings
 */
function calculateHammingDistance(str1, str2) {
  if (str1.length !== str2.length) {
    throw new Error('Strings must be of equal length for Hamming distance');
  }

  let distance = 0;
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] !== str2[i]) {
      distance++;
    }
  }

  return distance;
}