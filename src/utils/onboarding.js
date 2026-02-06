// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

import readline from "readline";
import { emitKeypressEvents } from "readline";
import {
  VALID_PASSWORD_TYPES,
  VALID_PRESETS,
  getPresetConfig
} from "../config.js";

/**
 * Displays progress indicator in ●○○○ (1/4) format
 * @param {number} current - Current step (1-based)
 * @param {number} total - Total steps
 * @returns {string} Formatted progress string
 */
const displayProgress = (current, total) => {
  const filled = "●".repeat(current);
  const empty = "○".repeat(total - current);
  return `${filled}${empty} (${current}/${total})`;
};

/**
 * Enhanced readline interface with keyboard navigation support
 * @returns {readline.Interface} Enhanced readline interface
 */

/**
 * Creates a readline interface for user input.
 * @returns {readline.Interface} The readline interface
 */
const createInterface = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Enable keypress events
  emitKeypressEvents(process.stdin);

  return rl;
};

/**
 * Enhanced prompt with keyboard navigation support
 * @param {string} question - The question to ask
 * @param {string[]} options - Available options
 * @param {readline.Interface} rl - The readline interface
 * @param {number} step - Current step number
 * @param {number} totalSteps - Total number of steps
 * @param {Object} examples - Optional examples to show with Space
 * @returns {Promise<string>} Selected option
 */
const promptWithNavigation = (question, options, rl, step, totalSteps, examples = {}) => {
  return new Promise((resolve) => {
    let selectedIndex = 0;
    let showingExamples = false;

    const renderMenu = () => {
      console.clear();
      console.log(`\n${displayProgress(step, totalSteps)}\n`);
      console.log(question);
      console.log("─".repeat(40));

      if (showingExamples && examples[options[selectedIndex]]) {
        console.log(`\n💡 Example for ${options[selectedIndex]}:`);
        console.log(examples[options[selectedIndex]]);
        console.log("\n📝 Press Space again to hide examples\n");
      }

      options.forEach((option, index) => {
        const prefix = index === selectedIndex ? "▶ " : "  ";
        const number = index + 1;
        console.log(`${prefix}${number}. ${option}`);
      });

      console.log("\n🔧 Controls:");
      console.log("• Arrow Keys: Navigate  • Enter: Select  • Esc: Go back");
      console.log("• 1-9: Quick select     • Space: Show/hide examples\n");
    };

    const handleKeypress = (str, key) => {
      if (!key) return;

      switch (key.name) {
        case 'up':
          selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : options.length - 1;
          renderMenu();
          break;
        case 'down':
          selectedIndex = selectedIndex < options.length - 1 ? selectedIndex + 1 : 0;
          renderMenu();
          break;
        case 'return':
          process.stdin.removeListener('keypress', handleKeypress);
          if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
          }
          console.log(`\n✅ Selected: ${options[selectedIndex]}\n`);
          resolve(options[selectedIndex]);
          break;
        case 'escape':
          process.stdin.removeListener('keypress', handleKeypress);
          if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
          }
          console.log("\n⬅️  Going back...\n");
          resolve('__BACK__');
          break;
        case 'space':
          showingExamples = !showingExamples;
          renderMenu();
          break;
        default:
          // Handle number keys (1-9)
          if (str && /^[1-9]$/.test(str)) {
            const index = parseInt(str) - 1;
            if (index < options.length) {
              selectedIndex = index;
              process.stdin.removeListener('keypress', handleKeypress);
              if (process.stdin.isTTY) {
                process.stdin.setRawMode(false);
              }
              console.log(`\n✅ Selected: ${options[selectedIndex]}\n`);
              resolve(options[selectedIndex]);
            }
          }
          break;
      }
    };

    process.stdin.on('keypress', handleKeypress);
    renderMenu();
  });
};

/**
 * Prompts user with a question and returns their answer.
 * @param {string} question - The question to ask
 * @param {readline.Interface} rl - The readline interface
 * @returns {Promise<string>} The user's answer
 */
const askQuestion = (question, rl) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

/**
 * Displays a welcome message and intro to the password generator.
 */
const displayWelcome = () => {
  console.log("🔐 Welcome to Password Generator!");
  console.log("=====================================");
  console.log("Let's set up your password preferences through a quick 4-step process.\n");
};

/**
 * Step 1: Password type selection with enhanced navigation
 * @param {readline.Interface} rl - The readline interface
 * @returns {Promise<string>} The selected password type
 */
