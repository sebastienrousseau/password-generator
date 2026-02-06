import { expect } from "chai";
import { generatePassword } from "../../src/lib/memorable-password.js";

describe("Memorable Password Generator", () => {
  describe("generatePassword", () => {
    it("should return a string", async () => {
      const result = await generatePassword({ iteration: 3, separator: "-" });
      expect(result).to.be.a("string");
    });

    it("should contain the correct number of words", async () => {
      const result = await generatePassword({ iteration: 4, separator: "-" });
      const words = result.split("-");
      expect(words).to.have.lengthOf(4);
    });

    it("should use the specified separator", async () => {
      const result = await generatePassword({ iteration: 2, separator: "." });
      expect(result).to.include(".");
    });

    it("should produce title-cased words", async () => {
      const result = await generatePassword({ iteration: 3, separator: "-" });
      const words = result.split("-");
      words.forEach((word) => {
        expect(word[0]).to.equal(word[0].toUpperCase());
      });
    });

    it("should throw a RangeError for iteration < 1", async () => {
      try {
        await generatePassword({ iteration: 0, separator: "-" });
        expect.fail("Expected RangeError");
      } catch (error) {
        expect(error).to.be.instanceOf(RangeError);
        expect(error.message).to.equal("The iteration argument must be a positive integer");
      }
    });

    it("should work with a single iteration", async () => {
      const result = await generatePassword({ iteration: 1, separator: "-" });
      expect(result).to.not.include("-");
      expect(result.length).to.be.greaterThan(0);
    });

    it("should generate different passwords on each call", async () => {
      const results = new Set();
      for (let i = 0; i < 10; i++) {
        results.add(await generatePassword({ iteration: 4, separator: "-" }));
      }
      expect(results.size).to.be.greaterThan(1);
    });

    it("should not contain spaces in the final password", async () => {
      const result = await generatePassword({ iteration: 5, separator: "-" });
      expect(result).to.not.include(" ");
    });

    it("should throw a RangeError for non-integer iteration", async () => {
      try {
        await generatePassword({ iteration: 2.5, separator: "-" });
        expect.fail("Expected RangeError");
      } catch (error) {
        expect(error).to.be.instanceOf(RangeError);
        expect(error.message).to.equal("The iteration argument must be a positive integer");
      }
    });

    it("should throw a RangeError for negative iteration", async () => {
      try {
        await generatePassword({ iteration: -1, separator: "-" });
        expect.fail("Expected RangeError");
      } catch (error) {
        expect(error).to.be.instanceOf(RangeError);
        expect(error.message).to.equal("The iteration argument must be a positive integer");
      }
    });
  });
});
