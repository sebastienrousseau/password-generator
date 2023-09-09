/**
 * Generates a random integer within a specified range.
 *
 * @param {number} max - The upper bound (exclusive) for the random number.
 * @param {number} min - The lower bound (inclusive) for the random number (optional).
 * @returns {number} A random integer within the specified range.
 */
export function randomNumber(max, min = 0) {
  /**
   * Math.random() generates a random floating-point number in the range [0, 1),
   * so we multiply it by (max - min) to expand the range.
   * We then add min to shift the range to [min, max).
   * Finally, we use Math.floor() to ensure the result is an integer.
   */
  return Math.floor(Math.random() * (max - min)) + min;
}
