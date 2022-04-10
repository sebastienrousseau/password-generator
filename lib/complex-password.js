/*jshint esversion: 8 */

import child_process from "child_process";

// Initializing Variables
const log = (arg) => console.log(arg);
const args = process.argv.slice(2);

export async function complexPassword() {
  child_process.exec(
    // Generating a 256-bit cipher
    "openssl rand -base64 256",
       (error, stdout) => {

      // Initializing a complex password
         let complex = stdout
           .toString()
           .match(new RegExp(`.{0,${args[3]}}`, "g"));
         complex = complex
           .slice(0, args[3])
           .join(args[5])
           .toString();
      log(complex);

    });
}
