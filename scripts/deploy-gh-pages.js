#!/usr/bin/env node
// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Deploy Web Demo to GitHub Pages (gh-pages branch).
 *
 * Usage: npm run web:deploy
 *
 * This script:
 * 1. Builds the web demo (bundled)
 * 2. Creates/updates gh-pages branch
 * 3. Pushes to origin
 */

import { execSync } from "child_process";
import { existsSync, rmSync, readdirSync, cpSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  return execSync(cmd, { cwd: ROOT, stdio: "inherit", ...opts });
}

function runSilent(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf-8" }).trim();
}

console.log("\n🚀 Deploying Web Demo to GitHub Pages\n");

// 1. Build the web demo
console.log("[1/5] Building web demo...");
run("npm run web:build");

// 2. Get current branch to return to later
const currentBranch = runSilent("git rev-parse --abbrev-ref HEAD");
console.log(`\n[2/5] Current branch: ${currentBranch}`);

// 3. Create temporary worktree for gh-pages
const tmpDir = join(ROOT, ".gh-pages-tmp");
if (existsSync(tmpDir)) {
  rmSync(tmpDir, { recursive: true });
}

console.log("\n[3/5] Setting up gh-pages branch...");
try {
  // Check if gh-pages exists remotely
  try {
    runSilent("git ls-remote --exit-code --heads origin gh-pages");
    run(`git worktree add ${tmpDir} gh-pages`);
  } catch {
    // Create orphan gh-pages branch
    console.log("  Creating new gh-pages branch...");
    run(`git worktree add --detach ${tmpDir}`);
    execSync("git checkout --orphan gh-pages", { cwd: tmpDir, stdio: "inherit" });
    execSync("git rm -rf .", { cwd: tmpDir, stdio: "pipe" });
  }

  // 4. Copy built files
  console.log("\n[4/5] Copying build files...");
  const srcDir = join(ROOT, "dist/web");
  const files = readdirSync(srcDir);
  for (const file of files) {
    cpSync(join(srcDir, file), join(tmpDir, file), { recursive: true });
  }

  // Add .nojekyll to prevent Jekyll processing
  execSync("touch .nojekyll", { cwd: tmpDir });

  // Commit and push
  console.log("\n[5/5] Committing and pushing...");
  const commitMsg = `Deploy web demo - ${new Date().toISOString().split("T")[0]}`;
  execSync("git add -A", { cwd: tmpDir, stdio: "inherit" });

  try {
    execSync(`git commit -m "${commitMsg}"`, { cwd: tmpDir, stdio: "inherit" });
    execSync("git push origin gh-pages --force", { cwd: tmpDir, stdio: "inherit" });
    console.log("\n✅ Deployed successfully!");
    console.log("   URL: https://<username>.github.io/password-generator/");
  } catch (e) {
    if (e.message?.includes("nothing to commit")) {
      console.log("\n✅ No changes to deploy.");
    } else {
      throw e;
    }
  }

} finally {
  // Cleanup worktree
  console.log("\nCleaning up...");
  run(`git worktree remove ${tmpDir} --force 2>/dev/null || true`);
}

console.log("Done.\n");
