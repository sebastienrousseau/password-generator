/*jshint esversion: 8 */
export function toTitleCase(str) {
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
}
