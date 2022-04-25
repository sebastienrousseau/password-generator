import { toSnakeCase } from "../../src/utils/toSnakeCase/toSnakeCase.js";
import * as chai from "chai";

let snakeCaseArray = [
  "passwordGenerator",
  "password-generator",
  "PasswordGenerator",
  "PASSWORD_GENERATOR",
  "password_generator",
  "password_generator",
  "password generator",
  "Password Generator",
  "password.generator",
  "--PASSWORD-GENERATOR--",
];

// toSnakeCase() tests
describe("Running toSnakeCase (string) \n", function () {
  it("should return a string \n", function () {
    let str = "Password Generator";
    expect(toSnakeCase(str)).to.be.a("string");
  });
  it("should convert all the alphabetic characters in a snake case string.", function () {
    for (let i = 0; i < snakeCaseArray.length; i++) {
      // console.log(`  →  Test #${[i]} where string = "${snakeCaseArray[i]}"\n`);
      expect(toSnakeCase(snakeCaseArray[i])).equal("password_generator");
    }
  });
});
