// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Re-export from packages/core for backward compatibility.
 * @module entropy-calculator
 */

export {
  ENTROPY_CONSTANTS,
  calculateBase64Entropy,
  calculateBase64ChunkEntropy,
  calculateDictionaryEntropy,
  calculateCharsetEntropy,
  calculateSyllableEntropy,
  getSecurityLevel,
  getSecurityRecommendation,
  calculateTotalEntropy,
} from "../../../packages/core/src/domain/entropy-calculator.js";