const selectPasswordType = async (rl) => {
  const options = [
    "🔐 strong - Maximum security for important accounts",
    "🧠 memorable - Easy to remember for daily use",
    "⚙️ base64 - For API keys and system integration"
  ];

  const examples = {
    "🔐 strong - Maximum security for important accounts":
      "Example: K9#mL$8vR2@qN7!pX4^wB6&zD3*hF5+jG1%cV9~sA8",
    "🧠 memorable - Easy to remember for daily use":
      "Example: Rainbow-Mountain-7-Coffee or Sunset_Ocean_42_Music",
    "⚙️ base64 - For API keys and system integration":
      "Example: Q29kZXIyMDI0IQ or TXlBcGlLZXkxMjM="
  };

  const result = await promptWithNavigation(
    "📋 Choose your password type:",
    options,
    rl,
    1,
    4,
    examples
  );

  if (result === '__BACK__') {
    console.log("❌ Cannot go back from first step.");
    return await selectPasswordType(rl);
  }

  // Map display option back to type
  if (result.includes("strong")) return "strong";
  if (result.includes("memorable")) return "memorable";
  if (result.includes("base64")) return "base64";

  return "strong"; // fallback
};

/**
 * Step 2: Security level selection with enhanced navigation
 * @param {readline.Interface} rl - The readline interface
 * @param {string} passwordType - The selected password type
 * @returns {Promise<Object>} The preset configuration or custom flag
 */
const selectSecurityLevel = async (rl, passwordType) => {
  const options = [
    "⚡ quick - Fast setup for everyday accounts",
    "🔒 secure - Maximum protection for important accounts",
    "💭 memorable - Human-friendly for frequent typing",
    "⚙️ custom - Fine-tune your preferences"
  ];

  const examples = {
    "⚡ quick - Fast setup for everyday accounts":
      "Generates 16-character passwords quickly. Good for low-risk accounts.",
    "🔒 secure - Maximum protection for important accounts":
      "Uses maximum length and complexity. Best for banking and critical accounts.",
    "💭 memorable - Human-friendly for frequent typing":
      "Creates readable word combinations. Easier to type on mobile devices.",
    "⚙️ custom - Fine-tune your preferences":
      "Lets you customize length, iterations, separators, and all options."
  };

  const result = await promptWithNavigation(
    "🛡️ Choose your security level:",
    options,
    rl,
    2,
    4,
    examples
  );

  if (result === '__BACK__') {
    return await selectPasswordType(rl);
  }

  // Map display option back to preset
  if (result.includes("quick")) {
    return { preset: "quick", config: getPresetConfig("quick") };
  } else if (result.includes("secure")) {
    return { preset: "secure", config: getPresetConfig("secure") };
  } else if (result.includes("memorable")) {
    return { preset: "memorable", config: getPresetConfig("memorable") };
  } else if (result.includes("custom")) {
    return { preset: null, config: await customConfiguration(rl, passwordType) };
  }

  return { preset: "quick", config: getPresetConfig("quick") }; // fallback
};

/**
 * Handles custom configuration for advanced users.
 * @param {readline.Interface} rl - The readline interface
 * @param {string} passwordType - The selected password type
 * @returns {Promise<Object>} Custom configuration object
 */
const customConfiguration = async (rl, passwordType) => {
  console.log("\n⚙️  Custom Configuration");
  console.log("─".repeat(25));

  const config = { type: passwordType };

  if (passwordType !== "memorable") {
    while (true) {
      const lengthAnswer = await askQuestion("Password chunk length (8-64): ", rl);
      const length = parseInt(lengthAnswer);
      if (length >= 8 && length <= 64) {
        config.length = length;
        break;
      }
      console.log("❌ Please enter a number between 8 and 64.\n");
    }
  }

  while (true) {
    const iterationAnswer = await askQuestion(
      passwordType === "memorable"
        ? "Number of words (2-8): "
        : "Number of chunks (1-10): ",
      rl
    );
    const iteration = parseInt(iterationAnswer);
    if (iteration >= 1 && iteration <= (passwordType === "memorable" ? 8 : 10)) {
      config.iteration = iteration;
      break;
    }
    console.log(
      passwordType === "memorable"
        ? "❌ Please enter a number between 2 and 8.\n"
        : "❌ Please enter a number between 1 and 10.\n"
    );
  }

  const separatorAnswer = await askQuestion(
    "Separator character (-, _, space, or none): ", rl
  );
  config.separator = separatorAnswer === "none" ? "" :
                     separatorAnswer === "space" ? " " :
                     separatorAnswer || "-";

  return config;
};

/**
 * Step 3: Clipboard option with enhanced navigation
 * @param {readline.Interface} rl - The readline interface
 * @returns {Promise<boolean>} Whether to copy to clipboard
 */
const selectClipboardOption = async (rl) => {
  const options = [
    "✅ Yes - Copy to clipboard automatically",
    "❌ No - Display password only"
  ];

  const examples = {
    "✅ Yes - Copy to clipboard automatically":
      "Password will be copied to your clipboard for easy pasting. More convenient but may leave traces in clipboard history.",
    "❌ No - Display password only":
      "Password will only be shown in the terminal. More secure but requires manual copying."
  };

  const result = await promptWithNavigation(
    "📋 Clipboard settings:",
    options,
    rl,
    3,
    4,
    examples
  );

  if (result === '__BACK__') {
    return await selectSecurityLevel(rl);
  }

  return result.includes("Yes");
};

