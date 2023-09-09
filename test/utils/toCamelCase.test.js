import { toCamelCase } from "../../src/utils/toCamelCase/toCamelCase.js";
import { assert } from 'chai';

const strings = {
  dot: "password.generator",
  junk: "--PASSWORD-GENERATOR--",
  kebab: "password-generator",
  sentence: "Password generator",
  snake: "password_generator",
  space: "password generator",
  title: "Password Generator",
  uppercase: "PASSWORD GENERATOR",
};

// Run the tests
describe("Running toCamelCase() function", function () {
  for (let key in strings) {
    it(`should convert a ${key} case string to camelCase`, function () {
      assert.equal(toCamelCase(strings[key]), expectedResults[key]);
    });
  }
});

const expectedResults = {
  dot: "passwordGenerator",
  junk: "passwordGenerator",
  kebab: "passwordGenerator",
  sentence: "passwordGenerator",
  snake: "passwordGenerator",
  space: "passwordGenerator",
  title: "passwordGenerator",
  uppercase: "passwordGenerator",
};




