/* eslint-disable node/no-unpublished-import: ["error", "always", { ".js": "never" }]*/
/*jshint esversion: 8 */

import { promises as fs } from "fs";
import { titleCase } from "./title-case.js";

// Initializing Variables
const args = process.argv.slice(2);

export async function memorablePassword() {
  // Initializing variables
  let data = await fs.readFile("./dictionaries/common.json", "utf8");
  let memorable = [];
  let random;

  // Read the JSON dictionary and store it as an array
  data = JSON.parse([data]);

  // Picking random words from the JSON dictionary
  data.entries.forEach(() => {
    random = data.entries[Math.floor(Math.random() * data.entries.length)];
    memorable.push(titleCase(random));
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
