
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
console.log(toKebabCase('kebabCase')); // 'kebab-case'
console.log(toKebabCase('some text')); // 'some-text'
console.log(toKebabCase('some-mixed_string With spaces_underscores-and-hyphens')); // 'some-mixed-string-with-spaces-underscores-and-hyphens'
console.log(toKebabCase('AllThe-small Things')); // 'all-the-small-things'
console.log(toKebabCase('IAmEditingSomeXMLAndHTML')); // 'i-am-editing-some-xml-and-html'
```

