# toCharArray(): string

[File: toCharArray.js](./toCharArray.js)

Converts a string to an array of characters.

-   Use the spread operator `(...)` to convert the string into an array of characters.

```js
export const toCharArray = (str) => [...str];
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
