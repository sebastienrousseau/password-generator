import { randomConsonant } from "../../src/utils/randomConsonant.js";
import { expect } from 'chai';

// Mock the randomNumber function for testing
const mockRandomNumber = (max) => Math.floor(Math.random() * max);

// Replace the randomNumber function with the mock version
const originalRandomNumber = global.randomNumber;
global.randomNumber = mockRandomNumber;

describe("randomConsonant()", () => {
  it('should be a defined function', () => {
    expect(randomConsonant).to.be.a('function');
  });

  it('should return a single consonant character', () => {
    const consonant = randomConsonant();
    expect(consonant).to.be.a('string');
    expect(consonant).to.match(/[bcdfhgjklmnpqrstvwxyz]/);
  });

});

// Restore the original randomNumber function
global.randomNumber = originalRandomNumber;
