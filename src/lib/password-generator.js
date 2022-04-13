/* eslint-disable node/no-unpublished-import */
/*jshint esversion: 8 */
import { base64Password } from "./base64-password.js";
import { Command as c } from "commander";
import { complexPassword } from "./complex-password.js";
import { memorablePassword } from "./memorable-password.js";

// Initializing Variables
const actions = {
  base64: () => base64Password(),
  complex: () => complexPassword(),
  memorable: () => memorablePassword(),
};
const args = process.argv.slice(2);
const bool = Object.prototype.hasOwnProperty.call(actions, args[1]);
const program = new c();
export function passwordGenerator() {

  if (bool) {
    actions[args[1]]();
  }
  else {
    program
      .version("1.0.0")
      .option("-t, --type <type>", "Specify a type (base64, complex, memorable)")
      .option("-l, --length <numbers>", "Specify a length for each iteration")
      .option("-i, --iteration <numbers>", "Specify a number of iteration")
      .option("-s, --separator <char>", "Specify a character for the separator")
      .parse(process.argv);
    program.help();
  }
} 
