// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Node.js System Clock adapter.
 *
 * This adapter provides time-related functionality using Node.js built-ins.
 *
 * @module NodeSystemClock
 */

import { performance } from "perf_hooks";
import { ClockPort } from "../../core/ports/ClockPort.js";

/**
 * Node.js implementation of ClockPort.
 */
export class NodeSystemClock extends ClockPort {
  /**
   * Gets the current timestamp in milliseconds since Unix epoch.
   *
   * @returns {number} Unix timestamp in milliseconds.
   */
  now() {
    return Date.now();
  }

  /**
   * Gets a high-resolution timestamp for performance measurement.
   *
   * @returns {number} High-resolution timestamp in milliseconds.
   */
  performanceNow() {
    return performance.now();
  }

  /**
   * Gets the current date as an ISO 8601 string.
   *
   * @returns {string} ISO 8601 formatted date string.
   */
  toISOString() {
    return new Date().toISOString();
  }

  /**
   * Gets the current date as a locale-specific string.
   *
   * @param {string} locale - The locale to use.
   * @param {Object} options - Intl.DateTimeFormat options.
   * @returns {string} Locale-formatted date string.
   */
  toLocaleString(locale = "en-US", options = {}) {
    return new Date().toLocaleString(locale, options);
  }

  /**
   * Creates a Date object from a timestamp.
   *
   * @param {number} timestamp - Unix timestamp in milliseconds.
   * @returns {Date} A Date object.
   */
  fromTimestamp(timestamp) {
    return new Date(timestamp);
  }

  /**
   * Measures the elapsed time of an async operation.
   *
   * @param {Function} asyncFn - The async function to measure.
   * @returns {Promise<{result: any, elapsed: number}>} The result and elapsed time in ms.
   */
  async measure(asyncFn) {
    const start = this.performanceNow();
    const result = await asyncFn();
    const elapsed = this.performanceNow() - start;
    return { result, elapsed };
  }
}

export default NodeSystemClock;
