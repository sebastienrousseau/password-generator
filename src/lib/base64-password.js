import crypto from "crypto";

// Initializing Variables
const args = process.argv.slice(2);

const base64Password = async(data) => {
  // Generating a base64 variable.
  let base64 = await crypto.randomBytes(256).toString("base64");
  // Initializing a base64 password
  base64 = base64
    .match(new RegExp(".{1," + data.length + "}", "g"))
    .slice(0, data.iteration)
    .join(data.separator);
  console.log(base64);
  return base64;
};
export default base64Password;

if (args) {
  let data = args;
  data.length = data[3];
  data.iteration = data[5];
  data.separator = data[7];
  base64Password(data);
}

