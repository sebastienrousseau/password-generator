# toCamelCase(): string

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
