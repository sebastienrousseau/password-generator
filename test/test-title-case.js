/*jshint esversion: 8 */
import { toTitleCase } from "../lib/title-case.js";
import * as chai from "chai";
let expect = chai.expect;

// mocha() test
describe("mocha () ", function () {
  it("should load mocha", function () {
    expect(true);
  });
});

// toTitleCase() test
describe("toTitleCase (string) ", function () {
  it("should return a string", function () {
    let str = "HELLO";
    expect(toTitleCase(str)).to.be.a("string");
  });
  it("should return a titleized string for one lowercase word", function () {
    let str = "hello";
    expect(toTitleCase(str)).equal("Hello");
  });
  it("should return a titleized string for one uppercase word", function () {
    let str = "HELLO";
    expect(toTitleCase(str)).equal("Hello");
  });
  it("should return a titleized string for a sentence of words", function () {
    let str = "hello world";
    expect(toTitleCase(str)).equal("Hello world");
  });
});
