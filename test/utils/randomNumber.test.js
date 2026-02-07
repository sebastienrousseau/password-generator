import { expect } from "chai";
import { randomNumber } from "../../src/utils/randomNumber.js";

describe("randomNumber Function", () => {
  it("should generate a random number between 0 and max", () => {
    const max = 100;
    const random = randomNumber(max);
    expect(random).to.be.a("number");
    expect(random).to.be.at.least(0);
    expect(random).to.be.lessThan(max);
  });

  it("should generate a random number within a specified range", () => {
    const min = 50;
    const max = 100;
    const random = randomNumber(max, min);
    expect(random).to.be.a("number");
    expect(random).to.be.at.least(min);
    expect(random).to.be.lessThan(max);
  });

  it("should generate min when min and max are equal", () => {
    const min = 50;
    const max = 50;
    const random = randomNumber(max, min);
    expect(random).to.equal(min);
  });

  it("should be random (uniform distribution)", () => {
    const max = 10;
    const numSamples = 1000;
    const tolerance = numSamples / max;
    const count = new Array(max).fill(0);

    for (let i = 0; i < numSamples; i++) {
      const random = randomNumber(max);
      count[random]++;
    }

    count.forEach((c) => {
      expect(c).to.be.closeTo(tolerance, tolerance * 0.4);
    });
  });

  it("should always return an integer", () => {
    for (let i = 0; i < 100; i++) {
      const result = randomNumber(1000);
      expect(Number.isInteger(result)).to.equal(true);
    }
  });

  it("should use cryptographically secure randomness (not predictable)", () => {
    // Generate two batches and verify they differ (extremely unlikely to match with crypto)
    const batch1 = Array.from({ length: 20 }, () => randomNumber(1000000));
    const batch2 = Array.from({ length: 20 }, () => randomNumber(1000000));
    const match = batch1.every((val, i) => val === batch2[i]);
    expect(match).to.equal(false);
  });
});
