// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { randomConsonant } from '../../src/utils/randomConsonant.js';
import { CONSONANTS } from '../../src/constants.js';

describe('randomConsonant', () => {
  it('should be a defined function', () => {
    expect(randomConsonant).to.be.a('function');
  });

  it('should return a single character', () => {
    const consonant = randomConsonant();
    expect(consonant).to.be.a('string');
    expect(consonant).to.have.lengthOf(1);
  });

  it('should return a character that exists in CONSONANTS array', () => {
    const consonant = randomConsonant();
    expect(CONSONANTS).to.include(consonant);
  });

  it('should return different consonants over multiple calls (probabilistic)', () => {
    const results = new Set();
    for (let i = 0; i < 50; i++) {
      results.add(randomConsonant());
    }
    // Should get some variety in 50 calls (expect at least 3 different consonants)
    expect(results.size).to.be.at.least(3);
  });

  it('should never return vowels', () => {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    for (let i = 0; i < 20; i++) {
      const consonant = randomConsonant();
      expect(vowels).to.not.include(consonant);
    }
  });

  it('should only return lowercase letters', () => {
    for (let i = 0; i < 10; i++) {
      const consonant = randomConsonant();
      expect(consonant).to.match(/^[a-z]$/);
    }
  });
});
