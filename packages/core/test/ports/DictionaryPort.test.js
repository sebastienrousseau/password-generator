// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import {
  DictionaryPort,
  DICTIONARY_REQUIRED_METHODS,
  MemoryDictionary,
  DEFAULT_WORD_LIST,
} from '../../src/ports/DictionaryPort.js';

describe('Ports: DictionaryPort', () => {
  describe('DictionaryPort base class', () => {
    let port;

    beforeEach(() => {
      port = new DictionaryPort();
    });

    it('should be a class', () => {
      expect(DictionaryPort).to.be.a('function');
      expect(port).to.be.instanceOf(DictionaryPort);
    });

    describe('loadDictionary', () => {
      it('should throw Error indicating method must be implemented', async () => {
        try {
          await port.loadDictionary();
          expect.fail('Should have thrown');
        } catch (e) {
          expect(e.message).to.include('must be implemented');
          expect(e.message).to.include('loadDictionary');
        }
      });
    });

    describe('getWordCount', () => {
      it('should throw Error indicating method must be implemented', async () => {
        try {
          await port.getWordCount();
          expect.fail('Should have thrown');
        } catch (e) {
          expect(e.message).to.include('must be implemented');
          expect(e.message).to.include('getWordCount');
        }
      });
    });

    describe('selectRandomWord', () => {
      it('should throw Error indicating method must be implemented', async () => {
        try {
          await port.selectRandomWord(() => 0);
          expect.fail('Should have thrown');
        } catch (e) {
          expect(e.message).to.include('must be implemented');
          expect(e.message).to.include('selectRandomWord');
        }
      });
    });
  });

  describe('DICTIONARY_REQUIRED_METHODS', () => {
    it('should be an array', () => {
      expect(DICTIONARY_REQUIRED_METHODS).to.be.an('array');
    });

    it('should contain loadDictionary', () => {
      expect(DICTIONARY_REQUIRED_METHODS).to.include('loadDictionary');
    });

    it('should contain getWordCount', () => {
      expect(DICTIONARY_REQUIRED_METHODS).to.include('getWordCount');
    });

    it('should contain selectRandomWord', () => {
      expect(DICTIONARY_REQUIRED_METHODS).to.include('selectRandomWord');
    });

    it('should have exactly 3 required methods', () => {
      expect(DICTIONARY_REQUIRED_METHODS).to.have.lengthOf(3);
    });
  });

  describe('DEFAULT_WORD_LIST', () => {
    it('should be an array', () => {
      expect(DEFAULT_WORD_LIST).to.be.an('array');
    });

    it('should have words', () => {
      expect(DEFAULT_WORD_LIST.length).to.be.greaterThan(0);
    });

    it('should contain lowercase words', () => {
      for (const word of DEFAULT_WORD_LIST) {
        expect(word).to.equal(word.toLowerCase());
      }
    });

    it('should contain only alphabetic characters', () => {
      for (const word of DEFAULT_WORD_LIST) {
        expect(word).to.match(/^[a-z]+$/);
      }
    });

    it('should contain unique words', () => {
      const unique = new Set(DEFAULT_WORD_LIST);
      expect(unique.size).to.equal(DEFAULT_WORD_LIST.length);
    });

    it('should contain some known words', () => {
      expect(DEFAULT_WORD_LIST).to.include('abandon');
      expect(DEFAULT_WORD_LIST).to.include('ability');
    });
  });

  describe('MemoryDictionary', () => {
    describe('constructor', () => {
      it('should be a class', () => {
        expect(MemoryDictionary).to.be.a('function');
      });

      it('should extend DictionaryPort', () => {
        const dict = new MemoryDictionary();
        expect(dict).to.be.instanceOf(DictionaryPort);
      });

      it('should accept initial word list', () => {
        const words = ['apple', 'banana', 'cherry'];
        const dict = new MemoryDictionary(words);
        expect(dict.words).to.deep.equal(words);
      });

      it('should default to empty array', () => {
        const dict = new MemoryDictionary();
        expect(dict.words).to.deep.equal([]);
      });
    });

    describe('loadDictionary', () => {
      it('should return the word list', async () => {
        const words = ['word1', 'word2'];
        const dict = new MemoryDictionary(words);
        const result = await dict.loadDictionary();
        expect(result).to.deep.equal(words);
      });

      it('should return empty array for empty dictionary', async () => {
        const dict = new MemoryDictionary();
        const result = await dict.loadDictionary();
        expect(result).to.deep.equal([]);
      });

      it('should return a reference to internal words', async () => {
        const words = ['a', 'b'];
        const dict = new MemoryDictionary(words);
        const result = await dict.loadDictionary();
        expect(result).to.equal(dict.words);
      });
    });

    describe('getWordCount', () => {
      it('should return the count of words', async () => {
        const dict = new MemoryDictionary(['a', 'b', 'c']);
        expect(await dict.getWordCount()).to.equal(3);
      });

      it('should return 0 for empty dictionary', async () => {
        const dict = new MemoryDictionary();
        expect(await dict.getWordCount()).to.equal(0);
      });

      it('should return correct count for large word list', async () => {
        const dict = new MemoryDictionary(DEFAULT_WORD_LIST);
        expect(await dict.getWordCount()).to.equal(DEFAULT_WORD_LIST.length);
      });
    });

    describe('selectRandomWord', () => {
      it('should select word at given index', async () => {
        const dict = new MemoryDictionary(['apple', 'banana', 'cherry']);
        const randomFn = async () => 1;
        const word = await dict.selectRandomWord(randomFn);
        expect(word).to.equal('banana');
      });

      it('should use the random function to select index', async () => {
        const dict = new MemoryDictionary(['a', 'b', 'c', 'd', 'e']);
        let calledWith = null;
        const randomFn = async (max) => {
          calledWith = max;
          return 2;
        };
        await dict.selectRandomWord(randomFn);
        expect(calledWith).to.equal(5);
      });

      it('should throw for empty dictionary', async () => {
        const dict = new MemoryDictionary();
        const randomFn = async () => 0;
        try {
          await dict.selectRandomWord(randomFn);
          expect.fail('Should have thrown');
        } catch (e) {
          expect(e.message).to.include('empty');
        }
      });

      it('should select first word with index 0', async () => {
        const dict = new MemoryDictionary(['first', 'second']);
        const randomFn = async () => 0;
        const word = await dict.selectRandomWord(randomFn);
        expect(word).to.equal('first');
      });

      it('should select last word with index length-1', async () => {
        const dict = new MemoryDictionary(['first', 'second', 'last']);
        const randomFn = async () => 2;
        const word = await dict.selectRandomWord(randomFn);
        expect(word).to.equal('last');
      });
    });

    describe('setWords', () => {
      it('should update the word list', () => {
        const dict = new MemoryDictionary(['old']);
        dict.setWords(['new1', 'new2']);
        expect(dict.words).to.deep.equal(['new1', 'new2']);
      });

      it('should affect loadDictionary result', async () => {
        const dict = new MemoryDictionary(['old']);
        dict.setWords(['new']);
        expect(await dict.loadDictionary()).to.deep.equal(['new']);
      });

      it('should affect getWordCount result', async () => {
        const dict = new MemoryDictionary(['a']);
        dict.setWords(['x', 'y', 'z']);
        expect(await dict.getWordCount()).to.equal(3);
      });

      it('should allow setting to empty array', () => {
        const dict = new MemoryDictionary(['word']);
        dict.setWords([]);
        expect(dict.words).to.deep.equal([]);
      });
    });

    describe('deterministic behavior', () => {
      it('should select same word with same random function', async () => {
        const dict = new MemoryDictionary(['a', 'b', 'c', 'd', 'e']);
        const randomFn = async () => 3;

        const word1 = await dict.selectRandomWord(randomFn);
        const word2 = await dict.selectRandomWord(randomFn);

        expect(word1).to.equal(word2);
        expect(word1).to.equal('d');
      });

      it('should support sequence-based random selection', async () => {
        const dict = new MemoryDictionary(['a', 'b', 'c']);
        const sequence = [0, 2, 1, 0];
        let idx = 0;
        const randomFn = async () => sequence[idx++];

        expect(await dict.selectRandomWord(randomFn)).to.equal('a');
        expect(await dict.selectRandomWord(randomFn)).to.equal('c');
        expect(await dict.selectRandomWord(randomFn)).to.equal('b');
        expect(await dict.selectRandomWord(randomFn)).to.equal('a');
      });
    });
  });
});
