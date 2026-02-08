// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Shared Test Fixtures for Cross-Interface Parity Testing.
 *
 * These fixtures define the canonical test cases that ALL adapters
 * (CLI, Web, Mobile) must pass identically. The fixtures include:
 *
 * 1. Password configurations with expected outputs
 * 2. Validation test cases with expected results
 * 3. Entropy calculation test cases with expected values
 *
 * IMPORTANT: When modifying these fixtures, ALL adapter parity tests
 * must be updated and verified to maintain cross-interface parity.
 *
 * @module parity/fixtures
 */

import { PARITY_SEEDS } from './MockRandomGenerator.js';

/**
 * Password Generation Parity Test Cases.
 *
 * Each case defines:
 * - config: Password generation configuration
 * - seed: MockRandomGenerator seed to use
 * - expectedPassword: Exact expected output (calculated with deterministic mock)
 * - description: Human-readable test description
 */
export const GENERATION_PARITY_CASES = [
  // ============================================
  // Strong Password Cases
  // ============================================
  {
    id: 'strong-basic',
    description: 'Basic strong password (16 chars, 1 iteration)',
    config: {
      type: 'strong',
      length: 16,
      iteration: 1,
      separator: '-',
    },
    seed: PARITY_SEEDS.PRIMARY,
    // Expected output with seed 42, incrementing sequence starting at 0
    // Characters are selected from BASE64_CHARSET using modulo 64
    expectedPassword: 'ABCDEFGHIJKLMNOPq', // Will be computed
    expectedLength: 16,
    expectedChunks: 1,
  },
  {
    id: 'strong-multi-chunk',
    description: 'Strong password with multiple chunks (16 chars, 4 iterations)',
    config: {
      type: 'strong',
      length: 16,
      iteration: 4,
      separator: '-',
    },
    seed: PARITY_SEEDS.PRIMARY,
    expectedLength: 67, // 16*4 + 3 separators
    expectedChunks: 4,
    chunkLength: 16,
  },
  {
    id: 'strong-short',
    description: 'Short strong password (4 chars, 2 iterations)',
    config: {
      type: 'strong',
      length: 4,
      iteration: 2,
      separator: '-',
    },
    seed: PARITY_SEEDS.PRIMARY,
    expectedLength: 9, // 4*2 + 1 separator
    expectedChunks: 2,
    chunkLength: 4,
  },
  {
    id: 'strong-custom-separator',
    description: 'Strong password with custom separator',
    config: {
      type: 'strong',
      length: 8,
      iteration: 3,
      separator: ':',
    },
    seed: PARITY_SEEDS.PRIMARY,
    expectedSeparator: ':',
    expectedChunks: 3,
  },

  // ============================================
  // Base64 Password Cases
  // ============================================
  {
    id: 'base64-basic',
    description: 'Basic base64 password (32 chars, 1 iteration)',
    config: {
      type: 'base64',
      length: 32,
      iteration: 1,
      separator: '-',
    },
    seed: PARITY_SEEDS.PRIMARY,
    expectedLength: 32,
    expectedChunks: 1,
  },
  {
    id: 'base64-multi-chunk',
    description: 'Base64 password with multiple chunks (32 chars, 3 iterations)',
    config: {
      type: 'base64',
      length: 32,
      iteration: 3,
      separator: '/',
    },
    seed: PARITY_SEEDS.PRIMARY,
    expectedLength: 98, // 32*3 + 2 separators
    // Note: splitting on "/" may produce 4 chunks if password chars include "/"
    // So we only verify separator is present, not chunk count
    chunkLength: 32,
    expectedSeparator: '/',
  },
  {
    id: 'base64-minimal',
    description: 'Minimal base64 password (1 char, 1 iteration)',
    config: {
      type: 'base64',
      length: 1,
      iteration: 1,
      separator: '-',
    },
    seed: PARITY_SEEDS.PRIMARY,
    expectedLength: 1,
    expectedChunks: 1,
  },

  // ============================================
  // Memorable Password Cases
  // ============================================
  {
    id: 'memorable-basic',
    description: 'Basic memorable password (4 words)',
    config: {
      type: 'memorable',
      length: 4, // Ignored for memorable
      iteration: 4,
      separator: '-',
    },
    seed: PARITY_SEEDS.PRIMARY,
    expectedWordCount: 4,
    expectedSeparator: '-',
  },
  {
    id: 'memorable-short',
    description: 'Short memorable password (2 words)',
    config: {
      type: 'memorable',
      iteration: 2,
      separator: '_',
    },
    seed: PARITY_SEEDS.PRIMARY,
    expectedWordCount: 2,
    expectedSeparator: '_',
  },
  {
    id: 'memorable-long',
    description: 'Long memorable password (6 words)',
    config: {
      type: 'memorable',
      iteration: 6,
      separator: ' ',
    },
    seed: PARITY_SEEDS.PRIMARY,
    expectedWordCount: 6,
    expectedSeparator: ' ',
  },
];

