// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { randomBytes, randomInt } from "crypto";

/** Base64 character set (64 characters, no padding bias). */
const BASE64_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Generates a random base64 string of the specified byte length.
 *
 * @param {number} byteLength The number of random bytes to generate.
 * @return {string} The generated base64 string.
 * @throws {RangeError} If byteLength is not a positive integer.
 */
export const generateRandomBase64 = (byteLength) => {
  if (!Number.isInteger(byteLength) || byteLength < 1) {
    throw new RangeError("The byteLength argument must be a positive integer");
  }
  return randomBytes(byteLength).toString("base64");
};

/**
 * Generates a random string of the exact character length using uniform
 * selection from the base64 character set. Each character is independently
 * chosen via crypto.randomInt() to avoid the bias introduced by slicing
 * base64-encoded byte strings.
 *
 * @param {number} length The desired character length of the output.
 * @return {string} A random string of exactly `length` characters.
 * @throws {RangeError} If length is not a positive integer.
 */
export const generateBase64Chunk = (length) => {
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError("The length argument must be a positive integer");
  }
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE64_CHARSET[randomInt(BASE64_CHARSET.length)];
  }
  return result;
};

/**
 * Splits a string into substrings of the specified length.
 *
 * @param {string} str The string to split.
 * @param {number} length The length of each substring.
 * @return {Array<string>} The array of substrings.
 * @throws {RangeError} If length is not a positive integer.
 */
export const splitString = (str, length) => {
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError("The length argument must be a positive integer");
  }
  const substrings = str.match(new RegExp(`.{1,${length}}`, "g"));
  return substrings || [];
};
