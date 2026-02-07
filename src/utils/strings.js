// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { STRING_ERRORS } from '../errors.js';

/**
 * Consolidated string transformation utilities.
 *
 * @module strings
 */

/**
 * Converts a given string to camel case.
 *
 * @param {string} str - The input string to convert.
 * @returns {string} The camel-cased string.
 * @throws {TypeError} If the input is not a string.
 */
export const toCamelCase = (str) => {
  if (typeof str !== 'string') {
    throw new TypeError(STRING_ERRORS.INPUT_MUST_BE_STRING);
  }
  const words = str.match(/[a-zA-Z0-9]+/g) || [];
  if (words.length === 0) {
    return '';
  }
  let result = words[0].toLowerCase();
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    result += word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
  return result;
};

/**
 * Converts a string to an array of characters.
 *
 * @param {string} str - The input string to convert.
 * @returns {string[]} An array of individual characters.
 */
export const toCharArray = (str) => [...str];

/**
 * Formats a number as a currency string.
 *
 * @param {number} n - The number to format.
 * @param {string} curr - The ISO 4217 currency code.
 * @param {string} [languageFormat] - The BCP 47 language tag for locale formatting.
 * @returns {string} The formatted currency string.
 */
export const toCurrency = (n, curr, languageFormat = undefined) =>
  Intl.NumberFormat(languageFormat, {
    style: 'currency',
    minimumFractionDigits: 2,
    currency: curr,
  }).format(n);

/**
 * Converts a string to kebab case.
 *
 * @param {string} str - The input string to convert.
 * @returns {string} The kebab-cased string.
 */
export const toKebabCase = (str) =>
  str
    .match(/[A-Z]{2,}|[A-Z]?[a-z]+\d*|[A-Z]|\d+/g)
    .map((x) => x.toLowerCase())
    .join('-');

/**
 * Converts a string to snake case.
 *
 * @param {string} str - The input string to convert.
 * @returns {string} The snake-cased string.
 */
export const toSnakeCase = (str) =>
  str
    .replace(/^[^A-Za-z\d]*|[^A-Za-z\d]*$/g, '')
    .replace(/([a-z])([A-Z])/g, (_, a, b) => a + '_' + b.toLowerCase())
    .replace(/[^A-Za-z\d]+/g, '_')
    .toLowerCase();

/**
 * Converts a string to title case.
 *
 * @param {string} str - The input string to convert.
 * @returns {string} The title-cased string.
 */
export const toTitleCase = (str) =>
  str
    .toLowerCase()
    .match(/[A-Z]{2,}(?=[A-Z][a-z]|\b)|[A-Z]?[a-z]+|[A-Z]|\d+/g)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(' ');
