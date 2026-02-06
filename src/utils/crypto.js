// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { randomBytes } from "crypto";

/**
 * Generates a random base64 string of the specified byte length.
 *
 * @param {number} byteLength The number of random bytes to generate.
 * @return {string} The generated base64 string.
 */
export const generateRandomBase64 = (byteLength) => {
  return randomBytes(byteLength).toString("base64");
};

/**
 * Generates a random base64 string and slices it to the exact character length.
 *
 * @param {number} length The desired character length of the output.
 * @return {string} A base64 string of exactly `length` characters.
 */
export const generateBase64Chunk = (length) => {
  const bytes = randomBytes(Math.ceil((length * 3) / 4));
  return bytes.toString("base64").slice(0, length);
};

/**
 * Splits a string into substrings of the specified length.
 *
 * @param {string} str The string to split.
 * @param {number} length The length of each substring.
 * @return {Array<string>} The array of substrings.
 */
export const splitString = (str, length) => {
  const substrings = str.match(new RegExp(`.{1,${length}}`, "g"));
  return substrings || [];
};
