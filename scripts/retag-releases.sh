#!/usr/bin/env bash
# SPDX-License-Identifier: Apache-2.0 OR MIT
set -euo pipefail

# Script to retag and publish standardized releases for jspassgen
# Adheres strictly to /Users/seb/Code/AGENTS.md, REPO-STANDARD.md, and passmcp v0.0.5 format

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${REPO_ROOT}"

echo "==> Updating signed annotated tags for v0.0.1 through v0.0.11..."

declare -a RELEASES=(
  "v0.0.1:1.0.4:0.0.1"
  "v0.0.2:1.0.5:0.0.2"
  "v0.0.3:1.0.6:0.0.3"
  "v0.0.4:1.0.7:0.0.4"
  "v0.0.5:1.0.8:0.0.5"
  "v0.0.6:1.0.9:0.0.6"
  "v0.0.7:1.1.0:0.0.7"
  "v0.0.8:1.1.1:0.0.8"
  "v0.0.9:1.1.3:0.0.9"
  "v0.0.10:v1.1.4:0.0.10"
  "v0.0.11:v1.1.5:0.0.11"
)

for entry in "${RELEASES[@]}"; do
  IFS=":" read -r tag src ver <<< "${entry}"
  # Resolve commit from the existing tag or legacy tag
  if git rev-parse "${tag}^{commit}" >/dev/null 2>&1; then
    commit="$(git rev-parse "${tag}^{commit}")"
  else
    commit="$(git rev-parse "${src}^{commit}")"
  fi
  echo "Tagging ${tag} (${commit:0:7}) with jspassgen ${tag}..."
  git tag -s -a -f -m "jspassgen ${tag}" "${tag}" "${commit}"
done

echo "==> Pushing new standardized tags to origin..."
for entry in "${RELEASES[@]}"; do
  IFS=":" read -r tag _ _ <<< "${entry}"
  echo "Pushing ${tag} to origin..."
  git push origin "${tag}" --force
done

echo "==> Updating GitHub Releases with 'jspassgen v<version>' titles..."
for entry in "${RELEASES[@]}"; do
  IFS=":" read -r tag _ ver <<< "${entry}"
  notes_file="docs/releases/${tag}.md"
  title="jspassgen ${tag}"
  echo "Setting release title for ${tag}: ${title}..."
  if gh release view "${tag}" >/dev/null 2>&1; then
    gh release edit "${tag}" --title "${title}" --notes-file "${notes_file}"
  else
    gh release create "${tag}" --title "${title}" --notes-file "${notes_file}"
  fi
done

echo "==> Checking for remaining legacy tags..."
declare -a LEGACY_TAGS=(
  "1.0.4"
  "1.0.5"
  "1.0.6"
  "1.0.7"
  "1.0.8"
  "1.0.9"
  "1.1.0"
  "1.1.1"
  "1.1.3"
  "v1.1.4"
  "v1.1.5"
)

for ltag in "${LEGACY_TAGS[@]}"; do
  if git rev-parse "${ltag}^{commit}" >/dev/null 2>&1; then
    echo "Deleting legacy tag ${ltag}..."
    gh release delete "${ltag}" --yes 2>/dev/null || true
    git tag -d "${ltag}" 2>/dev/null || true
    git push origin --delete "${ltag}" 2>/dev/null || true
  fi
done

echo "==> Done. All 11 releases have been retitled to 'jspassgen <version>'."
