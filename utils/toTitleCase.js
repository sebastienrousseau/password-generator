/*jshint esversion: 8 */

/**
 * Converts all the alphabetic characters in a string to title case.
 * @param {String} str The text to be converted to title case.
 */
export function toTitleCase(str) {
  return str.charAt(0).toUpperCase() + str.replace(1).toLowerCase();
}
