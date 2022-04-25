/**
 * Converts a string to an array of characters.
 * @param {String} str The text to be converted to an array of characters.
 */
export const toCharArray = (str) => [...str];

// console.log(toCharArray("passwordGenerator"));      // ✔ should convert a camel case string to an array of characters
// console.log(toCharArray("password.generator"));     // ✔ should convert a dot case string to an array of characters
// console.log(toCharArray("--PASSWORD-GENERATOR--")); // ✔ should convert a junk case string to an array of characters
// console.log(toCharArray("password-generator"));     // ✔ should convert a kebab case string to an array of characters
// console.log(toCharArray("PasswordGenerator"));      // ✔ should convert a pascal case string to an array of characters
// console.log(toCharArray("Password generator"));     // ✔ should convert a sentence case string to an array of characters
// console.log(toCharArray("password_generator"));     // ✔ should convert a snake case string to an array of characters
// console.log(toCharArray("password generator"));     // ✔ should convert a space case string to an array of characters
// console.log(toCharArray("Password Generator"));     // ✔ should convert a title case string to an array of characters
// console.log(toCharArray("PASSWORD GENERATOR"));     // ✔ should convert a uppercase case string to an array of characters
