import { randomInt } from "crypto";

/**
 * Generates a cryptographically secure random integer within a specified range.
 *
 * @param {number} max - The upper bound (exclusive) for the random number.
 * @param {number} min - The lower bound (inclusive) for the random number (optional, defaults to 0).
 * @returns {number} A cryptographically secure random integer in [min, max).
 * @throws {RangeError} If max <= min (when min is explicitly provided and >= max).
 * @throws {TypeError} If max or min are not numbers.
 */
export function randomNumber(max, min = 0) {
  if (max === min) {
    return min;
  }
  return randomInt(min, max);
}
