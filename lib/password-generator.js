/*jshint esversion: 9 */
import openssl from 'openssl-nodejs';
import child_process from 'child_process';

export async function passwordGenerator() {
  try {
    child_process.exec(
      'openssl rand -base64 64', (error, stdout) => {
        // log("args: " + stdout);
        let password = stdout.toString().match(new RegExp(`.{0,${args[3]}}`, 'g'));
        password = password.slice(0, args[3]).join(args[5]).toString();
        // let password = stdout.toString().match(new RegExp(`.{0,${args[3]}}`, 'g')).slice(0, args[5]).join('-');
        log(password);
    });
  } catch (error) {
    log(error);
    log(error.stack);
  }
}
