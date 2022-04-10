/*jshint esversion: 8 */
import { titleCase } from "../lib/title-case.js";
import * as chai from 'chai';
let assert = chai.assert;
let should = chai.should();
let expect = chai.expect;

// Begin a test for titleCase()
describe('#titleCase(string)', () => {

  context('with string argument', () => {
    it('receives one argument and returns it in title case', function () {
      titleCase('hello world', function (str) {
        expect(str)
          .to.be.a('string')
          .that.matches(/^[a-f0-9]{32}$/)
          .and.equal("Hello world");
      });
    });
  });
});
