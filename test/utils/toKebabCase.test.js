import { toKebabCase } from "../../src/utils/toKebabCase/toKebabCase.js";

// toKebabCase() tests
describe("Running toKebabCase (string) \n", function () {
  it("should return a string \n", function () {
    let str = "Password Generator";
    expect(toKebabCase(str)).to.be.a("string");
  });
  it("should convert all the alphabetic characters in a kebab case string.", function () {
    for (let i = 0; i < strings.length; i++) {
      // console.log(`  →  Test #${[i]} where string = "${strings[i]}"\n`);
      expect(toKebabCase(strings[i])).equal("password-generator");
    }
  });
});
