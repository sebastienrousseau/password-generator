#!/usr/bin/env bash
# Copyright © 2022-2026 JavaScript Password Generator (jspassgen). All rights reserved.
# SPDX-License-Identifier: Apache-2.0 OR MIT

# Publish historical tags and current version to npmjs registry
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

echo "Publishing all versions of jspassgen to https://registry.npmjs.org/..."

# Check npm authentication
npm whoami --registry https://registry.npmjs.org/

ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
TMP_PUBLISH_DIR=$(mktemp -d)
trap 'rm -rf "${TMP_PUBLISH_DIR}"; git checkout "${ORIGINAL_BRANCH}"' EXIT

for VER in "${VERSIONS[@]}"; do
  echo "=== Preparing jspassgen@${VER} ==="
  git checkout "v${VER}"

  # Build the package distribution
  npm run build

  # If this is the latest version, tag as latest, otherwise publish with version tag
  if [ "${VER}" = "0.0.15" ]; then
    echo "Publishing jspassgen@${VER} as latest..."
    npm publish dist/ --access public --tag latest
  else
    echo "Publishing historical jspassgen@${VER}..."
    npm publish dist/ --access public --tag "legacy-${VER}"
  fi
done

echo "Successfully published all versions to npmjs!"
