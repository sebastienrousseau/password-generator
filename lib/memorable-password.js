/*jshint esversion: 9 */

import {
  promises as fs
} from "fs";
import {
  titleCase
} from "./title-case.js";

const log = (arg) => console.log(arg);
export async function memorablePassword() {

  try {

    let args = process.argv.slice(2);
    let data = await fs.readFile('./lib/memorable-words.json', 'utf8');
    let memorable = [];
    let random;

    // Read JSON and create an array
    data = JSON.parse([data]);

    // Generating random values from JSON dictionary
    data.forEach(() => {
      random = data[parseInt(Math.random() * data.length)];
      memorable.push(titleCase(random));
      return memorable;
    });

    // Creating memorable password
    memorable = memorable.slice(0, args[0]).join(args[1]).toString();
    log(memorable);
  } catch (error) {
    log(error.stack);
    log(error);
  }
}
