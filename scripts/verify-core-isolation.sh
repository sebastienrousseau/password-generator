#!/usr/bin/env bash
#
# verify-core-isolation.sh
# Checks that packages/core has zero platform dependencies.
# Exit code 0 = no violations found, Exit code 1 = violations detected.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CORE_DIR="$PROJECT_ROOT/packages/core"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track violations
VIOLATIONS_FOUND=0

echo "=========================================="
echo "Core Package Isolation Verification"
echo "=========================================="
echo ""
echo "Scanning: $CORE_DIR"
echo ""

# Node.js built-in modules (forbidden in core)
NODE_BUILTINS=(
  "crypto"
  "fs"
  "path"
  "http"
  "https"
  "process"
  "child_process"
  "os"
  "net"
  "tls"
  "stream"
  "buffer"
  "util"
  "events"
  "url"
  "querystring"
  "readline"
  "tty"
  "cluster"
  "worker_threads"
  "perf_hooks"
  "v8"
  "vm"
  "repl"
  "dgram"
  "dns"
  "zlib"
)

# Browser globals (forbidden in core)
BROWSER_GLOBALS=(
  "window"
  "document"
  "localStorage"
  "sessionStorage"
  "fetch"
  "XMLHttpRequest"
  "navigator"
  "location"
  "history"
)

# CLI libraries (forbidden in core)
CLI_LIBRARIES=(
  "commander"
  "chalk"
  "clipboardy"
  "inquirer"
  "ora"
  "yargs"
)

# UI frameworks (forbidden in core)
UI_FRAMEWORKS=(
  "react"
  "vue"
  "angular"
  "svelte"
  "solid"
)

# Platform-specific packages
PLATFORM_SPECIFIC=(
  "electron"
)

# Check if core directory exists
if [ ! -d "$CORE_DIR" ]; then
  echo -e "${RED}ERROR: Core directory not found at $CORE_DIR${NC}"
  exit 1
fi

# Function to check for import/require patterns
check_imports() {
  local pattern="$1"
  local category="$2"
  local files

  # Check for ES module imports: import ... from 'pattern' or import 'pattern'
  # Exclude test files - tests are allowed to use platform-specific code
  files=$(grep -rl --include="*.js" --include="*.ts" --include="*.mjs" \
    --exclude-dir="test" \
    -E "(import\s+.*from\s+['\"]${pattern}['\"]|import\s+['\"]${pattern}['\"]|from\s+['\"]node:${pattern}['\"])" \
    "$CORE_DIR/src" 2>/dev/null || true)

  if [ -n "$files" ]; then
    echo -e "${RED}VIOLATION:${NC} Found ${category} import '${pattern}' in:"
    echo "$files" | while read -r file; do
      echo "  - $file"
      grep -n -E "(import\s+.*from\s+['\"]${pattern}['\"]|import\s+['\"]${pattern}['\"]|from\s+['\"]node:${pattern}['\"])" "$file" | head -5
    done
    VIOLATIONS_FOUND=1
    return 1
  fi

  # Check for CommonJS require: require('pattern')
  # Exclude test files - tests are allowed to use platform-specific code
  files=$(grep -rl --include="*.js" --include="*.ts" --include="*.cjs" \
    --exclude-dir="test" \
    -E "require\s*\(\s*['\"]${pattern}['\"]" \
    "$CORE_DIR/src" 2>/dev/null || true)

  if [ -n "$files" ]; then
    echo -e "${RED}VIOLATION:${NC} Found ${category} require '${pattern}' in:"
    echo "$files" | while read -r file; do
      echo "  - $file"
      grep -n -E "require\s*\(\s*['\"]${pattern}['\"]" "$file" | head -5
    done
    VIOLATIONS_FOUND=1
    return 1
  fi

  return 0
}

# Function to check for global references
check_globals() {
  local pattern="$1"
  local category="$2"
  local files

  # Check for global variable usage (word boundary match)
  # Exclude test files - tests are allowed to use platform-specific code
  files=$(grep -rl --include="*.js" --include="*.ts" \
    --exclude-dir="test" \
    -E "\b${pattern}\b\s*[\.\[]" \
    "$CORE_DIR/src" 2>/dev/null || true)

  if [ -n "$files" ]; then
    echo -e "${RED}VIOLATION:${NC} Found ${category} global '${pattern}' in:"
    echo "$files" | while read -r file; do
      echo "  - $file"
      grep -n -E "\b${pattern}\b\s*[\.\[]" "$file" | head -5
    done
    VIOLATIONS_FOUND=1
    return 1
  fi

  return 0
}

echo "Checking Node.js built-in modules..."
echo "-------------------------------------------"
for module in "${NODE_BUILTINS[@]}"; do
  check_imports "$module" "Node.js built-in" || true
done
echo ""

echo "Checking browser globals..."
echo "-------------------------------------------"
for global in "${BROWSER_GLOBALS[@]}"; do
  check_globals "$global" "Browser global" || true
done
echo ""

echo "Checking CLI libraries..."
echo "-------------------------------------------"
for lib in "${CLI_LIBRARIES[@]}"; do
  check_imports "$lib" "CLI library" || true
done
echo ""

echo "Checking UI frameworks..."
echo "-------------------------------------------"
for framework in "${UI_FRAMEWORKS[@]}"; do
  check_imports "$framework" "UI framework" || true
done
echo ""

echo "Checking platform-specific packages..."
echo "-------------------------------------------"
for pkg in "${PLATFORM_SPECIFIC[@]}"; do
  check_imports "$pkg" "Platform-specific" || true
done
echo ""

echo "=========================================="
if [ $VIOLATIONS_FOUND -eq 0 ]; then
  echo -e "${GREEN}SUCCESS: No platform dependencies found in packages/core${NC}"
  exit 0
else
  echo -e "${RED}FAILED: Platform dependencies detected in packages/core${NC}"
  echo -e "${YELLOW}The core package must remain platform-agnostic.${NC}"
  echo -e "${YELLOW}Move platform-specific code to src/adapters/ instead.${NC}"
  exit 1
fi
