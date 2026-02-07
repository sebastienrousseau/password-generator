// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Pure domain logic for password template parsing and validation.
 * Supports regex-like templates such as [A-Z]{3}-[0-9]{4}-[special]{1}
 *
 * @module template
 */

import { CHARACTER_SET_METADATA, createCustomCharset } from './charset.js';

/**
 * Template token types for parsing
 */
export const TOKEN_TYPES = {
  LITERAL: 'literal',
  CHARACTER_SET: 'character_set',
  CUSTOM_SET: 'custom_set',
  QUANTITY: 'quantity',
};

/**
 * Parses a password template string into a list of generation instructions.
 *
 * @param {string} template - Template string (e.g., "[A-Z]{3}-[0-9]{4}-[special]{1}")
 * @returns {Array} Array of template instructions
 * @throws {Error} If template syntax is invalid
 */
export const parseTemplate = (template) => {
  if (!template || typeof template !== 'string') {
    throw new Error('Template must be a non-empty string');
  }

  const instructions = [];
  let i = 0;

  while (i < template.length) {
    if (template[i] === '[') {
      // Parse character set definition
      const { instruction, nextIndex } = parseCharacterSetInstruction(template, i);
      instructions.push(instruction);
      i = nextIndex;
    } else {
      // Parse literal character(s)
      const { instruction, nextIndex } = parseLiteralInstruction(template, i);
      instructions.push(instruction);
      i = nextIndex;
    }
  }

  if (instructions.length === 0) {
    throw new Error('Template cannot be empty');
  }

  return instructions;
};

/**
 * Parses a character set instruction like [A-Z]{3} or [special]{1}
 *
 * @param {string} template - Full template string
 * @param {number} startIndex - Starting index of the character set
 * @returns {Object} Parsed instruction and next index
 */
const parseCharacterSetInstruction = (template, startIndex) => {
  const closeBracket = template.indexOf(']', startIndex);
  if (closeBracket === -1) {
    throw new Error(`Unmatched '[' at position ${startIndex}`);
  }

  const charSetDef = template.slice(startIndex + 1, closeBracket);
  if (!charSetDef) {
    throw new Error(`Empty character set at position ${startIndex}`);
  }

  // Parse quantity specification
  let nextIndex = closeBracket + 1;
  let quantity = 1;

  if (nextIndex < template.length && template[nextIndex] === '{') {
    const { parsedQuantity, endIndex } = parseQuantity(template, nextIndex);
    quantity = parsedQuantity;
    nextIndex = endIndex;
  }

  // Determine character set type and create instruction
  const charset = resolveCharacterSet(charSetDef);

  return {
    instruction: {
      type: TOKEN_TYPES.CHARACTER_SET,
      charset: charset.charset,
      quantity,
      entropy: charset.bitsPerCharacter * quantity,
      description: charset.description,
    },
    nextIndex,
  };
};

/**
 * Parses a literal instruction (non-bracketed characters)
 *
 * @param {string} template - Full template string
 * @param {number} startIndex - Starting index of the literal
 * @returns {Object} Parsed instruction and next index
 */
const parseLiteralInstruction = (template, startIndex) => {
  let endIndex = startIndex;

  // Find the end of literal characters (stop at '[' or end of string)
  while (endIndex < template.length && template[endIndex] !== '[') {
    endIndex++;
  }

  const literal = template.slice(startIndex, endIndex);
  if (!literal) {
    throw new Error(`Empty literal at position ${startIndex}`);
  }

  return {
    instruction: {
      type: TOKEN_TYPES.LITERAL,
      value: literal,
      quantity: literal.length,
      entropy: 0, // Literal characters contribute no entropy
      description: `Literal: "${literal}"`,
    },
    nextIndex: endIndex,
  };
};

/**
 * Parses a quantity specification like {3} or {1,5}
 *
 * @param {string} template - Full template string
 * @param {number} startIndex - Starting index of the quantity spec
 * @returns {Object} Parsed quantity and next index
 */
