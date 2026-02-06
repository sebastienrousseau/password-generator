import { expect } from "chai";
import { randomNumber } from "../../src/utils/randomNumber.js";

describe("randomNumber Function", () => {
  // Test for generating a random number between 0 and a specified max value.
  it("should generate a random number between 0 and max", () => {
    const max = 100;
    const random = randomNumber(max);
    expect(random).to.be.a("number");
    expect(random).to.be.at.least(0);
    expect(random).to.be.lessThan(max);
  });

  // Test for generating a random number within a specified range (min to max).
  it("should generate a random number within a specified range", () => {
    const min = 50;
    const max = 100;
    const random = randomNumber(max, min);
    expect(random).to.be.a("number");
    expect(random).to.be.at.least(min);
    expect(random).to.be.lessThan(max);
  });

  // Test for generating a random number with min and max equal.
  it("should generate min when min and max are equal", () => {
    const min = 50;
    const max = 50;
    const random = randomNumber(max, min);
    expect(random).to.equal(min);
  });

  // Test for randomness (generating multiple random numbers and checking distribution).
  it("should be random", () => {
    const max = 10;
    const numSamples = 1000;
    const tolerance = numSamples / max; // Tolerance for uniform distribution
    const count = new Array(max).fill(0);

    for (let i = 0; i < numSamples; i++) {
      const random = randomNumber(max);
      count[random]++;
    }

    // Check that each number is within tolerance of the expected count (uniform distribution).
    count.forEach((c) => {
      expect(c).to.be.closeTo(tolerance, tolerance * 0.4); // Allowing 40% tolerance
    });
  });
});
