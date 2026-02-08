// Type definitions for string utilities module
// Project: https://github.com/sebastienrousseau/jspassgen

/**
 * Converts a given string to camel case.
 *
 * @param str - The input string to convert
 * @returns The camel-cased string
 *
 * @example
 * ```typescript
 * import { toCamelCase } from './strings.js';
 *
 * console.log(toCamelCase('hello world')); // 'helloWorld'
 * console.log(toCamelCase('foo-bar-baz')); // 'fooBarBaz'
 * console.log(toCamelCase('snake_case_string')); // 'snakeCaseString'
 * ```
 *
 * @throws {TypeError} If the input is not a string
 */
export declare function toCamelCase(str: string): string;

/**
 * Converts a string to an array of characters.
 *
 * @param str - The input string to convert
 * @returns An array of individual characters
 *
 * @example
 * ```typescript
 * import { toCharArray } from './strings.js';
 *
 * console.log(toCharArray('hello')); // ['h', 'e', 'l', 'l', 'o']
 * console.log(toCharArray('123')); // ['1', '2', '3']
 * console.log(toCharArray('')); // []
 * ```
 */
export declare function toCharArray(str: string): string[];

/**
 * Formats a number as a currency string.
 *
 * @param n - The number to format
 * @param curr - The ISO 4217 currency code
 * @param languageFormat - The BCP 47 language tag for locale formatting
 * @returns The formatted currency string
 *
 * @example
 * ```typescript
 * import { toCurrency } from './strings.js';
 *
 * console.log(toCurrency(1234.56, 'USD', 'en-US')); // '$1,234.56'
 * console.log(toCurrency(1234.56, 'EUR', 'de-DE')); // '1.234,56 €'
 * console.log(toCurrency(1234.56, 'JPY', 'ja-JP')); // '¥1,235'
 * ```
 */
export declare function toCurrency(
  n: number,
  curr: string,
  languageFormat?: string
): string;

/**
 * Converts a string to kebab case.
 *
 * @param str - The input string to convert
 * @returns The kebab-cased string
 *
 * @example
 * ```typescript
 * import { toKebabCase } from './strings.js';
 *
 * console.log(toKebabCase('HelloWorld')); // 'hello-world'
 * console.log(toKebabCase('fooBarBaz')); // 'foo-bar-baz'
 * console.log(toKebabCase('some_snake_case')); // 'some-snake-case'
 * ```
 */
export declare function toKebabCase(str: string): string;

/**
 * Converts a string to snake case.
 *
 * @param str - The input string to convert
 * @returns The snake-cased string
 *
 * @example
 * ```typescript
 * import { toSnakeCase } from './strings.js';
 *
 * console.log(toSnakeCase('HelloWorld')); // 'hello_world'
 * console.log(toSnakeCase('fooBarBaz')); // 'foo_bar_baz'
 * console.log(toSnakeCase('some-kebab-case')); // 'some_kebab_case'
 * ```
 */
export declare function toSnakeCase(str: string): string;

/**
 * Converts a string to title case.
 *
 * @param str - The input string to convert
 * @returns The title-cased string
 *
 * @example
 * ```typescript
 * import { toTitleCase } from './strings.js';
 *
 * console.log(toTitleCase('hello world')); // 'Hello World'
 * console.log(toTitleCase('fooBarBaz')); // 'Foo Bar Baz'
 * console.log(toTitleCase('snake_case_string')); // 'Snake Case String'
 * ```
 */
export declare function toTitleCase(str: string): string;