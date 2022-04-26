import { randomNumber } from "../utils/randomNumber.js";
import { readFile } from "fs/promises";
import { toTitleCase } from "../utils/toTitleCase/toTitleCase.js";

// Initializing Variables
const args = process.argv.slice(2);
const data = JSON.parse(
  await readFile(new URL("../dictionaries/common.json", import.meta.url))
);
let memorable = [];

const memorablePassword = async() => {
  // Picking random words from the JSON dictionary based on the data length
  data.entries.forEach(() => {
    memorable.push(
      toTitleCase(data.entries[randomNumber(data.entries.length)])
    );
  });
  // Initializing a memorable password
  memorable = memorable
    .slice(0, args[3])
    .join(args[5])
    .toString()
    .replace(/ /g, "");
  console.log(memorable);
  return memorable;
};
export default memorablePassword();
