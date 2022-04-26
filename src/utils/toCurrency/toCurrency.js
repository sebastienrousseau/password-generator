/**
 * Takes a number and returns it in the specified currency formatting..
 * @param {String} str The text to be converted to kebab case.
 */

export const toCurrency = (n, curr, LanguageFormat = undefined) =>
  Intl.NumberFormat(LanguageFormat, {
    style: "currency",
    minimumFractionDigits: 2,
    currency: curr
  }).format(n);

// console.log(toCurrency(123456.789, 'EUR')); // ✔ should convert to  €123,456.79  | currency: Euro | currencyLangFormat: Local
// console.log(toCurrency(123456.789, 'RUB', 'Ru-ru')); // ✔ should convert to  123 456,79 ₽  | currency: Ruble | currencyLangFormat: Russian
// console.log(toCurrency(123456.789, 'RUB')); // ✔ should convert to  RUB 123,456.79  | currency: Ruble | currencyLangFormat: Local
// console.log(toCurrency(123456.789, 'USD', 'en-us')); // ✔ should convert to  $123,456.79  | currency: US Dollar | currencyLangFormat: English (United States)
// console.log(toCurrency(123456.789, 'USD', 'fa')); // ✔ should convert to  ۱۲۳٬۴۵۶٫۷۹ ؜$ | currency: US Dollar | currencyLangFormat: Farsi
// console.log(toCurrency(322342436423.2435, "JPY", "fi")); // ✔ should convert to  322 342 436 423 ¥ | currency: Japanese Yen | currencyLangFormat: Finnish
// console.log(toCurrency(322342436423.2435, "JPY")); // ✔ should convert to  ¥322,342,436,423 | currency: Japanese Yen | currencyLangFormat: Local
