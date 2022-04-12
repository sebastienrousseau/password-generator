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
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+|[A-Z]|\d+/g
      )
      .map((x) => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
      .join("");
  return s.slice(0, 1).toLowerCase() + s.slice(1);
};

// console.log(toCamelCase("passwordGenerator")); //
// console.log(toCamelCase("password.generator"));
// console.log(toCamelCase("--PASSWORD-GENERATOR--"));
// console.log(toCamelCase("password-generator"));
// console.log(toCamelCase("PasswordGenerator"));
// console.log(toCamelCase("Password generator"));
// console.log(toCamelCase("password_generator"));
// console.log(toCamelCase("password generator"));
// console.log(toCamelCase("Password Generator"));
// console.log(toCamelCase("PASSWORD GENERATOR"));
