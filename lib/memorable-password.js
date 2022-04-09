/*jshint esversion: 8 */

import {
  promises as fs
} from "fs";
import {
  titleCase
} from "./title-case.js";

export async function memorablePassword() {

  try {
    // Initializing variables
    let data = await fs.readFile('./lib/memorable-words.json', 'utf8');
    let memorable = [];
    let random;

    // Read the JSON dictionary and store it as an array
    data = JSON.parse([data]);

    // Picking random words from the JSON dictionary
    data.forEach(() => {
      random = data[parseInt(Math.random() * data.length)];
      memorable.push(titleCase(random));
      return memorable;
    });

    // Initializing a memorable password
    memorable = memorable.slice(0, args[3]).join(args[5]).toString();
    log(memorable);
  } catch (error) {
    log(error.stack);
    log(error);
  }
}
