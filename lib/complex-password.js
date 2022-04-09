/*jshint esversion: 8 */
import openssl from 'openssl-nodejs';
import child_process from 'child_process';

export async function complexPassword() {
  try {
    child_process.exec(

      // Generating a 256-bit cipher
      'openssl rand -base64 256', (error, stdout) => {

        // Initializing a complex password
        let complex = stdout.toString().match(new RegExp(`.{0,${args[3]}}`, 'g'));
        complex = complex.slice(0, args[3]).join(args[5]).toString();
        log(complex);

      });
  } catch (error) {
    log(error);
    log(error.stack);
  }
}
