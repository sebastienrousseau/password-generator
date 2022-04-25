import crypto from "crypto";

// Initializing Variables
const args = process.argv.slice(2);

const base64Password = async( ) => {
  // Generating a base64 variable.
  let base64 = await crypto.randomBytes(256).toString("base64");

  // Initializing a base64 password
  base64 = base64
    .match(new RegExp(".{1," + args[3] + "}", "g"))
    .slice(0, args[5])
    .join(args[7]);
  console.log(base64);
  return base64;
};

export default base64Password();
