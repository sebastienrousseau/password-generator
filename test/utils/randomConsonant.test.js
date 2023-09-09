import { randomConsonant } from "../../src/utils/randomConsonant.js";
import { expect } from 'chai';

// Mock the randomNumber function for testing
const mockRandomNumber = (max) => Math.floor(Math.random() * max);

// Replace the randomNumber function with the mock version
const originalRandomNumber = global.randomNumber;
global.randomNumber = mockRandomNumber;

// Test the randomConsonant() function
describe("Running randomConsonant", () => {
  it('should be a defined function', () => {
    expect(randomConsonant).to.be.a('function');
  });

  it('should return a single consonant character', () => {
    const consonant = randomConsonant();
    expect(consonant).to.be.a('string');
    expect(consonant).to.match(/[bcdfhgjklmnpqrstvwxyz]/);
  });

  it('should return a random consonant character', () => {
    // Mock the random number to always return 0 (the first consonant)
    global.randomNumber = () => 0;
    expect(randomConsonant()).to.equal('b');

    // Mock the random number to always return 9 (the tenth consonant)
    global.randomNumber = () => 9;
    expect(randomConsonant()).to.equal('k');
  });
});

// Restore the original randomNumber function
global.randomNumber = originalRandomNumber;
