/*jshint esversion: 8 */

/**
 * Converts all the alphabetic characters in a string to camel case.
 * @param {String} str The text to be converted to camel case.
 */
export function toCamelCase(str) {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
    .join('');
}

console.log(toCamelCase('some_database_field_name')); // 'someDatabaseFieldName'
console.log(toCamelCase('Some label that needs to be camelized')); // 'someLabelThatNeedsToBeCamelized'
console.log(toCamelCase('some-javascript-property')); // 'someJavascriptProperty'
console.log(toCamelCase('some-mixed_string with spaces_underscores-and-hyphens')); // 'someMixedStringWithSpacesUnderscoresAndHyphens'
