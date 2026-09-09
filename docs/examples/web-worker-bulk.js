// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Web Worker Bulk Password Generation Example
 *
 * This example demonstrates how to generate 10,000+ passwords using Web Workers
 * without blocking the main thread. It shows progress tracking, performance
 * monitoring, and different generation strategies.
 *
 * @example
 * // HTML setup required:
 * // <script type="module" src="docs/examples/web-worker-bulk.js"></script>
 *
 * @module examples/web-worker-bulk
 */

import { PasswordWorkerPool } from '../../src/workers/password-worker-pool.js';

/**
 * Performance measurement utilities
 */
class PerformanceMonitor {
  constructor() {
    this.startTime = null;
    this.endTime = null;
    this.checkpoints = [];
  }

  start() {
    this.startTime = performance.now();
    this.checkpoints = [];
    console.log('🚀 Starting bulk password generation...');
  }

  checkpoint(label, count = 0) {
    const now = performance.now();
    const elapsed = now - this.startTime;
    this.checkpoints.push({ label, elapsed, count });

    const rate = count > 0 ? (count / elapsed * 1000).toFixed(0) : 'N/A';
    console.log(`⏱️ ${label}: ${elapsed.toFixed(2)}ms (${rate} passwords/sec)`);
  }

  finish(totalCount) {
    this.endTime = performance.now();
    const totalTime = this.endTime - this.startTime;
    const rate = (totalCount / totalTime * 1000).toFixed(0);

    console.log(`\n✅ Bulk generation complete!`);
    console.log(`📊 Total time: ${totalTime.toFixed(2)}ms`);
    console.log(`📊 Total passwords: ${totalCount}`);
    console.log(`📊 Average rate: ${rate} passwords/sec`);
    console.log(`📊 Memory used: ${this._getMemoryUsage()}`);

    return {
      totalTime,
      totalCount,
      rate: parseInt(rate),
      checkpoints: this.checkpoints
    };
  }

  _getMemoryUsage() {
    if (performance.memory) {
      const used = performance.memory.usedJSHeapSize;
      const total = performance.memory.totalJSHeapSize;
      const usedMB = (used / 1024 / 1024).toFixed(1);
      const totalMB = (total / 1024 / 1024).toFixed(1);
      return `${usedMB}/${totalMB} MB`;
    }
    return 'Not available';
  }
}

/**
 * Progress tracker with visual updates
 */
class ProgressTracker {
  constructor(containerId = 'progress-container') {
    this.container = document.getElementById(containerId);
    this.progressBar = null;
    this.statusText = null;
    this.setupUI();
  }

  setupUI() {
    if (this.container) {
      this.container.innerHTML = `
        <div style="margin: 20px 0;">
          <div id="progress-status" style="margin-bottom: 10px; font-family: monospace;">
            Ready to generate passwords...
          </div>
          <div style="background: #f0f0f0; border-radius: 8px; overflow: hidden; height: 20px;">
            <div id="progress-bar" style="
              background: linear-gradient(90deg, #4CAF50, #45a049);
              height: 100%;
              width: 0%;
              transition: width 0.3s ease;
            "></div>
          </div>
          <div id="generation-stats" style="margin-top: 10px; font-size: 0.9em; color: #666;">
          </div>
        </div>
      `;
      this.progressBar = document.getElementById('progress-bar');
      this.statusText = document.getElementById('progress-status');
      this.statsText = document.getElementById('generation-stats');
    }
  }

  update(progress) {
    const { completed, total, percentage } = progress;

    if (this.progressBar) {
      this.progressBar.style.width = `${percentage}%`;
    }

    if (this.statusText) {
      this.statusText.textContent = `Generating passwords... ${completed}/${total} (${percentage}%)`;
    }

    if (this.statsText) {
      const rate = completed > 0 ? ((completed / (Date.now() - this.startTime)) * 1000).toFixed(0) : '0';
      this.statsText.textContent = `Rate: ${rate} passwords/sec`;
    }
  }

  start() {
    this.startTime = Date.now();
    if (this.statusText) {
      this.statusText.textContent = 'Initializing workers...';
    }
  }

