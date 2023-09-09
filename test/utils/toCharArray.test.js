import { toCharArray } from "../../src/utils/toCharArray/toCharArray.js";
import { assert } from 'chai';

const strings = {
  camel: "passwordGenerator",
  dot: "password.generator",
  junk: "--PASSWORD-GENERATOR--",
  kebab: "password-generator",
  pascal: "PasswordGenerator",
  sentence: "Password generator",
  snake: "password_generator",
  space: "password generator",
  title: "Password Generator",
  uppercase: "PASSWORD GENERATOR",
};

// Test type of toCharArray() function
describe("Running test type of toCharArray() function", function () {
  for (let key in strings) testArray(key);
});

/**
 * Create a testArray for a given case `key`.
 *
 * @param {String} key
 */
function testArray(key) {
  it(`should validate that the conversion of a ${key} case string should be of type array`, function () {
    assert.typeOf(toCharArray(strings[key]), 'array');
  });
}

// toCharArray() test function
describe("Running toCharArray() function", function () {
  for (let key in strings) testFunction(key);
});

/**
 * Create a testFunction for a given case `key`.
 *
 * @param {String} key
 */
function testFunction(key) {
  it(`should validate that the conversion of a ${key} case string should be an array of characters`, function () {
    const expectedResults = {
      camel: ['p', 'a', 's', 's', 'w', 'o', 'r', 'd', 'G', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'],
      dot: ['p', 'a', 's', 's', 'w', 'o', 'r', 'd', '.', 'g', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'],
      junk: ['-', '-', 'P', 'A', 'S', 'S', 'W', 'O', 'R', 'D', '-', 'G', 'E', 'N', 'E', 'R', 'A', 'T', 'O', 'R', '-', '-'],
      kebab: ['p', 'a', 's', 's', 'w', 'o', 'r', 'd', '-', 'g', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'],
      pascal: ['P', 'a', 's', 's', 'w', 'o', 'r', 'd', 'G', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'],
      sentence: ['P', 'a', 's', 's', 'w', 'o', 'r', 'd', ' ', 'g', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'],
      snake: ['p', 'a', 's', 's', 'w', 'o', 'r', 'd', '_', 'g', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'],
      space: ['p', 'a', 's', 's', 'w', 'o', 'r', 'd', ' ', 'g', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'],
      title: ['P', 'a', 's', 's', 'w', 'o', 'r', 'd', ' ', 'G', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'],
      uppercase: ['P', 'A', 'S', 'S', 'W', 'O', 'R', 'D', ' ', 'G', 'E', 'N', 'E', 'R', 'A', 'T', 'O', 'R'],
    };

    assert.deepEqual(toCharArray(strings[key]), expectedResults[key]);
  });
}
