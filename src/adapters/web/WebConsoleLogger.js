// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Web Console Logger adapter for browser environments.
 *
 * This adapter provides a standardized logging interface that works consistently
 * across both Node.js and browser environments, with optional enhanced formatting
 * for web console capabilities.
 *
 * @module WebConsoleLogger
 */

/**
 * Log levels for categorizing messages.
 */
export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

/**
 * Default configuration for the web console logger.
 */
const DEFAULT_CONFIG = {
  enabled: true,
  level: LogLevel.INFO,
  timestamp: true,
  colors: true,
  prefix: 'PwdGen',
};

/**
 * Web Console Logger class that provides enhanced logging capabilities.
 */
export class WebConsoleLogger {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Formats a timestamp for log messages.
   * @returns {string} Formatted timestamp.
   */
  _formatTimestamp() {
    if (!this.config.timestamp) {
      return '';
    }
    return `[${new Date().toISOString()}] `;
  }

  /**
   * Formats a log message with optional prefix and timestamp.
   * @param {string} level The log level.
   * @param {string} message The message to format.
   * @returns {string} Formatted log message.
   */
  _formatMessage(level, message) {
    const timestamp = this._formatTimestamp();
    const prefix = this.config.prefix ? `[${this.config.prefix}] ` : '';
    return `${timestamp}${prefix}${level}: ${message}`;
  }

  /**
   * Checks if a message should be logged based on the current log level.
   * @param {number} messageLevel The level of the message.
   * @returns {boolean} True if the message should be logged.
   */
  _shouldLog(messageLevel) {
    return this.config.enabled && messageLevel >= this.config.level;
  }

  /**
   * Logs a debug message.
   * @param {string} message The message to log.
   * @param {...any} args Additional arguments to pass to console.
   */
  debug(message, ...args) {
    if (!this._shouldLog(LogLevel.DEBUG)) {
      return;
    }

    if (this.config.colors && typeof console !== 'undefined' && console.debug) {
      console.debug(`%c${this._formatMessage('DEBUG', message)}`, 'color: gray', ...args);
    } else {
      this.log(this._formatMessage('DEBUG', message), ...args);
    }
  }

  /**
   * Logs an info message.
   * @param {string} message The message to log.
   * @param {...any} args Additional arguments to pass to console.
   */
  info(message, ...args) {
    if (!this._shouldLog(LogLevel.INFO)) {
      return;
    }

    if (this.config.colors && typeof console !== 'undefined' && console.info) {
      console.info(`%c${this._formatMessage('INFO', message)}`, 'color: blue', ...args);
    } else {
      this.log(this._formatMessage('INFO', message), ...args);
    }
  }

  /**
   * Logs a warning message.
   * @param {string} message The message to log.
   * @param {...any} args Additional arguments to pass to console.
   */
  warn(message, ...args) {
    if (!this._shouldLog(LogLevel.WARN)) {
      return;
    }

    if (typeof console !== 'undefined' && console.warn) {
      if (this.config.colors) {
        console.warn(`%c${this._formatMessage('WARN', message)}`, 'color: orange', ...args);
      } else {
        console.warn(this._formatMessage('WARN', message), ...args);
      }
    } else {
      this.log(this._formatMessage('WARN', message), ...args);
    }
  }

  /**
   * Logs an error message.
   * @param {string} message The message to log.
   * @param {...any} args Additional arguments to pass to console.
   */
  error(message, ...args) {
    if (!this._shouldLog(LogLevel.ERROR)) {
      return;
    }

    if (typeof console !== 'undefined' && console.error) {
      if (this.config.colors) {
        console.error(
          `%c${this._formatMessage('ERROR', message)}`,
          'color: red; font-weight: bold',
          ...args
        );
      } else {
        console.error(this._formatMessage('ERROR', message), ...args);
      }
    } else {
      this.log(this._formatMessage('ERROR', message), ...args);
    }
  }

  /**
   * Basic log method that falls back to console.log or a no-op.
   * @param {string} message The message to log.
   * @param {...any} args Additional arguments to pass to console.
   */
  log(message, ...args) {
    if (typeof console !== 'undefined' && console.log) {
      console.log(message, ...args);
    }
    // In environments without console, this becomes a no-op
  }

  /**
   * Logs a group of related messages (useful for debugging).
   * @param {string} groupName The name of the group.
   * @param {Function} callback Function that contains the grouped logs.
   */
  group(groupName, callback) {
    if (typeof console !== 'undefined' && console.group) {
      console.group(this._formatMessage('GROUP', groupName));
      try {
        callback();
      } finally {
        if (console.groupEnd) {
          console.groupEnd();
        }
      }
    } else {
      this.info(`--- ${groupName} ---`);
      callback();
      this.info(`--- End ${groupName} ---`);
    }
  }

  /**
   * Updates the logger configuration.
   * @param {Object} newConfig New configuration options.
   */
  configure(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

/**
 * Default logger instance for immediate use.
 */
export const logger = new WebConsoleLogger();

/**
 * Simple console adapter that provides Node.js console-compatible interface.
 */
export const webConsole = {
  log: (message, ...args) => logger.log(message, ...args),
  info: (message, ...args) => logger.info(message, ...args),
  warn: (message, ...args) => logger.warn(message, ...args),
  error: (message, ...args) => logger.error(message, ...args),
  debug: (message, ...args) => logger.debug(message, ...args),
  group: (groupName, callback) => logger.group(groupName, callback),
};

export default WebConsoleLogger;
