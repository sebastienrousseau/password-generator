import { randomVowel } from "../../src/utils/randomVowel.js";
import { expect } from 'chai';

// Mock the randomNumber function for testing
const mockRandomNumber = (max) => Math.floor(Math.random() * max);

// Store the original randomNumber function to restore it later
const originalRandomNumber = global.randomNumber;

// Replace the randomNumber function with the mock version
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
});

// Restore the original randomNumber function after the tests
global.randomNumber = originalRandomNumber;
