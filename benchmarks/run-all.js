#!/usr/bin/env node
// Copyright 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Comprehensive Benchmark Suite Runner
 *
 * Executes all password generator benchmarks and outputs results in a
 * format compatible with hyperfine for CI integration.
 */

import { spawn } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// ============================================
// Configuration
// ============================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BENCHMARKS = [
  {
    name: 'crypto-vs-mathrand',
    file: 'crypto-vs-mathrand.bench.js',
    description: 'Crypto vs Math.random() security baseline comparison',
    timeout: 120000 // 2 minutes
  },
  {
    name: 'password-generation',
    file: 'password-generation.bench.js',
    description: 'Password generation performance across types and sizes',
    timeout: 60000 // 1 minute
  },
  {
    name: 'bulk-generation',
    file: 'bulk-generation.bench.js',
    description: 'Bulk password generation throughput analysis',
    timeout: 90000 // 1.5 minutes
  },
  {
    name: 'entropy-calculation',
    file: 'entropy-calculation.bench.js',
    description: 'Entropy calculation performance benchmarks',
    timeout: 30000 // 30 seconds
  }
];

// ============================================
// Utilities
// ============================================

/**
 * Executes a benchmark script and captures output.
 */
function runBenchmark(benchmark) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🔧 Running: ${benchmark.name}`);
    console.log(`📝 ${benchmark.description}`);
    console.log(`${'='.repeat(80)}`);

    const child = spawn('node', [benchmark.file], {
      cwd: __dirname,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output); // Real-time output
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output); // Real-time output
    });

    const timeoutId = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Benchmark ${benchmark.name} timed out after ${benchmark.timeout}ms`));
    }, benchmark.timeout);

    child.on('close', (code) => {
      clearTimeout(timeoutId);
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (code === 0) {
        console.log(`\n✅ ${benchmark.name} completed in ${(duration / 1000).toFixed(2)}s`);
        resolve({
          name: benchmark.name,
          description: benchmark.description,
          success: true,
          duration,
          stdout,
          stderr,
          exitCode: code
        });
      } else {
        console.error(`\n❌ ${benchmark.name} failed with exit code ${code}`);
        reject(new Error(`Benchmark ${benchmark.name} failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      console.error(`\n💥 ${benchmark.name} error:`, error.message);
      reject(error);
    });
  });
}

/**
 * Extracts hyperfine-compatible JSON from benchmark output.
 */
function extractHyperfineData(output) {
  try {
    // Look for JSON blocks in the output
    const jsonMatch = output.match(/\{[\s\S]*"results"[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Formats duration in human-readable format.
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

/**
 * Generates a summary report.
 */
function generateSummary(results) {
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;

  return {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      successful,
      failed,
      totalDuration: formatDuration(totalDuration)
    },
    benchmarks: results.map(r => ({
      name: r.name,
      description: r.description,
      success: r.success,
      duration: formatDuration(r.duration),
      exitCode: r.exitCode
    }))
  };
}

// ============================================
// Main Execution
// ============================================

async function main() {
  const startTime = Date.now();

  console.log('🚀 Password Generator Benchmark Suite');
  console.log(`📅 Started: ${new Date().toISOString()}`);
  console.log(`📁 Directory: ${__dirname}`);
  console.log(`🧪 Benchmarks: ${BENCHMARKS.length}`);

  const results = [];
  const hyperfineData = [];

  // Execute benchmarks sequentially to avoid resource conflicts
  for (const benchmark of BENCHMARKS) {
    try {
      const result = await runBenchmark(benchmark);
      results.push(result);

      // Extract hyperfine data if available
      const hyperfine = extractHyperfineData(result.stdout);
      if (hyperfine && hyperfine.results) {
        hyperfineData.push(...hyperfine.results);
      }
    } catch (error) {
      console.error(`Failed to run benchmark ${benchmark.name}:`, error.message);
      results.push({
        name: benchmark.name,
        description: benchmark.description,
        success: false,
        duration: 0,
        stdout: '',
        stderr: error.message,
        exitCode: -1
      });
    }
  }

  // ============================================
  // Generate Final Report
  // ============================================

  const endTime = Date.now();
  const totalDuration = endTime - startTime;

  console.log('\n' + '='.repeat(80));
  console.log('📊 BENCHMARK SUITE SUMMARY');
  console.log('='.repeat(80));

  const summary = generateSummary(results);

  console.log(`⏱️  Total execution time: ${formatDuration(totalDuration)}`);
  console.log(`✅ Successful: ${summary.summary.successful}/${summary.summary.total}`);
  console.log(`❌ Failed: ${summary.summary.failed}/${summary.summary.total}`);

  if (summary.summary.failed > 0) {
    console.log('\n❌ Failed benchmarks:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.name}: ${r.stderr || 'Unknown error'}`);
    });
  }

  // ============================================
  // Hyperfine Output
  // ============================================

  if (hyperfineData.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('🔧 HYPERFINE-COMPATIBLE RESULTS');
    console.log('='.repeat(80));

    const hyperfineOutput = {
      results: hyperfineData
    };

    // Output to stdout for CI integration
    console.log(JSON.stringify(hyperfineOutput, null, 2));

    // Save to file for later analysis
    const outputFile = join(__dirname, 'benchmark-results.json');
    writeFileSync(outputFile, JSON.stringify({
      summary,
      hyperfineResults: hyperfineOutput,
      rawResults: results
    }, null, 2));

    console.log(`\n💾 Detailed results saved to: ${outputFile}`);
  }

  // ============================================
  // CI Integration Instructions
  // ============================================

  console.log('\n' + '='.repeat(80));
  console.log('🔧 CI INTEGRATION USAGE');
  console.log('='.repeat(80));
  console.log();
  console.log('To integrate with hyperfine in CI:');
  console.log('');
  console.log('1. Run benchmarks:');
  console.log('   npm run benchmark:all > benchmark-output.txt');
  console.log('');
  console.log('2. Extract JSON results:');
  console.log('   cat benchmark-results.json | jq .hyperfineResults > hyperfine.json');
  console.log('');
  console.log('3. Compare with hyperfine:');
  console.log('   hyperfine --import-json hyperfine.json --export-markdown results.md');
  console.log('');
  console.log('4. Performance regression detection:');
  console.log('   npm run benchmark:all | grep "ops/s" | sort -k3 -n');

  // Exit with proper code
  const exitCode = summary.summary.failed > 0 ? 1 : 0;
  process.exit(exitCode);
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('💥 Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught exception:', error);
  process.exit(1);
});

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('💥 Main execution failed:', error);
    process.exit(1);
  });
}