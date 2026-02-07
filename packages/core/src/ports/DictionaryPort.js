// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Port interface for dictionary/wordlist operations.
 *
 * This port abstracts dictionary loading and word selection to enable
 * different implementations (file system, bundled, HTTP, custom lists, etc.).
 *
 * @interface DictionaryPort
 */
export class DictionaryPort {
  /**
   * Loads the dictionary and returns the list of words.
   *
   * @returns {Promise<string[]>} Array of words from the dictionary.
   * @abstract
   */
  async loadDictionary() {
    throw new Error("DictionaryPort.loadDictionary() must be implemented");
  }

  /**
   * Gets the number of words in the dictionary.
   *
   * @returns {Promise<number>} The word count.
   * @abstract
   */
  async getWordCount() {
    throw new Error("DictionaryPort.getWordCount() must be implemented");
  }

  /**
   * Selects a random word from the dictionary using the provided random generator.
   *
   * @param {Function} randomIntFn - Function that returns a random integer in [0, max).
   * @returns {Promise<string>} A randomly selected word.
   * @abstract
   */
  async selectRandomWord(_randomIntFn) {
    throw new Error("DictionaryPort.selectRandomWord() must be implemented");
  }
}

/**
 * Required methods for DictionaryPort implementations.
 */
export const DICTIONARY_REQUIRED_METHODS = ["loadDictionary", "getWordCount", "selectRandomWord"];

/**
 * In-memory dictionary implementation for testing or bundled dictionaries.
 */
export class MemoryDictionary extends DictionaryPort {
  constructor(words = []) {
    super();
    this.words = words;
  }

  async loadDictionary() {
    return this.words;
  }

  async getWordCount() {
    return this.words.length;
  }

  async selectRandomWord(randomIntFn) {
    if (this.words.length === 0) {
      throw new Error("Dictionary is empty");
    }
    const index = await randomIntFn(this.words.length);
    return this.words[index];
  }

  setWords(words) {
    this.words = words;
  }
}

/**
 * Default word list for memorable passwords (EFF large wordlist subset).
 * This is a small sample - real implementations should use the full EFF list.
 */
export const DEFAULT_WORD_LIST = [
  "abandon",
  "ability",
  "able",
  "about",
  "above",
  "absent",
  "absorb",
  "abstract",
  "absurd",
  "abuse",
  "access",
  "accident",
  "account",
  "accuse",
  "achieve",
  "acid",
  "acoustic",
  "acquire",
  "across",
  "act",
  "action",
  "actor",
  "actress",
  "actual",
  "adapt",
  "add",
  "addict",
  "address",
  "adjust",
  "admit",
  "adult",
  "advance",
  "advice",
  "aerobic",
  "affair",
  "afford",
  "afraid",
  "again",
  "age",
  "agent",
  "agree",
  "ahead",
  "aim",
  "air",
  "airport",
  "aisle",
  "alarm",
  "album",
];
