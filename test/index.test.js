import { exec } from 'child_process';
import { expect, assert } from 'chai';

// mocha() test
describe('Running mocha () ', function () {
  it('should run mocha', function () {
    expect(true).to.be.true;
  });
});

describe('PasswordGenerator Entry Point', () => {
  it('should run without errors', (done) => {
    exec('node index.js', (error, stdout, stderr) => {
      expect(error).to.be.null;
      expect(stderr).to.equal('');
      done();
    });
  });
});
