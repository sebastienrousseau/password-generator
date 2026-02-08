// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * SecurityAudit module provides transparency into cryptographic operations
 * without affecting normal password generation performance.
 *
 * When audit mode is disabled (default), all tracking operations are no-ops.
 * When enabled via --audit flag, detailed entropy and algorithm information is collected.
 *
 * @module security-audit
 */

import {
  ENTROPY_CONSTANTS,
  getSecurityLevel,
  getSecurityRecommendation,
} from '../../packages/core/src/domain/index.js';

/**
 * Global audit state - disabled by default for zero-overhead operation
 * @type {boolean}
 */
let auditEnabled = false;

/**
 * Entropy sources tracking for current generation session
 * @type {Array<Object>}
 */
let entropyLog = [];

/**
 * Algorithm usage tracking for current generation session
 * @type {Object}
 */
let algorithmUsage = {};

/**
 * Performance tracking for audit overhead measurement
 * @type {Object}
 */
let performanceMetrics = {
  generationStart: 0,
  generationEnd: 0,
  auditOverhead: 0,
};

// Re-export entropy constants from domain layer
export { ENTROPY_CONSTANTS } from '../../packages/core/src/domain/index.js';

/**
 * Resets audit session state for new password generation
 */
export const resetAuditSession = () => {
  if (!auditEnabled) {
    return;
  }

  entropyLog = [];
  algorithmUsage = {};
  performanceMetrics = {
    generationStart: performance.now(),
    generationEnd: 0,
    auditOverhead: 0,
  };
};

/**
 * Enables or disables audit mode
 * @param {boolean} enabled - Whether to enable audit tracking
 */
export const setAuditMode = (enabled) => {
  auditEnabled = enabled;
  if (enabled) {
    resetAuditSession();
  }
};

/**
 * Records entropy source usage during password generation
 * @param {string} source - The entropy source ('crypto.randomBytes', 'crypto.randomInt', etc.)
 * @param {number} calls - Number of calls to this source
 * @param {number} entropyBits - Estimated entropy bits generated
 * @param {Object} details - Additional details about the entropy generation
 */
export const recordEntropyUsage = (source, calls, entropyBits, details = {}) => {
  if (!auditEnabled) {
    return;
  }

  const auditStart = performance.now();

  entropyLog.push({
    source,
    calls,
    entropyBits,
    details,
    timestamp: Date.now(),
  });

  performanceMetrics.auditOverhead += performance.now() - auditStart;
};

/**
 * Records algorithm usage during password generation
 * @param {string} algorithm - The algorithm used ('base64-encoding', 'dictionary-lookup', etc.)
 * @param {Object} config - Configuration parameters for the algorithm
 */
export const recordAlgorithmUsage = (algorithm, config = {}) => {
  if (!auditEnabled) {
    return;
  }

  const auditStart = performance.now();

  if (!algorithmUsage[algorithm]) {
    algorithmUsage[algorithm] = {
      usageCount: 0,
      configurations: [],
    };
  }

  algorithmUsage[algorithm].usageCount++;
  algorithmUsage[algorithm].configurations.push(config);

  performanceMetrics.auditOverhead += performance.now() - auditStart;
};

// Re-export entropy calculation functions from domain layer
export {
  calculateBase64Entropy,
  calculateBase64ChunkEntropy,
  calculateDictionaryEntropy,
} from '../../packages/core/src/domain/index.js';

/**
 * Sets dictionary size for entropy calculations
 * @param {number} size - Number of entries in the dictionary
 */
export const setDictionarySize = (size) => {
  // Use the already-imported ENTROPY_CONSTANTS
  ENTROPY_CONSTANTS.DICTIONARY_ENTRIES = size;
};

/**
 * Finishes audit session and calculates final metrics
 */
export const finishAuditSession = () => {
  if (!auditEnabled) {
    return;
  }

  performanceMetrics.generationEnd = performance.now();
};

// Use domain logic for security level classification

/**
 * Creates entropy breakdown by source type
 * @return {Object} Entropy breakdown by source
 */
const getEntropyBreakdown = () => {
  const breakdown = {};

  for (const entry of entropyLog) {
    if (!breakdown[entry.source]) {
      breakdown[entry.source] = 0;
    }
    breakdown[entry.source] += entry.entropyBits;
  }

  return breakdown;
};

/**
 * Generates comprehensive security audit report
 * @return {Object} Complete audit report with entropy analysis and algorithm usage
 */
export const generateAuditReport = () => {
  if (!auditEnabled) {
    return {
      auditEnabled: false,
      message: 'Security audit was not enabled for this generation session',
    };
  }

  const totalEntropyBits = entropyLog.reduce((sum, entry) => sum + entry.entropyBits, 0);
  const totalGenerationTime = performanceMetrics.generationEnd - performanceMetrics.generationStart;
  const auditOverheadPercent = (performanceMetrics.auditOverhead / totalGenerationTime) * 100;

  return {
    auditEnabled: true,
    summary: {
      totalEntropyBits: Math.round(totalEntropyBits * 100) / 100,
      securityLevel: getSecurityLevel(totalEntropyBits),
      algorithmsUsed: Object.keys(algorithmUsage).length,
      entropySourcesUsed: entropyLog.length,
    },
    entropyDetails: {
      sources: entropyLog.map((entry) => ({
        source: entry.source,
        calls: entry.calls,
        entropyBits: Math.round(entry.entropyBits * 100) / 100,
        details: entry.details,
      })),
      breakdown: getEntropyBreakdown(),
    },
    algorithms: algorithmUsage,
    performance: {
      totalGenerationTimeMs: Math.round(totalGenerationTime * 100) / 100,
      auditOverheadMs: Math.round(performanceMetrics.auditOverhead * 100) / 100,
      auditOverheadPercent: Math.round(auditOverheadPercent * 100) / 100,
    },
    compliance: {
      cryptographicStandard: 'Uses Node.js crypto module (OpenSSL-based CSPRNG)',
      entropySource: 'OS-provided cryptographically secure random number generator',
      recommendation: getSecurityRecommendation(totalEntropyBits),
    },
  };
};
