export function randomNumber(number) {
  return Math.floor(Math.random() * 2 ** 32) % number;
}
