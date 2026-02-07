// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Port interface for time and clock operations.
 *
 * This port abstracts time-related operations to enable testability
 * and allow different implementations (system clock, mock clock,
 * high-resolution timers, etc.).
 *
 * Used for performance measurement, audit timestamps, and time-based
 * operations in password generation.
 *
 * @interface ClockPort
 */
export class ClockPort {
  /**
   * Gets the current time as a Unix timestamp in milliseconds.
   *
   * @returns {Promise<number>} A promise resolving to the current timestamp.
   * @abstract
   */
  async now() {
    throw new Error("ClockPort.now() must be implemented");
  }

  /**
   * Gets the current time as an ISO 8601 formatted string.
   *
   * @returns {Promise<string>} A promise resolving to the current time as an ISO string.
   * @abstract
   */
  async nowISO() {
    throw new Error("ClockPort.nowISO() must be implemented");
  }

  /**
   * Gets a high-resolution timestamp for performance measurement.
   * Returns time in milliseconds with sub-millisecond precision when available.
   *
   * @returns {Promise<number>} A promise resolving to a high-resolution timestamp.
   * @abstract
   */
  async performanceNow() {
    throw new Error("ClockPort.performanceNow() must be implemented");
  }

  /**
   * Creates a timer that measures elapsed time between start and end.
   *
   * @returns {Promise<Object>} A promise resolving to a timer object with start() and end() methods.
   * @abstract
   */
  async createTimer() {
    throw new Error("ClockPort.createTimer() must be implemented");
  }

  /**
   * Formats a timestamp into a human-readable string.
   *
   * @param {number} timestamp - The timestamp to format (milliseconds since Unix epoch).
   * @param {Object} [options] - Optional formatting options.
   * @param {string} [options.format='ISO'] - The format type ('ISO', 'local', 'UTC').
   * @param {string} [options.locale] - The locale for formatting.
   * @returns {Promise<string>} A promise resolving to the formatted timestamp.
   * @abstract
   */
  async formatTimestamp(timestamp, options = { format: 'ISO' }) {
    throw new Error("ClockPort.formatTimestamp() must be implemented");
  }

  /**
   * Calculates the duration between two timestamps.
   *
   * @param {number} startTimestamp - The start timestamp in milliseconds.
   * @param {number} endTimestamp - The end timestamp in milliseconds.
   * @returns {Promise<Object>} A promise resolving to duration information.
   * @abstract
   */
  async calculateDuration(startTimestamp, endTimestamp) {
    throw new Error("ClockPort.calculateDuration() must be implemented");
  }

  /**
   * Delays execution for the specified number of milliseconds.
   * Primarily used for testing and controlled timing operations.
   *
   * @param {number} milliseconds - The number of milliseconds to delay.
   * @returns {Promise<void>} A promise that resolves after the delay.
   * @abstract
   */
  async delay(milliseconds) {
    throw new Error("ClockPort.delay() must be implemented");
  }

  /**
   * Sets a timeout that executes a callback after the specified delay.
   *
   * @param {Function} callback - The callback function to execute.
   * @param {number} milliseconds - The delay in milliseconds.
   * @returns {Promise<Object>} A promise resolving to a timeout object that can be cancelled.
   * @abstract
   */
  async setTimeout(callback, milliseconds) {
    throw new Error("ClockPort.setTimeout() must be implemented");
  }

  /**
   * Creates a stopwatch for measuring cumulative time across multiple operations.
   *
   * @returns {Promise<Object>} A promise resolving to a stopwatch object.
   * @abstract
   */
  async createStopwatch() {
    throw new Error("ClockPort.createStopwatch() must be implemented");
  }

  /**
   * Gets the timezone offset from UTC in minutes.
   *
   * @returns {Promise<number>} A promise resolving to the timezone offset.
   * @abstract
   */
  async getTimezoneOffset() {
    throw new Error("ClockPort.getTimezoneOffset() must be implemented");
  }

  /**
   * Validates that timestamps are within acceptable ranges.
   * Used for security audit and data integrity checks.
   *
   * @param {number} timestamp - The timestamp to validate.
   * @param {Object} [options] - Optional validation options.
   * @param {number} [options.minTimestamp] - The minimum acceptable timestamp.
   * @param {number} [options.maxTimestamp] - The maximum acceptable timestamp.
   * @returns {Promise<boolean>} A promise resolving to true if timestamp is valid.
   * @abstract
   */
  async validateTimestamp(timestamp, options = {}) {
    throw new Error("ClockPort.validateTimestamp() must be implemented");
  }
}