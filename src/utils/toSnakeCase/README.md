
# toSnakeCase(): string

[File: toSnakeCase.js](../toSnakeCase/toSnakeCase.js)

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
