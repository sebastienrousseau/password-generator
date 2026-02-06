// Type definitions for base64 password generator module
// Project: https://github.com/sebastienrousseau/password-generator

/**
 * Options for generating base64 passwords.
 */
export interface Base64PasswordOptions {
  /** The length of each password chunk */
  length: number;
  /** The number of password chunks */
  iteration: number;
  /** The separator between password chunks */
  separator: string;
}

/**
 * Generates a password using random Base64 characters with the specified configuration.
 *
 * Creates a password by generating a Base64 string and splitting it into chunks
 * of the specified length, then joining them with the given separator.
 *
 * @param options - Configuration options for password generation
 * @returns The generated Base64 password
 *
 * @example
 * ```typescript
 * import { generatePassword } from './base64-password.js';
 *
 * const password = generatePassword({
 *   length: 10,
 *   iteration: 2,
 *   separator: '+'
 * });
 * console.log(password); // e.g., "Kx8P2mN4qR+7sLw9Q3vY5"
 * ```
 *
 * @throws {RangeError} If length is not a positive integer
 * @throws {RangeError} If iteration is not a positive integer
 */
export declare function generatePassword(options: Base64PasswordOptions): string;

export default generatePassword;