  finish(results) {
    if (this.progressBar) {
      this.progressBar.style.width = '100%';
    }

    if (this.statusText) {
      this.statusText.textContent = `Complete! Generated ${results.totalCount} passwords in ${results.totalTime.toFixed(2)}ms`;
    }

    if (this.statsText) {
      this.statsText.textContent = `Final rate: ${results.rate} passwords/sec`;
    }
  }
}

/**
 * Configuration generators for different password scenarios
 */
class ConfigurationGenerator {
  /**
   * Generates configs for mixed password types (realistic use case).
   *
   * @param {number} count - Number of passwords to generate.
   * @returns {Array<Object>} Array of password configurations.
   */
  static mixed(count) {
    const configs = [];
    const types = [
      { type: 'strong', weight: 0.5 },
      { type: 'memorable', weight: 0.3 },
      { type: 'base64', weight: 0.2 }
    ];

    for (let i = 0; i < count; i++) {
      // Select type based on weights
      const rand = Math.random();
      let cumulativeWeight = 0;
      let selectedType = types[0];

      for (const typeConfig of types) {
        cumulativeWeight += typeConfig.weight;
        if (rand <= cumulativeWeight) {
          selectedType = typeConfig;
          break;
        }
      }

      let config = {
        type: selectedType.type,
        separator: Math.random() < 0.5 ? '-' : '_'
      };

      // Add type-specific parameters
      switch (selectedType.type) {
        case 'strong':
          config.length = [12, 16, 20, 24][Math.floor(Math.random() * 4)];
          config.iteration = [1, 2, 3][Math.floor(Math.random() * 3)];
          break;

        case 'memorable':
          config.iteration = [3, 4, 5, 6][Math.floor(Math.random() * 4)];
          break;

        case 'base64':
          config.length = [16, 24, 32][Math.floor(Math.random() * 3)];
          config.iteration = 1;
          break;
      }

      configs.push(config);
    }

    return configs;
  }

  /**
   * Generates configs for strong passwords only.
   *
   * @param {number} count - Number of passwords to generate.
   * @returns {Array<Object>} Array of strong password configurations.
   */
  static strongOnly(count) {
    return Array.from({ length: count }, () => ({
      type: 'strong',
      length: 16,
      iteration: 2,
      separator: '-'
    }));
  }

  /**
   * Generates configs for memorable passwords only.
   *
   * @param {number} count - Number of passwords to generate.
   * @returns {Array<Object>} Array of memorable password configurations.
   */
  static memorableOnly(count) {
    return Array.from({ length: count }, () => ({
      type: 'memorable',
      iteration: 4,
      separator: '-'
    }));
  }

  /**
   * Generates configs for performance testing.
   *
   * @param {number} count - Number of passwords to generate.
   * @returns {Array<Object>} Array of fast-generation configurations.
   */
  static performanceTest(count) {
    return Array.from({ length: count }, () => ({
      type: 'base64',
      length: 12,
      iteration: 1,
      separator: ''
    }));
  }
}

/**
 * Main demonstration function
 */
