import { toCharArray } from "../../src/utils/toCharArray/toCharArray.js";
import * as chai from "chai";

// Test type of toCharArray() function
describe("Running test type of toCharArray() function \n", function () {
  for (let key in strings) testArray(key);
});

/**
 * Create a testArray for a given case `key`.
 *
 * @param {String} key
 */

function testArray(key) {
  it("should validate that the conversion of a " + key + " case string should be of type array", function () {
    assert.typeOf(toCharArray(strings[key]), 'array' );
  });
}

// toCharArray() test function
describe("Running toCharArray () function \n", function () {
  for (let key in strings) testFunction(key);
});

/**
 * Create a testFunction for a given case `key`.
 *
 * @param {String} key
 */

function testFunction(key) {
  it("should validate that the conversion of a " + key + " case string should be an array of characters.", function () {
    assert.deepEqual(toCharArray(strings.camel), ['p', 'a', 's', 's', 'w', 'o', 'r', 'd', 'G', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'] );
    assert.deepEqual(toCharArray(strings.dot), ['p', 'a', 's', 's', 'w', 'o', 'r', 'd', '.', 'g', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'] );
    assert.deepEqual(toCharArray(strings.junk), ['-', '-', 'P', 'A', 'S', 'S', 'W', 'O', 'R', 'D', '-', 'G', 'E', 'N', 'E', 'R', 'A', 'T', 'O', 'R', '-', '-'] );
    assert.deepEqual(toCharArray(strings.kebab), ['p', 'a', 's', 's', 'w', 'o', 'r', 'd', '-', 'g', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'] );
    assert.deepEqual(toCharArray(strings.pascal), ['P', 'a', 's', 's', 'w', 'o', 'r', 'd', 'G', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'] );
    assert.deepEqual(toCharArray(strings.sentence), ['P', 'a', 's', 's', 'w', 'o', 'r', 'd', ' ', 'g', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'] );
    assert.deepEqual(toCharArray(strings.snake), ['p', 'a', 's', 's', 'w', 'o', 'r', 'd', '_', 'g', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'] );
    assert.deepEqual(toCharArray(strings.space), ['p', 'a', 's', 's', 'w', 'o', 'r', 'd', ' ', 'g', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'] );
    assert.deepEqual(toCharArray(strings.title), ['P', 'a', 's', 's', 'w', 'o', 'r', 'd', ' ', 'G', 'e', 'n', 'e', 'r', 'a', 't', 'o', 'r'] );
    assert.deepEqual(toCharArray(strings.uppercase), ['P', 'A', 'S', 'S', 'W', 'O', 'R', 'D', ' ', 'G', 'E', 'N', 'E', 'R', 'A', 'T', 'O', 'R'] );
  });
}
