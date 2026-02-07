// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Re-export from packages/core for backward compatibility.
 * @module password-types
 */

export {
  PASSWORD_TYPES,
  GENERATION_STRATEGIES,
  VALID_PASSWORD_TYPES,
  isValidPasswordType,
  PASSWORD_TYPE_METADATA,
  validatePasswordTypeConfig,
  getExpectedEntropy,
} from "../../../packages/core/src/domain/password-types.js";
