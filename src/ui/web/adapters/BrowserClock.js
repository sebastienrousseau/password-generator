// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Browser implementation of ClockPort using browser timing APIs.
 *
 * This adapter provides time-related functionality for browser environments
 * using Date and Performance APIs.
 */

import { ClockPort } from "../../../../packages/core/src/ports/ClockPort.js";

/**
 * Browser-based clock adapter.
 * Implements ClockPort for browser environments.
 */
export class BrowserClock extends ClockPort {
  /**
   * Returns the current timestamp in milliseconds since epoch.
   *
   * @returns {number} Current timestamp in milliseconds.
   */
  now() {
    return Date.now();
  }

  /**
   * Returns a high-resolution timestamp for performance measurement.
   *
   * @returns {number} High-resolution timestamp in milliseconds.
   */
  performanceNow() {
    if (typeof performance !== "undefined" && performance.now) {
      return performance.now();
    }
    // Fallback to Date.now() if Performance API not available
    return Date.now();
  }

  /**
   * Returns the current date/time as an ISO 8601 string.
   *
   * @returns {string} ISO 8601 formatted date string.
   */
  toISOString() {
    return new Date().toISOString();
  }

  /**
   * Measures the execution time of an async function.
   *
   * @param {Function} asyncFn - Async function to measure.
   * @returns {Promise<{result: *, elapsed: number}>} Result and elapsed time in ms.
   */
  async measure(asyncFn) {
    const start = this.performanceNow();
    const result = await asyncFn();
    const elapsed = this.performanceNow() - start;
    return { result, elapsed };
  }

  /**
   * Creates a delay for the specified duration.
   *
   * @param {number} ms - Duration in milliseconds.
   * @returns {Promise<void>} Promise that resolves after delay.
   */
  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
