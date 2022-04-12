/*jshint esversion: 8 */

/**
 * Converts all the alphabetic characters in a snake case string.
 * @param {String} str The text to be converted to snake case.
 */
export const toSnakeCase = (str) => str

  .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, "")
  .replace(/([a-z])([A-Z])/g, (_, a, b) => a + "_" + b.toLowerCase())
  .replace(/[^A-Za-z0-9]+|_+/g, "_")
  .toLowerCase();
