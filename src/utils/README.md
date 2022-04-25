# Table of Contents

-   [Utils](#utils)
    -   [Table of Contents](#table-of-contents)
        -   [toCamelCase(): string](#tocamelcase-string)
        -   [toCharArray(): string](#tochararray-string)
        -   [toKebabCase(): string](#tokebabcase-string)
        -   [toSnakeCase(): string](#tosnakecase-string)
        -   [toTitleCase(): string](#totitlecase-string)


## Utils

### toCamelCase(): string

[File: toCamelCase.js](./toCamelCase.js)

Converts all the alphabetic characters in a string to camel case.

-   Use `String.prototype.match()` to break the string into words using an appropriate regexp.
-   Use `Array.prototype.map()`, `Array.prototype.slice()`, `Array.prototype.join()`, `String.prototype.toLowerCase()` and `String.prototype.toUpperCase()` to combine them, capitalizing the first letter of each one.

```js
const toCamelCase = str => {
  const s =
    str &&
    str
      .match(
        /[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g
      )
      .map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
      .join('');
  return s.slice(0, 1).toLowerCase() + s.slice(1);
};
```

```js
toCamelCase("passwordGenerator");        // ✔ should convert a camel case string to camelcase
toCamelCase("password.generator");       // ✔ should convert a dot case string to camelcase
toCamelCase("--PASSWORD-GENERATOR--");   // ✔ should convert a junk case string to camelcase
toCamelCase("password-generator");       // ✔ should convert a kebab case string to camelcase
toCamelCase("PasswordGenerator");        // ✔ should convert a pascal case string to camelcase
toCamelCase("Password generator");       // ✔ should convert a sentence case string to camelcase
toCamelCase("password_generator");       // ✔ should convert a snake case string to camelcase
toCamelCase("password generator");       // ✔ should convert a space case string to camelcase 
toCamelCase("Password Generator");       // ✔ should convert a title case string to camelcase
toCamelCase("PASSWORD GENERATOR");       // ✔ should convert a uppercase case string to camelcase
```

### toCharArray(): string

[File: toCharArray.js](./toCharArray.js)

Converts a string to an array of characters.

-   Use the spread operator `(...)` to convert the string into an array of characters.

```js
export const toCharArray = str => [...str];
```

```js
toCharArray("passwordGenerator");      // ✔ should convert a camel case string to an array of characters
toCharArray("password.generator");     // ✔ should convert a dot case string to an array of characters
toCharArray("--PASSWORD-GENERATOR--"); // ✔ should convert a junk case string to an array of characters
toCharArray("password-generator");     // ✔ should convert a kebab case string to an array of characters
toCharArray("PasswordGenerator");      // ✔ should convert a pascal case string to an array of characters
toCharArray("Password generator");     // ✔ should convert a sentence case string to an array of characters
toCharArray("password_generator");     // ✔ should convert a snake case string to an array of characters
toCharArray("password generator");     // ✔ should convert a space case string to an array of characters
toCharArray("Password Generator");     // ✔ should convert a title case string to an array of characters
toCharArray("PASSWORD GENERATOR");     // ✔ should convert a uppercase case string to an array of characters

```

### toKebabCase(): string

[File: toKebabCase.js](./toKebabCase.js)

Converts all the alphabetic characters in a string to kebab case.

-   Use `String.prototype.match()` to break the string into words using an appropriate regexp.
-   Use `Array.prototype.map()`, `Array.prototype.join()` and `String.prototype.toLowerCase()` to combine them, adding `-` as a separator.

```js
export function toKebabCase(str) {
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join('-');
}
```

```js
console.log(toKebabCase('kebabCase')); // 'kebab-case'
console.log(toKebabCase('some text')); // 'some-text'
console.log(toKebabCase('some-mixed_string With spaces_underscores-and-hyphens')); // 'some-mixed-string-with-spaces-underscores-and-hyphens'
console.log(toKebabCase('AllThe-small Things')); // 'all-the-small-things'
console.log(toKebabCase('IAmEditingSomeXMLAndHTML')); // 'i-am-editing-some-xml-and-html'
```

### toSnakeCase(): string

[File: toSnakeCase.js](./toSnakeCase.js)

Converts all the alphabetic characters in a string to snake case.

-   Use `String.prototype.match()` to break the string into words using an appropriate regexp.
-   Use `String.prototype.replace()` and `String.prototype.toLowerCase()` to combine them, adding `_` as a separator.

```js
export function toSnakeCase(str) {
  return str
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, '')
    .replace(/([a-z])([A-Z])/g, (_, a, b) => a + '_' + b.toLowerCase())
    .replace(/[^A-Za-z0-9]+|_+/g, '_')
    .toLowerCase();
}
```

```js
console.log(toSnakeCase('snakeCase')); // 'snake-case'
console.log(toSnakeCase('some text')); // 'some-text'
console.log(toSnakeCase('some-mixed_string With spaces_underscores-and-hyphens')); // 'some-mixed-string-with-spaces-underscores-and-hyphens'
console.log(toSnakeCase('AllThe-small Things')); // 'all-the-small-things'
console.log(toSnakeCase('IAmEditingSomeXMLAndHTML')); // 'i-am-editing-some-xml-and-html'
```

### toTitleCase(): string

[File: toTitleCase.js](./toTitleCase.js)

Converts all the alphabetic characters in a string to a title case string.

-   Use `String.prototype.match()` to break the string into words using an appropriate regexp.
-   Use `Array.prototype.map()`, `Array.prototype.slice()`, `Array.prototype.join()` and `String.prototype.toUpperCase()` to combine them, capitalizing the first letter of each word and adding a whitespace between them.

```js
export const toTitleCase = (str) =>
  str
    .toLowerCase()
    .match(/[A-Z]{2,}(?=[A-Z][a-z]|\b)|[A-Z]?[a-z]+|[A-Z]|\d+/g)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1))
    .join(" ");
```

```js
toTitleCase("passwordGenerator");      // ✔ should convert a camel case string to title case
toTitleCase("password.generator");     // ✔ should convert a dot case string to title case
toTitleCase("--PASSWORD-GENERATOR--"); // ✔ should convert a junk case string to title case
toTitleCase("password-generator");     // ✔ should convert a kebab case string to title case
toTitleCase("PasswordGenerator");      // ✔ should convert a pascal case string to title case
toTitleCase("Password generator");     // ✔ should convert a sentence case string to title case
toTitleCase("password_generator");     // ✔ should convert a snake case string to title case
toTitleCase("password generator");     // ✔ should convert a space case string to title case
toTitleCase("Password Generator");     // ✔ should convert a title case string to title case
toTitleCase("PASSWORD GENERATOR");     // ✔ should convert a uppercase case string to title case
```
