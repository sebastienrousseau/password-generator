// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Port interface for logging and audit operations.
 *
 * This port abstracts logging operations to enable different implementations
 * (console logging, file logging, structured logging, audit systems, etc.).
 *
 * Supports both general logging and security audit tracking for cryptographic
 * operations and password generation events.
 *
 * @interface LoggerPort
 */
export class LoggerPort {
  /**
   * Logs an informational message.
   *
   * @param {string} message - The message to log.
   * @param {Object} [metadata] - Optional structured metadata.
   * @returns {Promise<void>} A promise that resolves when logging completes.
   * @abstract
   */
  async info(message, metadata = {}) {
    throw new Error("LoggerPort.info() must be implemented");
  }

  /**
   * Logs a warning message.
   *
   * @param {string} message - The message to log.
   * @param {Object} [metadata] - Optional structured metadata.
   * @returns {Promise<void>} A promise that resolves when logging completes.
   * @abstract
   */
  async warn(message, metadata = {}) {
    throw new Error("LoggerPort.warn() must be implemented");
  }

  /**
   * Logs an error message.
   *
   * @param {string} message - The message to log.
   * @param {Error|Object} [error] - Optional error object or metadata.
   * @returns {Promise<void>} A promise that resolves when logging completes.
   * @abstract
   */
  async error(message, error = {}) {
    throw new Error("LoggerPort.error() must be implemented");
  }

  /**
   * Logs a debug message (may be filtered out in production).
   *
   * @param {string} message - The message to log.
   * @param {Object} [metadata] - Optional structured metadata.
   * @returns {Promise<void>} A promise that resolves when logging completes.
   * @abstract
   */
  async debug(message, metadata = {}) {
    throw new Error("LoggerPort.debug() must be implemented");
  }

  /**
   * Records entropy usage for security audit tracking.
   *
   * @param {string} source - The entropy source (e.g., 'crypto.randomBytes').
   * @param {number} calls - The number of calls made to the entropy source.
   * @param {number} totalEntropy - The total bits of entropy generated.
   * @param {Object} metadata - Additional metadata about the operation.
   * @returns {Promise<void>} A promise that resolves when recording completes.
   * @abstract
   */
  async recordEntropyUsage(source, calls, totalEntropy, metadata = {}) {
    throw new Error("LoggerPort.recordEntropyUsage() must be implemented");
  }

  /**
   * Records algorithm usage for security audit tracking.
   *
   * @param {string} algorithm - The algorithm name (e.g., 'base64-generation').
   * @param {Object} metadata - Metadata about the algorithm usage.
   * @returns {Promise<void>} A promise that resolves when recording completes.
   * @abstract
   */
  async recordAlgorithmUsage(algorithm, metadata = {}) {
    throw new Error("LoggerPort.recordAlgorithmUsage() must be implemented");
  }

  /**
   * Enables or disables audit mode for detailed security tracking.
   *
   * @param {boolean} enabled - Whether audit mode should be enabled.
   * @returns {Promise<void>} A promise that resolves when audit mode is set.
   * @abstract
   */
  async setAuditMode(enabled) {
    throw new Error("LoggerPort.setAuditMode() must be implemented");
  }

  /**
   * Resets the current audit session, clearing any accumulated audit data.
   *
   * @returns {Promise<void>} A promise that resolves when the session is reset.
   * @abstract
   */
  async resetAuditSession() {
    throw new Error("LoggerPort.resetAuditSession() must be implemented");
  }

  /**
   * Finalizes the current audit session for report generation.
   *
   * @returns {Promise<void>} A promise that resolves when the session is finalized.
   * @abstract
   */
  async finishAuditSession() {
    throw new Error("LoggerPort.finishAuditSession() must be implemented");
  }

  /**
   * Generates a comprehensive audit report for the current session.
   *
   * @returns {Promise<Object>} A promise resolving to the audit report object.
   * @abstract
   */
  async generateAuditReport() {
    throw new Error("LoggerPort.generateAuditReport() must be implemented");
  }

  /**
   * Records performance metrics for audit and monitoring.
   *
   * @param {string} operation - The operation being measured.
   * @param {number} durationMs - The duration in milliseconds.
   * @param {Object} [metadata] - Optional metadata about the operation.
   * @returns {Promise<void>} A promise that resolves when metrics are recorded.
   * @abstract
   */
  async recordPerformanceMetric(operation, durationMs, metadata = {}) {
    throw new Error("LoggerPort.recordPerformanceMetric() must be implemented");
  }
}