async function demonstrateBulkGeneration() {
  console.clear();
  console.log('🔒 Password Generator - Web Worker Bulk Generation Demo');
  console.log('='.repeat(60));

  const monitor = new PerformanceMonitor();
  const progress = new ProgressTracker();

  // Initialize worker pool
  monitor.start();
  progress.start();

  const pool = new PasswordWorkerPool({
    size: navigator.hardwareConcurrency || 4,
    timeout: 60000 // 1 minute timeout for large batches
  });

  try {
    await pool.initialize();
    monitor.checkpoint('Worker pool initialized');

    // Demonstration scenarios
    const scenarios = [
      {
        name: 'Warm-up (1,000 mixed passwords)',
        count: 1000,
        configGen: ConfigurationGenerator.mixed
      },
      {
        name: 'Performance test (5,000 fast passwords)',
        count: 5000,
        configGen: ConfigurationGenerator.performanceTest
      },
      {
        name: 'Production simulation (10,000 mixed passwords)',
        count: 10000,
        configGen: ConfigurationGenerator.mixed
      },
      {
        name: 'Memorable passwords (2,000 strong memorable)',
        count: 2000,
        configGen: ConfigurationGenerator.memorableOnly
      }
    ];

    const results = [];

    for (const scenario of scenarios) {
      console.log(`\n📋 Starting: ${scenario.name}`);

      // Generate configurations
      const configs = scenario.configGen(scenario.count);
      monitor.checkpoint(`Generated ${configs.length} configurations`);

      // Track progress
      let lastUpdateTime = Date.now();
      const onProgress = (progressData) => {
        const now = Date.now();
        if (now - lastUpdateTime > 200) { // Update UI max every 200ms
          progress.update(progressData);
          lastUpdateTime = now;
        }
      };

      // Generate passwords
      const passwords = await pool.generateMultiple(configs, { onProgress });
      monitor.checkpoint(`Generated ${passwords.length} passwords`, passwords.length);

      // Validate results
      if (passwords.length !== scenario.count) {
        throw new Error(`Expected ${scenario.count} passwords, got ${passwords.length}`);
      }

      // Sample some passwords for display
      console.log('📝 Sample passwords:');
      const samples = passwords.slice(0, 5);
      samples.forEach((pwd, i) => {
        console.log(`  ${i + 1}. ${pwd}`);
      });

      results.push({
        scenario: scenario.name,
        count: passwords.length,
        samplePasswords: samples
      });
    }

    // Final statistics
    const finalStats = pool.getStats();
    const overallResults = monitor.finish(finalStats.totalPasswordsGenerated);
    progress.finish(overallResults);

    console.log('\n📈 Worker Pool Statistics:');
    console.log(`  Pool size: ${finalStats.poolSize}`);
    console.log(`  Tasks completed: ${finalStats.tasksCompleted}`);
    console.log(`  Total passwords: ${finalStats.totalPasswordsGenerated}`);
    console.log(`  Errors: ${finalStats.errors}`);

    return {
      overallResults,
      scenarios: results,
      poolStats: finalStats
    };

  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  } finally {
    // Clean up workers
    await pool.terminate();
    monitor.checkpoint('Worker pool terminated');
  }
}

/**
 * Stress test for extreme bulk generation
 */
async function stressTest(passwordCount = 50000) {
  console.log(`\n🔥 Stress Test: Generating ${passwordCount.toLocaleString()} passwords`);
  console.log('='.repeat(60));

  const monitor = new PerformanceMonitor();
  const progress = new ProgressTracker();

  monitor.start();
  progress.start();

  // Use maximum workers for stress test
  const pool = new PasswordWorkerPool({
    size: Math.max(navigator.hardwareConcurrency || 4, 8),
    timeout: 300000 // 5 minute timeout
  });

  try {
    await pool.initialize();

    // Use fast configuration for stress test
    const configs = ConfigurationGenerator.performanceTest(passwordCount);

    let progressUpdates = 0;
    const passwords = await pool.generateMultiple(configs, {
      onProgress: (progressData) => {
        progressUpdates++;
        if (progressUpdates % 10 === 0) { // Update less frequently
          progress.update(progressData);
        }
      }
    });

    const results = monitor.finish(passwords.length);
    progress.finish(results);

    // Memory analysis
    if (performance.memory) {
      const memoryMB = performance.memory.usedJSHeapSize / 1024 / 1024;
      console.log(`📊 Memory efficiency: ${(memoryMB / passwordCount * 1000).toFixed(3)} MB per 1000 passwords`);
    }

    return results;

  } finally {
    await pool.terminate();
  }
}

/**
 * Interactive demo controls
 */
