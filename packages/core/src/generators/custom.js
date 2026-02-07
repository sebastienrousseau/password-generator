// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure generator for custom character set and template-based passwords.
 * All randomness is provided through the injected random generator port.
 *
 * @module generators/custom
 */

import { createCustomCharset, validateCharset } from "../domain/charset.js";
import { parseTemplate, validateTemplate, calculateTemplateEntropy, TOKEN_TYPES } from "../domain/template.js";
import { validatePositiveInteger } from "../domain/base64-generation.js";

/**
 * Generates a password using a custom character set.
 *
 * @param {Object} config - Password configuration.
 * @param {string} config.allowedChars - Allowed characters or character set names.
 * @param {string} [config.forbiddenChars] - Characters to exclude.
 * @param {number} config.length - Length of each chunk.
 * @param {number} config.iteration - Number of chunks.
 * @param {string} config.separator - Separator between chunks.
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @returns {Promise<string>} The generated password.
 */
export const generateCustomPassword = async (config, randomGenerator) => {
  const { allowedChars, forbiddenChars, length, iteration, separator } = config;

  validatePositiveInteger(length, "length");
  validatePositiveInteger(iteration, "iteration");

  // Create custom character set
  const customCharset = createCustomCharset(allowedChars, forbiddenChars);

  // Validate the resulting character set
  const validation = validateCharset(customCharset.charset);
  if (!validation.isValid) {
    throw new Error(`Invalid character set: ${validation.errors.join("; ")}`);
  }

  const chunks = [];
  for (let i = 0; i < iteration; i++) {
    const chunk = await generateCustomChunk(length, customCharset.charset, randomGenerator);
    chunks.push(chunk);
  }

  return chunks.join(separator);
};

/**
 * Generates a password using a template specification.
 *
 * @param {Object} config - Password configuration.
 * @param {string} config.template - Template string (e.g., "[A-Z]{3}-[0-9]{4}")
 * @param {number} config.iteration - Number of complete template iterations.
 * @param {string} config.separator - Separator between iterations.
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @returns {Promise<string>} The generated password.
 */
export const generateTemplatePassword = async (config, randomGenerator) => {
  const { template, iteration, separator } = config;

  validatePositiveInteger(iteration, "iteration");

  // Validate and parse template
  const templateValidation = validateTemplate(template);
  if (!templateValidation.isValid) {
    throw new Error(`Invalid template: ${templateValidation.errors.join("; ")}`);
  }

  const instructions = templateValidation.metadata.instructions;
  const results = [];

  for (let i = 0; i < iteration; i++) {
    const passwordPart = await generateFromTemplate(instructions, randomGenerator);
    results.push(passwordPart);
  }

  return results.join(separator);
};

/**
 * Generates a single password chunk using a custom character set.
 *
 * @param {number} length - The number of characters to generate.
 * @param {string} charset - The character set to use.
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @returns {Promise<string>} A random string of the specified length.
 */
const generateCustomChunk = async (length, charset, randomGenerator) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    const index = await randomGenerator.generateRandomInt(charset.length);
    result += charset[index];
  }
  return result;
};

/**
 * Generates a password from parsed template instructions.
 *
 * @param {Array} instructions - Parsed template instructions.
 * @param {Object} randomGenerator - RandomGeneratorPort implementation.
 * @returns {Promise<string>} Generated password segment.
 */
const generateFromTemplate = async (instructions, randomGenerator) => {
  let result = "";

  for (const instruction of instructions) {
    switch (instruction.type) {
      case TOKEN_TYPES.LITERAL:
        result += instruction.value;
        break;

      case TOKEN_TYPES.CHARACTER_SET:
        for (let i = 0; i < instruction.quantity; i++) {
          const index = await randomGenerator.generateRandomInt(instruction.charset.length);
          result += instruction.charset[index];
        }
        break;

      default:
        throw new Error(`Unsupported instruction type: ${instruction.type}`);
    }
  }

  return result;
};

/**
 * Calculates the entropy of a custom character set password configuration.
 *
 * @param {Object} config - Password configuration.
 * @param {string} config.allowedChars - Allowed characters or character set names.
 * @param {string} [config.forbiddenChars] - Characters to exclude.
 * @param {number} config.length - Length of each chunk.
 * @param {number} config.iteration - Number of chunks.
 * @returns {number} Total entropy in bits.
 */
export const calculateCustomPasswordEntropy = (config) => {
  const { allowedChars, forbiddenChars, length, iteration } = config;

  try {
    const customCharset = createCustomCharset(allowedChars, forbiddenChars);
    const bitsPerChar = customCharset.bitsPerCharacter;
    return length * iteration * bitsPerChar;
  } catch (error) {
    // Return 0 if character set cannot be created
    return 0;
  }
};

/**
 * Calculates the entropy of a template-based password configuration.
 *
 * @param {Object} config - Password configuration.
 * @param {string} config.template - Template string.
 * @param {number} config.iteration - Number of complete template iterations.
 * @returns {number} Total entropy in bits.
 */
export const calculateTemplatePasswordEntropy = (config) => {
  const { template, iteration } = config;

  try {
    const templateValidation = validateTemplate(template);
    if (!templateValidation.isValid) {
      return 0;
    }

    const entropyPerIteration = calculateTemplateEntropy(templateValidation.metadata.instructions);
    return entropyPerIteration * iteration;
  } catch (error) {
    // Return 0 if template cannot be parsed
    return 0;
  }
};