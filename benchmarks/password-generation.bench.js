// Copyright 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Password Generation Benchmarks
 *
 * Measures performance of password generation across types and sizes.
 */

import { PasswordService } from '../packages/core/index.js';
import { NodeCryptoRandom } from '../src/adapters/NodeCryptoRandom.js';

// ============================================
// Benchmark Infrastructure
// ============================================

/**
 * Simple benchmark runner.
 * @param {string} name - Benchmark name
 * @param {Function} fn - Function to benchmark
 * @param {number} iterations - Number of iterations
 */
async function benchmark(name, fn, iterations = 1000) {
  // Warmup
  for (let i = 0; i < 100; i++) {
    await fn();
  }

  // Measure
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    await fn();
  }
  const end = performance.now();

  const totalMs = end - start;
  const avgMs = totalMs / iterations;
  const opsPerSec = (iterations / totalMs) * 1000;

  console.log(`${name.padEnd(45)} ${avgMs.toFixed(3).padStart(8)} ms/op  ${opsPerSec.toFixed(0).padStart(8)} ops/s`);

  return { name, totalMs, avgMs, opsPerSec, iterations };
}

/**
 * Formats bytes for display.
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ============================================
// Setup
// ============================================

const randomGenerator = new NodeCryptoRandom();
const service = new PasswordService({ randomGenerator });

// ============================================
// Password Generation Benchmarks
// ============================================

console.log('='.repeat(70));
console.log('Password Generation Benchmarks');
console.log('='.repeat(70));
console.log();

console.log('Strong Password Generation');
console.log('-'.repeat(70));

const results = [];

// Strong passwords by length
for (const length of [8, 16, 32, 64, 128]) {
  results.push(await benchmark(
    `strong (length=${length}, iteration=1)`,
    () => service.generate({ type: 'strong', length, iteration: 1 }),
    1000
  ));
}

console.log();
console.log('Strong Password Generation (multiple chunks)');
console.log('-'.repeat(70));

for (const iteration of [1, 4, 8, 16]) {
  results.push(await benchmark(
    `strong (length=16, iteration=${iteration})`,
    () => service.generate({ type: 'strong', length: 16, iteration }),
    1000
  ));
}

console.log();
console.log('Base64 Password Generation');
console.log('-'.repeat(70));

for (const length of [8, 16, 32, 64, 128]) {
  results.push(await benchmark(
    `base64 (length=${length}, iteration=1)`,
    () => service.generate({ type: 'base64', length, iteration: 1 }),
    1000
  ));
}

console.log();
console.log('Memorable Password Generation');
console.log('-'.repeat(70));

for (const iteration of [2, 4, 6, 8]) {
  results.push(await benchmark(
    `memorable (words=${iteration})`,
    () => service.generate({ type: 'memorable', iteration }),
    500 // Fewer iterations as memorable is slower
  ));
}

console.log();
console.log('Numeric PIN Generation');
console.log('-'.repeat(70));

for (const length of [4, 6, 8, 12]) {
  results.push(await benchmark(
    `numeric (length=${length})`,
    () => service.generate({ type: 'numeric', length, iteration: 1 }),
    1000
  ));
}

// ============================================
// Summary
// ============================================

console.log();
console.log('='.repeat(70));
console.log('Summary');
console.log('='.repeat(70));

const fastest = results.reduce((a, b) => a.opsPerSec > b.opsPerSec ? a : b);
const slowest = results.reduce((a, b) => a.opsPerSec < b.opsPerSec ? a : b);

console.log(`Fastest: ${fastest.name} (${fastest.opsPerSec.toFixed(0)} ops/s)`);
console.log(`Slowest: ${slowest.name} (${slowest.opsPerSec.toFixed(0)} ops/s)`);

// Memory usage
const used = process.memoryUsage();
console.log();
console.log('Memory Usage:');
console.log(`  Heap Used:  ${formatBytes(used.heapUsed)}`);
console.log(`  Heap Total: ${formatBytes(used.heapTotal)}`);
console.log(`  RSS:        ${formatBytes(used.rss)}`);
