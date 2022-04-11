/*jshint esversion: 8 */

/**
 * Converts all the alphabetic characters in a string to snake case.
 * @param {String} str The text to be converted to snake case.
 */
export function toSnakeCase(str) {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join('_');
}
