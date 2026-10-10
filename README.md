<!-- SPDX-License-Identifier: Apache-2.0 OR MIT -->

<p align="center">
  <img src=".github/assets/logo.svg" alt="jspassgen logo" width="128" />
</p>

<h1 align="center">jspassgen</h1>

<p align="center">
  Fast, simple, and powerful utility for generating cryptographically secure passwords and passphrases across Node.js, CLI, and Web environments.
</p>

<p align="center">
  <a href="https://github.com/sebastienrousseau/jspassgen/actions/workflows/quality-gates.yml"><img src="https://img.shields.io/github/actions/workflow/status/sebastienrousseau/jspassgen/quality-gates.yml?branch=master&style=for-the-badge&logo=github&label=Build" alt="Build" /></a>
  <a href="https://www.npmjs.com/package/jspassgen"><img src="https://img.shields.io/npm/v/jspassgen.svg?style=for-the-badge&color=fc8d62&logo=npm" alt="npm registry" /></a>
  <a href="https://github.com/sebastienrousseau/jspassgen/releases"><img src="https://img.shields.io/github/v/release/sebastienrousseau/jspassgen?style=for-the-badge&color=blue&logo=github&label=Release" alt="Release" /></a>
  <a href="https://app.codacy.com/gh/sebastienrousseau/jspassgen/dashboard"><img src="https://img.shields.io/codacy/grade/0acb169c95e443729551979e0fd86eaf?style=for-the-badge&logo=codacy" alt="Codacy grade" /></a>
  <a href="LICENSE-APACHE"><img src="https://img.shields.io/badge/license-Apache--2.0%20OR%20MIT-blue.svg?style=for-the-badge" alt="License: Apache-2.0 OR MIT" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/node->=22.0.0-93450a.svg?style=for-the-badge&logo=node.js" alt="Node.js 22+" /></a>
</p>

---

## Contents

**Getting started**

