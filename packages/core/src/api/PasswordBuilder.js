// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Fluent builder API for password generation.
 * This provides a more intuitive interface around the core service.
 *
 * @module PasswordBuilder
 */

import { createCustomCharset } from '../domain/charset.js';
import { PASSWORD_TYPES } from '../domain/password-types.js';

/**
 * Fluent builder for creating passwords with method chaining.
 * Provides an intuitive API like .length(16).includeSymbols().excludeSimilar().generate()
 */
export class PasswordBuilder {
  constructor(service) {
    this.service = service;
    this.config = {
      type: PASSWORD_TYPES.STRONG, // Default to strong passwords
      length: 16,
      iteration: 1,
      separator: '-',
    };
    this.allowedChars = '';
    this.forbiddenChars = '';
  }

  /**
   * Set the password length
   * @param {number} length - Password length
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  length(length) {
    this.config.length = length;
    return this;
  }

  /**
   * Set the password type
   * @param {string} type - Password type (strong, base64, memorable, etc.)
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  type(type) {
    this.config.type = type;
    return this;
  }

  /**
   * Set the number of iterations (chunks/words)
   * @param {number} count - Number of iterations
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  iterations(count) {
    this.config.iteration = count;
    return this;
  }

  /**
   * Set the separator between chunks/words
   * @param {string} separator - Separator string
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  separator(separator) {
    this.config.separator = separator;
    return this;
  }

  /**
   * Include uppercase letters
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  includeUppercase() {
    if (!this.allowedChars.includes('UPPERCASE')) {
      this.allowedChars += this.allowedChars ? ',UPPERCASE' : 'UPPERCASE';
    }
    this.config.type = PASSWORD_TYPES.CUSTOM;
    return this;
  }

  /**
   * Include lowercase letters
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  includeLowercase() {
    if (!this.allowedChars.includes('LOWERCASE')) {
      this.allowedChars += this.allowedChars ? ',LOWERCASE' : 'LOWERCASE';
    }
    this.config.type = PASSWORD_TYPES.CUSTOM;
    return this;
  }

  /**
   * Include digits
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  includeDigits() {
    if (!this.allowedChars.includes('DIGITS')) {
      this.allowedChars += this.allowedChars ? ',DIGITS' : 'DIGITS';
    }
    this.config.type = PASSWORD_TYPES.CUSTOM;
    return this;
  }

  /**
   * Include symbols/special characters
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  includeSymbols() {
    if (!this.allowedChars.includes('SPECIAL')) {
      this.allowedChars += this.allowedChars ? ',SPECIAL' : 'SPECIAL';
    }
    this.config.type = PASSWORD_TYPES.CUSTOM;
    return this;
  }

  /**
   * Exclude similar-looking characters (0, O, l, 1, etc.)
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  excludeSimilar() {
    const similarChars = "0O1lI|`'";
    this.forbiddenChars += similarChars;
    this.config.type = PASSWORD_TYPES.CUSTOM;
    return this;
  }

  /**
   * Exclude specific characters
   * @param {string} chars - Characters to exclude
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  exclude(chars) {
    this.forbiddenChars += chars;
    this.config.type = PASSWORD_TYPES.CUSTOM;
    return this;
  }

  /**
   * Include specific characters
   * @param {string} chars - Characters to include
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  include(chars) {
    this.allowedChars += this.allowedChars ? ',' + chars : chars;
    this.config.type = PASSWORD_TYPES.CUSTOM;
    return this;
  }

  /**
   * Use base64 character set
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  useBase64() {
    this.config.type = PASSWORD_TYPES.BASE64;
    return this;
  }

  /**
   * Generate memorable/passphrase style passwords
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  memorable() {
    this.config.type = PASSWORD_TYPES.MEMORABLE;
    return this;
  }

  /**
   * Generate quantum-resistant passwords
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  quantumResistant() {
    this.config.type = PASSWORD_TYPES.QUANTUM;
    return this;
  }

  /**
   * Generate honeywords (decoy passwords)
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  honeywords() {
    this.config.type = PASSWORD_TYPES.HONEYWORD;
    return this;
  }

  /**
   * Generate pronounceable passwords
   * @returns {PasswordBuilder} Builder instance for chaining
   */
  pronounceable() {
    this.config.type = PASSWORD_TYPES.PRONOUNCEABLE;
    return this;
  }

  /**
   * Build the configuration object for the service
   * @returns {Object} Configuration object
   */
  build() {
    let finalConfig = { ...this.config };

    // If using custom type and have character set constraints, build custom charset
    if (finalConfig.type === PASSWORD_TYPES.CUSTOM && (this.allowedChars || this.forbiddenChars)) {
      try {
        const charsetMeta = createCustomCharset(
          this.allowedChars || 'UPPERCASE,LOWERCASE,DIGITS,SPECIAL',
          this.forbiddenChars
        );
        finalConfig.charset = charsetMeta.charset;
      } catch (error) {
        throw new Error(`Failed to create custom character set: ${error.message}`);
      }
    }

    return finalConfig;
  }

  /**
   * Generate the password using the configured options
   * @returns {Promise<string>} Generated password
   */
  async generate() {
    const config = this.build();
    return await this.service.generate(config);
  }

  /**
   * Generate multiple passwords with the same configuration
   * @param {number} count - Number of passwords to generate
   * @returns {Promise<string[]>} Array of generated passwords
   */
  async generateMultiple(count) {
    const config = this.build();
    const optionsArray = Array(count).fill(config);
    return await this.service.generateMultiple(optionsArray);
  }

  /**
   * Calculate entropy for the current configuration
   * @returns {Object} Entropy information
   */
  calculateEntropy() {
    const config = this.build();
    return this.service.calculateEntropy(config);
  }

  /**
   * Validate the current configuration
   * @returns {Object} Validation result
   */
  validate() {
    const config = this.build();
    return this.service.validateConfig(config);
  }

  /**
   * Clone the builder to create variations
   * @returns {PasswordBuilder} New builder instance with same configuration
   */
  clone() {
    const newBuilder = new PasswordBuilder(this.service);
    newBuilder.config = { ...this.config };
    newBuilder.allowedChars = this.allowedChars;
    newBuilder.forbiddenChars = this.forbiddenChars;
    return newBuilder;
  }
}

/**
 * Create a new PasswordBuilder instance
 * @param {Object} service - Password generation service
 * @returns {PasswordBuilder} New builder instance
 */
export function createPasswordBuilder(service) {
  return new PasswordBuilder(service);
}

/**
 * Shorthand factory function with common presets
 */
export const PasswordPresets = {
  /**
   * Strong password with all character types, excluding similar chars
   * @param {Object} service - Password generation service
   * @returns {PasswordBuilder} Configured builder
   */
  secure(service) {
    return new PasswordBuilder(service)
      .includeUppercase()
      .includeLowercase()
      .includeDigits()
      .includeSymbols()
      .excludeSimilar()
      .length(16);
  },
  /** Simple alphanumeric password */
  simple(service) {
    return new PasswordBuilder(service)
      .includeUppercase()
      .includeLowercase()
      .includeDigits()
      .length(12);
  },
  /** PIN-style numeric password */
  pin(service) {
    return new PasswordBuilder(service).includeDigits().length(6);
  },
  /** Passphrase with multiple words */
  passphrase(service) {
    return new PasswordBuilder(service).memorable().iterations(4).separator('-');
  },
  /** Maximum security quantum-resistant password */
  maxSecurity(service) {
    return new PasswordBuilder(service).quantumResistant().length(64);
  },
};
