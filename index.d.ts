// Type definitions for @aspect/jspassgen (JavaScript Password Generator)
// Project: https://github.com/sebastienrousseau/jspassgen
// Definitions by: Claude Sonnet 4 <noreply@anthropic.com>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/**
 * Configuration options for password generation.
 *
 * @example
 * ```typescript
 * const options: PasswordGeneratorOptions = {
 *   type: 'strong',
 *   length: 16,
 *   iteration: 3,
 *   separator: '-'
 * };
 * ```
 */
export interface PasswordGeneratorOptions {
  /** The type of password to generate */
  type: "strong" | "base64" | "memorable";
  /** The length of each password chunk (not applicable for memorable type) */
  length?: number;
  /** The number of password chunks or words */
  iteration: number;
  /** The separator between password chunks */
  separator: string;
}

/**
 * Generates a password of the specified type using the appropriate generator module.
 *
 * @param options - Configuration options for password generation
 * @returns A Promise that resolves to the generated password
 *
 * @example
 * ```typescript
 * // Generate a strong password
 * const strongPassword = await PasswordGenerator({
 *   type: 'strong',
 *   length: 16,
 *   iteration: 3,
 *   separator: '-'
 * });
 *
 * // Generate a memorable password
 * const memorablePassword = await PasswordGenerator({
 *   type: 'memorable',
 *   iteration: 4,
 *   separator: '-'
 * });
 *
 * // Generate a base64 password
 * const base64Password = await PasswordGenerator({
 *   type: 'base64',
 *   length: 12,
 *   iteration: 2,
 *   separator: '+'
 * });
 * ```
 *
 * @throws {Error} When password type is not provided or is invalid
 * @throws {RangeError} When length or iteration parameters are not positive integers
 */
export declare function PasswordGenerator(
  options: PasswordGeneratorOptions,
): Promise<string>;

export default PasswordGenerator;
