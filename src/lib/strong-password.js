import childProcess from "child_process";

// Initializing Variables
const args = process.argv.slice(2);

const strongPassword = async() => {
  // Runs a command in a shell and buffers the output.
  await childProcess.exec(
    // Generating a 256-bit cipher
    "openssl rand -base64 256",
    (err, stdout, stderr) => {
      if (err) {
        console.debug("Exec: Fail to execute command");
        console.debug(err);
        console.debug(stderr);
      }

      // Initializing a strong password
      let strong = stdout.toString().match(new RegExp(`.{0,${args[3]}}`, "g"));
      strong = strong.slice(0, args[5]).join(args[7]).toString();
      console.log(strong);
      return strong;
    }
  );
};
export default strongPassword();
