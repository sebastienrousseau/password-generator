/*jshint esversion: 8 */
import { titleCase } from "../lib/title-case.js";
import * as chai from "chai";
let expect = chai.expect;
describe("Mocha test", function(){
  it("should load mocha", function(){
    expect(true);
  });
});

// titleCase() test
describe("titleCase(string)", function () {
   it("should return a string", function(){
    let str = "HELLO";
    expect(titleCase(str)).to.be.a("string");
   });

  it("should return a titleized string for one lowercase word", function () {
    let str = "hello";
    expect(titleCase(str)).equal("Hello");
  });

  it("should return a titleized string for one uppercase word", function () {
    let str = "HELLO";
    expect(titleCase(str)).equal("Hello");
  });

  it("should return a titleized string for a sentence of words", function () {
    let str = "hello world";
    expect(titleCase(str)).equal("Hello world");
  });
});
