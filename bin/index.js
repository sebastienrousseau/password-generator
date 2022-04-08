/*jshint esversion: 8 */
import {
  Command as c
} from 'commander';
import {
  memorablePassword
} from '../lib/memorable-password.js';
import {
  passwordGenerator
} from '../lib/password-generator.js';

// Global Variables
global.log = (arg) => console.log(arg);
global.args = process.argv.slice(2);
const program = new c();

(async () => {

  try {
    program
      .version("1.0.0")
      .option('-t, --type <type>', 'Add type either memorable or complex')
      .option('-l, --length', 'Add length')
      .option('-d, --delimiter', 'Add delimiter')
      .parse(process.argv);

    if (args.length === 0) {
      program.help();
    } else if (args[1] == "memorable") {
      memorablePassword();
    } else if (args[1] === "complex") {
      passwordGenerator();
    }


  } catch (error) {
    log(error.stack);
    log(error);
  }

})();
