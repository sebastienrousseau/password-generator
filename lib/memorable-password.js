/*jshint esversion: 9 */

import { promises as fs } from "fs";
import { titleCase } from "./title-case.js";

export async function memorablePassword(result, memorable) {

  try {
    let args = process.argv.slice(2);
    let data = await fs.readFile('./lib/memorable-words.json', 'utf8');
    let memorable = [];
    let random;

    // Read and create an array
    data = JSON.parse([data]);

    // Generate random values
    data.forEach(() => {
      random = data[parseInt(Math.random() * data.length)];
      memorable.push(titleCase(random));
      return memorable;
    });

    memorable = memorable.slice(0, args[0]).join(args[1]).toString();
    console.log(memorable);
  } catch (error) {
    console.log(error);
    console.log(error.stack);
  }
}
