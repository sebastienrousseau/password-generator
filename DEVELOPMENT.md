<!-- SPDX-License-Identifier: Apache-2.0 OR MIT -->

# Development Guide

This guide describes how to set up the development environment, execute tests, verify package isolation, reproduce all CI gates locally, and understand the release lifecycle for `jspassgen` (JavaScript Password Generator).

---

## 1. Prerequisites

- **Node.js**: `^22.0.0` or `>=24.0.0`
- **npm**: `^10.0.0`
- **Git**: Configured with SSH commit signing (`commit.gpgsign = true`)

Verify your local toolchain:

```bash
node --version
npm --version
git --version
```

---

## 2. Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/sebastienrousseau/jspassgen.git
cd jspassgen
npm ci
```

---

## 3. Architecture & Package Structure

The repository uses a hexagonal architecture separating the runtime-agnostic domain core from platform-specific adapters:

```text
jspassgen/
├── packages/
│   └── core/                     # Runtime-agnostic core domain
│       ├── src/
│       │   ├── api/              # Public builder interfaces
│       │   ├── domain/           # Pure entropy and validation logic
│       │   ├── generators/       # Password generation strategies
│       │   ├── ports/            # Port interfaces and in-memory fakes
│       │   └── index.js          # Core entry point
│       └── test/                 # Core domain and contract tests
├── src/                          # Node.js and CLI implementation
│   ├── adapters/                 # Platform adapters (crypto, clock, etc.)
│   ├── cli/                      # CLI controllers and interactive UI
│   ├── services/                 # Application services
│   └── ui/                       # Terminal styling and theme tokens
├── test/                         # Integration and CLI test suites
└── dist/                         # Compiled distribution bundle
```

---

## 4. Local Validation Gates

All pull requests and commits must satisfy the following validation gates prior to merge:

### Running Tests

Run the full mocha test suite with c8 code coverage:

```bash
npm test
```

Run web and cross-interface parity tests:

```bash
npm run test:parity
npm run test:web
```

### Linting and Formatting

Run ESLint and Markdown linters with zero errors and zero warnings:

```bash
npm run lint
npm run lint:markdown
```

Automatically fix linting discrepancies:

```bash
npm run lint:fix
npm run format
```

### Core Package Isolation Verification

Verify that `packages/core` contains zero Node.js built-ins, browser globals, or third-party dependencies:

```bash
npm run verify:core
```

### Build & Package Verification

Compile distribution artifacts and test built binaries:

```bash
npm run build
node dist/index.js -p quick
node dist/index.js -t honeyword -l 16 -i 3
```

---

## 5. Benchmarks

Run performance benchmarks across password generation, CSPRNG operations, and entropy calculations:

```bash
npm run benchmark:crypto
npm run benchmark:entropy
npm run benchmark:generation
```

---

## 6. Release & Branch Lifecycle

The project follows strict Semantic Versioning and branch lifecycle invariants:

1. **Version Increments**: Every release increments strictly by `0.0.1` (`v0.0.1` -> `v0.0.2` ... -> `v0.0.999` -> `v0.1.0`).
2. **Release Branch**: All work for an iteration begins on `feat/v<next-version>`.
3. **Single Active Release PR**: Across the repository, there is at most ONE active pull request targeting `master`, which must be `feat/v<next-version>`.
4. **Branch Funneling**: Dependabot updates, security fixes, and feature commits are merged into `feat/v<next-version>`, never directly into `master`.
5. **Signed Commits & Tags**: Commits and tags require cryptographic SSH signing.
