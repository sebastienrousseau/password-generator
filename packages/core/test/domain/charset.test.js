// Copyright (c) 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { expect } from "chai";
import { describe, it } from "mocha";
import {
  BASE64_CHARSET,
  VOWELS,
  CONSONANTS,
  CHARACTER_SET_METADATA,
} from "../../src/domain/charset.js";

describe("Domain: charset", () => {
  describe("BASE64_CHARSET", () => {
    it("should contain exactly 64 characters", () => {
      expect(BASE64_CHARSET).to.have.lengthOf(64);
    });

    it("should contain uppercase letters A-Z", () => {
      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (const char of uppercase) {
        expect(BASE64_CHARSET).to.include(char);
      }
    });

    it("should contain lowercase letters a-z", () => {
      const lowercase = "abcdefghijklmnopqrstuvwxyz";
      for (const char of lowercase) {
        expect(BASE64_CHARSET).to.include(char);
      }
    });

    it("should contain digits 0-9", () => {
      const digits = "0123456789";
      for (const char of digits) {
        expect(BASE64_CHARSET).to.include(char);
      }
    });

    it("should contain + and / characters", () => {
      expect(BASE64_CHARSET).to.include("+");
      expect(BASE64_CHARSET).to.include("/");
    });

    it("should not contain duplicate characters", () => {
      const chars = new Set(BASE64_CHARSET);
      expect(chars.size).to.equal(BASE64_CHARSET.length);
    });

    it("should match RFC 4648 base64 alphabet", () => {
      const rfc4648 =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      expect(BASE64_CHARSET).to.equal(rfc4648);
    });
  });

  describe("VOWELS", () => {
    it("should contain exactly 5 vowels", () => {
      expect(VOWELS).to.have.lengthOf(5);
    });

    it("should contain a, e, i, o, u", () => {
      expect(VOWELS).to.include("a");
      expect(VOWELS).to.include("e");
      expect(VOWELS).to.include("i");
      expect(VOWELS).to.include("o");
      expect(VOWELS).to.include("u");
    });

    it("should not contain duplicate characters", () => {
      const chars = new Set(VOWELS);
      expect(chars.size).to.equal(VOWELS.length);
    });

    it("should only contain lowercase characters", () => {
      expect(VOWELS).to.equal(VOWELS.toLowerCase());
    });
  });

  describe("CONSONANTS", () => {
    it("should contain exactly 21 consonants", () => {
      expect(CONSONANTS).to.have.lengthOf(21);
    });

    it("should not contain vowels", () => {
      for (const vowel of VOWELS) {
        expect(CONSONANTS).to.not.include(vowel);
      }
    });

    it("should not contain duplicate characters", () => {
      const chars = new Set(CONSONANTS);
      expect(chars.size).to.equal(CONSONANTS.length);
    });

    it("should only contain lowercase letters", () => {
      expect(CONSONANTS).to.equal(CONSONANTS.toLowerCase());
      expect(CONSONANTS).to.match(/^[a-z]+$/);
    });

    it("should combine with vowels to form complete lowercase alphabet except certain letters", () => {
      const combined = VOWELS + CONSONANTS;
      // All letters should be accounted for (26 letters total)
      expect(combined).to.have.lengthOf(26);
    });
  });

  describe("CHARACTER_SET_METADATA", () => {
    describe("BASE64 metadata", () => {
      it("should have correct charset reference", () => {
        expect(CHARACTER_SET_METADATA.BASE64.charset).to.equal(BASE64_CHARSET);
      });

      it("should have size of 64", () => {
        expect(CHARACTER_SET_METADATA.BASE64.size).to.equal(64);
      });

      it("should have bitsPerCharacter of 6", () => {
        expect(CHARACTER_SET_METADATA.BASE64.bitsPerCharacter).to.equal(6);
      });

      it("should have a description", () => {
        expect(CHARACTER_SET_METADATA.BASE64.description).to.be.a("string");
        expect(CHARACTER_SET_METADATA.BASE64.description.length).to.be.greaterThan(0);
      });
    });

    describe("VOWELS metadata", () => {
      it("should have correct charset reference", () => {
        expect(CHARACTER_SET_METADATA.VOWELS.charset).to.equal(VOWELS);
      });

      it("should have size of 5", () => {
        expect(CHARACTER_SET_METADATA.VOWELS.size).to.equal(5);
      });

      it("should have correct bitsPerCharacter (log2(5))", () => {
        expect(CHARACTER_SET_METADATA.VOWELS.bitsPerCharacter).to.be.closeTo(
          Math.log2(5),
          0.0001
        );
      });

      it("should have a description", () => {
        expect(CHARACTER_SET_METADATA.VOWELS.description).to.be.a("string");
        expect(CHARACTER_SET_METADATA.VOWELS.description.length).to.be.greaterThan(0);
      });
    });

    describe("CONSONANTS metadata", () => {
      it("should have correct charset reference", () => {
        expect(CHARACTER_SET_METADATA.CONSONANTS.charset).to.equal(CONSONANTS);
      });

      it("should have size of 21", () => {
        expect(CHARACTER_SET_METADATA.CONSONANTS.size).to.equal(21);
      });

      it("should have correct bitsPerCharacter (log2(21))", () => {
        expect(CHARACTER_SET_METADATA.CONSONANTS.bitsPerCharacter).to.be.closeTo(
          Math.log2(21),
          0.0001
        );
      });

      it("should have a description", () => {
        expect(CHARACTER_SET_METADATA.CONSONANTS.description).to.be.a("string");
        expect(CHARACTER_SET_METADATA.CONSONANTS.description.length).to.be.greaterThan(0);
      });
    });
  });
});
