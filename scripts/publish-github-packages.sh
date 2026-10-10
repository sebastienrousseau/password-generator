#!/usr/bin/env bash
# Copyright © 2022-2026 JavaScript Password Generator (jspassgen). All rights reserved.
# SPDX-License-Identifier: Apache-2.0 OR MIT

# Publish historical tags and current version to GitHub Packages under @sebastienrousseau/jspassgen
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
  "0.0.16"
  "0.0.17"
  "0.0.18"
  "0.0.19"
)

LATEST_VER="${VERSIONS[${#VERSIONS[@]}-1]}"

TOKEN="${NODE_AUTH_TOKEN:-$(gh auth token 2>/dev/null || true)}"
if [ -z "${TOKEN}" ]; then
  echo "Error: NODE_AUTH_TOKEN is not set and gh auth token is unavailable."
  echo "Run: gh auth refresh -s write:packages"
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR=$(mktemp -d)
trap 'rm -rf "${WORK_DIR}"' EXIT

cat << EOF > "${WORK_DIR}/.npmrc"
registry=https://npm.pkg.github.com/
@sebastienrousseau:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${TOKEN}
EOF

echo "==> Checking GitHub Packages authentication..."
npm whoami --registry https://npm.pkg.github.com/ --userconfig "${WORK_DIR}/.npmrc"

for VER in "${VERSIONS[@]}"; do
  echo "--------------------------------------------------------"
  echo "==> Checking @sebastienrousseau/jspassgen@${VER} on GitHub Packages..."
  echo "--------------------------------------------------------"

  if curl -sf -H "Authorization: Bearer ${TOKEN}" "https://npm.pkg.github.com/@sebastienrousseau/jspassgen/${VER}" >/dev/null 2>&1; then
    echo "==> @sebastienrousseau/jspassgen@${VER} is already published on GitHub Packages, skipping..."
    continue
  fi

  echo "==> Preparing @sebastienrousseau/jspassgen@${VER} for GitHub Packages..."
  STAGE_DIR="${WORK_DIR}/${VER}"
  mkdir -p "${STAGE_DIR}"

  if git rev-parse "v${VER}" >/dev/null 2>&1; then
    git archive "v${VER}" | tar -x -C "${STAGE_DIR}"
  else
    git archive HEAD | tar -x -C "${STAGE_DIR}"
  fi

  cd "${STAGE_DIR}"

  # Remove any archived .npmrc to prevent overriding GitHub Packages registry
  rm -f .npmrc

  # Set scoped package name for GitHub Packages, ensure absolute logo URL, and strip scripts
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.name = '@sebastienrousseau/jspassgen';
    pkg.version = '${VER}';
    pkg.publishConfig = { access: 'public', registry: 'https://npm.pkg.github.com/' };
    pkg.repository = {
      type: 'git',
      url: 'git+https://github.com/sebastienrousseau/jspassgen.git'
    };
    delete pkg.scripts;
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

    if (fs.existsSync('README.md')) {
      let readme = fs.readFileSync('README.md', 'utf8');
      const target = 'https://raw.githubusercontent.com/sebastienrousseau/jspassgen/master/.github/assets/logo.svg';
      if (readme.includes('.github/assets/logo.svg') && !readme.includes('raw.githubusercontent.com')) {
        readme = readme.split('.github/assets/logo.svg').join(target);
        fs.writeFileSync('README.md', readme);
      }
    }
  "

  if [ "${VER}" = "${LATEST_VER}" ]; then
    echo "Publishing @sebastienrousseau/jspassgen@${VER} as latest..."
    npm publish . --access public --tag latest --registry https://npm.pkg.github.com/ --ignore-scripts --userconfig "${WORK_DIR}/.npmrc" || true
  else
    echo "Publishing historical @sebastienrousseau/jspassgen@${VER}..."
    npm publish . --access public --tag "release-${VER}" --registry https://npm.pkg.github.com/ --ignore-scripts --userconfig "${WORK_DIR}/.npmrc" || true
  fi
  cd "${REPO_ROOT}"
done

echo "==> Successfully processed all versions to GitHub Packages!"
