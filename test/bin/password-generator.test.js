import { PasswordGenerator } from '../../src/bin/password-generator.js';
import { expect } from 'chai';

describe('PasswordGenerator', function () {
  it('should be a function', function () {
    expect(PasswordGenerator).to.be.a('function');
  });
});
