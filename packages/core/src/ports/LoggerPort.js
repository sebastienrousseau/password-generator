// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Port interface for logging operations.
 *
 * This port abstracts logging functionality to enable different implementations
 * (console, file, remote logging, no-op for production, etc.).
 *
 * @interface LoggerPort
 */
export class LoggerPort {
  /**
   * Logs a debug message.
   *
   * @param {string} message - The message to log.
   * @param {Object} [metadata] - Additional context.
   * @abstract
   */
  debug(_message, _metadata = {}) {
    throw new Error("LoggerPort.debug() must be implemented");
  }

  /**
   * Logs an informational message.
   *
   * @param {string} message - The message to log.
   * @param {Object} [metadata] - Additional context.
   * @abstract
   */
  info(_message, _metadata = {}) {
    throw new Error("LoggerPort.info() must be implemented");
  }

  /**
   * Logs a warning message.
   *
   * @param {string} message - The message to log.
   * @param {Object} [metadata] - Additional context.
   * @abstract
   */
  warn(_message, _metadata = {}) {
    throw new Error("LoggerPort.warn() must be implemented");
  }

  /**
   * Logs an error message.
   *
   * @param {string} message - The error message.
   * @param {Error} [error] - The error object.
   * @abstract
   */
  error(_message, _error = null) {
    throw new Error("LoggerPort.error() must be implemented");
  }
}

/**
 * Required methods for LoggerPort implementations.
 */
export const LOGGER_REQUIRED_METHODS = ["info", "error"];

/**
 * Optional methods for LoggerPort implementations.
 */
export const LOGGER_OPTIONAL_METHODS = ["debug", "warn"];

/**
 * No-op logger implementation for when logging is disabled.
 */
export class NoOpLogger extends LoggerPort {
  debug() {}
  info() {}
  warn() {}
  error() {}
}
