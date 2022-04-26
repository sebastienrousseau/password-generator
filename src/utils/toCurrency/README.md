# toCurrency(): string

[File: toCurrency.js](./toCurrency.js)

Takes a number and returns it in the specified currency formatting.

-   Use `Intl.NumberFormat` to enable country / currency sensitive formatting.

```js
export const toCurrency = (n, curr, LanguageFormat = undefined) =>
  Intl.NumberFormat(LanguageFormat, {
    style: "currency",
    minimumFractionDigits: 2,
    currency: curr
  }).format(n);
```

```js
toCurrency(123456.789, 'EUR'); 
// ✔ should convert to  €123,456.79  | currency: Euro | currencyLangFormat: Local
toCurrency(123456.789, 'RUB', 'Ru-ru'); 
// ✔ should convert to  123 456,79 ₽  | currency: Ruble | currencyLangFormat: Russian
toCurrency(123456.789, 'RUB'); 
// ✔ should convert to  RUB 123,456.79  | currency: Ruble | currencyLangFormat: Local
toCurrency(123456.789, 'USD', 'en-us'); 
// ✔ should convert to  $123,456.79  | currency: US Dollar | currencyLangFormat: English (United States)
toCurrency(123456.789, 'USD', 'fa'); 
// ✔ should convert to  ۱۲۳٬۴۵۶٫۷۹ ؜$ | currency: US Dollar | currencyLangFormat: Farsi
toCurrency(322342436423.2435, "JPY", "fi"); 
// ✔ should convert to  322 342 436 423 ¥ | currency: Japanese Yen | currencyLangFormat: Finnish
toCurrency(322342436423.2435, "JPY"); 
// ✔ should convert to  ¥322,342,436,423 | currency: Japanese Yen | currencyLangFormat: Local
```
