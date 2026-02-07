// Copyright 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Crypto vs Math.random Security Baseline Benchmarks
 *
 * Compares performance between cryptographically secure random generation
 * and Math.random() to demonstrate security vs performance trade-offs.
 * This benchmark shows why crypto should be preferred despite performance overhead.
 */

import { randomBytes, randomInt } from 'crypto';
import { createQuickService } from '../packages/core/src/index.js';

// ============================================
// Benchmark Infrastructure
// ============================================

/**
 * Simple benchmark runner with statistical confidence intervals.
 * @param {string} name - Benchmark name
 * @param {Function} fn - Function to benchmark
 * @param {number} iterations - Number of iterations
 * @param {Object} options - Benchmark options
 */
async function benchmark(name, fn, iterations = 1000, options = {}) {
  const { warmup = 100, statistical = true } = options;

  // Warmup
  for (let i = 0; i < warmup; i++) {
    await fn();
  }

  // Collect timings for statistical analysis
  const timings = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    timings.push(end - start);
  }

  // Calculate statistics
  const totalMs = timings.reduce((sum, t) => sum + t, 0);
  const avgMs = totalMs / iterations;
  const minMs = Math.min(...timings);
  const maxMs = Math.max(...timings);
  const opsPerSec = (iterations / totalMs) * 1000;

  let stdDev = 0;
  if (statistical && timings.length > 1) {
    const variance = timings.reduce((sum, t) => sum + Math.pow(t - avgMs, 2), 0) / (iterations - 1);
    stdDev = Math.sqrt(variance);
  }

  // Format for hyperfine compatibility
  const hyperfineOut = {
    command: name,
    mean: avgMs / 1000, // seconds
    stddev: stdDev / 1000, // seconds
    min: minMs / 1000, // seconds
    max: maxMs / 1000, // seconds
    times: timings.map(t => t / 1000) // seconds
  };

  console.log(`${name.padEnd(50)} ${avgMs.toFixed(3).padStart(8)} ms/op  ${opsPerSec.toFixed(0).padStart(8)} ops/s  ${stdDev.toFixed(3).padStart(6)} σ`);

  return { name, avgMs, opsPerSec, stdDev, hyperfineOut, timings };
}

/**
 * Security analysis utility.
 */
function analyzeEntropy(values) {
  const freq = {};
  for (const val of values) {
    freq[val] = (freq[val] || 0) + 1;
  }

  const totalCount = values.length;
  let entropy = 0;

  for (const count of Object.values(freq)) {
    const p = count / totalCount;
    entropy -= p * Math.log2(p);
  }

  return {
    uniqueValues: Object.keys(freq).length,
    totalValues: totalCount,
    entropy: entropy.toFixed(3),
    maxEntropy: Math.log2(values.length).toFixed(3)
  };
}

// ============================================
// Random Generator Implementations
// ============================================

/**
 * Cryptographically secure random generator using Node.js crypto
 */
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

/**
 * Math.random() based generator (INSECURE - for comparison only)
 */
class MathRandomGenerator {
  async generateRandomBytes(byteLength) {
    const bytes = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return bytes;
  }

  async generateRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  async generateRandomBase64(byteLength) {
    const bytes = await this.generateRandomBytes(byteLength);
    return btoa(String.fromCharCode.apply(null, bytes));
  }

  async generateRandomString(length, charset) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
    return result;
  }
}

// ============================================
// Setup
// ============================================

const cryptoGenerator = new NodeCryptoRandomGenerator();
const mathGenerator = new MathRandomGenerator();

const cryptoService = createQuickService(cryptoGenerator);
const mathService = createQuickService(mathGenerator);

// Character set for testing
const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

// ============================================
// Raw Random Generation Benchmarks
// ============================================

console.log('='.repeat(80));
console.log('Crypto vs Math.random() Security Baseline Benchmarks');
console.log('='.repeat(80));
console.log();

console.log('Raw Random Generation Performance');
console.log('-'.repeat(80));

const rawResults = [];

// Random bytes generation
rawResults.push(await benchmark(
  'crypto.randomBytes(32)',
  () => cryptoGenerator.generateRandomBytes(32),
  5000
));

rawResults.push(await benchmark(
  'Math.random() bytes(32)',
  () => mathGenerator.generateRandomBytes(32),
  5000
));

// Random integer generation
rawResults.push(await benchmark(
  'crypto.randomInt(0, 256)',
  () => cryptoGenerator.generateRandomInt(256),
  5000
));

rawResults.push(await benchmark(
  'Math.random() int(0, 256)',
  () => mathGenerator.generateRandomInt(256),
  5000
));

// Random string generation
rawResults.push(await benchmark(
  'crypto.randomString(16, charset)',
  () => cryptoGenerator.generateRandomString(16, charset),
  5000
));

rawResults.push(await benchmark(
  'Math.random() string(16, charset)',
  () => mathGenerator.generateRandomString(16, charset),
  5000
));

// ============================================
// Password Generation Benchmarks
// ============================================

console.log();
console.log('Password Generation Performance');
console.log('-'.repeat(80));

const passwordResults = [];

