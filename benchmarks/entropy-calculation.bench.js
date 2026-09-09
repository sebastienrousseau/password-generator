// Copyright 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Entropy Calculation Benchmarks
 *
 * Measures performance of entropy and strength calculations.
 */

import {
  calculateBase64Entropy,
  calculateBase64ChunkEntropy,
  calculateDictionaryEntropy,
  calculateCharsetEntropy,
  calculateSyllableEntropy,
  calculateTotalEntropy,
  getSecurityLevel,
  getSecurityRecommendation,
} from '../packages/core/src/domain/entropy-calculator.js';

// ============================================
// Benchmark Infrastructure
// ============================================

/**
 * Simple benchmark runner.
 */
function benchmark(name, fn, iterations = 10000) {
  // Warmup
  for (let i = 0; i < 1000; i++) {
    fn();
  }

  // Measure
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();

  const totalMs = end - start;
  const avgMs = totalMs / iterations;
  const avgNs = avgMs * 1_000_000;
  const opsPerSec = (iterations / totalMs) * 1000;

  console.log(`${name.padEnd(50)} ${avgNs.toFixed(0).padStart(8)} ns/op  ${(opsPerSec / 1000).toFixed(0).padStart(6)}k ops/s`);

  return { name, totalMs, avgMs, opsPerSec, iterations };
}

// ============================================
// Sample Configurations
// ============================================

const configs = {
  strong: { type: 'strong', length: 16, iteration: 4 },
  base64: { type: 'base64', length: 24, iteration: 2 },
  memorable: { type: 'memorable', iteration: 4 },
};

// ============================================
// Entropy Calculation Benchmarks
// ============================================

console.log('='.repeat(70));
console.log('Entropy Calculation Benchmarks');
console.log('='.repeat(70));
console.log();

console.log('Base64 Entropy Calculations');
console.log('-'.repeat(70));

for (const length of [8, 16, 32, 64, 128]) {
  benchmark(
    `calculateBase64Entropy(${length})`,
    () => calculateBase64Entropy(length)
  );
}

console.log();
console.log('Base64 Chunk Entropy');
console.log('-'.repeat(70));

for (const length of [8, 16, 32, 64]) {
  benchmark(
    `calculateBase64ChunkEntropy(${length})`,
    () => calculateBase64ChunkEntropy(length)
  );
}

console.log();
console.log('Dictionary Entropy');
console.log('-'.repeat(70));

for (const wordCount of [2, 4, 6, 8]) {
  benchmark(
    `calculateDictionaryEntropy(7776, ${wordCount})`,
    () => calculateDictionaryEntropy(7776, wordCount)
  );
}

console.log();
console.log('Charset Entropy');
console.log('-'.repeat(70));

const charsets = [
  { name: 'numeric', size: 10 },
  { name: 'lowercase', size: 26 },
  { name: 'alphanumeric', size: 62 },
  { name: 'full', size: 94 },
];

for (const { name, size } of charsets) {
  benchmark(
    `calculateCharsetEntropy(${name}, len=16)`,
    () => calculateCharsetEntropy(size, 16)
  );
}

console.log();
console.log('Syllable Entropy');
console.log('-'.repeat(70));

for (const count of [2, 4, 6, 8]) {
  benchmark(
    `calculateSyllableEntropy(${count})`,
    () => calculateSyllableEntropy(count)
  );
}

console.log();
console.log('Total Entropy (combined)');
console.log('-'.repeat(70));

for (const [name, config] of Object.entries(configs)) {
  benchmark(
    `calculateTotalEntropy(${name})`,
    () => calculateTotalEntropy(config)
  );
}

console.log();
console.log('Security Level Classification');
console.log('-'.repeat(70));

for (const bits of [28, 60, 80, 128, 256]) {
  benchmark(
    `getSecurityLevel(${bits} bits)`,
    () => getSecurityLevel(bits)
  );
}

console.log();
console.log('Security Recommendations');
console.log('-'.repeat(70));

for (const bits of [50, 80, 128]) {
  benchmark(
    `getSecurityRecommendation(${bits} bits)`,
    () => getSecurityRecommendation(bits)
  );
}

// ============================================
// Combined Operations
// ============================================

console.log();
console.log('Combined Operations');
console.log('-'.repeat(70));

benchmark(
  'full entropy + security level',
  () => {
    const entropy = calculateTotalEntropy(configs.strong);
    return getSecurityLevel(entropy);
  }
);

benchmark(
  'config validation + entropy + recommendation',
  () => {
    const entropy = calculateTotalEntropy({ type: 'strong', length: 16, iteration: 4 });
    return getSecurityRecommendation(entropy);
  }
);

// ============================================
// Summary
// ============================================

console.log();
console.log('='.repeat(70));
console.log('All benchmarks completed.');
console.log('='.repeat(70));
