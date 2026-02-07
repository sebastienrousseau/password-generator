// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Port interface for time-related operations.
 *
 * This port abstracts time functionality to enable testing with fixed timestamps
 * and different time sources (system clock, NTP, mock, etc.).
 *
 * @interface ClockPort
 */
export class ClockPort {
  /**
   * Gets the current timestamp in milliseconds since Unix epoch.
   *
   * @returns {number} Unix timestamp in milliseconds.
   * @abstract
   */
  now() {
    throw new Error("ClockPort.now() must be implemented");
  }

  /**
   * Gets a high-resolution timestamp for performance measurement.
   *
   * @returns {number} High-resolution timestamp in milliseconds.
   * @abstract
   */
  performanceNow() {
    throw new Error("ClockPort.performanceNow() must be implemented");
  }

  /**
   * Gets the current date as an ISO 8601 string.
   *
   * @returns {string} ISO 8601 formatted date string.
   * @abstract
   */
  toISOString() {
    throw new Error("ClockPort.toISOString() must be implemented");
  }
}

/**
 * Required methods for ClockPort implementations.
 */
export const CLOCK_REQUIRED_METHODS = ["now", "performanceNow"];

/**
 * Optional methods for ClockPort implementations.
 */
export const CLOCK_OPTIONAL_METHODS = ["toISOString"];

/**
 * Fixed clock implementation for testing.
 */
export class FixedClock extends ClockPort {
  constructor(timestamp = Date.now()) {
    super();
    this.timestamp = timestamp;
    this.performanceStart = 0;
  }

  now() {
    return this.timestamp;
  }

  performanceNow() {
    return this.performanceStart;
  }

  toISOString() {
    return new Date(this.timestamp).toISOString();
  }

  setTimestamp(timestamp) {
    this.timestamp = timestamp;
  }

  advance(milliseconds) {
    this.timestamp += milliseconds;
    this.performanceStart += milliseconds;
  }
}
