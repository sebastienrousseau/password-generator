// Copyright 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Bulk Password Generation Benchmarks
 *
 * Profiles current generateMultiple performance to identify optimization opportunities.
 */

import { randomBytes, randomInt } from 'crypto';
import { createQuickService } from '../packages/core/src/index.js';
import { generateMultiplePasswords } from '../src/services/password-service.js';

// ============================================
// Benchmark Infrastructure
// ============================================

/**
 * Simple benchmark runner with memory tracking.
 */
async function benchmark(name, fn, iterations = 100) {
  // Force garbage collection if available
  if (global.gc) global.gc();

  const memBefore = process.memoryUsage();

  // Warmup
  for (let i = 0; i < 10; i++) {
    await fn();
  }

  // Measure
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    await fn();
  }
  const end = performance.now();

  const memAfter = process.memoryUsage();
  const totalMs = end - start;
  const avgMs = totalMs / iterations;
  const opsPerSec = (iterations / totalMs) * 1000;
  const memDelta = memAfter.heapUsed - memBefore.heapUsed;

  console.log(`${name.padEnd(45)} ${avgMs.toFixed(3).padStart(8)} ms/op  ${opsPerSec.toFixed(0).padStart(8)} ops/s  ${formatBytes(memDelta)}`);

  return { name, totalMs, avgMs, opsPerSec, iterations, memDelta };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ============================================
// Node.js Crypto Random Generator
// ============================================

class NodeCryptoRandomGenerator {
  async generateRandomBytes(byteLength) {
    return new Uint8Array(randomBytes(byteLength));
  }

  async generateRandomInt(max) {
    return randomInt(0, max);
  }

  async generateRandomBase64(byteLength) {
    return randomBytes(byteLength).toString('base64');
  }

  async generateRandomString(length, charset) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[randomInt(0, charset.length)];
    }
    return result;
  }
}

// ============================================
// Setup
// ============================================

const randomGenerator = new NodeCryptoRandomGenerator();
const service = createQuickService(randomGenerator);

// ============================================
// Bulk Generation Benchmarks
// ============================================

console.log('='.repeat(80));
console.log('Bulk Password Generation Benchmarks');
console.log('='.repeat(80));
console.log();

console.log('Current generateMultiple Performance (Sequential)');
console.log('-'.repeat(80));

const results = [];

// Test bulk generation with different quantities
for (const count of [1, 10, 50, 100, 500]) {
  const configs = Array(count).fill(null).map(() => ({
    type: 'strong',
    length: 16,
    iteration: 4,
    separator: '-'
  }));

  results.push(await benchmark(
    `generateMultiple (count=${count})`,
    () => service.generateMultiple(configs),
    Math.max(1, Math.floor(100 / count)) // Adjust iterations based on count
  ));
}

console.log();
console.log('Service-level generateMultiplePasswords (Sequential)');
console.log('-'.repeat(80));

for (const count of [1, 10, 50, 100]) {
  const configs = Array(count).fill(null).map(() => ({
    type: 'strong',
    length: 16,
    iteration: 4,
    separator: '-'
  }));

  results.push(await benchmark(
    `generateMultiplePasswords (count=${count})`,
    () => generateMultiplePasswords(configs),
    Math.max(1, Math.floor(100 / count))
  ));
}

console.log();
console.log('Single vs Multiple Generation Comparison');
console.log('-'.repeat(80));

// Compare single generation vs bulk for equivalent work
const singleConfig = { type: 'strong', length: 16, iteration: 4, separator: '-' };

results.push(await benchmark(
  'Single generation x 10',
  async () => {
    for (let i = 0; i < 10; i++) {
      await service.generate(singleConfig);
    }
  },
  100
));

const bulkConfigs = Array(10).fill(singleConfig);
results.push(await benchmark(
  'Bulk generation (count=10)',
  () => service.generateMultiple(bulkConfigs),
  100
));

console.log();
console.log('Port Initialization Overhead');
console.log('-'.repeat(80));

// Test if service recreation causes overhead
results.push(await benchmark(
  'Service recreation x 10',
  async () => {
    for (let i = 0; i < 10; i++) {
      const newService = createQuickService(new NodeCryptoRandomGenerator());
      await newService.generate(singleConfig);
    }
  },
  50
));

// ============================================
// Summary
// ============================================

console.log();
console.log('='.repeat(80));
console.log('Performance Analysis');
console.log('='.repeat(80));

// Calculate efficiency metrics
const single10 = results.find(r => r.name.includes('Single generation x 10'));
const bulk10 = results.find(r => r.name.includes('Bulk generation (count=10)'));

if (single10 && bulk10) {
  const efficiency = ((single10.avgMs - bulk10.avgMs) / single10.avgMs) * 100;
  console.log(`Bulk vs Sequential Efficiency: ${efficiency.toFixed(1)}% ${efficiency > 0 ? 'improvement' : 'regression'}`);
}

// Memory efficiency
const totalMem = results.reduce((sum, r) => sum + Math.abs(r.memDelta), 0);
console.log(`Total Memory Delta: ${formatBytes(totalMem)}`);

console.log();
console.log('Bottleneck Analysis:');
console.log('1. Sequential generation in generateMultiple method');
console.log('2. Individual randomGenerator.generateRandomInt calls per character');
console.log('3. Repeated validation overhead per password');
console.log('4. No batched random number generation');