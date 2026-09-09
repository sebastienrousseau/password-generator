// Type definitions for jspassgen CLI module
// Project: https://github.com/sebastienrousseau/jspassgen

/**
 * Configuration options for password generation.
 */
export interface PasswordGeneratorOptions {
  /** The type of password to generate */
  type: 'strong' | 'base64' | 'memorable';
  /** The length of each password chunk (optional, not used for memorable type) */
  length?: number;
  /** The number of password chunks or words */
  iteration: number;
  /** The separator between password chunks */
  separator: string;
}

/**
 * Generates a password of the specified type using the appropriate generator module.
 *
 * @param data - Configuration options for password generation
 * @returns A Promise that resolves to the generated password
 *
 * @example
 * ```typescript
 * import { PasswordGenerator } from './src/bin/password-generator.js';
 *
 * // Generate a strong password
 * const password = await PasswordGenerator({
 *   type: 'strong',
 *   length: 16,
 *   iteration: 3,
 *   separator: '-'
 * });
 * console.log(password); // e.g., "Kx8P2mN4qR7s-Lw9Q3vY5hB1-Mp6Z8aT"
 * ```
 *
 * @throws {Error} When password type is not provided
 * @throws {Error} When password type is not supported
 * @throws {RangeError} When length or iteration parameters are not positive integers
 */
export declare function PasswordGenerator(data: PasswordGeneratorOptions): Promise<string>;