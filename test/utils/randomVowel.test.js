import { randomVowel } from "../../src/utils/randomVowel.js";
import { expect } from 'chai';

// Mock the randomNumber function for testing
const mockRandomNumber = (max) => Math.floor(Math.random() * max);

// Replace the randomNumber function with the mock version
const originalRandomNumber = global.randomNumber;
global.randomNumber = mockRandomNumber;

// Test the randomVowel() function
describe("Running randomVowel", () => {
  it('should be a defined function', () => {
    expect(randomVowel).to.be.a('function');
  });

  it('should return a single vowel character', () => {
    const vowel = randomVowel();
    expect(vowel).to.be.a('string');
    expect(vowel).to.match(/[aeiou]/);
  });

  it('should return a random vowel character', () => {
    // Mock the random number to always return 0 (the first vowel)
    global.randomNumber = () => 0;
    expect(randomVowel()).to.equal('a');

    // Mock the random number to always return 4 (the last vowel)
    global.randomNumber = () => 4;
    expect(randomVowel()).to.equal('u');
  });
});

// Restore the original randomNumber function
global.randomNumber = originalRandomNumber;
