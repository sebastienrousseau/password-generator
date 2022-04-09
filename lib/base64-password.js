/*jshint esversion: 8 */

import crypto from 'crypto';

export async function base64Password() {
  try {

    // Generating a base64 variable.
    let base64 = (crypto.randomBytes(256)).toString('base64');

    // Initializing a base64 password
    base64 = base64.match(new RegExp('.{1,' + args[3] + '}', 'g')).slice(0, args[3]).join(args[5]);
    log(base64);

  } catch (error) {
    log(error.stack);
    log(error);
  }
}
