/**
 * Converts a given string to camel case.
 *
 * Camel case is a naming convention where spaces or other delimiters are removed,
 * and each word (except the first one) starts with a capital letter.
 *
 * @param {string} str - The input string to be converted to camel case.
 * @returns {string} The input string converted to camel case.
 *
 * @throws {TypeError} Throws a TypeError if the input is not a string.
 *
 * @example
 * // Returns "myCamelCaseString"
 * const camelCaseStr = toCamelCase("my camel case string");
 *
 * // Returns "helloWorld"
 * const anotherCamelCaseStr = toCamelCase("Hello, World!");
 */
export const toCamelCase = (str) => {
  if (typeof str !== "string") {
    throw new TypeError("Input must be a string");
  }

  // Define a regular expression to match words (alphanumeric sequences)
  const wordPattern = /[a-zA-Z0-9]+/g;

  // Split the input string into words
  const words = str.match(wordPattern) || [];

  // If there are no words, return an empty string
  if (words.length === 0) {
    return "";
  }

  // Convert the first word to lowercase
  let camelCaseStr = words[0].toLowerCase();

  // Iterate over the remaining words and capitalize their first letter
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    camelCaseStr += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  return camelCaseStr;
};
