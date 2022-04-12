/*jshint esversion: 8 */

/**
 * Converts all the alphabetic characters in a string to kebab case.
 * @param {String} str The text to be converted to kebab case.
 */
export const toKebabCase = (str) =>
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|\d+/g)
    .map(x => x.toLowerCase())
    .join("-");

// console.log(toKebabCase("passwordGenerator"));      // ✔ should convert a camel case string to kebab case
// console.log(toKebabCase("password.generator"));     // ✔ should convert a dot case string to kebab case
// console.log(toKebabCase("--PASSWORD-GENERATOR--")); // ✔ should convert a junk case string to kebab case
// console.log(toKebabCase("password-generator"));     // ✔ should convert a kebab case string to kebab case
// console.log(toKebabCase("PasswordGenerator"));      // ✔ should convert a pascal case string to kebab case
// console.log(toKebabCase("Password generator"));     // ✔ should convert a sentence case string to kebab case
// console.log(toKebabCase("password_generator"));     // ✔ should convert a snake case string to kebab case
// console.log(toKebabCase("password generator"));     // ✔ should convert a space case string to kebab case
// console.log(toKebabCase("Password Generator"));     // ✔ should convert a title case string to kebab case
// console.log(toKebabCase("PASSWORD GENERATOR"));     // ✔ should convert a uppercase case string to kebab case
