import { join } from "path";
import { program } from "commander";
import { readFileSync } from "fs";

// Initializing Variables
const args = process.argv.slice(2);
const pkg = JSON.parse(
  readFileSync(join(process.cwd(), "/package.json"), "utf8")
);

/** @function passwordGenerator */
export let passwordGenerator = async() => {
  await program
    .name("password-generator")
    .version(pkg.version, "-v, --version", "output the current version")
    .description(
      "A fast, simple and powerful open-source utility tool for generating strong, unique and random passwords"
    )
    .option(
      "-t, --type <type>",
      "specify a password type",
      "base64, memorable or strong"
    )
    .option("-l, --length <numbers>", "specify a length for each iteration")
    .option("-i, --iteration <numbers>", "specify a number of iteration")
    .option("-s, --separator <char>", "specify a character for the separator")
    .parse(process.argv);


  if (args[1]) {
    import ("../src/lib/" + args[1] + "-password.js");
  } else if (!args[1]) {
    program.help();
  }
};
passwordGenerator();
