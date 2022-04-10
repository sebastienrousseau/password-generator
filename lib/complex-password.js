/*jshint esversion: 8 */

import child_process from "child_process";

// Initializing Variables
const args = process.argv.slice(2);

export async function complexPassword() {
  child_process.exec(
    // Generating a 256-bit cipher
    "openssl rand -base64 256",
    (err, stdout, stderr) => {
      if (err) {
        console.debug(`Exec: Fail to execute command`);
        console.debug(err);
        console.debug(stderr);
      }
      // Initializing a complex password
      let complex = stdout.toString().match(new RegExp(`.{0,${args[3]}}`, "g"));
      complex = complex.slice(0, args[3]).join(args[5]).toString();
      console.log(complex);

    });
}
