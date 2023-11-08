// Copyright © 2022-2023 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

// Importing the randomNumber utility for generating random numbers.
import { randomNumber } from "../utils/randomNumber.js";
// Importing the readFile function from fs/promises for reading files.
import { readFile } from "fs/promises";
// Importing the toTitleCase function for converting strings to title case.
import { toTitleCase } from "../utils/toTitleCase/toTitleCase.js";
// Importing the clipboardy module for clipboard operations.
import clipboardy from "clipboardy";

/**
 * Generate a memorable password using random words from a dictionary.
 *
 * @param {Object} options - Configuration options for password generation.
 * @param {number} options.iteration - The number of words to use.
 * @param {string} options.separator - The separator between words.
 * @return {Promise<string>} The generated password.
 */
// Main function to generate a memorable password.
// It takes an options object with iteration and separator configurations.
export const generatePassword = async({ iteration, separator }) => {
  // Reading the dictionary file and parsing it as JSON.
  const dictionary = JSON.parse(
    await readFile(new URL("../dictionaries/common.json", import.meta.url), {
      encoding: "utf8",
    }),
  );

  if (iteration < 1) {
    // Error handling: Ensures the iteration argument is a positive integer.
    throw new RangeError("The iteration argument must be a positive integer");
  }

  // Generating the memorable part of the password by selecting random words and applying title case.
  const memorable = Array.from({ length: iteration }, () => {
    // Select a random word from the dictionary and convert it to title case.
    return toTitleCase(
      dictionary.entries[randomNumber(dictionary.entries.length)],
    );
  });

  // Joining the words together using the specified separator and removing any spaces.
  const password = memorable.join(separator).replace(/ /g, "");

  // Return the generated password.
  return password;
};

// The following code is meant to be executed when running the script directly.
// It parses command-line arguments provided to the script.
const args = process.argv.slice(2);
const data = {};

// Loop through the command-line arguments to capture options for password generation.
for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace("-", ""); // Remove leading dashes from the argument key.
  const value = args[i + 1]; // The following argument is considered the value.
  data[key] = value; // Store the key-value pair in the data object.
}

// Check if the correct arguments are provided, otherwise print the usage and exit.
if (data.t !== "memorable" || !data.i || !data.s) {
  console.error("Usage: node . -t memorable -i <iteration> -s <separator>");
  process.exit(1);
}

// The self-invoking async function generates the password and handles clipboard operations and output.
(async() => {
  try {
    // Generate the password using provided command-line arguments.
    const generatedPassword = await generatePassword({
      iteration: parseInt(data.i, 10), // Convert iteration to an integer.
      separator: data.s, // Use the provided separator.
    });

    // Copy the password to the clipboard.
    await clipboardy.write(generatedPassword);

    // Output the generated password to the console.
    console.log(`Generated Password: ${generatedPassword}`);
  } catch (error) {
    // If an error occurs, log it and exit with an error code.
    console.error(error);
    process.exit(1);
  }
})();
