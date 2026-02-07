#!/usr/bin/env node
/**
 * verify-core-deps.js
 *
 * Programmatic verification that packages/core has zero platform dependencies.
 * This script can be used in CI or as a pre-commit hook.
 *
 * Exit codes:
 *   0 - No violations found
 *   1 - Violations detected
 *   2 - Script error
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, dirname, extname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = dirname(__dirname);
const CORE_DIR = join(PROJECT_ROOT, "packages", "core");

// =============================================================================
// FORBIDDEN DEPENDENCIES CONFIGURATION
// =============================================================================

const FORBIDDEN = {
  nodeBuiltins: [
    "crypto",
    "fs",
    "path",
    "http",
    "https",
    "process",
    "child_process",
    "os",
    "net",
    "tls",
    "stream",
    "buffer",
    "util",
    "events",
    "url",
    "querystring",
    "readline",
    "tty",
    "cluster",
    "worker_threads",
    "perf_hooks",
    "v8",
    "vm",
    "repl",
    "dgram",
    "dns",
    "zlib",
  ],
  browserGlobals: [
    "window",
    "document",
    "localStorage",
    "sessionStorage",
    "fetch",
    "XMLHttpRequest",
    "navigator",
    "location",
    "history",
  ],
  cliLibraries: [
    "commander",
    "chalk",
    "clipboardy",
    "inquirer",
    "ora",
    "yargs",
  ],
  uiFrameworks: ["react", "vue", "angular", "svelte", "solid"],
  platformSpecific: ["electron"],
};

// =============================================================================
// FILE UTILITIES
// =============================================================================

/**
 * Recursively get all source files in a directory
 */
function getSourceFiles(dir, extensions = [".js", ".ts", ".mjs", ".cjs"]) {
  const files = [];

  if (!existsSync(dir)) {
    return files;
  }

  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && entry !== "node_modules") {
      files.push(...getSourceFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.includes(extname(entry))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Read file content safely
 */
function readFile(filePath) {
  try {
    return readFileSync(filePath, "utf8");
  } catch {
    console.error(`Warning: Could not read file: ${filePath}`);
    return "";
  }
}

// =============================================================================
// VIOLATION DETECTION
// =============================================================================

/**
 * Check for import/require of a module
 */
function checkModuleImport(content, moduleName) {
  const patterns = [
    // ES module imports
    new RegExp(`import\\s+.*from\\s+['"]${moduleName}['"]`, "g"),
    new RegExp(`import\\s+['"]${moduleName}['"]`, "g"),
    new RegExp(`from\\s+['"]node:${moduleName}['"]`, "g"),
    // Dynamic imports
    new RegExp(`import\\s*\\(\\s*['"]${moduleName}['"]\\s*\\)`, "g"),
    // CommonJS require
    new RegExp(`require\\s*\\(\\s*['"]${moduleName}['"]\\s*\\)`, "g"),
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return null;
}

/**
 * Check for usage of browser globals
 */
function checkGlobalUsage(content, globalName) {
  // Match global usage like window.foo, document.querySelector, etc.
  // Exclude string literals and comments
  const pattern = new RegExp(`\\b${globalName}\\s*\\.`, "g");
  const match = content.match(pattern);

  if (match) {
    // Additional check to avoid false positives in comments/strings
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comment lines
      if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
        continue;
      }
      if (pattern.test(line)) {
        return { line: i + 1, match: match[0] };
      }
    }
  }

  return null;
}

/**
 * Find line number for a match
 */
function findLineNumber(content, searchStr) {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchStr)) {
      return i + 1;
    }
  }
  return -1;
}

// =============================================================================
// MAIN VERIFICATION
// =============================================================================

class Violation {
  constructor(file, category, dependency, lineNumber, snippet) {
    this.file = file;
    this.category = category;
    this.dependency = dependency;
    this.lineNumber = lineNumber;
    this.snippet = snippet;
  }

  toString() {
    const relativePath = this.file.replace(PROJECT_ROOT + "/", "");
    return `  ${relativePath}:${this.lineNumber} - ${this.category}: '${this.dependency}'\n    ${this.snippet}`;
  }
}

function verifyCore() {
  console.log("==========================================");
  console.log("Core Package Isolation Verification");
  console.log("==========================================\n");

  if (!existsSync(CORE_DIR)) {
    console.error(`ERROR: Core directory not found at ${CORE_DIR}`);
    process.exit(2);
  }

  console.log(`Scanning: ${CORE_DIR}\n`);

  const violations = [];
  const files = getSourceFiles(CORE_DIR);

  console.log(`Found ${files.length} source files to check.\n`);

  for (const file of files) {
    const content = readFile(file);
    if (!content) continue;

    // Check Node.js built-ins
    for (const module of FORBIDDEN.nodeBuiltins) {
      const match = checkModuleImport(content, module);
      if (match) {
        const lineNum = findLineNumber(content, match);
        violations.push(
          new Violation(file, "Node.js built-in", module, lineNum, match)
        );
      }
    }

    // Check CLI libraries
    for (const lib of FORBIDDEN.cliLibraries) {
      const match = checkModuleImport(content, lib);
      if (match) {
        const lineNum = findLineNumber(content, match);
        violations.push(new Violation(file, "CLI library", lib, lineNum, match));
      }
    }

    // Check UI frameworks
    for (const framework of FORBIDDEN.uiFrameworks) {
      const match = checkModuleImport(content, framework);
      if (match) {
        const lineNum = findLineNumber(content, match);
        violations.push(
          new Violation(file, "UI framework", framework, lineNum, match)
        );
      }
    }

    // Check platform-specific
    for (const pkg of FORBIDDEN.platformSpecific) {
      const match = checkModuleImport(content, pkg);
      if (match) {
        const lineNum = findLineNumber(content, match);
        violations.push(
          new Violation(file, "Platform-specific", pkg, lineNum, match)
        );
      }
    }

    // Check browser globals
    for (const global of FORBIDDEN.browserGlobals) {
      const result = checkGlobalUsage(content, global);
      if (result) {
        violations.push(
          new Violation(
            file,
            "Browser global",
            global,
            result.line,
            result.match
          )
        );
      }
    }
  }

  // Report results
  console.log("==========================================");

  if (violations.length === 0) {
    console.log("\x1b[32mSUCCESS: No platform dependencies found in packages/core\x1b[0m");
    return 0;
  }

  console.log(`\x1b[31mFAILED: Found ${violations.length} violation(s)\x1b[0m\n`);

  // Group violations by category
  const byCategory = {};
  for (const v of violations) {
    if (!byCategory[v.category]) {
      byCategory[v.category] = [];
    }
    byCategory[v.category].push(v);
  }

  for (const [category, categoryViolations] of Object.entries(byCategory)) {
    console.log(`\n${category}:`);
    console.log("-".repeat(40));
    for (const v of categoryViolations) {
      console.log(v.toString());
    }
  }

  console.log("\n==========================================");
  console.log("\x1b[33mThe core package must remain platform-agnostic.\x1b[0m");
  console.log("\x1b[33mMove platform-specific code to src/adapters/ instead.\x1b[0m");

  return 1;
}

// =============================================================================
// EXECUTION
// =============================================================================

try {
  const exitCode = verifyCore();
  process.exit(exitCode);
} catch (error) {
  console.error("Script error:", error.message);
  process.exit(2);
}
