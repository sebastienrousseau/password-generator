/*jshint esversion: 8 */
import { toTitleCase } from "../../utils/toTitleCase.js";
import * as chai from "chai";
let expect = chai.expect;

let toTitleCaseArray = [
  "password Generator",
  "password generator",
  "Password Generator",
  "PASSWORD GENERATOR",
  "Password Generator",
];

// mocha() test
describe("Running mocha () ", function () {
  it("should run mocha", function () {
    expect(true);
  });
});

// toTitleCase() test
describe("Running toTitleCase (string) \n", function () {
  it("should return a string", function () {
    let str = "Password";
    expect(toTitleCase(str)).to.be.a("string");
  });

  it("should convert all the alphabetic characters in a string to title case.", function () {
    for (let i = 0; i < toTitleCaseArray.length; i++) {
      //console.log(`  →  Test #${[i]} where string = "${toTitleCaseArray[i]}"\n`);
      expect(toTitleCase(toTitleCaseArray[i])).equal("Password Generator");
    }
  });
});