// Strong password generation
passwordResults.push(await benchmark(
  'crypto: strong(length=16, iter=1)',
  () => cryptoService.generate({ type: 'strong', length: 16, iteration: 1 }),
  2000
));

passwordResults.push(await benchmark(
  'Math.random: strong(length=16, iter=1)',
  () => mathService.generate({ type: 'strong', length: 16, iteration: 1 }),
  2000
));

// Base64 password generation
passwordResults.push(await benchmark(
  'crypto: base64(length=24, iter=1)',
  () => cryptoService.generate({ type: 'base64', length: 24, iteration: 1 }),
  2000
));

passwordResults.push(await benchmark(
  'Math.random: base64(length=24, iter=1)',
  () => mathService.generate({ type: 'base64', length: 24, iteration: 1 }),
  2000
));

// Memorable password generation
passwordResults.push(await benchmark(
  'crypto: memorable(iter=4)',
  () => cryptoService.generate({ type: 'memorable', iteration: 4 }),
  1000
));

passwordResults.push(await benchmark(
  'Math.random: memorable(iter=4)',
  () => mathService.generate({ type: 'memorable', iteration: 4 }),
  1000
));

// ============================================
// Security Analysis
// ============================================

console.log();
console.log('Security Analysis (Entropy Distribution)');
console.log('-'.repeat(80));

// Generate samples for entropy analysis
const cryptoInts = [];
const mathInts = [];
const sampleSize = 10000;

console.log('Collecting randomness samples...');
for (let i = 0; i < sampleSize; i++) {
  cryptoInts.push(await cryptoGenerator.generateRandomInt(256));
  mathInts.push(await mathGenerator.generateRandomInt(256));
}

const cryptoAnalysis = analyzeEntropy(cryptoInts);
const mathAnalysis = analyzeEntropy(mathInts);

console.log();
console.log(`crypto.randomInt(256) entropy:   ${cryptoAnalysis.entropy}/${cryptoAnalysis.maxEntropy} bits (${cryptoAnalysis.uniqueValues} unique)`);
console.log(`Math.random() entropy:           ${mathAnalysis.entropy}/${mathAnalysis.maxEntropy} bits (${mathAnalysis.uniqueValues} unique)`);

// ============================================
// Performance Summary
// ============================================

console.log();
console.log('='.repeat(80));
console.log('Performance Summary');
console.log('='.repeat(80));

const allResults = [...rawResults, ...passwordResults];

// Find crypto vs math.random comparisons
const comparisons = [
  { crypto: 'crypto.randomBytes(32)', math: 'Math.random() bytes(32)' },
  { crypto: 'crypto.randomInt(0, 256)', math: 'Math.random() int(0, 256)' },
  { crypto: 'crypto.randomString(16, charset)', math: 'Math.random() string(16, charset)' },
  { crypto: 'crypto: strong(length=16, iter=1)', math: 'Math.random: strong(length=16, iter=1)' },
  { crypto: 'crypto: base64(length=24, iter=1)', math: 'Math.random: base64(length=24, iter=1)' },
  { crypto: 'crypto: memorable(iter=4)', math: 'Math.random: memorable(iter=4)' }
];

console.log();
for (const comp of comparisons) {
  const cryptoResult = allResults.find(r => r.name === comp.crypto);
  const mathResult = allResults.find(r => r.name === comp.math);

  if (cryptoResult && mathResult) {
    const speedup = (mathResult.avgMs / cryptoResult.avgMs).toFixed(2);
    const overhead = (((cryptoResult.avgMs / mathResult.avgMs) - 1) * 100).toFixed(1);
    console.log(`${comp.crypto}`);
    console.log(`  vs ${comp.math}`);
    console.log(`  Math.random is ${speedup}x faster (${overhead}% crypto overhead)`);
    console.log();
  }
}

// ============================================
// Hyperfine JSON Output
// ============================================

console.log('='.repeat(80));
console.log('Hyperfine-compatible JSON Results');
console.log('='.repeat(80));

const hyperfineResults = {
  results: allResults.map(r => r.hyperfineOut)
};

console.log(JSON.stringify(hyperfineResults, null, 2));

// ============================================
// Security Recommendations
// ============================================

console.log();
console.log('='.repeat(80));
console.log('SECURITY ANALYSIS');
console.log('='.repeat(80));
console.log();
console.log('🔒 CRYPTO RECOMMENDATION: Always use cryptographically secure random generation');
console.log('   for password generation, even with the performance overhead.');
console.log();
console.log('⚠️  MATH.RANDOM WARNING: Math.random() is NOT suitable for security purposes.');
console.log('   It uses predictable PRNG algorithms that can be reverse-engineered.');
console.log();
console.log('📊 Performance vs Security Trade-off:');
console.log('   - Crypto overhead: ~10-100% slower than Math.random()');
console.log('   - Security gain: Cryptographically unpredictable randomness');
console.log('   - Verdict: Security benefits FAR outweigh performance costs');
console.log();

// Memory usage
const used = process.memoryUsage();
console.log('Memory Usage:');
console.log(`  Heap Used:  ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Heap Total: ${(used.heapTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`  RSS:        ${(used.rss / 1024 / 1024).toFixed(2)} MB`);