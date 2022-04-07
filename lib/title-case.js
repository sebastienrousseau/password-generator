/*jshint esversion: 9 */
export function titleCase(str) {
  try {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
      str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
  } catch (error) {
    console.log(error);
    console.log(error.stack);
  }
}
