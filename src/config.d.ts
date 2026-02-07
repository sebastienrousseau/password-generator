// Type definitions for password-generator configuration module
// Project: https://github.com/sebastienrousseau/password-generator

/**
 * Valid password types supported by the generator.
 */
export type PasswordType = 'strong' | 'base64' | 'memorable';

/**
 * Valid password types array.
 */
export declare const VALID_PASSWORD_TYPES: readonly PasswordType[];

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
 * Default values for CLI options.
 */
export declare const CLI_DEFAULTS: CLIDefaults;

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

/**
 * CLI option configurations for the commander program.
 *
 * @example
 * ```typescript
 * import { CLI_OPTIONS } from './config.js';
 *
 * console.log(CLI_OPTIONS.name); // "password-generator"
 * console.log(CLI_OPTIONS.options.type.flags); // "-t, --type <type>"
 * console.log(CLI_OPTIONS.options.length.defaultValue); // 16
 * ```
 */
export declare const CLI_OPTIONS: CLIOptionsConfig;

/**
 * Helper function to validate password type.
 *
 * @param type - The password type to validate
 * @returns True if the type is valid, false otherwise
 *
 * @example
 * ```typescript
 * import { isValidPasswordType } from './config.js';
 *
 * console.log(isValidPasswordType('strong')); // true
 * console.log(isValidPasswordType('invalid')); // false
 * ```
 */
export declare function isValidPasswordType(type: string): type is PasswordType;

/**
 * Helper function to get formatted valid types string for error messages.
 *
 * @returns Comma-separated list of valid password types
 *
 * @example
 * ```typescript
 * import { getValidTypesString } from './config.js';
 *
 * console.log(getValidTypesString()); // "strong, base64, memorable"
 * ```
 */
export declare function getValidTypesString(): string;