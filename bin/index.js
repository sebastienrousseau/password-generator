/*jshint esversion: 8 */
import { base64Password } from "../lib/base64-password.js";
import { Command as c } from "commander";
import { complexPassword } from "../lib/complex-password.js";
import { memorablePassword } from "../lib/memorable-password.js";

// Initializing Variables
const actions = {
  "base64":()=> base64Password(),
  "complex":()=> complexPassword(),
  "memorable":()=> memorablePassword()
};
const args = process.argv.slice(2);
const bool = actions.hasOwnProperty(args[1]);
const program = new c();
(async () => {
  program
    .version("1.0.0")
    .option("-t, --type <type>", "Specify a type (base64, complex, memorable)")
    .option("-i, --iteration <numbers>", "Specify a number of iteration")
    .option("-s, --separator <char>", "Specify a character for the separator")
    .parse(process.argv);

  if (bool) {
    actions[args[1]]();
  } else {
    program.help();
  }
})();
