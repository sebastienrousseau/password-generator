import { toCamelCase } from "../../src/utils/toCamelCase/toCamelCase.js";

global.strings = {
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

// toCamelCase() tests
describe("Running toCamelCase () function \n", function () {
  for (let key in strings) test(key);
});

/**
 * Create a test for a given case `key`.
 *
 * @param {String} key
 */

function test(key) {
  it("should convert a " + key + " case string to camelcase", function () {
    assert.equal(toCamelCase(strings[key]), "passwordGenerator");
  });
}