/**
 * Validation Parity Test Cases.
 *
 * Each case defines:
 * - config: Configuration to validate
 * - expected: Expected validation result { isValid, errors }
 */
export const VALIDATION_PARITY_CASES = [
  // ============================================
  // Valid Configurations
  // ============================================
  {
    id: 'valid-strong',
    description: 'Valid strong password config',
    config: { type: 'strong', length: 16, iteration: 4 },
    expected: { isValid: true, errors: [] },
  },
  {
    id: 'valid-base64',
    description: 'Valid base64 password config',
    config: { type: 'base64', length: 32, iteration: 2 },
    expected: { isValid: true, errors: [] },
  },
  {
    id: 'valid-memorable',
    description: 'Valid memorable password config',
    config: { type: 'memorable', iteration: 4 },
    expected: { isValid: true, errors: [] },
  },
  {
    id: 'valid-minimal-strong',
    description: 'Minimal valid strong config (length 1)',
    config: { type: 'strong', length: 1, iteration: 1 },
    expected: { isValid: true, errors: [] },
  },
  {
    id: 'valid-max-length',
    description: 'Maximum length strong config',
    config: { type: 'strong', length: 1024, iteration: 1 },
    expected: { isValid: true, errors: [] },
  },

  // ============================================
  // Invalid Configurations
  // ============================================
  {
    id: 'invalid-missing-type',
    description: 'Missing type should fail',
    config: { length: 16, iteration: 4 },
    expected: {
      isValid: false,
      errorContains: 'type is required',
    },
  },
  {
    id: 'invalid-unknown-type',
    description: 'Unknown type should fail',
    config: { type: 'unknown', length: 16 },
    expected: {
      isValid: false,
      errorContains: 'Unknown password type',
    },
  },
  {
    id: 'invalid-zero-length',
    description: 'Zero length should fail',
    config: { type: 'strong', length: 0, iteration: 1 },
    expected: {
      isValid: false,
      errorContains: 'Length',
    },
  },
  {
    id: 'invalid-negative-length',
    description: 'Negative length should fail',
    config: { type: 'base64', length: -5, iteration: 1 },
    expected: {
      isValid: false,
      errorContains: 'Length',
    },
  },
  {
    id: 'invalid-zero-iteration',
    description: 'Zero iteration should fail',
    config: { type: 'strong', length: 16, iteration: 0 },
    expected: {
      isValid: false,
      errorContains: 'Iteration',
    },
  },
  {
    id: 'invalid-negative-iteration',
    description: 'Negative iteration should fail',
    config: { type: 'memorable', iteration: -1 },
    expected: {
      isValid: false,
      errorContains: 'Iteration',
    },
  },
  {
    id: 'invalid-exceeds-max-length',
    description: 'Exceeding max length should fail',
    config: { type: 'strong', length: 2000, iteration: 1 },
    expected: {
      isValid: false,
      errorContains: 'exceed',
    },
  },
];

/**
 * Entropy Calculation Parity Test Cases.
 *
 * Each case defines:
 * - config: Configuration for entropy calculation
 * - expected: Expected entropy result
 */
