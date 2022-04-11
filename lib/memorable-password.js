/* eslint-disable node/no-unpublished-import */
/*jshint esversion: 8 */

import { promises as fs } from "fs";
import { randomNumber } from "../utils/randomNumber.js";
import { titleCase } from "../utils/titleCase.js";

// Initializing Variables
const args = process.argv.slice(2);
let data, memorable = [];

export async function memorablePassword() {
  // Initializing variables
  data = await fs.readFile("./dictionaries/common.json", "utf8");

  // Read the JSON dictionary and store it as an array
  data = JSON.parse(data);

  // Picking random words from the JSON dictionary based on the data length
  data.entries.forEach(() => {
    memorable.push(titleCase(data.entries[randomNumber(data.entries.length)]));
    return memorable;
  });

  // Initializing a memorable password
  memorable = memorable
    .slice(0, args[3])
    .join(args[5])
    .toString()
    .replace(/ /g, "");
  console.log(memorable);
}
