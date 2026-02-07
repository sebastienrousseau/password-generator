// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Node.js Console Logger adapter.
 *
 * This adapter provides logging functionality using Node.js console methods.
 *
 * @module NodeConsoleLogger
 */

import { LoggerPort } from "../../../packages/core/src/ports/index.js";

/**
 * Log level enum for filtering messages.
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
};

/**
 * Node.js implementation of LoggerPort using console methods.
 */
export class NodeConsoleLogger extends LoggerPort {
  /**
   * Creates a new NodeConsoleLogger instance.
   *
   * @param {Object} options - Logger options.
   * @param {number} options.level - Minimum log level to output.
   * @param {boolean} options.timestamps - Whether to include timestamps.
   * @param {string} options.prefix - Prefix for all log messages.
   */
  constructor(options = {}) {
    super();
    this.level = options.level ?? LogLevel.INFO;
    this.timestamps = options.timestamps ?? false;
    this.prefix = options.prefix ?? "";
  }

  /**
   * Formats a message with optional timestamp and prefix.
   *
   * @param {string} level - The log level label.
   * @param {string} message - The message to format.
   * @returns {string} The formatted message.
   * @private
   */
  _format(level, message) {
    const parts = [];

    if (this.timestamps) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(`[${level}]`);

    if (this.prefix) {
      parts.push(`[${this.prefix}]`);
    }

    parts.push(message);

    return parts.join(" ");
  }

  /**
   * Logs a debug message.
   *
   * @param {string} message - The message to log.
   * @param {Object} metadata - Additional context.
   */
  debug(message, metadata = {}) {
    if (this.level <= LogLevel.DEBUG) {
      const formatted = this._format("DEBUG", message);
      if (Object.keys(metadata).length > 0) {
        console.debug(formatted, metadata);
      } else {
        console.debug(formatted);
      }
    }
  }

  /**
   * Logs an informational message.
   *
   * @param {string} message - The message to log.
   * @param {Object} metadata - Additional context.
   */
  info(message, metadata = {}) {
    if (this.level <= LogLevel.INFO) {
      const formatted = this._format("INFO", message);
      if (Object.keys(metadata).length > 0) {
        console.info(formatted, metadata);
      } else {
        console.info(formatted);
      }
    }
  }

  /**
   * Logs a warning message.
   *
   * @param {string} message - The message to log.
   * @param {Object} metadata - Additional context.
   */
  warn(message, metadata = {}) {
    if (this.level <= LogLevel.WARN) {
      const formatted = this._format("WARN", message);
      if (Object.keys(metadata).length > 0) {
        console.warn(formatted, metadata);
      } else {
        console.warn(formatted);
      }
    }
  }

  /**
   * Logs an error message.
   *
   * @param {string} message - The error message.
   * @param {Error} error - The error object.
   */
  error(message, error = null) {
    if (this.level <= LogLevel.ERROR) {
      const formatted = this._format("ERROR", message);
      if (error) {
        console.error(formatted, error);
      } else {
        console.error(formatted);
      }
    }
  }

  /**
   * Sets the minimum log level.
   *
   * @param {number} level - The new log level.
   */
  setLevel(level) {
    this.level = level;
  }
}

export default NodeConsoleLogger;