/**
 * Step 4: Display results and security information
 * @param {Object} config - The final configuration
 * @param {boolean} clipboard - Whether clipboard is enabled
 * @param {string|null} preset - The preset name if used
 */
const displayResults = (config, clipboard, preset) => {
  console.clear();
  console.log(`\n${displayProgress(4, 4)}\n`);
  console.log("✅ Configuration Summary");
  console.log("─".repeat(40));
  console.log(`Password Type: ${config.type}`);
  if (config.length) {
    console.log(`Chunk Length: ${config.length}`);
  }
  console.log(`${config.type === "memorable" ? "Words" : "Chunks"}: ${config.iteration}`);
  console.log(`Separator: "${config.separator || "(none)"}"`);
  console.log(`Clipboard: ${clipboard ? "Enabled" : "Disabled"}`);
  if (preset) {
    console.log(`Preset Used: ${preset}`);
  }

  console.log("\n🔒 Security Information:");
  console.log("─".repeat(25));

  if (config.type === "strong") {
    const entropy = Math.log2(64) * config.length * config.iteration;
    console.log(`• Estimated entropy: ~${Math.round(entropy)} bits`);
    console.log("• Uses cryptographically secure random generation");
    console.log("• Includes uppercase, lowercase, numbers, and symbols");
  } else if (config.type === "memorable") {
    console.log("• Human-readable word combinations");
    console.log("• Easier to remember and type");
    console.log("• Good for accounts requiring frequent manual entry");
  } else if (config.type === "base64") {
    const entropy = Math.log2(64) * config.length * config.iteration;
    console.log(`• Estimated entropy: ~${Math.round(entropy)} bits`);
    console.log("• Base64 encoded for compatibility");
    console.log("• Safe for URLs and most systems");
  }

  console.log("\n💻 Command Learning Panel:");
  console.log("─".repeat(30));
  console.log("🎓 Next time, skip the setup and use this direct CLI command:");

  // Build equivalent CLI command
  let cliCommand = "password-generator";

  if (preset) {
    cliCommand += ` -p ${preset}`;
  } else {
    // Custom configuration command building
    cliCommand += ` --type ${config.type}`;
    if (config.length) {
      cliCommand += ` --length ${config.length}`;
    }
    cliCommand += ` --iteration ${config.iteration}`;
    if (config.separator && config.separator !== "-") {
      cliCommand += ` --separator "${config.separator}"`;
    }
  }

  if (clipboard) {
    cliCommand += " -c";
  }

  console.log(`\n   ${cliCommand}\n`);
  console.log("📚 Command breakdown:");
  if (preset) {
    console.log(`   -p ${preset}    Use the '${preset}' preset configuration`);
  } else {
    console.log(`   --type ${config.type}    Password type selection`);
    if (config.length) {
      console.log(`   --length ${config.length}     ${config.type === "memorable" ? "Word" : "Chunk"} length`);
    }
    console.log(`   --iteration ${config.iteration}   Number of ${config.type === "memorable" ? "words" : "chunks"}`);
    if (config.separator && config.separator !== "-") {
      console.log(`   --separator "${config.separator}"   Custom separator character`);
    }
  }
  if (clipboard) {
    console.log("   -c               Copy to clipboard");
  }

  console.log("\n🚀 Next Steps:");
  console.log("─".repeat(15));
  console.log("• Your password will be generated with these settings");
  console.log("• Use --help to see all available CLI options");
  console.log("• Run with --audit to see detailed security information");

  if (preset) {
    console.log(`• Use -p ${preset} flag for quick access to this preset`);
  }
};

/**
 * Main onboarding flow function
 * @returns {Promise<Object>} Configuration object with clipboard setting
 */
export const runOnboarding = async () => {
  const rl = createInterface();

  try {
    displayWelcome();

    // Step 1: Password type selection
    const passwordType = await selectPasswordType(rl);

    // Step 2: Security level selection
    const { preset, config } = await selectSecurityLevel(rl, passwordType);

    // Step 3: Clipboard option
    const clipboard = await selectClipboardOption(rl);

    // Step 4: Display results
    displayResults(config, clipboard, preset);

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Setup complete! Generating your password...\n");

    return {
      config,
      clipboard,
      preset
    };
  } finally {
    rl.close();
  }
};

/**
 * Check if this is likely a first run (no arguments provided except interactive flag)
 * @param {string[]} args - Command line arguments
 * @returns {boolean} Whether this appears to be a first run
 */
export const isFirstRun = (args) => {
  // Filter out the interactive flags
  const nonInteractiveArgs = args.filter(arg =>
    arg !== "--interactive" && arg !== "password-generator"
  );

  // If no other arguments are provided, treat as first run
  return nonInteractiveArgs.length === 0;
};