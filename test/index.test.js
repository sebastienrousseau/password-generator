/*jshint esversion: 8 */

import { passwordGenerator } from "../bin/password-generator.js"
import * as chai from "chai";
let expect = chai.expect;
let assert = chai.assert;


// mocha() test
describe("Running mocha () ", function () {
  it("should run mocha", function () {
    expect(true);
  });
});

// Initialization test
describe("Running Initialization tests \n", function() {
  it('should asserts passwordGenerator is truthy', function () {
    expect(passwordGenerator).to.be.ok;
    expect(passwordGenerator).to.exist;
  });
});

// passwordGenerator() test
describe("passwordGenerator() test", function() {
    it("should be a promise", function () {
      expect(Promise.resolve()).to.be.a("promise");
    });
});
