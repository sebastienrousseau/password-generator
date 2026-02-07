// Type definitions for crypto utilities module
// Project: https://github.com/sebastienrousseau/password-generator

/**
 * Validates that a value is a positive integer, throwing a RangeError if not.
 *
 * @param value - The value to validate
 * @param name - The parameter name for the error message
 *
 * @example
 * ```typescript
 * import { validatePositiveInteger } from './crypto.js';
 *
 * validatePositiveInteger(5, 'length'); // OK
 * validatePositiveInteger(-1, 'length'); // Throws RangeError
 * validatePositiveInteger(0, 'length'); // Throws RangeError
 * validatePositiveInteger(3.14, 'length'); // Throws RangeError
 * ```
 *
 * @throws {RangeError} If value is not a positive integer
 */
export declare function validatePositiveInteger(value: any, name: string): void;

/**
 * Generates a random base64 string of the specified byte length.
 *
 * @param byteLength - The number of random bytes to generate
 * @returns The generated base64 string
 *
 * @example
 * ```typescript
 * import { generateRandomBase64 } from './crypto.js';
 *
 * const base64String = generateRandomBase64(16);
 * console.log(base64String); // e.g., "Kx8P2mN4qR7sLw9Q3vY5hB1Mp6Z8aT=="
 * ```
 *
 * @throws {RangeError} If byteLength is not a positive integer
 */
export declare function generateRandomBase64(byteLength: number): string;

/**
 * Generates a random string of the exact character length using uniform
 * selection from the base64 character set. Each character is independently
 * chosen via crypto.randomInt() to avoid the bias introduced by slicing
 * base64-encoded byte strings.
 *
 * @param length - The desired character length of the output
 * @returns A random string of exactly `length` characters
 *
 * @example
 * ```typescript
 * import { generateBase64Chunk } from './crypto.js';
 *
 * const chunk = generateBase64Chunk(12);
 * console.log(chunk); // e.g., "Kx8P2mN4qR7s" (exactly 12 characters)
 * console.log(chunk.length); // 12
 * ```
 *
 * @throws {RangeError} If length is not a positive integer
 */
export declare function generateBase64Chunk(length: number): string;

/**
 * Splits a string into substrings of the specified length.
 *
 * @param str - The string to split
 * @param length - The length of each substring
 * @returns The array of substrings
 *
 * @example
 * ```typescript
 * import { splitString } from './crypto.js';
 *
 * const parts = splitString('abcdefghij', 3);
 * console.log(parts); // ['abc', 'def', 'ghi', 'j']
 *
 * const evenParts = splitString('abcdefgh', 4);
 * console.log(evenParts); // ['abcd', 'efgh']
 * ```
 *
 * @throws {RangeError} If length is not a positive integer
 */
export declare function splitString(str: string, length: number): string[];