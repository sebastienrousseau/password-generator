/*jshint esversion: 8 */
import { base64Password } from "../lib/base64-password.js";
import { Command } from "commander";
import { complexPassword } from "../lib/complex-password.js";
import { join } from "path";
import { memorablePassword } from "../lib/memorable-password.js";
import { readFileSync } from "fs";

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
const program = new Command();
export function passwordGenerator() {
  program
    .name("password-generator")
    .version(pkg.version, "-v, --version", "output the current version")
    .description(
      "A fast, simple and powerful open-source utility tool for generating strong, unique and random passwords"
    )
    .option(
      "-t, --type <type>",
      "specify a password type",
      "base64, complex or memorable"
      )
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
