import { randomInt } from "crypto";

/**
 * Generates a cryptographically secure random integer within a specified range.
 *
 * @param {number} max - The upper bound (exclusive) for the random number.
 * @param {number} min - The lower bound (inclusive) for the random number (optional).
 * @returns {number} A cryptographically secure random integer in [min, max).
 */
export function randomNumber(max, min = 0) {
  if (max === min) {
    return min;
  }
  return randomInt(min, max);
}
