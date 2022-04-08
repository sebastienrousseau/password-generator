/*jshint esversion: 9 */
import openssl from 'openssl-nodejs';
import child_process from 'child_process';

const log = (arg) => console.log(arg);

export async function passwordGenerator() {
  try {
    child_process.exec(
      'openssl rand -base64 64', (error, stdout) => {
        let args = process.argv.slice(2);
        let password = stdout.toString().match(new RegExp(`.{0,${args[0]}}`, 'g')).slice(0, args[1]).join('-');
        log(password);
      });
  } catch (error) {
    log(error);
    log(error.stack);
  }
}
