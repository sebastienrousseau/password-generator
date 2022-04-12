/*jshint esversion: 8 */

/**
 * Converts all the alphabetic characters in a string to title case.
 * @param {String} str The text to be converted to title case.
 */
export const toTitleCase = (str) => str

  .toLowerCase()
  .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
  .map(x => x.charAt(0).toUpperCase() + x.slice(1))
  .join(" ");