function setupInteractiveDemo() {
  if (typeof document === 'undefined') {
    console.log('⚠️ Interactive demo requires browser environment');
    return;
  }

  // Create demo UI
  document.body.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
      <h1>🔒 Password Generator - Web Worker Bulk Demo</h1>

      <div style="margin: 20px 0;">
        <h3>Quick Start</h3>
        <button id="demo-btn" style="
          background: #4CAF50; color: white; border: none; padding: 12px 24px;
          border-radius: 4px; cursor: pointer; font-size: 16px; margin-right: 10px;
        ">Run Full Demo</button>

        <button id="stress-btn" style="
          background: #ff9800; color: white; border: none; padding: 12px 24px;
          border-radius: 4px; cursor: pointer; font-size: 16px;
        ">Stress Test (50k)</button>
      </div>

      <div id="progress-container"></div>

      <div id="results" style="margin-top: 20px;"></div>

      <div style="margin-top: 40px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
        <h4>About This Demo</h4>
        <p>This demonstration shows the Password Generator's Web Worker implementation for bulk password generation:</p>
        <ul>
          <li><strong>Non-blocking:</strong> Generates thousands of passwords without freezing the browser</li>
          <li><strong>Parallel processing:</strong> Uses multiple Web Workers to maximize performance</li>
          <li><strong>Progress tracking:</strong> Real-time updates on generation progress</li>
          <li><strong>Memory efficient:</strong> Manages memory usage even for large batches</li>
          <li><strong>Error resilient:</strong> Handles worker failures and retries automatically</li>
        </ul>

        <h4>Performance Notes</h4>
        <p>Performance varies based on:</p>
        <ul>
          <li><strong>CPU cores:</strong> More cores = more parallel workers = better performance</li>
          <li><strong>Password complexity:</strong> Strong/memorable passwords take longer than base64</li>
          <li><strong>Batch size:</strong> Optimal batch size depends on password count and worker count</li>
          <li><strong>Browser:</strong> Different JavaScript engines have varying performance characteristics</li>
        </ul>
      </div>
    </div>
  `;

  // Add event listeners
  document.getElementById('demo-btn').addEventListener('click', async () => {
    document.getElementById('results').innerHTML = '<div style="color: #666;">Running full demonstration...</div>';
    try {
      const results = await demonstrateBulkGeneration();
      displayResults(results);
    } catch (error) {
      document.getElementById('results').innerHTML = `<div style="color: red;">Error: ${error.message}</div>`;
    }
  });

  document.getElementById('stress-btn').addEventListener('click', async () => {
    document.getElementById('results').innerHTML = '<div style="color: #666;">Running stress test...</div>';
    try {
      const results = await stressTest();
      document.getElementById('results').innerHTML = `
        <div style="color: #4CAF50; font-weight: bold;">
          Stress test complete! Generated ${results.totalCount.toLocaleString()} passwords
          in ${results.totalTime.toFixed(2)}ms (${results.rate} passwords/sec)
        </div>
      `;
    } catch (error) {
      document.getElementById('results').innerHTML = `<div style="color: red;">Error: ${error.message}</div>`;
    }
  });

  function displayResults(results) {
    const html = `
      <div style="color: #4CAF50; font-weight: bold; margin-bottom: 20px;">
        ✅ All scenarios completed successfully!
      </div>

      <div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px;">
        <h4>Overall Performance</h4>
        <p><strong>Total time:</strong> ${results.overallResults.totalTime.toFixed(2)}ms</p>
        <p><strong>Total passwords:</strong> ${results.overallResults.totalCount.toLocaleString()}</p>
        <p><strong>Average rate:</strong> ${results.overallResults.rate} passwords/sec</p>

        <h4>Pool Statistics</h4>
        <p><strong>Workers used:</strong> ${results.poolStats.poolSize}</p>
        <p><strong>Tasks completed:</strong> ${results.poolStats.tasksCompleted}</p>
        <p><strong>Errors:</strong> ${results.poolStats.errors}</p>
      </div>
    `;

    document.getElementById('results').innerHTML = html;
  }
}

// Auto-setup if in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupInteractiveDemo);
  } else {
    setupInteractiveDemo();
  }
}

// Export for programmatic usage
export {
  demonstrateBulkGeneration,
  stressTest,
  ConfigurationGenerator,
  PerformanceMonitor,
  ProgressTracker,
  setupInteractiveDemo
};