// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure generator for template-based passwords using regex-like syntax.
 * Supports patterns like [A-Z]{3}-[0-9]{4}-[special]{1}.
 * All randomness is provided through the injected random generator port.
 *
 * @module generators/template
 */

import { parseTemplate, validateTemplate, calculateTemplateEntropy, TOKEN_TYPES } from "../domain/template.js";
import { validatePositiveInteger } from "../domain/base64-generation.js";

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

/**
 * Validates a template string and returns validation result.
 * Convenience function that wraps the domain validation.
 *
 * @param {string} template - Template string to validate.
 * @returns {Object} Validation result with isValid, errors, and metadata.
 */
export const validateTemplateFormat = (template) => {
  return validateTemplate(template);
};

/**
 * Parses a template string into generation instructions.
 * Convenience function that wraps the domain parser.
 *
 * @param {string} template - Template string to parse.
 * @returns {Array} Array of template instructions.
 */
export const parseTemplateFormat = (template) => {
  return parseTemplate(template);
};