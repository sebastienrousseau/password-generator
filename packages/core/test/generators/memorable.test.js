// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it, beforeEach } from "mocha";
import {
  generateMemorablePassword,
  calculateMemorablePasswordEntropy,
  generatePassphrase,
} from "../../src/generators/memorable.js";
import { MemoryDictionary, DEFAULT_WORD_LIST } from "../../src/ports/DictionaryPort.js";

/**
 * Mock RandomGenerator for deterministic testing
 */
class MockRandomGenerator {
  constructor(sequence = []) {
    this.sequence = sequence;
    this.index = 0;
  }

  async generateRandomInt(max) {
    const value = this.sequence[this.index++ % this.sequence.length];
    return value % max;
  }

  async generateRandomBytes(byteLength) {
    const bytes = new Uint8Array(byteLength);
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = this.sequence[this.index++ % this.sequence.length];
    }
    return bytes;
  }
}

describe("Generators: memorable", () => {
  describe("generateMemorablePassword", () => {
    it("should generate password with single word", async () => {
      const mock = new MockRandomGenerator([0]);
      const dict = new MemoryDictionary(["apple", "banana", "cherry"]);

      const result = await generateMemorablePassword(
        { iteration: 1, separator: "-" },
        mock,
        dict
      );

      expect(result).to.equal("apple");
    });

    it("should generate password with multiple words", async () => {
      const mock = new MockRandomGenerator([0, 1, 2]);
      const dict = new MemoryDictionary(["apple", "banana", "cherry"]);

      const result = await generateMemorablePassword(
        { iteration: 3, separator: "-" },
        mock,
        dict
      );

      expect(result).to.equal("apple-banana-cherry");
    });

    it("should use custom separator", async () => {
      const mock = new MockRandomGenerator([0, 1]);
      const dict = new MemoryDictionary(["hello", "world"]);

      const result = await generateMemorablePassword(
        { iteration: 2, separator: " " },
        mock,
        dict
      );

      expect(result).to.equal("hello world");
    });

    it("should use empty separator", async () => {
      const mock = new MockRandomGenerator([0, 1]);
      const dict = new MemoryDictionary(["foo", "bar"]);

      const result = await generateMemorablePassword(
        { iteration: 2, separator: "" },
        mock,
        dict
      );

      expect(result).to.equal("foobar");
    });

    it("should generate deterministic output", async () => {
      const sequence = [0, 2, 1];
      const dict = new MemoryDictionary(["alpha", "beta", "gamma"]);

      const mock1 = new MockRandomGenerator(sequence);
      const mock2 = new MockRandomGenerator(sequence);

      const result1 = await generateMemorablePassword(
        { iteration: 3, separator: "-" },
        mock1,
        dict
      );
      const result2 = await generateMemorablePassword(
        { iteration: 3, separator: "-" },
        mock2,
        dict
      );

      expect(result1).to.equal(result2);
      expect(result1).to.equal("alpha-gamma-beta");
    });

    it("should throw RangeError for zero iteration", async () => {
      const mock = new MockRandomGenerator([0]);
      const dict = new MemoryDictionary(["word"]);

      try {
        await generateMemorablePassword(
          { iteration: 0, separator: "-" },
          mock,
          dict
        );
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should throw RangeError for negative iteration", async () => {
      const mock = new MockRandomGenerator([0]);
      const dict = new MemoryDictionary(["word"]);

      try {
        await generateMemorablePassword(
          { iteration: -2, separator: "-" },
          mock,
          dict
        );
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e).to.be.instanceOf(RangeError);
      }
    });

    it("should throw error for empty dictionary", async () => {
      const mock = new MockRandomGenerator([0]);
      const dict = new MemoryDictionary([]);

      try {
        await generateMemorablePassword(
          { iteration: 1, separator: "-" },
          mock,
          dict
        );
        expect.fail("Should have thrown");
      } catch (e) {
        expect(e.message).to.include("empty");
      }
    });

    it("should work with DEFAULT_WORD_LIST", async () => {
      const mock = new MockRandomGenerator([0, 1, 2, 3]);
      const dict = new MemoryDictionary(DEFAULT_WORD_LIST);

      const result = await generateMemorablePassword(
        { iteration: 4, separator: "-" },
        mock,
        dict
      );

      const words = result.split("-");
      expect(words).to.have.lengthOf(4);
      words.forEach(word => {
        expect(DEFAULT_WORD_LIST).to.include(word);
      });
    });

    it("should handle 6 words (typical passphrase)", async () => {
      const mock = new MockRandomGenerator([0, 5, 10, 15, 20, 25]);
      const dict = new MemoryDictionary(DEFAULT_WORD_LIST);

      const result = await generateMemorablePassword(
        { iteration: 6, separator: "-" },
        mock,
        dict
      );

      const words = result.split("-");
      expect(words).to.have.lengthOf(6);
    });

    it("should allow repeating words", async () => {
      const mock = new MockRandomGenerator([0, 0, 0]);
      const dict = new MemoryDictionary(["repeat"]);

      const result = await generateMemorablePassword(
        { iteration: 3, separator: "-" },
        mock,
        dict
      );

      expect(result).to.equal("repeat-repeat-repeat");
    });
  });

  describe("calculateMemorablePasswordEntropy", () => {
    it("should calculate entropy for default dictionary size (7776)", () => {
      const entropy = calculateMemorablePasswordEntropy({ iteration: 1 });
      expect(entropy).to.be.closeTo(Math.log2(7776), 0.0001);
    });

    it("should scale linearly with iteration count", () => {
      const entropy1 = calculateMemorablePasswordEntropy({ iteration: 1 });
      const entropy4 = calculateMemorablePasswordEntropy({ iteration: 4 });
      expect(entropy4).to.be.closeTo(entropy1 * 4, 0.0001);
    });

    it("should use custom dictionary size", () => {
      const entropy = calculateMemorablePasswordEntropy({
        iteration: 4,
        dictionarySize: 10000,
      });
      expect(entropy).to.be.closeTo(4 * Math.log2(10000), 0.0001);
    });

    it("should calculate approximately 12.9 bits per word for EFF diceware", () => {
      const entropy = calculateMemorablePasswordEntropy({ iteration: 1 });
      expect(entropy).to.be.closeTo(12.9, 0.1);
    });

    it("should calculate approximately 51.7 bits for 4 words", () => {
      const entropy = calculateMemorablePasswordEntropy({ iteration: 4 });
      expect(entropy).to.be.closeTo(51.7, 0.2);
    });

    it("should calculate approximately 77.5 bits for 6 words", () => {
      const entropy = calculateMemorablePasswordEntropy({ iteration: 6 });
      expect(entropy).to.be.closeTo(77.5, 0.2);
    });
  });

  describe("generatePassphrase", () => {
    describe("basic functionality", () => {
      it("should generate basic passphrase", async () => {
        const mock = new MockRandomGenerator([0, 1]);
        const dict = new MemoryDictionary(["hello", "world"]);

        const result = await generatePassphrase(
          { iteration: 2, separator: "-" },
          mock,
          dict
        );

        expect(result).to.equal("hello-world");
      });

      it("should use custom separator", async () => {
        const mock = new MockRandomGenerator([0, 1]);
        const dict = new MemoryDictionary(["alpha", "beta"]);

        const result = await generatePassphrase(
          { iteration: 2, separator: "_" },
          mock,
          dict
        );

        expect(result).to.equal("alpha_beta");
      });
    });

    describe("capitalize transform", () => {
      it("should capitalize first letter of each word", async () => {
        const mock = new MockRandomGenerator([0, 1, 2]);
        const dict = new MemoryDictionary(["apple", "banana", "cherry"]);

        const result = await generatePassphrase(
          {
            iteration: 3,
            separator: "-",
            transforms: { capitalize: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("Apple-Banana-Cherry");
      });

      it("should handle single word with capitalize", async () => {
        const mock = new MockRandomGenerator([0]);
        const dict = new MemoryDictionary(["word"]);

        const result = await generatePassphrase(
          {
            iteration: 1,
            separator: "-",
            transforms: { capitalize: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("Word");
      });

      it("should handle words already capitalized", async () => {
        const mock = new MockRandomGenerator([0, 1]);
        const dict = new MemoryDictionary(["HELLO", "world"]);

        const result = await generatePassphrase(
          {
            iteration: 2,
            separator: "-",
            transforms: { capitalize: true },
          },
          mock,
          dict
        );

        // First letter uppercased, rest unchanged
        expect(result).to.equal("HELLO-World");
      });
    });

    describe("uppercase transform", () => {
      it("should convert entire passphrase to uppercase", async () => {
        const mock = new MockRandomGenerator([0, 1]);
        const dict = new MemoryDictionary(["hello", "world"]);

        const result = await generatePassphrase(
          {
            iteration: 2,
            separator: "-",
            transforms: { uppercase: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("HELLO-WORLD");
      });

      it("should uppercase separator as well", async () => {
        const mock = new MockRandomGenerator([0, 1]);
        const dict = new MemoryDictionary(["foo", "bar"]);

        const result = await generatePassphrase(
          {
            iteration: 2,
            separator: " and ",
            transforms: { uppercase: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("FOO AND BAR");
      });
    });

    describe("appendNumber transform", () => {
      it("should append random number", async () => {
        // First 2 values for word selection, third for number (0-999)
        const mock = new MockRandomGenerator([0, 1, 123]);
        const dict = new MemoryDictionary(["hello", "world"]);

        const result = await generatePassphrase(
          {
            iteration: 2,
            separator: "-",
            transforms: { appendNumber: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("hello-world123");
      });

      it("should append number from 0-999 range", async () => {
        const mock = new MockRandomGenerator([0, 0]); // 0 % 1000 = 0
        const dict = new MemoryDictionary(["word"]);

        const result = await generatePassphrase(
          {
            iteration: 1,
            separator: "-",
            transforms: { appendNumber: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("word0");
      });
    });

    describe("combined transforms", () => {
      it("should apply capitalize and appendNumber", async () => {
        const mock = new MockRandomGenerator([0, 1, 42]);
        const dict = new MemoryDictionary(["foo", "bar"]);

        const result = await generatePassphrase(
          {
            iteration: 2,
            separator: "-",
            transforms: { capitalize: true, appendNumber: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("Foo-Bar42");
      });

      it("should apply uppercase and appendNumber", async () => {
        const mock = new MockRandomGenerator([0, 1, 999]);
        const dict = new MemoryDictionary(["hello", "world"]);

        const result = await generatePassphrase(
          {
            iteration: 2,
            separator: "-",
            transforms: { uppercase: true, appendNumber: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("HELLO-WORLD999");
      });

      it("should apply capitalize then uppercase (uppercase wins)", async () => {
        const mock = new MockRandomGenerator([0, 1]);
        const dict = new MemoryDictionary(["test", "case"]);

        const result = await generatePassphrase(
          {
            iteration: 2,
            separator: "-",
            transforms: { capitalize: true, uppercase: true },
          },
          mock,
          dict
        );

        // Capitalize runs first, then uppercase
        expect(result).to.equal("TEST-CASE");
      });
    });

    describe("no transforms", () => {
      it("should work with empty transforms object", async () => {
        const mock = new MockRandomGenerator([0, 1]);
        const dict = new MemoryDictionary(["hello", "world"]);

        const result = await generatePassphrase(
          {
            iteration: 2,
            separator: "-",
            transforms: {},
          },
          mock,
          dict
        );

        expect(result).to.equal("hello-world");
      });

      it("should work without transforms option", async () => {
        const mock = new MockRandomGenerator([0, 1]);
        const dict = new MemoryDictionary(["hello", "world"]);

        const result = await generatePassphrase(
          { iteration: 2, separator: "-" },
          mock,
          dict
        );

        expect(result).to.equal("hello-world");
      });
    });

    describe("error handling", () => {
      it("should throw for empty dictionary", async () => {
        const mock = new MockRandomGenerator([0]);
        const dict = new MemoryDictionary([]);

        try {
          await generatePassphrase(
            { iteration: 1, separator: "-" },
            mock,
            dict
          );
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.include("empty");
        }
      });

      it("should throw for zero iteration", async () => {
        const mock = new MockRandomGenerator([0]);
        const dict = new MemoryDictionary(["word"]);

        try {
          await generatePassphrase(
            { iteration: 0, separator: "-" },
            mock,
            dict
          );
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e).to.be.instanceOf(RangeError);
        }
      });
    });

    describe("deterministic behavior", () => {
      it("should produce same output with same sequence", async () => {
        const sequence = [5, 10, 15, 100];
        const mock1 = new MockRandomGenerator(sequence);
        const mock2 = new MockRandomGenerator(sequence);
        const dict = new MemoryDictionary(DEFAULT_WORD_LIST);

        const result1 = await generatePassphrase(
          {
            iteration: 3,
            separator: "-",
            transforms: { capitalize: true, appendNumber: true },
          },
          mock1,
          dict
        );

        const result2 = await generatePassphrase(
          {
            iteration: 3,
            separator: "-",
            transforms: { capitalize: true, appendNumber: true },
          },
          mock2,
          dict
        );

        expect(result1).to.equal(result2);
      });
    });
  });

  describe("Edge cases", () => {
    describe("Empty dictionary handling", () => {
      it("should throw error when dictionary returns null", async () => {
        const mock = new MockRandomGenerator([0]);
        // Create a custom dictionary that returns null
        const nullDict = {
          async loadDictionary() {
            return null;
          },
          async selectRandomWord() {
            return "word";
          },
        };

        try {
          await generateMemorablePassword(
            { iteration: 1, separator: "-" },
            mock,
            nullDict
          );
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.equal("Dictionary is empty or not loaded");
        }
      });

      it("should throw error when dictionary returns undefined", async () => {
        const mock = new MockRandomGenerator([0]);
        const undefinedDict = {
          async loadDictionary() {
            return undefined;
          },
          async selectRandomWord() {
            return "word";
          },
        };

        try {
          await generateMemorablePassword(
            { iteration: 1, separator: "-" },
            mock,
            undefinedDict
          );
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.equal("Dictionary is empty or not loaded");
        }
      });

      it("should throw for generatePassphrase with null dictionary", async () => {
        const mock = new MockRandomGenerator([0]);
        const nullDict = {
          async loadDictionary() {
            return null;
          },
          async selectRandomWord() {
            return "word";
          },
        };

        try {
          await generatePassphrase(
            { iteration: 1, separator: "-" },
            mock,
            nullDict
          );
          expect.fail("Should have thrown");
        } catch (e) {
          expect(e.message).to.equal("Dictionary is empty or not loaded");
        }
      });
    });

    describe("calculateMemorablePasswordEntropy edge cases", () => {
      it("should handle very small dictionary size", () => {
        const entropy = calculateMemorablePasswordEntropy({
          iteration: 4,
          dictionarySize: 2,
        });
        // log2(2) = 1 bit per word, 4 words = 4 bits
        expect(entropy).to.equal(4);
      });

      it("should handle dictionary size of 1", () => {
        const entropy = calculateMemorablePasswordEntropy({
          iteration: 10,
          dictionarySize: 1,
        });
        // log2(1) = 0 bits per word
        expect(entropy).to.equal(0);
      });

      it("should handle very large dictionary size", () => {
        const entropy = calculateMemorablePasswordEntropy({
          iteration: 4,
          dictionarySize: 1000000,
        });
        // log2(1000000) ≈ 19.93 bits per word
        expect(entropy).to.be.closeTo(4 * Math.log2(1000000), 0.0001);
      });

      it("should handle single word iteration", () => {
        const entropy = calculateMemorablePasswordEntropy({
          iteration: 1,
          dictionarySize: 7776,
        });
        expect(entropy).to.be.closeTo(Math.log2(7776), 0.0001);
      });

      it("should handle large iteration count", () => {
        const entropy = calculateMemorablePasswordEntropy({
          iteration: 100,
          dictionarySize: 7776,
        });
        expect(entropy).to.be.closeTo(100 * Math.log2(7776), 0.0001);
      });

      it("should return 0 for iteration of 0", () => {
        const entropy = calculateMemorablePasswordEntropy({
          iteration: 0,
          dictionarySize: 7776,
        });
        expect(entropy).to.equal(0);
      });
    });

    describe("generatePassphrase transform edge cases", () => {
      it("should handle single character words with capitalize", async () => {
        const mock = new MockRandomGenerator([0, 1, 2]);
        const dict = new MemoryDictionary(["a", "b", "c"]);

        const result = await generatePassphrase(
          {
            iteration: 3,
            separator: "-",
            transforms: { capitalize: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("A-B-C");
      });

      it("should handle empty separator with capitalize", async () => {
        const mock = new MockRandomGenerator([0, 1]);
        const dict = new MemoryDictionary(["foo", "bar"]);

        const result = await generatePassphrase(
          {
            iteration: 2,
            separator: "",
            transforms: { capitalize: true },
          },
          mock,
          dict
        );

        // With empty separator, split("") splits into individual characters,
        // each gets capitalized, resulting in all uppercase
        expect(result).to.equal("FOOBAR");
      });

      it("should handle numeric separator with uppercase", async () => {
        const mock = new MockRandomGenerator([0, 1]);
        const dict = new MemoryDictionary(["test", "case"]);

        const result = await generatePassphrase(
          {
            iteration: 2,
            separator: "123",
            transforms: { uppercase: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("TEST123CASE");
      });

      it("should handle special character separator", async () => {
        const mock = new MockRandomGenerator([0, 1, 2]);
        const dict = new MemoryDictionary(["alpha", "beta", "gamma"]);

        const result = await generatePassphrase(
          {
            iteration: 3,
            separator: "!@#",
            transforms: { capitalize: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("Alpha!@#Beta!@#Gamma");
      });

      it("should handle all three transforms combined", async () => {
        const mock = new MockRandomGenerator([0, 1, 500]);
        const dict = new MemoryDictionary(["hello", "world"]);

        const result = await generatePassphrase(
          {
            iteration: 2,
            separator: "-",
            transforms: {
              capitalize: true,
              uppercase: true,
              appendNumber: true,
            },
          },
          mock,
          dict
        );

        // capitalize runs first (Hello-World), then uppercase (HELLO-WORLD), then appendNumber
        expect(result).to.equal("HELLO-WORLD500");
      });

      it("should handle appendNumber with value 0", async () => {
        const mock = new MockRandomGenerator([0, 0]); // Second 0 for the number
        const dict = new MemoryDictionary(["word"]);

        const result = await generatePassphrase(
          {
            iteration: 1,
            separator: "-",
            transforms: { appendNumber: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("word0");
      });

      it("should handle appendNumber with max value (999)", async () => {
        const mock = new MockRandomGenerator([0, 999]);
        const dict = new MemoryDictionary(["test"]);

        const result = await generatePassphrase(
          {
            iteration: 1,
            separator: "-",
            transforms: { appendNumber: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("test999");
      });

      it("should handle false transform values", async () => {
        const mock = new MockRandomGenerator([0, 1]);
        const dict = new MemoryDictionary(["hello", "world"]);

        const result = await generatePassphrase(
          {
            iteration: 2,
            separator: "-",
            transforms: {
              capitalize: false,
              uppercase: false,
              appendNumber: false,
            },
          },
          mock,
          dict
        );

        expect(result).to.equal("hello-world");
      });
    });

    describe("Word selection edge cases", () => {
      it("should handle single word dictionary", async () => {
        const mock = new MockRandomGenerator([0, 0, 0, 0, 0]);
        const dict = new MemoryDictionary(["only"]);

        const result = await generateMemorablePassword(
          { iteration: 5, separator: "-" },
          mock,
          dict
        );

        expect(result).to.equal("only-only-only-only-only");
      });

      it("should handle large random values with modulo", async () => {
        // When random returns values larger than dictionary size
        const mock = new MockRandomGenerator([100, 101, 102]);
        const dict = new MemoryDictionary(["a", "b", "c"]);

        const result = await generateMemorablePassword(
          { iteration: 3, separator: "-" },
          mock,
          dict
        );

        // 100 % 3 = 1 (b), 101 % 3 = 2 (c), 102 % 3 = 0 (a)
        expect(result).to.equal("b-c-a");
      });

      it("should handle wraparound in random sequence", async () => {
        const mock = new MockRandomGenerator([0, 1]); // Will cycle
        const dict = new MemoryDictionary(["first", "second", "third"]);

        const result = await generateMemorablePassword(
          { iteration: 4, separator: "-" },
          mock,
          dict
        );

        // Sequence: 0, 1, 0, 1 (cycling)
        expect(result).to.equal("first-second-first-second");
      });

      it("should handle very long passphrase", async () => {
        const sequence = Array.from({ length: 20 }, (_, i) => i);
        const mock = new MockRandomGenerator(sequence);
        const dict = new MemoryDictionary(DEFAULT_WORD_LIST);

        const result = await generateMemorablePassword(
          { iteration: 20, separator: "-" },
          mock,
          dict
        );

        const words = result.split("-");
        expect(words).to.have.lengthOf(20);
      });

      it("should handle unicode words", async () => {
        const mock = new MockRandomGenerator([0, 1, 2]);
        const dict = new MemoryDictionary(["café", "naïve", "résumé"]);

        const result = await generatePassphrase(
          {
            iteration: 3,
            separator: "-",
            transforms: { capitalize: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("Café-Naïve-Résumé");
      });

      it("should handle words with numbers", async () => {
        const mock = new MockRandomGenerator([0, 1]);
        const dict = new MemoryDictionary(["test123", "code456"]);

        const result = await generatePassphrase(
          {
            iteration: 2,
            separator: "-",
            transforms: { uppercase: true },
          },
          mock,
          dict
        );

        expect(result).to.equal("TEST123-CODE456");
      });

      it("should handle empty string separator with multiple words", async () => {
        const mock = new MockRandomGenerator([0, 1, 2]);
        const dict = new MemoryDictionary(["one", "two", "three"]);

        const result = await generateMemorablePassword(
          { iteration: 3, separator: "" },
          mock,
          dict
        );

        expect(result).to.equal("onetwothree");
      });
    });

    describe("Integration with MemoryDictionary", () => {
      it("should work correctly with dictionary that has duplicate words", async () => {
        const mock = new MockRandomGenerator([0, 1, 2]);
        const dict = new MemoryDictionary(["same", "same", "same"]);

        const result = await generateMemorablePassword(
          { iteration: 3, separator: "-" },
          mock,
          dict
        );

        expect(result).to.equal("same-same-same");
      });

      it("should handle whitespace in words", async () => {
        const mock = new MockRandomGenerator([0, 1]);
        const dict = new MemoryDictionary(["hello world", "foo bar"]);

        const result = await generateMemorablePassword(
          { iteration: 2, separator: "-" },
          mock,
          dict
        );

        expect(result).to.equal("hello world-foo bar");
      });

      it("should handle words containing separator character", async () => {
        const mock = new MockRandomGenerator([0, 1]);
        const dict = new MemoryDictionary(["pre-fix", "suf-fix"]);

        const result = await generateMemorablePassword(
          { iteration: 2, separator: "-" },
          mock,
          dict
        );

        expect(result).to.equal("pre-fix-suf-fix");
      });
    });
  });
});
