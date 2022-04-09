/*jshint esversion: 8 */
import { Command as c } from 'commander';
import { memorablePassword } from '../lib/memorable-password.js';
import { complexPassword } from '../lib/complex-password.js';
import { base64Password } from '../lib/base64-password.js';

// Global Variables
global.log = (arg) => console.log(arg);
global.args = process.argv.slice(2);
const program = new c();

(async () => {

  try {
    program
      .version("1.0.0")
      .option('-t, --type <type>', 'Add type either memorable or complex')
      .option('-i, --iteration', 'Add iteration')
      .option('-s, --separator <char>', 'Add separator')
      .parse(process.argv);

    if (args.length === 0) {
      program.help();
    } else if (args[1] == "memorable") {
      memorablePassword();
    } else if (args[1] === "complex") {
      complexPassword();
    } else if (args[1] === "base64") {
      base64Password();
    }


  } catch (error) {
    log(error.stack);
    log(error);
  }

})();
