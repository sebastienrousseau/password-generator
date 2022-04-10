/*jshint esversion: 8 */
import { titleCase } from "../lib/title-case.js";
import * as chai from "chai";
let expect = chai.expect;

// Begin a test for titleCase()

describe("titleCase(string)", function () {
  it("receives one argument and returns it in title case", function () {
    expect(titleCase("HELLO")).equal("Hello");
  });
});
