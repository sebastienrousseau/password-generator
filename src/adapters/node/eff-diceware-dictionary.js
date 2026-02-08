// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * EFF Diceware Dictionary adapter for Node.js environment.
 * Loads the full 7776-word EFF large wordlist.
 *
 * @module adapters/node/eff-diceware-dictionary
 */

import { DictionaryPort } from '../../../packages/core/src/ports/DictionaryPort.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * EFF Diceware Dictionary implementation.
 * Loads the full 7776-word EFF large wordlist from the bundled JSON file.
 */
export class EFFDicewareDictionary extends DictionaryPort {
  constructor() {
    super();
    this.words = null;
  }

  async loadDictionary() {
    if (this.words === null) {
      const dictionary = require('../../dictionaries/eff-diceware.json');
      this.words = dictionary.words || [];
    }
    return this.words;
  }

  async getWordCount() {
    await this.loadDictionary();
    return this.words.length;
  }

  async selectRandomWord(randomIntFn) {
    await this.loadDictionary();
    if (this.words.length === 0) {
      throw new Error('EFF Diceware dictionary is empty');
    }
    const index = await randomIntFn(this.words.length);
    return this.words[index];
  }
}
