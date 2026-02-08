import { toCamelCase } from '../../src/utils/strings.js';
import { assert, expect } from 'chai';

const strings = {
  dot: 'password.generator',
  junk: '--PASSWORD-GENERATOR--',
  kebab: 'password-generator',
  sentence: 'Password generator',
  snake: 'password_generator',
  space: 'password generator',
  title: 'Password Generator',
  uppercase: 'PASSWORD GENERATOR',
};

const expectedResults = {
  dot: 'passwordGenerator',
  junk: 'passwordGenerator',
  kebab: 'passwordGenerator',
  sentence: 'passwordGenerator',
  snake: 'passwordGenerator',
  space: 'passwordGenerator',
  title: 'passwordGenerator',
  uppercase: 'passwordGenerator',
};

// Run the tests
describe('Running toCamelCase() function', function () {
  for (let key in strings) {
    it(`should convert a ${key} case string to camelCase`, function () {
      assert.equal(toCamelCase(strings[key]), expectedResults[key]);
    });
  }

  it('should handle an empty string', function () {
    assert.equal(toCamelCase(''), '');
  });

  it('should handle a single word string', function () {
    assert.equal(toCamelCase('singleword'), 'singleword');
  });

  it('should throw a TypeError for non-string input', function () {
    expect(() => toCamelCase(123)).to.throw(TypeError, 'Input must be a string');
  });
});
