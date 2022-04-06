/*jshint esversion: 9 */
import openssl from 'openssl-nodejs';
import child_process from 'child_process';

export async function passwordGenerator(length, split, character, caps) {
  try {
      child_process.exec(
        'openssl rand -base64 64', (error, stdout) => {
          let args = process.argv.slice(2);
          let password = stdout.toString().match(new RegExp(`.{0,${args[0]}}`, 'g')).slice(0,args[1]).join('-');
          console.log(password);
        });
  } catch (error) {
    console.log(error);
    console.log(error.stack);
  }
}
