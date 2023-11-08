// Copyright © 2022-2023 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

// This script acts as a factory to generate different types of passwords
// based on the provided type argument. It utilizes dynamic imports to
// load the appropriate password generator module.

// Extract command line arguments
const args = process.argv.slice(2);

// Asynchronous function to generate a password
export const PasswordGenerator = async(data) => {
  if (data.type) {
    // Construct the module path for the required password type
    let modulePath = `../lib/${data.type}-password.js`;

    try {
      // Dynamically import the appropriate password generator module
      const generatorModule = await import(modulePath);

      // Call the function from the imported module to generate the password
      return await generatorModule.generatePassword(data);
    } catch (error) {
      // Handle cases where the module does not exist or fails to load
      console.error(`Failed to load the password generator for type: ${data.type}`, error);
      throw error;
    }
  } else {
    // Throw an error if no type is provided
    throw new Error("Password type is required");
  }
};

// Self-invocation of the PasswordGenerator function if arguments are provided
(async() => {
  if (args.length > 0) {
    try {
      // Parse command line arguments into an object
      const options = {
        type: args[1],
        length: parseInt(args[3], 10),
        iteration: parseInt(args[5], 10),
        separator: args[7],
      };

      // Generate the password using the provided options
      const password = await PasswordGenerator(options);
      password;
    } catch (error) {
      console.error("Error generating password:", error);
    }
  }
})();
