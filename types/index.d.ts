// Type definitions for @sebastienrousseau/jspassgen (JavaScript Password Generator)
// Project: https://github.com/sebastienrousseau/jspassgen
// Definitions by: Claude Sonnet 4 <noreply@anthropic.com>
// TypeScript Version: 4.0+

/**
 * Centralized type definitions aggregating all password-generator modules.
 *
 * This file consolidates TypeScript definitions from across the codebase
 * to provide a single import point for all types and interfaces.
 *
 * @packageDocumentation
 */

// === Core JavaScript Password Generator (jspassgen) Types ===

/**
 * Valid password types supported by the generator.
 */
export type PasswordType = 'strong' | 'base64' | 'memorable';

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
  type: PasswordType;
  /** The length of each password chunk (not applicable for memorable type) */
  length?: number;
  /** The number of password chunks or words */
  iteration: number;
  /** The separator between password chunks */
  separator: string;
}

// === Library-Specific Types ===

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
 * Options for generating base64-encoded passwords.
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
 * Options for generating memorable passwords.
 */
export interface MemorablePasswordOptions {
  /** The number of words to generate */
  iteration: number;
  /** The separator between words */
  separator: string;
}

// === CLI Configuration Types ===

/**
 * Default values for CLI options.
 */
export interface CLIDefaults {
  /** Default length for password chunks (applies to strong and base64 types) */
  readonly length: number;
  /** Default number of password chunks or words */
  readonly iteration: number;
  /** Default separator between password chunks */
  readonly separator: string;
  /** Default clipboard option state */
  readonly clipboard: boolean;
}

/**
 * CLI option configuration for a single option.
 */
export interface CLIOption {
  /** Command line flags for the option */
  readonly flags: string;
  /** Description of the option */
  readonly description: string;
  /** Whether the option is required */
  readonly required?: boolean;
  /** Parser function for the option value */
  readonly parser?: (value: string) => any;
  /** Default value for the option */
  readonly defaultValue?: any;
}

/**
 * Complete CLI options configuration.
 */
export interface CLIOptionsConfig {
  /** Program name */
  readonly name: string;
  /** Program description */
  readonly description: string;
  /** Available CLI options */
  readonly options: {
    readonly type: CLIOption;
    readonly length: CLIOption;
    readonly iteration: CLIOption;
    readonly separator: CLIOption;
    readonly clipboard: CLIOption;
  };
}

// === Utility Types ===

/**
 * Random number generation options.
 */
export interface RandomNumberOptions {
  /** Minimum value (inclusive) */
  min: number;
  /** Maximum value (inclusive) */
  max: number;
}

/**
 * Cryptographic utility functions return type.
 */
export interface CryptoUtils {
  /** Generate cryptographically secure random integers */
  randomInt: (min: number, max: number) => number;
  /** Generate random bytes */
  randomBytes: (size: number) => Buffer;
}

// === Function Signatures ===

/**
 * Main password generator function.
 *
 * @param data - Configuration options for password generation
 * @returns A Promise that resolves to the generated password
 *
 * @example
 * ```typescript
 * // Generate a strong password
 * const password = await PasswordGenerator({
 *   type: 'strong',
 *   length: 16,
 *   iteration: 3,
 *   separator: '-'
 * });
 * ```
 */
export declare function PasswordGenerator(data: PasswordGeneratorOptions): Promise<string>;

/**
 * Generate a strong password.
 *
 * @param options - Strong password generation options
 * @returns The generated strong password
 */
export declare function generateStrongPassword(options: StrongPasswordOptions): string;

/**
 * Generate a base64 password.
 *
 * @param options - Base64 password generation options
 * @returns The generated base64 password
 */
export declare function generateBase64Password(options: Base64PasswordOptions): string;

/**
 * Generate a memorable password.
 *
 * @param options - Memorable password generation options
 * @returns The generated memorable password
 */
export declare function generateMemorablePassword(options: MemorablePasswordOptions): string;

/**
 * Validate password type.
 *
 * @param type - The password type to validate
 * @returns True if the type is valid
 */
export declare function isValidPasswordType(type: string): type is PasswordType;

/**
 * Get formatted valid types string for error messages.
 *
 * @returns Comma-separated list of valid password types
 */
export declare function getValidTypesString(): string;

// === Constants ===

/**
 * Array of valid password types.
 */
export declare const VALID_PASSWORD_TYPES: readonly PasswordType[];

/**
 * Default CLI configuration values.
 */
export declare const CLI_DEFAULTS: CLIDefaults;

/**
 * CLI option configurations for the commander program.
 */
export declare const CLI_OPTIONS: CLIOptionsConfig;

// === Re-exports from main module ===
export { PasswordGenerator as default };

// === Preset Types for Common Use Cases ===

/**
 * Preset configuration for generating strong passwords.
 */
export interface StrongPasswordPreset {
  type: 'strong';
  length: 16;
  iteration: 3;
  separator: '-';
}

/**
 * Preset configuration for generating memorable passwords.
 */
export interface MemorablePasswordPreset {
  type: 'memorable';
  iteration: 4;
  separator: '-';
}

/**
 * Preset configuration for generating base64 passwords.
 */
export interface Base64PasswordPreset {
  type: 'base64';
  length: 12;
  iteration: 2;
  separator: '+';
}

/**
 * Union type of all preset configurations.
 */
export type PasswordPreset = StrongPasswordPreset | MemorablePasswordPreset | Base64PasswordPreset;

/**
 * Helper type to extract options by password type.
 */
export type OptionsForType<T extends PasswordType> =
  T extends 'strong' ? StrongPasswordOptions :
  T extends 'base64' ? Base64PasswordOptions :
  T extends 'memorable' ? MemorablePasswordOptions :
  never;