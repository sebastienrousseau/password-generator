// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Password Generation Web Workers Module
 *
 * Provides Web Worker-based password generation for non-blocking bulk operations.
 * This module enables generating thousands of passwords in parallel without
 * blocking the main thread.
 *
 * @module workers
 *
 * @example
 * import { PasswordWorkerPool } from '@password-generator/workers';
 *
 * const pool = new PasswordWorkerPool({ size: 4 });
 * await pool.initialize();
 *
 * const passwords = await pool.generateMultiple([
 *   { type: 'strong', length: 16, iteration: 2, separator: '-' },
 *   { type: 'memorable', iteration: 4, separator: '-' },
 *   { type: 'base64', length: 24, iteration: 1 }
 * ]);
 *
 * await pool.terminate();
 */

import { PasswordWorkerPool } from './password-worker-pool.js';

export { PasswordWorkerPool };

/**
 * Creates a quick worker pool with sensible defaults.
 *
 * @param {Object} [options] - Pool configuration options.
 * @returns {PasswordWorkerPool} Configured worker pool.
 */
export function createWorkerPool(options = {}) {
  const { size = navigator?.hardwareConcurrency || 4, ...restOptions } = options;

  return new PasswordWorkerPool({
    size,
    ...restOptions,
  });
}

/**
 * Utility function for quick bulk password generation.
 * Creates a temporary worker pool, generates passwords, and cleans up.
 *
 * @param {Array<Object>} configs - Password generation configurations.
 * @param {Object} [options] - Generation options.
 * @param {number} [options.workers] - Number of workers to use.
 * @param {Function} [options.onProgress] - Progress callback.
 * @returns {Promise<Array<string>>} Array of generated passwords.
 */
export async function generatePasswordsBulk(configs, options = {}) {
  const { workers, onProgress, ...poolOptions } = options;

  const pool = createWorkerPool({
    size: workers,
    ...poolOptions,
  });

  try {
    await pool.initialize();
    return await pool.generateMultiple(configs, { onProgress });
  } finally {
    await pool.terminate();
  }
}

/**
 * Utility function for generating a large number of identical passwords.
 * Optimized for cases where you need many passwords with the same configuration.
 *
 * @param {Object} config - Password configuration template.
 * @param {number} count - Number of passwords to generate.
 * @param {Object} [options] - Generation options.
 * @returns {Promise<Array<string>>} Array of generated passwords.
 */
export async function generateIdenticalPasswords(config, count, options = {}) {
  const configs = Array(count).fill(config);
  return generatePasswordsBulk(configs, options);
}

/**
 * Pre-configured generation presets for common use cases.
 */
export const GenerationPresets = {
  /**
   * Strong passwords suitable for most applications.
   */
  STRONG_DEFAULT: {
    type: 'strong',
    length: 16,
    iteration: 2,
    separator: '-',
  },

  /**
   * Memorable passwords for users who need to remember them.
   */
  MEMORABLE_DEFAULT: {
    type: 'memorable',
    iteration: 4,
    separator: '-',
  },

  /**
   * High-security passwords for critical applications.
   */
  HIGH_SECURITY: {
    type: 'strong',
    length: 24,
    iteration: 3,
    separator: '_',
  },

  /**
   * Fast-generation passwords for performance testing.
   */
  PERFORMANCE_TEST: {
    type: 'base64',
    length: 12,
    iteration: 1,
    separator: '',
  },
};

/**
 * Configuration helpers for common bulk generation patterns.
 */
export const BulkPatterns = {
  /**
   * Creates configurations for mixed password types.
   *
   * @param {number} count - Total number of configurations.
   * @param {Object} [distribution] - Type distribution weights.
   * @returns {Array<Object>} Array of configurations.
   */
  mixed(count, distribution = { strong: 0.5, memorable: 0.3, base64: 0.2 }) {
    const configs = [];
    const types = Object.entries(distribution);
    let totalWeight = Object.values(distribution).reduce((sum, w) => sum + w, 0);

    for (let i = 0; i < count; i++) {
      const rand = Math.random() * totalWeight;
      let cumulativeWeight = 0;
      let selectedType = types[0][0];

      for (const [type, weight] of types) {
        cumulativeWeight += weight;
        if (rand <= cumulativeWeight) {
          selectedType = type;
          break;
        }
      }

      configs.push({ ...GenerationPresets[`${selectedType.toUpperCase()}_DEFAULT`] });
    }

    return configs;
  },

  /**
   * Creates configurations for varying password lengths.
   *
   * @param {number} count - Total number of configurations.
   * @param {Array<number>} lengths - Possible lengths.
   * @returns {Array<Object>} Array of configurations.
   */
  varyingLengths(count, lengths = [12, 16, 20, 24]) {
    return Array.from({ length: count }, (_, i) => ({
      type: 'strong',
      length: lengths[i % lengths.length],
      iteration: 1,
      separator: '-',
    }));
  },

  /**
   * Creates configurations for performance benchmarking.
   *
   * @param {number} count - Total number of configurations.
   * @returns {Array<Object>} Array of configurations optimized for speed.
   */
  benchmark(count) {
    return Array(count).fill({ ...GenerationPresets.PERFORMANCE_TEST });
  },
};
