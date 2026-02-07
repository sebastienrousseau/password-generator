// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Centralized constants for character sets used across password generators.
 * Re-exports from the core package for backward compatibility.
 *
 * @module constants
 */

// Re-export character sets from core package
export {
  BASE64_CHARSET,
  VOWELS,
  CONSONANTS,
  CHARACTER_SET_METADATA,
} from '../packages/core/src/domain/charset.js';
