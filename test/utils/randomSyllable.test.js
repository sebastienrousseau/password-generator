import { randomSyllable } from "../../src/utils/randomSyllable.js";
import { expect } from 'chai';

// Mock the randomConsonant and randomVowel functions for testing
const mockRandomConsonant = () => 'c'; // Mock consonant to always return 'c'
const mockRandomVowel = () => 'a'; // Mock vowel to always return 'a'

// Replace the randomConsonant and randomVowel functions with the mock versions
let originalRandomConsonant, originalRandomVowel;

beforeEach(() => {
  originalRandomConsonant = global.randomConsonant;
  originalRandomVowel = global.randomVowel;
  global.randomConsonant = mockRandomConsonant;
  global.randomVowel = mockRandomVowel;
});

afterEach(() => {
  global.randomConsonant = originalRandomConsonant;
  global.randomVowel = originalRandomVowel;
});

// Test the randomSyllable() function
describe("Running randomSyllable", () => {
  it('should be a defined function', () => {
    expect(randomSyllable).to.be.a('function');
  });

  it('should return a string containing a consonant, vowel, and consonant', () => {
    const syllable = randomSyllable();
    expect(syllable).to.be.a('string');
    expect(syllable).to.match(/^[bcdfhgjklmnpqrstvwxyz][aeiou][bcdfhgjklmnpqrstvwxyz]$/);
  });

});
