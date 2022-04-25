/**
 * Converts all the alphabetic characters in a string to camel case.
 * @param {String} str The text to be converted to camel case.
 */
export const toCamelCase = (str) => {
  // Any of ((literally "/", uppercase, at least 2 times), (uppercase, optional, letter, once or more, literally "/g"))
  const r = /[A-Z]{2,}|[A-Z]?[a-z]+/g;
  const s =
    str &&
    str
      .match(r)
      .map((x) => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
      .join("");
  return s.slice(0, 1).toLowerCase() + s.slice(1);
};

// console.log(toCamelCase("passwordGenerator"));      // ✔ should convert a camel case string to camelcase
// console.log(toCamelCase("password.generator"));     // ✔ should convert a dot case string to camelcase
// console.log(toCamelCase("--PASSWORD-GENERATOR--")); // ✔ should convert a junk case string to camelcase
// console.log(toCamelCase("password-generator"));     // ✔ should convert a kebab case string to camelcase
// console.log(toCamelCase("PasswordGenerator"));      // ✔ should convert a pascal case string to camelcase
// console.log(toCamelCase("Password generator"));     // ✔ should convert a sentence case string to camelcase
// console.log(toCamelCase("password_generator"));     // ✔ should convert a snake case string to camelcase
// console.log(toCamelCase("password generator"));     // ✔ should convert a space case string to camelcase
// console.log(toCamelCase("Password Generator"));     // ✔ should convert a title case string to camelcase
// console.log(toCamelCase("PASSWORD GENERATOR"));     // ✔ should convert a uppercase case string to camelcase
