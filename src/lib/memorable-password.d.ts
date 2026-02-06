// Type definitions for memorable password generator module
// Project: https://github.com/sebastienrousseau/password-generator

/**
 * Options for generating memorable passwords.
 */
export interface MemorablePasswordOptions {
  /** The number of words to use */
  iteration: number;
  /** The separator between words */
  separator: string;
}

/**
 * Dictionary structure loaded from JSON file.
 */
export interface Dictionary {
  /** Array of dictionary entries/words */
  entries: string[];
}

/**
 * Generate a memorable password using random words from a dictionary.
 *
 * Creates a password by selecting random words from a built-in dictionary,
 * converting them to title case, and joining them with the specified separator.
 * Spaces within words are removed from the final password.
 *
 * @param options - Configuration options for password generation
 * @returns A Promise that resolves to the generated memorable password
 *
 * @example
 * ```typescript
 * import { generatePassword } from './memorable-password.js';
 *
 * const password = await generatePassword({
 *   iteration: 4,
 *   separator: '-'
 * });
 * console.log(password); // e.g., "Apple-Mountain-Ocean-Tiger"
 * ```
 *
 * @throws {RangeError} If iteration is not a positive integer
 * @throws {Error} If the dictionary file cannot be loaded
 */
export declare function generatePassword(options: MemorablePasswordOptions): Promise<string>;

export default generatePassword;