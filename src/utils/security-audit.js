// Copyright © 2022-2024 Password Generator. All rights reserved.
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
  auditOverhead: 0
};

/**
 * Entropy calculation constants
 */
const ENTROPY_CONSTANTS = {
  // Base64 charset has 64 possible values = 6 bits per character
  BASE64_BITS_PER_CHAR: Math.log2(64),
  // Dictionary entropy depends on dictionary size
  DICTIONARY_ENTRIES: null, // Will be set when dictionary is loaded
};

/**
 * Resets audit session state for new password generation
 */
export const resetAuditSession = () => {
  if (!auditEnabled) {return;}

  entropyLog = [];
  algorithmUsage = {};
  performanceMetrics = {
    generationStart: performance.now(),
    generationEnd: 0,
    auditOverhead: 0
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
  if (!auditEnabled) {return;}

  const auditStart = performance.now();

  entropyLog.push({
    source,
    calls,
    entropyBits,
    details,
    timestamp: Date.now()
  });

  performanceMetrics.auditOverhead += performance.now() - auditStart;
};

/**
 * Records algorithm usage during password generation
 * @param {string} algorithm - The algorithm used ('base64-encoding', 'dictionary-lookup', etc.)
 * @param {Object} config - Configuration parameters for the algorithm
 */
export const recordAlgorithmUsage = (algorithm, config = {}) => {
  if (!auditEnabled) {return;}

  const auditStart = performance.now();

  if (!algorithmUsage[algorithm]) {
    algorithmUsage[algorithm] = {
      usageCount: 0,
      configurations: []
    };
  }

  algorithmUsage[algorithm].usageCount++;
  algorithmUsage[algorithm].configurations.push(config);

  performanceMetrics.auditOverhead += performance.now() - auditStart;
};

/**
 * Calculates entropy for base64 password generation
 * @param {number} byteLength - Number of random bytes generated
 * @return {number} Estimated entropy in bits
 */
export const calculateBase64Entropy = (byteLength) => {
  // Each random byte provides 8 bits of entropy
  return byteLength * 8;
};

/**
 * Calculates entropy for base64 chunk generation
 * @param {number} characterLength - Number of characters in the chunk
 * @return {number} Estimated entropy in bits
 */
export const calculateBase64ChunkEntropy = (characterLength) => {
  // Each base64 character provides log2(64) = 6 bits of entropy
  return characterLength * ENTROPY_CONSTANTS.BASE64_BITS_PER_CHAR;
};

/**
 * Calculates entropy for dictionary-based password generation
 * @param {number} dictionarySize - Number of entries in the dictionary
 * @param {number} wordCount - Number of words selected
 * @return {number} Estimated entropy in bits
 */
export const calculateDictionaryEntropy = (dictionarySize, wordCount) => {
  // Each word selection provides log2(dictionarySize) bits of entropy
  const bitsPerWord = Math.log2(dictionarySize);
  return wordCount * bitsPerWord;
};

/**
 * Sets dictionary size for entropy calculations
 * @param {number} size - Number of entries in the dictionary
 */
export const setDictionarySize = (size) => {
  ENTROPY_CONSTANTS.DICTIONARY_ENTRIES = size;
};

/**
 * Finishes audit session and calculates final metrics
 */
export const finishAuditSession = () => {
  if (!auditEnabled) {return;}

  performanceMetrics.generationEnd = performance.now();
};

/**
 * Determines security level based on total entropy
 * @param {number} entropyBits - Total entropy in bits
 * @return {string} Security level classification
 */
const getSecurityLevel = (entropyBits) => {
  if (entropyBits >= 256) {return "EXCELLENT (256+ bits)";}
  if (entropyBits >= 128) {return "STRONG (128-255 bits)";}
  if (entropyBits >= 80) {return "GOOD (80-127 bits)";}
  if (entropyBits >= 64) {return "MODERATE (64-79 bits)";}
  return "WEAK (<64 bits)";
};

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
 * Provides security recommendations based on entropy level
 * @param {number} entropyBits - Total entropy in bits
 * @return {string} Security recommendation
 */
const getSecurityRecommendation = (entropyBits) => {
  if (entropyBits >= 128) {
    return "Excellent security. Suitable for high-security applications.";
  } else if (entropyBits >= 80) {
    return "Good security for most applications. Consider increasing length for high-security needs.";
  } else {
    return "Consider increasing password length or iteration count for better security.";
  }
};

/**
 * Generates comprehensive security audit report
 * @return {Object} Complete audit report with entropy analysis and algorithm usage
 */
export const generateAuditReport = () => {
  if (!auditEnabled) {
    return {
      auditEnabled: false,
      message: "Security audit was not enabled for this generation session"
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
      sources: entropyLog.map(entry => ({
        source: entry.source,
        calls: entry.calls,
        entropyBits: Math.round(entry.entropyBits * 100) / 100,
        details: entry.details
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
      cryptographicStandard: "Uses Node.js crypto module (OpenSSL-based CSPRNG)",
      entropySource: "OS-provided cryptographically secure random number generator",
      recommendation: getSecurityRecommendation(totalEntropyBits)
    }
  };
};
