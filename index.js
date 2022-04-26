#!/usr/bin/env node

import { program } from "commander";

program
  .version("1.0.8", "-v, --version", "output the current version")
  .option("-t, --type <type>", "specify a password type")
  .option("-l, --length <numbers>", "specify a length for each iteration")
  .option("-i, --iteration <numbers>", "specify a number of iteration")
  .option("-s, --separator <char>", "specify a character for the separator")
  .action(async(args) => {
    if (args.type === "base64") {
      const { base64Password } = import("./src/lib/base64-password.js");
      base64Password;
    } else if (args.type === "strong") {
      const { strongPassword } = import("./src/lib/strong-password.js");
      strongPassword;
    } else if (args.type === "memorable") {
      const { memorablePassword } = import("./src/lib/memorable-password.js");
      memorablePassword;
    } else if (
      args.type !== "base64" ||
      args.type !== "memorable" ||
      args.type !== "strong"
    ) {
      program.help();
    }
  })
  .parse(process.argv);
