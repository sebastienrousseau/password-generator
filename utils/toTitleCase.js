/*jshint esversion: 8 */

/**
 * Converts all the alphabetic characters in a string to title case.
 * @param {String} str The text to be converted to title case.
 */
export const toTitleCase = (str) =>
  str
    .toLowerCase()
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+|\b)|[A-Z]?[a-z]+|[A-Z]|\d+/g)
    .map(x => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" ");

// console.log(toTitleCase("passwordGenerator"));      // ✔ should convert a camel case string to title case
// console.log(toTitleCase("password.generator"));     // ✔ should convert a dot case string to title case
// console.log(toTitleCase("--PASSWORD-GENERATOR--")); // ✔ should convert a junk case string to title case
// console.log(toTitleCase("password-generator"));     // ✔ should convert a kebab case string to title case
// console.log(toTitleCase("PasswordGenerator"));      // ✔ should convert a pascal case string to title case
// console.log(toTitleCase("Password generator"));     // ✔ should convert a sentence case string to title case
// console.log(toTitleCase("password_generator"));     // ✔ should convert a snake case string to title case
// console.log(toTitleCase("password generator"));     // ✔ should convert a space case string to title case
// console.log(toTitleCase("Password Generator"));     // ✔ should convert a title case string to title case
// console.log(toTitleCase("PASSWORD GENERATOR"));     // ✔ should convert a uppercase case string to title case