const parseQuantity = (template, startIndex) => {
  const closeBrace = template.indexOf('}', startIndex);
  if (closeBrace === -1) {
    throw new Error(`Unmatched '{' at position ${startIndex}`);
  }

  const quantityDef = template.slice(startIndex + 1, closeBrace);
  if (!quantityDef) {
    throw new Error(`Empty quantity specification at position ${startIndex}`);
  }

  // Handle range quantities like {1,5} (future enhancement)
  if (quantityDef.includes(',')) {
    throw new Error(`Range quantities not yet supported: {${quantityDef}}`);
  }

  const quantity = parseInt(quantityDef, 10);
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error(`Invalid quantity: ${quantityDef}. Must be a positive integer.`);
  }

  if (quantity > 1000) {
    throw new Error(`Quantity too large: ${quantity}. Maximum allowed: 1000.`);
  }

  return {
    parsedQuantity: quantity,
    endIndex: closeBrace + 1,
  };
};

/**
 * Resolves a character set definition to actual characters.
 * Supports predefined sets, ranges, and literal characters.
 *
 * @param {string} charSetDef - Character set definition (e.g., "A-Z", "special", "abc123")
 * @returns {Object} Character set metadata
 */
const resolveCharacterSet = (charSetDef) => {
  // Handle predefined character sets
  const upperDef = charSetDef.toUpperCase();
  if (CHARACTER_SET_METADATA[upperDef]) {
    return CHARACTER_SET_METADATA[upperDef];
  }

  // Handle common aliases
  const aliases = {
    ALPHA: 'UPPERCASE,LOWERCASE',
    ALPHANUMERIC: 'UPPERCASE,LOWERCASE,DIGITS',
    HEX: 'HEX_UPPERCASE',
    HEXADECIMAL: 'HEX_UPPERCASE',
  };

  if (aliases[upperDef]) {
    return createCustomCharset(aliases[upperDef]);
  }

  // Handle character ranges (e.g., "A-Z", "0-9")
  const rangeMatch = charSetDef.match(/^([A-Za-z0-9])-([A-Za-z0-9])$/);
  if (rangeMatch) {
    const [, start, end] = rangeMatch;
    const startCode = start.charCodeAt(0);
    const endCode = end.charCodeAt(0);

    if (startCode > endCode) {
      throw new Error(
        `Invalid range: ${charSetDef}. Start character must come before end character.`
      );
    }

    let rangeChars = '';
    for (let code = startCode; code <= endCode; code++) {
      rangeChars += String.fromCharCode(code);
    }

    return {
      charset: rangeChars,
      size: rangeChars.length,
      bitsPerCharacter: Math.log2(rangeChars.length),
      description: `Range ${charSetDef} (${rangeChars.length} characters)`,
    };
  }

  // Handle literal character set
  if (charSetDef.length > 0) {
    const uniqueChars = [...new Set(charSetDef)];
    const charset = uniqueChars.join('');

    return {
      charset,
      size: charset.length,
      bitsPerCharacter: Math.log2(charset.length),
      description: `Literal set "${charset}" (${charset.length} characters)`,
    };
  }

  throw new Error(`Unrecognized character set: ${charSetDef}`);
};

/**
 * Validates a template string for syntax and security.
 *
 * @param {string} template - Template string to validate
 * @returns {Object} Validation result with isValid boolean, errors array, and metadata
 */
export const validateTemplate = (template) => {
  const errors = [];

  try {
    const instructions = parseTemplate(template);

    // Calculate total entropy and character count
    let totalEntropy = 0;
    let totalLength = 0;
    let hasRandomContent = false;

    for (const instruction of instructions) {
      totalEntropy += instruction.entropy || 0;
      totalLength += instruction.quantity || 0;

      if (instruction.type === TOKEN_TYPES.CHARACTER_SET) {
        hasRandomContent = true;
      }
    }

    // Security validations
    if (!hasRandomContent) {
      errors.push('Template must contain at least one random character set [...]');
    }

    if (totalLength > 1000) {
      errors.push(
        `Template generates passwords that are too long: ${totalLength} characters (max: 1000)`
      );
    }

    if (totalEntropy < 20) {
      errors.push(
        `Template provides insufficient entropy: ${totalEntropy.toFixed(1)} bits (minimum: 20 bits)`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      metadata: {
        instructions,
        totalEntropy,
        totalLength,
        hasRandomContent,
      },
    };
  } catch (error) {
    errors.push(`Template syntax error: ${error.message}`);
    return {
      isValid: false,
      errors,
      metadata: null,
    };
  }
};

/**
 * Calculates the entropy of a parsed template.
 *
 * @param {Array} instructions - Parsed template instructions
 * @returns {number} Total entropy in bits
 */
export const calculateTemplateEntropy = (instructions) => {
  return instructions.reduce((total, instruction) => total + (instruction.entropy || 0), 0);
};
