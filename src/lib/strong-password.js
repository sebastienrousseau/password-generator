import childProcess from "child_process";

// Initializing Variables
const args = process.argv.slice(2);
// let functionIsRunning = false;

const strongPassword = async(data) => {

  // if (!functionIsRunning) {
  //   functionIsRunning = true;
  // console.log(functionIsRunning);

  // Runs a command in a shell and buffers the output.
  childProcess.exec(

    // Generating a 256-bit cipher
    "openssl rand -base64 256",
    (err, stdout, stderr) => {
      if (err) {
        console.debug("Exec: Fail to execute command");
        console.debug(err);
        console.debug(stderr);
      }

      // Initializing a strong password
      let strong = stdout.toString().match(new RegExp(".{0," + data.length + "}", "g"));
      strong = strong.slice(0, data.iteration).join(data.separator).toString();
      console.log("Strong password:" + strong);
      return strong;
    }
  );
  // }
};
export default strongPassword;

if (args) {
  let data = args;
  data.length = data[3];
  data.iteration = data[5];
  data.separator = data[7];
  strongPassword(data);
}
