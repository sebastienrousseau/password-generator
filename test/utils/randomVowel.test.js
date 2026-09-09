// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { randomVowel } from '../../src/utils/randomVowel.js';
import { VOWELS } from '../../src/constants.js';

describe('randomVowel', () => {
  it('should be a defined function', () => {
    expect(randomVowel).to.be.a('function');
  });

  it('should return a single character', () => {
    const vowel = randomVowel();
    expect(vowel).to.be.a('string');
    expect(vowel).to.have.lengthOf(1);
  });

  it('should return a character that exists in VOWELS array', () => {
    const vowel = randomVowel();
    expect(VOWELS).to.include(vowel);
  });

  it('should return different vowels over multiple calls (probabilistic)', () => {
    const results = new Set();
    for (let i = 0; i < 25; i++) {
      results.add(randomVowel());
    }
    // Should get some variety in 25 calls (expect at least 3 different vowels)
    expect(results.size).to.be.at.least(3);
  });

  it('should never return consonants', () => {
    const consonants = [
      'b',
      'c',
      'd',
      'f',
      'g',
      'h',
      'j',
      'k',
      'l',
      'm',
      'n',
      'p',
      'q',
      'r',
      's',
      't',
      'v',
      'w',
      'x',
      'y',
      'z',
    ];
    for (let i = 0; i < 10; i++) {
      const vowel = randomVowel();
      expect(consonants).to.not.include(vowel);
    }
  });

  it('should only return lowercase letters', () => {
    for (let i = 0; i < 10; i++) {
      const vowel = randomVowel();
      expect(vowel).to.match(/^[a-z]$/);
    }
  });
});
