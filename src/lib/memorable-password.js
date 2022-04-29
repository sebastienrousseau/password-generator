import { randomNumber } from "../utils/randomNumber.js";
import { readFile } from "fs/promises";
import { toTitleCase } from "../utils/toTitleCase/toTitleCase.js";

// Initializing Variables
const args = process.argv.slice(2);
const dictionary = JSON.parse(
  await readFile(new URL("../dictionaries/common.json", import.meta.url))
);
let memorable = [];

const memorablePassword = async(data) => {
  // console.log(data);
  // Picking random words from the JSON dictionary based on the data length
  dictionary.entries.forEach(() => {
    memorable.push(
      toTitleCase(dictionary.entries[randomNumber(dictionary.entries.length)])
    );
  });
  // Initializing a memorable password
  memorable = memorable
    .slice(0, data.iteration)
    .join(data.separator)
    .toString()
    .replace(/ /g, "");
  console.log(memorable);
  return memorable;
};
export default memorablePassword;

if (args) {
  let data = args;
  data.length = data[3];
  data.iteration = data[5];
  data.separator = data[7];
  memorablePassword(data);
}

