#!/usr/bin/env node

import { join } from "path";
import { program } from "commander";
import { readFileSync } from "fs";

const { version } = JSON.parse(
  readFileSync(join(process.cwd(), "/package.json"), "utf8")
);

program
  .version(version, "-v, --version", "output the current version")
  .option("-t, --type <type>", "Specify a password type")
  .option("-l, --length <numbers>", "specify a length for each iteration")
  .option("-i, --iteration <numbers>", "specify a number of iteration")
  .option("-s, --separator <char>", "specify a character for the separator")
  .action(async(args) => {
    if (args.type === "base64") {
      const { base64Password } = import ("./src/lib/base64-password.js");
      base64Password;
    } else if (args.type === "strong") {
      const { strongPassword } = import ("./src/lib/strong-password.js");
      strongPassword;
    } else if (args.type === "memorable") {
      const { memorablePassword } = import ("./src/lib/memorable-password.js");
      memorablePassword;
    } else if (args.type !== "base64" || args.type !== "memorable" || args.type !== "strong") {
      program.help();
    }
  })
  .parse(process.argv);
