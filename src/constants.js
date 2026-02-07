// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Centralized constants for character sets used across password generators.
 * Re-exports from the core domain module for backward compatibility.
 *
 * @module constants
 */

// Re-export character sets from domain layer
export {
  BASE64_CHARSET,
  VOWELS,
  CONSONANTS,
  CHARACTER_SET_METADATA
} from "./core/domain/charset.js";
