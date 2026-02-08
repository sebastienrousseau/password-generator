<p align="right">
  <img src="https://kura.pro/password-generator-pro/images/logos/password-generator-pro.webp" alt="jspassgen logo" width="64" />
</p>

# jspassgen — Cryptographically Secure Password Generator

[![npm](https://img.shields.io/npm/v/jspassgen.svg?style=for-the-badge&color=success)](https://www.npmjs.com/package/jspassgen)
[![Codacy](https://img.shields.io/codacy/grade/0acb169c95e443729551979e0fd86eaf?style=for-the-badge)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=sebastienrousseau/jspassgen&utm_campaign=Badge_Grade)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/jspassgen?style=for-the-badge)](https://www.npmjs.com/package/jspassgen)

---

## Overview

Generate cryptographically secure passwords instantly from the command line or programmatically. jspassgen supports **8 password types** including quantum-resistant, diceware, and memorable passphrases — all powered by Node.js `crypto.randomInt()`.

```bash
npx jspassgen
```

---

## Table of contents

- [Get started](#get-started)
- [Password types](#password-types)
- [CLI reference](#cli-reference)
- [Programmatic API](#programmatic-api)
- [Quantum-resistant mode](#quantum-resistant-mode)
- [Web UI](#web-ui)
- [Security](#security)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Get started

**Requirements:** Node.js 20+

### Quick install

```bash
# Interactive guided setup
npx jspassgen

# Direct generation
npx jspassgen -t strong -l 16 -i 3 -s '-'
# Output: aB3dEf+/gH1iKl2M-nOpQr3stU4vWx-Yz5AbCdEfGh6I
```

### Code integration

```javascript
import PasswordGenerator from 'jspassgen';

const password = await PasswordGenerator({
  type: 'strong',
  length: 16,
  iteration: 3,
  separator: '-'
});
```

---

## Password types

| Type | Description | Example |
|------|-------------|---------|
| `strong` | Complex with uppercase, lowercase, numbers, symbols | `aB3dEf+/gH1i-Kl2MnOp` |
| `base64` | Base64-encoded for API keys and tokens | `YWJjZGVm.ZGhpamts` |
| `memorable` | Dictionary words for easy recall | `Apple-Castle-River-Moon` |
| `quantum-resistant` | Enhanced entropy with quantum-safe algorithms | `QR$v9K#mF2@x7L&nE8!p` |
| `diceware` | EFF wordlist-based passphrases | `unnoticed-repave-scoring` |
| `pronounceable` | Phonetically speakable passwords | `Fir-Mov-Lin-Tet` |
| `honeyword` | Deceptive passwords for honeypots | `trap-word-honey-pot` |
| `custom` | User-defined character sets | Custom output |

---

## CLI reference

```bash
npx jspassgen [options]
```

| Option | Description |
|--------|-------------|
| `-t, --type <type>` | Password type (strong, base64, memorable, quantum-resistant, diceware, honeyword, pronounceable, custom) |
| `-l, --length <n>` | Length of each chunk |
| `-i, --iteration <n>` | Number of chunks or words |
| `-s, --separator <char>` | Separator between chunks |
| `-c, --clipboard` | Copy to clipboard |
| `-p, --preset <name>` | Use preset (quick, secure, memorable, quantum) |
| `-a, --audit` | Show security audit |
| `-n, --count <n>` | Bulk generation count |
| `-f, --format <fmt>` | Output format (json, yaml, csv, text) |
| `--interactive` | Start guided setup |
| `-h, --help` | Show help |

### Examples

```bash
# Strong password for banking
npx jspassgen -t strong -l 20 -i 4 -s '' --clipboard

# Memorable for team sharing
npx jspassgen -t memorable -i 4 -s '-'

# API token
npx jspassgen -t base64 -l 32 -i 1

# Quantum-resistant
npx jspassgen -t quantum-resistant -l 32 -i 4
```

---

## Programmatic API

### Basic usage

```javascript
import PasswordGenerator from 'jspassgen';

const password = await PasswordGenerator({
  type: 'strong',
  length: 12,
  iteration: 3,
  separator: '-'
});
```

### Core package (platform-agnostic)

```javascript
import { createQuickService } from '@jspassgen/core';
import { NodeCryptoRandom } from './src/adapters/node/crypto-random.js';

const service = createQuickService(new NodeCryptoRandom());

const password = await service.generate({
  type: 'strong',
  length: 16,
  iteration: 3,
  separator: '-'
});

// Calculate entropy
const entropy = service.calculateEntropy({ type: 'strong', length: 16, iteration: 3 });
console.log(`${entropy.totalBits} bits (${entropy.securityLevel})`);
```

---

## Quantum-resistant mode

Generate passwords that withstand both classical and quantum computational attacks following NIST Post-Quantum Cryptography standards.

### Features

- **Enhanced Character Sets**: 94 printable ASCII characters
- **Minimum 256-bit Entropy**: Quantum-safe threshold
- **NIST SP 800-132 Compliance**: Argon2id key derivation
- **Post-Quantum Ready**: Resists quantum computing threats

### Usage

```bash
# Basic quantum-resistant
npx jspassgen -t quantum-resistant

# Maximum security (512-bit entropy)
npx jspassgen -t quantum-resistant -l 64 -i 8 -s ''
```

```javascript
const password = await PasswordGenerator({
  type: 'quantum-resistant',
  length: 32,
  iteration: 4,
  separator: '',
  kdf: {
    algorithm: 'argon2id',
    memory: 131072,
    time: 5,
    parallelism: 8
  }
});
```

### KDF parameters (NIST SP 800-132)

| Level | Memory | Time | Parallelism |
|-------|--------|------|-------------|
| Minimum | 64 MB | 3 | 4 |
| Recommended | 128 MB | 5 | 8 |
| Enterprise | 256 MB | 10 | 16 |

---

## Web UI

Modern web interface with WCAG 2.2 AAA accessibility.

### Features

- Dark/light theme support
- Real-time entropy calculation
- Keyboard shortcuts (Ctrl+Enter, Ctrl+C)
- Password history
- Screen reader support

### Quick start

```bash
git clone https://github.com/sebastienrousseau/jspassgen.git
cd jspassgen
npx serve src/ui/web/demo
# Open http://localhost:3000
```

---

## Security

### Password storage

Database storage requires secure Key Derivation Functions. **Never store plain text passwords.**

- **Recommended**: Argon2id with NIST SP 800-132 parameters
- **Alternative**: scrypt or PBKDF2 with high iteration counts
- **Prohibited**: MD5, SHA-1, plain SHA-256

### References

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf)

---

## Development

### Setup

```bash
git clone https://github.com/sebastienrousseau/jspassgen.git
cd jspassgen
npm install
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build distribution |
| `npm run test` | Run tests |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Fix code style |

### Project structure

```
jspassgen/
├── packages/core/     # Platform-agnostic core (zero dependencies)
├── src/
│   ├── adapters/      # Node.js adapters (crypto, clipboard)
│   ├── cli/           # CLI controller
│   └── ui/web/        # Web UI
├── benchmarks/        # Performance benchmarks
└── docs/              # Documentation
```

---

## Contributing

Please read [CONTRIBUTING.md](.github/CONTRIBUTING.md) before opening a pull request.

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE).

---

**Designed by Sebastien Rousseau — Engineered with Euxis**
