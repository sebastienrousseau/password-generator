import { toKebabCase } from '../../src/utils/strings.js';
import { expect } from 'chai';

let strings = [
  'passwordGenerator',
  'password-generator',
  'PasswordGenerator',
  'PASSWORD_GENERATOR',
  'password_generator',
  'password_generator',
  'password generator',
  'Password Generator',
  'password.generator',
  '--PASSWORD-GENERATOR--',
];

// toKebabCase() tests
describe('Running toKebabCase (string)', function () {
  it('should return a string', function () {
    let str = 'Password Generator';
    expect(toKebabCase(str)).to.be.a('string');
  });

  it('should convert all the alphabetic characters in a kebab case string', function () {
    for (let i = 0; i < strings.length; i++) {
      expect(toKebabCase(strings[i])).to.equal('password-generator');
    }
  });
});
