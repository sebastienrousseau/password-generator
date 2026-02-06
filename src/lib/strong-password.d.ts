// Type definitions for strong password generator module
// Project: https://github.com/sebastienrousseau/password-generator

/**
 * Options for generating strong passwords.
 */
export interface StrongPasswordOptions {
  /** The length of each password chunk */
  length: number;
  /** The number of password chunks */
  iteration: number;
  /** The separator between password chunks */
  separator: string;
}

/**
 * Generates a strong password based on the provided options.
 *
 * Creates a password consisting of multiple chunks of Base64-like characters,
 * each chunk of the specified length, separated by the given separator.
 *
 * @param options - Configuration options for password generation
 * @returns The generated strong password
 *
 * @example
 * ```typescript
 * import { generatePassword } from './strong-password.js';
 *
 * const password = generatePassword({
 *   length: 8,
 *   iteration: 3,
 *   separator: '-'
 * });
 * console.log(password); // e.g., "Kx8P2mN4-qR7sLw9Q-3vY5hB1"
 * ```
 *
 * @throws {RangeError} If length is not a positive integer
 * @throws {RangeError} If iteration is not a positive integer
 */
export declare function generatePassword(options: StrongPasswordOptions): string;

export default generatePassword;