- [Install](#install) : CLI execution and library installation
- [Requirements](#requirements) : toolchain floor, platforms
- [Quick Start](#quick-start) : interactive setup and common one-liners

**The jspassgen ecosystem**

- [The jspassgen ecosystem](#the-jspassgen-ecosystem) : platform-agnostic core and runtime adapters

**Library reference**

- [Capabilities at a glance](#capabilities-at-a-glance) : supported password types
- [CLI reference](#cli-reference) : flags and options
- [Programmatic API](#programmatic-api) : Node.js and browser integration
- [Web UI](#web-ui) : accessible browser application
- [Benchmarks](#benchmarks) : performance benchmarks

**Operational**

- [When not to use jspassgen](#when-not-to-use-jspassgen) : limitations and appropriate boundaries
- [Development](#development) : local gates, tests, build commands
- [Security](#security) : CSPRNG guarantees, entropy calculations, downstream storage
- [Documentation](#documentation) : architectural and standards references
- [Stability guarantees](#stability-guarantees) : SemVer axis and release policy
- [License](#license) : dual licensing details

---

## Install

### As a CLI tool

Run directly via `npx` without prior installation:

```bash
npx jspassgen
```

Or install globally:

```bash
npm install -g jspassgen
```

### As a Node.js library

```bash
npm install jspassgen
```

---

## Requirements

- **Runtime**: Node.js `^22.0.0` or `>=24.0.0`
- **Browsers**: Modern evergreen browsers supporting Web Crypto API (`crypto.getRandomValues`)
- **Zero Platform Dependencies in Core**: `packages/core` is pure ESM with no native dependencies

---

## Quick Start

### Interactive Mode

Launch the guided terminal prompt:

```bash
npx jspassgen --interactive
```

### Command Line Generation

Generate a strong password and copy it to the clipboard:

```bash
npx jspassgen -p quick -c
```

Generate a memorable passphrase using EFF wordlists:

```bash
npx jspassgen -t memorable -i 4 -s '-'
```

---

## The jspassgen ecosystem

jspassgen is organized into decoupled layers:

- **`packages/core`**: Zero-dependency domain engine implementing password generators, Shannon entropy calculations, character sets, and port contracts.
- **Node.js Adapter (`src/`)**: Concrete implementations using Node.js `crypto` (`crypto.randomBytes`, `crypto.randomInt`), terminal UI rendering, and clipboard lifecycle management.
- **Web Adapter (`src/ui/web/`)**: In-browser presentation layer using Web Crypto API and WCAG 2.2 AAA accessible controls.

---

## Capabilities at a glance

| Type | Strategy | Description | Typical Use Case |
| :--- | :--- | :--- | :--- |
| `strong` | Random character selection | Mixed uppercase, lowercase, numbers, and symbols | High-security administrative accounts |
| `base64` | RFC 4648 Base64 | Safe 64-character alphabet without padding bias | API secrets, cryptographic tokens |
| `memorable` | EFF Diceware dictionary | Human-friendly passphrase words separated by delimiter | Master passwords, verbal transmission |
| `quantum-resistant`| 256+ bit CSPRNG entropy | High-entropy string exceeding quantum brute-force thresholds | Long-term secrets, archival credentials |
| `diceware` | 5-dice EFF mapping | Passphrases mapped to standard 7,776-word EFF lists | Standardized security passphrases |
| `honeyword` | Decoy generation | Set containing 1 true secret and N believable decoys | Intrusion and database breach detection |
| `pronounceable`| CVVC syllable patterns | Easy-to-pronounce syllables | Human-readable verbal sharing |
| `custom` | Character set or template | User-configured allowed/forbidden characters | Specific legacy password policy compliance |

---

## CLI reference

```bash
jspassgen [options]
```

### Options

| Flag | Description | Default |
| :--- | :--- | :--- |
| `-t, --type <type>` | Password generation type (`strong`, `base64`, `memorable`, `quantum-resistant`, `diceware`, `honeyword`, `pronounceable`, `custom`) | `strong` |
| `-l, --length <n>` | Length of each chunk or password | `16` |
| `-i, --iteration <n>` | Number of chunks, syllables, or words | `1` |
| `-s, --separator <char>`| Delimiter character between chunks | `-` |
| `-p, --preset <name>` | Predefined configuration profile (`quick`, `secure`, `memorable`, `quantum`) | None |
| `-c, --clipboard` | Copy result to system clipboard (auto-scrubbed after 45s) | `false` |
| `-a, --audit` | Display cryptographic entropy and security audit report | `false` |
| `-n, --count <n>` | Number of distinct passwords to generate | `1` |
| `-f, --format <fmt>` | Structured output format (`text`, `json`, `csv`, `yaml`) | `text` |
| `--allowed-chars <chars>` | Character sets or literal characters for `custom` type | Standard ASCII |
| `--forbidden-chars <chars>`| Characters to exclude from `custom` generation | None |
| `--reveal` | Indicate real vs decoy index in `honeyword` output | `false` |
| `--interactive` | Launch interactive configuration wizard | `false` |
| `-h, --help` | Display command-line usage information | None |

---

## Programmatic API

### High-level Service

```javascript
import PasswordGenerator from 'jspassgen';

const password = await PasswordGenerator({
  type: 'strong',
  length: 20,
  iteration: 2,
  separator: '-',
});

console.log(password);
```

### Pure Core Engine

```javascript
import { createService } from '@jspassgen/core';
import { NodeCryptoRandom } from 'jspassgen/adapters/node';

const service = createService({}, { randomGenerator: new NodeCryptoRandom() });

const result = await service.generate({
  type: 'quantum-resistant',
  length: 43,
  includeEntropy: true,
});

console.log(result.password);
console.log(`Entropy: ${result.entropy} bits (${result.securityLevel})`);
```

---

## Web UI

A standalone client-side demo runs directly in any browser:

```bash
npm run demo:web
```

Features include WCAG 2.2 AAA accessible controls, real-time entropy estimation, dark and light theme tokens, and local storage history.

---

## Benchmarks

Benchmark results on modern hardware (Apple Silicon / Node.js 24):

- **Strong Generation (16 chars)**: ~500,000 ops/sec
- **Base64 Generation (32 chars)**: ~750,000 ops/sec
- **Entropy Calculation**: ~2,000,000 ops/sec

Run benchmarks locally:

```bash
npm run benchmark:generation
npm run benchmark:crypto
npm run benchmark:entropy
```

---

## When not to use jspassgen

- **Password Storage / Hashing**: jspassgen is a generation utility. It does not hash or verify credentials. Store generated passwords using dedicated Key Derivation Functions (Argon2id, scrypt, or bcrypt).
- **Non-CSPRNG Mocking**: Do not use in environments where cryptographically secure entropy sources (`crypto.randomBytes` or `crypto.getRandomValues`) are unavailable.

---

## Development

Full development guidelines, testing standards, and CI verification gates are documented in [DEVELOPMENT.md](DEVELOPMENT.md).

```bash
# Run tests and coverage
npm test

# Run linters
npm run lint && npm run lint:markdown

# Verify core zero-dependency isolation
npm run verify:core

# Compile and verify distribution package
npm run build
```

---

## Security

- **CSPRNG Enforced**: Generated exclusively via platform CSPRNGs (`crypto.randomBytes`, `crypto.randomInt`, or `crypto.getRandomValues`). Math.random() is strictly prohibited.
- **Automated Clipboard Purging**: Passwords copied via `-c` / `--clipboard` are automatically overwritten with empty data in system memory after 45 seconds or on process termination.
- **Reporting Vulnerabilities**: See [SECURITY.md](SECURITY.md) for vulnerability disclosure policies.

---

## Stability guarantees

- **Semantic Versioning**: All releases increment strictly by `0.0.1`. Breaking API changes increment minor versions after deprecation windows.
- **Core Package Isolation**: `packages/core` remains strictly zero-dependency across all versions.

---

## License

Licensed under either of:

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or <https://www.apache.org/licenses/LICENSE-2.0>)
- MIT License ([LICENSE-MIT](LICENSE-MIT) or <https://opensource.org/licenses/MIT>)

at your option.

---

Copyright &copy; 2022-2026 <a href="https://sebastienrousseau.com/" rel="author">Sebastien Rousseau</a>. All rights reserved.
