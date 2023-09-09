import { randomSyllable } from "../../src/utils/randomSyllable.js";
import { expect } from 'chai';

// Mock the randomConsonant and randomVowel functions for testing
const mockRandomConsonant = () => 'c'; // Mock consonant to always return 'c'
const mockRandomVowel = () => 'a'; // Mock vowel to always return 'a'

// Replace the randomConsonant and randomVowel functions with the mock versions
const originalRandomConsonant = global.randomConsonant;
const originalRandomVowel = global.randomVowel;

global.randomConsonant = mockRandomConsonant;
global.randomVowel = mockRandomVowel;

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

  it('should return a specific syllable based on mocked functions', () => {
    expect(randomSyllable()).to.equal('cac'); // Mocked to always return 'c' and 'a'
  });
});

// Restore the original randomConsonant and randomVowel functions
global.randomConsonant = originalRandomConsonant;
global.randomVowel = originalRandomVowel;
