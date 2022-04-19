/*jshint esversion: 8 */

/**
 * Converts all the alphabetic characters in a snake case string.
 * @param {String} str The text to be converted to snake case.
 */
export const toSnakeCase = (str) =>
  str
    .replace(/^[^A-Za-z\d]*|[^A-Za-z\d]*$/g, "")
    .replace(/([a-z])([A-Z])/g, (_, a, b) => a + "_" + b.toLowerCase())
    .replace(/[^A-Za-z\d]+/g, "_")
    .toLowerCase();

// console.log(toSnakeCase("passwordGenerator"));      // ✔ should convert a camel case string to snake case
// console.log(toSnakeCase("password.generator"));     // ✔ should convert a dot case string to snake case
// console.log(toSnakeCase("--PASSWORD-GENERATOR--")); // ✔ should convert a junk case string to snake case
// console.log(toSnakeCase("password-generator"));     // ✔ should convert a kebab case string to snake case
// console.log(toSnakeCase("PasswordGenerator"));      // ✔ should convert a pascal case string to snake case
// console.log(toSnakeCase("Password generator"));     // ✔ should convert a sentence case string to snake case
// console.log(toSnakeCase("password_generator"));     // ✔ should convert a snake case string to snake case
// console.log(toSnakeCase("password generator"));     // ✔ should convert a space case string to snake case
// console.log(toSnakeCase("Password Generator"));     // ✔ should convert a title case string to snake case
// console.log(toSnakeCase("PASSWORD GENERATOR"));     // ✔ should convert a uppercase case string to snake case
