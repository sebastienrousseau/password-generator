// Copyright 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Entropy Calculation Benchmarks
 *
 * Measures performance of entropy and strength calculations.
 */

import { EntropyCalculator } from '../packages/core/domain/EntropyCalculator.js';
import { StrengthIndicator } from '../packages/core/domain/StrengthIndicator.js';
import { PasswordConfig } from '../packages/core/domain/PasswordConfig.js';

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
// Setup
// ============================================

const entropyCalculator = new EntropyCalculator();
const strengthIndicator = new StrengthIndicator();

// Sample passwords
const passwords = {
  short: 'Ab1@',
  medium: 'K9#mP2$xL5&nQ8@r',
  long: 'K9#mP2$xL5&nQ8@r-Ab1@Cd3#Ef5$Gh7&Ij9*Kl0!Mn2@Op4#',
  memorable: 'correct-horse-battery-staple',
  numeric: '847291635082',
};

// Sample configs
const configs = {
  strong: new PasswordConfig({ type: 'strong', length: 16, iteration: 4 }),
  base64: new PasswordConfig({ type: 'base64', length: 24, iteration: 2 }),
  memorable: new PasswordConfig({ type: 'memorable', iteration: 4 }),
};

// ============================================
// Entropy Calculation Benchmarks
// ============================================

console.log('='.repeat(70));
console.log('Entropy Calculation Benchmarks');
console.log('='.repeat(70));
console.log();

console.log('EntropyCalculator.calculateFromPassword()');
console.log('-'.repeat(70));

for (const [name, password] of Object.entries(passwords)) {
  benchmark(
    `entropy from password (${name}, len=${password.length})`,
    () => entropyCalculator.calculateFromPassword(password)
  );
}

console.log();
console.log('EntropyCalculator.calculateFromConfig()');
console.log('-'.repeat(70));

for (const [name, config] of Object.entries(configs)) {
  benchmark(
    `entropy from config (${name})`,
    () => entropyCalculator.calculateFromConfig(config)
  );
}

console.log();
console.log('StrengthIndicator.fromEntropy()');
console.log('-'.repeat(70));

for (const bits of [28, 60, 80, 128, 256]) {
  benchmark(
    `strength from entropy (${bits} bits)`,
    () => strengthIndicator.fromEntropy(bits)
  );
}

console.log();
console.log('StrengthIndicator.fromPassword()');
console.log('-'.repeat(70));

for (const [name, password] of Object.entries(passwords)) {
  benchmark(
    `strength from password (${name})`,
    () => strengthIndicator.fromPassword(password)
  );
}

// ============================================
// Combined Operations
// ============================================

console.log();
console.log('Combined Operations');
console.log('-'.repeat(70));

benchmark(
  'full entropy + strength calculation',
  () => {
    const entropy = entropyCalculator.calculateFromPassword(passwords.medium);
    return strengthIndicator.fromEntropy(entropy);
  }
);

benchmark(
  'config validation + entropy + strength',
  () => {
    const config = new PasswordConfig({ type: 'strong', length: 16, iteration: 4 });
    const entropy = entropyCalculator.calculateFromConfig(config);
    return strengthIndicator.fromEntropy(entropy);
  }
);

// ============================================
// Character Set Analysis
// ============================================

console.log();
console.log('Character Set Analysis');
console.log('-'.repeat(70));

const testStrings = {
  'lowercase only': 'abcdefghijklmnop',
  'mixed case': 'AbCdEfGhIjKlMnOp',
  'alphanumeric': 'Ab1Cd2Ef3Gh4Ij5K',
  'with symbols': 'Ab1@Cd2#Ef3$Gh4%',
  'unicode': 'Hëllö Wörld 你好世界',
};

for (const [name, str] of Object.entries(testStrings)) {
  benchmark(
    `analyze charset (${name})`,
    () => entropyCalculator.calculateFromPassword(str)
  );
}

// ============================================
// Summary
// ============================================

console.log();
console.log('='.repeat(70));
console.log('All benchmarks completed.');
console.log('='.repeat(70));
