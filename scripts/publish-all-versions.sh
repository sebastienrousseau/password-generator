#!/usr/bin/env bash
# Copyright © 2022-2026 JavaScript Password Generator (jspassgen). All rights reserved.
# SPDX-License-Identifier: Apache-2.0 OR MIT

# Publish historical tags and current version to npmjs registry under jspassgen
set -euo pipefail

VERSIONS=(
  "0.0.1"
  "0.0.2"
  "0.0.3"
  "0.0.4"
  "0.0.5"
  "0.0.6"
  "0.0.7"
  "0.0.8"
  "0.0.9"
  "0.0.10"
  "0.0.11"
  "0.0.12"
  "0.0.13"
  "0.0.14"
  "0.0.15"
)

echo "==> Checking npm registry authentication..."
npm whoami --registry https://registry.npmjs.org/

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR=$(mktemp -d)
trap 'rm -rf "${WORK_DIR}"' EXIT

for VER in "${VERSIONS[@]}"; do
  echo "--------------------------------------------------------"
  echo "==> Preparing jspassgen@${VER} for npmjs..."
  echo "--------------------------------------------------------"

  STAGE_DIR="${WORK_DIR}/${VER}"
  mkdir -p "${STAGE_DIR}"

  # Archive git tree at tag v${VER}
  git archive "v${VER}" | tar -x -C "${STAGE_DIR}"

  cd "${STAGE_DIR}"

  # Update package.json to ensure package name is jspassgen and version matches tag
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.name = 'jspassgen';
    pkg.version = '${VER}';
    pkg.publishConfig = { access: 'public', registry: 'https://registry.npmjs.org/' };
    if (pkg.repository && typeof pkg.repository === 'object') {
      pkg.repository.url = 'git+https://github.com/sebastienrousseau/jspassgen.git';
    }
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  "

  # Build the distribution if build script exists, otherwise package the root
  if [ -f "Makefile" ] && grep -q "build:" Makefile; then
    npm run build || true
  fi

  TARGET_DIR="dist"
  if [ ! -d "dist" ]; then
    TARGET_DIR="."
  fi

  if [ "${VER}" = "0.0.15" ]; then
    echo "Publishing jspassgen@${VER} as latest..."
    npm publish "${TARGET_DIR}" --access public --tag latest --registry https://registry.npmjs.org/
  else
    echo "Publishing historical jspassgen@${VER}..."
    npm publish "${TARGET_DIR}" --access public --tag "release-${VER}" --registry https://registry.npmjs.org/
  fi
  cd "${REPO_ROOT}"
done

echo "==> Successfully published all versions of jspassgen to https://registry.npmjs.org/!"