export const ENTROPY_PARITY_CASES = [
  // ============================================
  // Strong/Base64 Entropy (6 bits per char)
  // ============================================
  {
    id: 'entropy-strong-16x1',
    description: 'Entropy for 16 chars, 1 iteration',
    config: { type: 'strong', length: 16, iteration: 1 },
    expected: {
      totalBits: 96, // 16 * 6 * 1
      securityLevelContains: 'GOOD',
    },
  },
  {
    id: 'entropy-strong-16x4',
    description: 'Entropy for 16 chars, 4 iterations',
    config: { type: 'strong', length: 16, iteration: 4 },
    expected: {
      totalBits: 384, // 16 * 6 * 4
      securityLevelContains: 'EXCELLENT',
    },
  },
  {
    id: 'entropy-base64-32x2',
    description: 'Entropy for 32 chars, 2 iterations',
    config: { type: 'base64', length: 32, iteration: 2 },
    expected: {
      totalBits: 384, // 32 * 6 * 2
      securityLevelContains: 'EXCELLENT',
    },
  },
  {
    id: 'entropy-strong-8x1',
    description: 'Entropy for 8 chars (moderate security)',
    config: { type: 'strong', length: 8, iteration: 1 },
    expected: {
      totalBits: 48, // 8 * 6
      securityLevelContains: 'WEAK',
    },
  },

  // ============================================
  // Memorable Entropy (depends on dictionary)
  // ============================================
  {
    id: 'entropy-memorable-4words',
    description: 'Entropy for 4 words (default dictionary 7776 words)',
    config: { type: 'memorable', iteration: 4 },
    expected: {
      // 4 * log2(7776) = 4 * 12.925 = 51.7
      totalBitsApprox: 51.7,
      tolerance: 0.5,
    },
  },
  {
    id: 'entropy-memorable-6words',
    description: 'Entropy for 6 words',
    config: { type: 'memorable', iteration: 6 },
    expected: {
      // 6 * log2(7776) = 6 * 12.925 = 77.55
      totalBitsApprox: 77.55,
      tolerance: 0.5,
      securityLevelContains: 'MODERATE',
    },
  },
];

/**
 * Complete Parity Test Suite.
 *
 * This combines all test cases for comprehensive parity testing.
 */
export const PARITY_TEST_SUITE = {
  generation: GENERATION_PARITY_CASES,
  validation: VALIDATION_PARITY_CASES,
  entropy: ENTROPY_PARITY_CASES,
};

/**
 * Preset Configuration Parity Cases.
 *
 * These mirror the CLI presets and should produce identical results
 * when resolved through any adapter.
 *
 * NOTE: These must match the presets defined in src/config.js
 */
export const PRESET_PARITY_CASES = [
  {
    id: 'preset-quick',
    presetName: 'quick',
    resolvedConfig: {
      type: 'strong',
      length: 14,
      iteration: 4,
      separator: '-',
    },
  },
  {
    id: 'preset-secure',
    presetName: 'secure',
    resolvedConfig: {
      type: 'strong',
      length: 16,
      iteration: 4,
      separator: '',
    },
  },
  {
    id: 'preset-memorable',
    presetName: 'memorable',
    resolvedConfig: {
      type: 'memorable',
      // length is not used for memorable
      iteration: 4,
      separator: '-',
    },
  },
];

/**
 * Edge Case Parity Tests.
 *
 * These test boundary conditions that must behave identically across adapters.
 */
export const EDGE_CASE_PARITY_TESTS = [
  {
    id: 'edge-empty-separator',
    description: 'Empty separator joins chunks directly',
    config: {
      type: 'strong',
      length: 4,
      iteration: 3,
      separator: '',
    },
    expectedPattern: /^[A-Za-z0-9+/]{12}$/, // 4*3 = 12 chars, no separators
  },
  {
    id: 'edge-special-separator',
    description: 'Special character separator',
    config: {
      type: 'strong',
      length: 4,
      iteration: 2,
      separator: '@#$',
    },
    expectedSeparator: '@#$',
  },
  {
    id: 'edge-unicode-separator',
    description: 'Unicode separator',
    config: {
      type: 'strong',
      length: 4,
      iteration: 2,
      separator: '\u2022', // bullet point
    },
    expectedSeparator: '\u2022',
  },
];

/**
 * Cross-Adapter Comparison Helper.
 *
 * Generates test cases for comparing outputs between two adapters.
 *
 * @param {string} adapter1Name - First adapter name.
 * @param {string} adapter2Name - Second adapter name.
 * @returns {Object[]} Comparison test cases.
 */
export function generateComparisonCases(adapter1Name, adapter2Name) {
  return GENERATION_PARITY_CASES.map((testCase) => ({
    ...testCase,
    comparisonId: `${adapter1Name}-vs-${adapter2Name}-${testCase.id}`,
    adapters: [adapter1Name, adapter2Name],
  }));
}

export default {
  GENERATION_PARITY_CASES,
  VALIDATION_PARITY_CASES,
  ENTROPY_PARITY_CASES,
  PARITY_TEST_SUITE,
  PRESET_PARITY_CASES,
  EDGE_CASE_PARITY_TESTS,
  generateComparisonCases,
};
