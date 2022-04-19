/*jshint esversion: 8 */
import { base64Password } from "./base64-password.js";
import { Command as c } from "commander";
import { complexPassword } from "./complex-password.js";
import { memorablePassword } from "./memorable-password.js";
import { readFileSync } from "fs";
import { join } from "path";

// Initializing Variables
const actions = {
  base64: () => base64Password(),
  complex: () => complexPassword(),
  memorable: () => memorablePassword(),
};
const args = process.argv.slice(2);
const bool = Object.prototype.hasOwnProperty.call(actions, args[1]);
const pkg = JSON.parse(
  readFileSync(join(process.cwd(), "/package.json"), "utf8")
);
const program = new c();
export function passwordGenerator()
{
  program
    .version(pkg.version)
    .option("-t, --type <type>", "specify a password type")
    .option("-l, --length <numbers>", "specify a length for each iteration")
    .option("-i, --iteration <numbers>", "specify a number of iteration")
    .option("-s, --separator <char>", "specify a character for the separator")
    .parse(process.argv);

  if (!bool) {
    return program.help();
  } else if (bool) {
    return actions[args[1]]();
  }
}
