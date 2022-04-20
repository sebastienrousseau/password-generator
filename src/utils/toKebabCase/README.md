
# toKebabCase(): string

[File: toKebabCase.js](../toKebabCase/toKebabCase.js)

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
toKebabCase("passwordGenerator");      // ✔ should convert a camel case string to kebab case
toKebabCase("password.generator");     // ✔ should convert a dot case string to kebab case
toKebabCase("--PASSWORD-GENERATOR--"); // ✔ should convert a junk case string to kebab case
toKebabCase("password-generator");     // ✔ should convert a kebab case string to kebab case
toKebabCase("PasswordGenerator");      // ✔ should convert a pascal case string to kebab case
toKebabCase("Password generator");     // ✔ should convert a sentence case string to kebab case
toKebabCase("password_generator");     // ✔ should convert a snake case string to kebab case
toKebabCase("password generator");     // ✔ should convert a space case string to kebab case
toKebabCase("Password Generator");     // ✔ should convert a title case string to kebab case
toKebabCase("PASSWORD GENERATOR");     // ✔ should convert a uppercase case string to kebab case
```

