// Initializing Variables
const args = process.argv.slice(2);
const PasswordGenerator = async(data) => {
  if (data.type) {
    let genPassword = "../lib/"+ data.type + "-password.js";
    const run = async() => {
      genPassword = await import (genPassword); genPassword;
    };
    run();
  }
};
PasswordGenerator(
  { type: args[1], length: args[3], iteration: args[5], separator: args[7]}
);
export default PasswordGenerator;

