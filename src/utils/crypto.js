// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import { randomBytes, randomInt } from 'crypto';
import { BASE64_CHARSET } from '../constants.js';
import { recordEntropyUsage, recordAlgorithmUsage } from './security-audit.js';
import {
  calculateBase64Entropy,
  calculateBase64ChunkEntropy,
  validatePositiveInteger,
} from '../../packages/core/src/domain/index.js';

// Re-export domain logic for backward compatibility
export { validatePositiveInteger } from '../../packages/core/src/domain/index.js';

/**
 * Generates a random base64 string of the specified byte length.
 *
 * @param {number} byteLength The number of random bytes to generate.
 * @return {string} The generated base64 string.
 * @throws {RangeError} If byteLength is not a positive integer.
 */
export const generateRandomBase64 = (byteLength) => {
  validatePositiveInteger(byteLength, 'byteLength');
  const result = randomBytes(byteLength).toString('base64');

  // Record entropy usage for audit
  recordEntropyUsage('crypto.randomBytes', 1, calculateBase64Entropy(byteLength), {
    byteLength,
    outputLength: result.length,
    method: 'base64-encoding',
  });
  recordAlgorithmUsage('base64-password-generation', {
    byteLength,
    encoding: 'base64',
  });

  return result;
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
  validatePositiveInteger(length, 'length');
  let result = '';
  for (let i = 0; i < length; i++) {
    result += BASE64_CHARSET[randomInt(BASE64_CHARSET.length)];
  }

  // Record entropy usage for audit
  recordEntropyUsage('crypto.randomInt', length, calculateBase64ChunkEntropy(length), {
    charsetSize: BASE64_CHARSET.length,
    outputLength: length,
    method: 'character-by-character',
  });
  recordAlgorithmUsage('base64-chunk-generation', {
    charsetSize: BASE64_CHARSET.length,
    outputLength: length,
  });

  return result;
};

// Re-export domain logic for backward compatibility
export { splitString } from '../../packages/core/src/domain/index.js';
