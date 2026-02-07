// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Password generator exports.
 *
 * @module generators
 */

export { generateChunk, generateStrongPassword, calculateStrongPasswordEntropy } from "./strong.js";

export {
  generateBase64Chunk,
  generateBase64Password,
  calculateBase64PasswordEntropy,
} from "./base64.js";

export {
  generateMemorablePassword,
  calculateMemorablePasswordEntropy,
  generatePassphrase,
} from "./memorable.js";

export {
  generateQuantumChunk,
  generateQuantumPassword,
  calculateQuantumPasswordEntropy,
  validateQuantumSecurity,
} from "./quantum.js";

export {
  generateHoneywordSet,
  generateHoneywordPassword,
  calculateHoneywordPasswordEntropy,
} from "./honeyword.js";

export {
  generatePronounceablePassword,
  calculatePronounceablePasswordEntropy,
  generateCVVCSyllable,
} from "./pronounceable.js";

export {
  generateCustomPassword,
  generateTemplatePassword,
  calculateCustomPasswordEntropy,
  calculateTemplatePasswordEntropy,
} from "./custom.js";

export { generateDicewarePassword, calculateDicewarePasswordEntropy } from "./diceware.js";

import { generateStrongPassword, calculateStrongPasswordEntropy } from "./strong.js";
import { generateBase64Password, calculateBase64PasswordEntropy } from "./base64.js";
import { generateMemorablePassword, calculateMemorablePasswordEntropy } from "./memorable.js";
import { generateQuantumPassword, calculateQuantumPasswordEntropy } from "./quantum.js";
import { generateHoneywordPassword, calculateHoneywordPasswordEntropy } from "./honeyword.js";
import {
  generatePronounceablePassword,
  calculatePronounceablePasswordEntropy,
} from "./pronounceable.js";
import { generateCustomPassword, calculateCustomPasswordEntropy } from "./custom.js";
import { generateDicewarePassword, calculateDicewarePasswordEntropy } from "./diceware.js";
import { PASSWORD_TYPES, isValidPasswordType } from "../domain/password-types.js";
import { PASSWORD_ERRORS } from "../errors.js";

/**
 * Generator registry mapping password types to their implementations.
 */
export const GENERATOR_REGISTRY = {
  [PASSWORD_TYPES.STRONG]: {
    generate: generateStrongPassword,
    calculateEntropy: calculateStrongPasswordEntropy,
  },
  [PASSWORD_TYPES.BASE64]: {
    generate: generateBase64Password,
    calculateEntropy: calculateBase64PasswordEntropy,
  },
  [PASSWORD_TYPES.MEMORABLE]: {
    generate: generateMemorablePassword,
    calculateEntropy: calculateMemorablePasswordEntropy,
  },
  [PASSWORD_TYPES.QUANTUM]: {
    generate: generateQuantumPassword,
    calculateEntropy: calculateQuantumPasswordEntropy,
  },
  [PASSWORD_TYPES.HONEYWORD]: {
    generate: generateHoneywordPassword,
    calculateEntropy: calculateHoneywordPasswordEntropy,
  },
  [PASSWORD_TYPES.PRONOUNCEABLE]: {
    generate: generatePronounceablePassword,
    calculateEntropy: calculatePronounceablePasswordEntropy,
  },
  [PASSWORD_TYPES.CUSTOM]: {
    generate: generateCustomPassword,
    calculateEntropy: calculateCustomPasswordEntropy,
  },
  [PASSWORD_TYPES.DICEWARE]: {
    generate: generateDicewarePassword,
    calculateEntropy: calculateDicewarePasswordEntropy,
  },
};

/**
 * Gets the generator for a password type.
 *
 * @param {string} type - The password type.
 * @returns {Object} The generator object with generate and calculateEntropy methods.
 * @throws {Error} If the password type is invalid.
 */
export const getGenerator = (type) => {
  if (!isValidPasswordType(type)) {
    throw new Error(PASSWORD_ERRORS.UNKNOWN_TYPE(type));
  }
  return GENERATOR_REGISTRY[type];
};

/**
 * Generates a password of the specified type.
 *
 * @param {Object} config - Password configuration.
 * @param {string} config.type - Password type (strong, base64, memorable, quantum, diceware).
 * @param {number} [config.length] - Length of each chunk (for strong/base64).
 * @param {number} config.iteration - Number of chunks/words.
 * @param {string} config.separator - Separator between chunks/words.
 * @param {Object} ports - Port implementations.
 * @param {Object} ports.randomGenerator - RandomGeneratorPort implementation.
 * @param {Object} [ports.dictionary] - DictionaryPort implementation (for memorable and diceware).
 * @returns {Promise<string>} The generated password.
 */
export const generate = async (config, ports) => {
  const { type } = config;
  const generator = getGenerator(type);

  if (type === PASSWORD_TYPES.MEMORABLE || type === PASSWORD_TYPES.DICEWARE) {
    if (!ports.dictionary) {
      throw new Error("DictionaryPort is required for memorable and diceware passwords");
    }
    return generator.generate(config, ports.randomGenerator, ports.dictionary);
  }

  return generator.generate(config, ports.randomGenerator);
};
