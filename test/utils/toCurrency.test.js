import { toCurrency } from "../../src/utils/strings.js";
import { expect } from 'chai';

// toCurrency() test
describe("Running toCurrency", () => {
  it('should be a defined function', () => {
    expect(toCurrency).to.be.a('function');
  });

  it('should take a suite of arguments and return a currency string', () => {
    expect(toCurrency(123456.789, "USD", "en-us")).to.be.a('string');
  });

  it("should convert a suite of arguments to the defined currency format", () => {
    expect(toCurrency(123456.789, "USD", "en-us")).to.equal("$123,456.79");
  });

  it('should return a dollar amount in string form, with a dollar sign preceding', () => {
    expect(toCurrency(5, "USD", "en-us")).to.equal('$5.00');
  });

  it('should handle decimals', () => {
    expect(toCurrency(0.5, "USD", "en-us")).to.equal('$0.50');
    expect(toCurrency(10, "USD", "en-us")).to.equal('$10.00');
    expect(toCurrency(100.5, "USD", "en-us")).to.equal('$100.50');
  });
});
