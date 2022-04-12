/*jshint esversion: 8 */

/**
 * Converts all the alphabetic characters in a string to camel case.
 * @param {String} str The text to be converted to camel case.
 */
export function toCamelCase(str) {
  return (str.slice(0, 1).toLowerCase() + str.slice(1))
    .replace(/([-_ ]){1,}/g, ' ')
    .split(/[-_ ]/)
    .reduce((cur, acc) => {
      return cur + acc[0].toUpperCase() + acc.substring(1);
    });
}
