#!/usr/bin/env node
// Copyright © 2022-2024 JavaScript Password Generator (jspassgen). All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Build script for Web Demo - bundles for GitHub Pages deployment.
 *
 * Output: dist/web/
 *   - index.html (with bundled JS reference)
 *   - styles/ (copied CSS)
 *   - bundle.js (all JS bundled)
 */

import { build } from "esbuild";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "src/ui/web/demo");
const DIST = join(ROOT, "dist/web");

// Ensure dist directory exists
mkdirSync(join(DIST, "styles"), { recursive: true });

console.log("Building Web Demo for GitHub Pages...\n");

// 1. Bundle JavaScript
console.log("  [1/3] Bundling JavaScript...");
await build({
  entryPoints: [join(SRC, "scripts/main.js")],
  bundle: true,
  minify: true,
  format: "esm",
  target: ["es2020"],
  outfile: join(DIST, "bundle.js"),
  sourcemap: true,
});

// 2. Copy and modify HTML
console.log("  [2/3] Processing HTML...");
let html = readFileSync(join(SRC, "index.html"), "utf-8");

// Update script reference to bundled version
html = html.replace(
  '<script type="module" src="scripts/main.js"></script>',
  '<script type="module" src="bundle.js"></script>'
);

// Update CSS paths (flatten to same directory)
html = html.replace(/href="styles\//g, 'href="styles/');

writeFileSync(join(DIST, "index.html"), html);

// 3. Copy CSS files
console.log("  [3/3] Copying styles...");
const stylesDir = join(SRC, "styles");
for (const file of readdirSync(stylesDir)) {
  if (file.endsWith(".css")) {
    copyFileSync(join(stylesDir, file), join(DIST, "styles", file));
  }
}

console.log("\n✓ Build complete: dist/web/");
console.log("  To preview: npm run web:preview");
console.log("  To deploy:  Copy dist/web/ to GitHub Pages branch");
