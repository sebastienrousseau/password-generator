/*jshint esversion: 8 */

/**
 * Converts all the alphabetic characters in a string to camel case.
 * @param {String} str The text to be converted to camel case.
 */
export const toCamelCase = (str) => {
  const s =
    str &&
    str
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )
      .map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
      .join('');
  return s.slice(0, 1).toLowerCase() + s.slice(1);
};
