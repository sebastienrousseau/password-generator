// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Port interface for dictionary and word list operations.
 *
 * This port abstracts dictionary loading and word selection to enable
 * different implementations (file-based, remote, in-memory, database, etc.).
 *
 * Used for memorable password generation that requires access to
 * word dictionaries with different themes and characteristics.
 *
 * @interface DictionaryPort
 */
export class DictionaryPort {
  /**
   * Loads a dictionary by name and returns its word list.
   *
   * @param {string} dictionaryName - The name of the dictionary to load.
   * @returns {Promise<string[]>} A promise resolving to an array of words.
   * @throws {Error} If the dictionary cannot be loaded or does not exist.
   * @abstract
   */
  async loadDictionary(dictionaryName) {
    throw new Error("DictionaryPort.loadDictionary() must be implemented");
  }

  /**
   * Gets a list of all available dictionary names.
   *
   * @returns {Promise<string[]>} A promise resolving to an array of dictionary names.
   * @abstract
   */
  async getAvailableDictionaries() {
    throw new Error("DictionaryPort.getAvailableDictionaries() must be implemented");
  }

  /**
   * Gets metadata about a specific dictionary (word count, description, etc.).
   *
   * @param {string} dictionaryName - The name of the dictionary.
   * @returns {Promise<Object>} A promise resolving to dictionary metadata.
   * @throws {Error} If the dictionary does not exist.
   * @abstract
   */
  async getDictionaryMetadata(dictionaryName) {
    throw new Error("DictionaryPort.getDictionaryMetadata() must be implemented");
  }

  /**
   * Selects a random word from the specified dictionary.
   *
   * @param {string} dictionaryName - The name of the dictionary.
   * @param {Object} [options] - Optional selection criteria.
   * @param {number} [options.minLength] - Minimum word length.
   * @param {number} [options.maxLength] - Maximum word length.
   * @param {string[]} [options.excludeWords] - Words to exclude from selection.
   * @returns {Promise<string>} A promise resolving to a randomly selected word.
   * @throws {Error} If the dictionary cannot be loaded or no words meet criteria.
   * @abstract
   */
  async selectRandomWord(dictionaryName, options = {}) {
    throw new Error("DictionaryPort.selectRandomWord() must be implemented");
  }

  /**
   * Selects multiple random words from the specified dictionary.
   *
   * @param {string} dictionaryName - The name of the dictionary.
   * @param {number} count - The number of words to select.
   * @param {Object} [options] - Optional selection criteria.
   * @param {number} [options.minLength] - Minimum word length.
   * @param {number} [options.maxLength] - Maximum word length.
   * @param {boolean} [options.unique=true] - Whether selected words must be unique.
   * @param {string[]} [options.excludeWords] - Words to exclude from selection.
   * @returns {Promise<string[]>} A promise resolving to an array of randomly selected words.
   * @throws {Error} If the dictionary cannot be loaded or insufficient words meet criteria.
   * @abstract
   */
  async selectRandomWords(dictionaryName, count, options = { unique: true }) {
    throw new Error("DictionaryPort.selectRandomWords() must be implemented");
  }

  /**
   * Filters words from a dictionary based on criteria.
   *
   * @param {string} dictionaryName - The name of the dictionary.
   * @param {Object} criteria - The filtering criteria.
   * @param {number} [criteria.minLength] - Minimum word length.
   * @param {number} [criteria.maxLength] - Maximum word length.
   * @param {RegExp} [criteria.pattern] - Pattern that words must match.
   * @param {string[]} [criteria.excludeWords] - Words to exclude.
   * @returns {Promise<string[]>} A promise resolving to an array of filtered words.
   * @throws {Error} If the dictionary cannot be loaded.
   * @abstract
   */
  async filterWords(dictionaryName, criteria) {
    throw new Error("DictionaryPort.filterWords() must be implemented");
  }

  /**
   * Validates that a dictionary contains sufficient words for password generation.
   *
   * @param {string} dictionaryName - The name of the dictionary.
   * @param {Object} requirements - The minimum requirements.
   * @param {number} requirements.minWordCount - Minimum total word count.
   * @param {number} [requirements.minUniqueWords] - Minimum unique words needed.
   * @returns {Promise<boolean>} A promise resolving to true if validation passes.
   * @throws {Error} If the dictionary cannot be loaded.
   * @abstract
   */
  async validateDictionary(dictionaryName, requirements) {
    throw new Error("DictionaryPort.validateDictionary() must be implemented");
  }

  /**
   * Calculates the entropy of a dictionary for security analysis.
   *
   * @param {string} dictionaryName - The name of the dictionary.
   * @param {Object} [options] - Optional calculation options.
   * @param {number} [options.minLength] - Consider only words >= this length.
   * @param {number} [options.maxLength] - Consider only words <= this length.
   * @returns {Promise<Object>} A promise resolving to entropy information.
   * @throws {Error} If the dictionary cannot be loaded.
   * @abstract
   */
  async calculateDictionaryEntropy(dictionaryName, options = {}) {
    throw new Error("DictionaryPort.calculateDictionaryEntropy() must be implemented");
  }

  /**
   * Preloads dictionaries into memory for faster access.
   *
   * @param {string[]} dictionaryNames - The names of dictionaries to preload.
   * @returns {Promise<void>} A promise that resolves when preloading completes.
   * @abstract
   */
  async preloadDictionaries(dictionaryNames) {
    throw new Error("DictionaryPort.preloadDictionaries() must be implemented");
  }

  /**
   * Clears cached dictionary data to free memory.
   *
   * @param {string[]} [dictionaryNames] - Specific dictionaries to clear, or all if undefined.
   * @returns {Promise<void>} A promise that resolves when clearing completes.
   * @abstract
   */
  async clearDictionaryCache(dictionaryNames) {
    throw new Error("DictionaryPort.clearDictionaryCache() must be implemented");
  }

  /**
   * Checks if a dictionary is currently loaded in memory.
   *
   * @param {string} dictionaryName - The name of the dictionary.
   * @returns {Promise<boolean>} A promise resolving to true if the dictionary is loaded.
   * @abstract
   */
  async isDictionaryLoaded(dictionaryName) {
    throw new Error("DictionaryPort.isDictionaryLoaded() must be implemented");
  }
}