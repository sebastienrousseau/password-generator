# toTitleCase(): string

[File: toTitleCase.js](../toTitleCase/toTitleCase.js)

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
