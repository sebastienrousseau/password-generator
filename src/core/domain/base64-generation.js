// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Re-export from packages/core for backward compatibility.
 * @module base64-generation
 */

export {
  validatePositiveInteger,
  isValidBase64,
  splitString,
  calculateBase64Length,
  calculateRequiredByteLength,
  BASE64_DOMAIN_RULES,
} from "../../../packages/core/src/domain/base64-generation.js";
