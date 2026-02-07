import { toSnakeCase } from '../../src/utils/strings.js';
import { expect } from 'chai';

let snakeCaseArray = [
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

// toSnakeCase() tests
describe('Running toSnakeCase (string)', function () {
  it('should return a string', function () {
    let str = 'Password Generator';
    expect(toSnakeCase(str)).to.be.a('string');
  });

  it('should convert all the alphabetic characters in a snake case string', function () {
    for (let i = 0; i < snakeCaseArray.length; i++) {
      expect(toSnakeCase(snakeCaseArray[i])).to.equal('password_generator');
    }
  });
});
