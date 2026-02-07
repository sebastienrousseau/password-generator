<!-- markdownlint-disable MD033 MD041 -->
<img
  src="https://kura.pro/password-generator-pro/images/logos/password-generator-pro.webp"
  alt="Password Generator Logo"
  width="261"
  align="right"
/>
<!-- markdownlint-enable MD033 MD041 -->

# Password Generator

A fast, simple, and powerful open-source utility for generating cryptographically secure passwords. Supports three password types: strong (complex), base64-encoded, and memorable word-based passwords.

[![Getting Started](https://kura.pro/common/images/buttons/button-primary.svg)](#quick-start)
[![Download v1.1.4](https://kura.pro/common/images/buttons/button-secondary.svg)](https://github.com/sebastienrousseau/password-generator/archive/refs/tags/1.1.4.zip)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/0acb169c95e443729551979e0fd86eaf)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=sebastienrousseau/password-generator&utm_campaign=Badge_Grade)
[![npm](https://img.shields.io/npm/v/@sebastienrousseau/password-generator.svg?style=flat&color=success)](https://www.npmjs.com/package/@sebastienrousseau/password-generator)
[![Release Notes](https://img.shields.io/badge/release-notes-success.svg)](https://github.com/sebastienrousseau/password-generator/releases/)
[![License: MIT](https://img.shields.io/badge/License-MIT-success.svg?style=flat)](https://opensource.org/licenses/MIT)

## Get Started in 30 Seconds

### Quick Install & First Password

**Requirements:** Node.js 18+

```bash
# Install and generate your first password instantly
npx @sebastienrousseau/password-generator
```

**That's it!** The interactive setup will guide you through creating your first secure password.

### Direct Commands (For Power Users)

```bash
# Strong password for important accounts
npx @sebastienrousseau/password-generator -t strong -l 12 -i 3 -s '-'
# Output: aB3dEf+/gH1i-Kl2MnOpQr3s-tU4vWxYz5A

# Memorable password for daily use
npx @sebastienrousseau/password-generator -t memorable -i 4 -s '-'
# Output: Apple-Breeze-Castle-Diamond
```

**Use in Your Code:**
```javascript
import PasswordGenerator from "@sebastienrousseau/password-generator";

const password = await PasswordGenerator({
  type: "strong", length: 12, iteration: 3, separator: "-"
});
```

### What You'll Get

✅ **Cryptographically secure** passwords using Node.js crypto module
✅ **Interactive guided setup** for first-time users
✅ **Three password types**: strong, memorable, base64
✅ **Instant clipboard copy** option
✅ **Zero configuration** required to start

## Interactive Onboarding

When you run `npx @sebastienrousseau/password-generator` without options, you'll enter a friendly 4-step setup:

**Step 1: Choose Password Type** → Pick from strong, memorable, or base64
**Step 2: Security Level** → Select quick, secure, memorable, or custom
**Step 3: Clipboard Settings** → Auto-copy or display only
**Step 4: Generate** → Get your password plus the CLI command to recreate it

**Navigation:** Use arrow keys, numbers (1-3), Space for examples, ESC to go back

**Example Experience:**
```
🔐 Welcome to Password Generator!
●○○○ (1/4)

📋 Choose your password type:
▶ 1. 🔐 strong - Maximum security for important accounts
  2. 🧠 memorable - Easy to remember for daily use
  3. ⚙️ base64 - For API keys and system integration

Controls: Arrow Keys: Navigate • Enter: Select • Space: Show examples
```

**First-timer friendly:** The onboarding shows examples, explains security implications, and teaches you the CLI commands for future use.

## Password Types

| Type | Description | Use Case | Example Output |
|------|-------------|----------|----------------|
| **strong** | Complex passwords with uppercase, lowercase, numbers, symbols | High-security accounts | `aB3dEf+/gH1i-Kl2MnOp` |
| **base64** | Base64-encoded character combinations | API keys, tokens | `YWJjZGVm.ZGhpamts` |
| **memorable** | Dictionary words for easy recall | Personal accounts, shared passwords | `Apple-Castle-River-Moon` |

## Usage Guide

### Command Line Interface

**Basic syntax:**
```bash
npx @sebastienrousseau/password-generator [options]
```

**Options:**
```
-t, --type <type>          Password type: strong, base64, memorable
-l, --length <number>      Length of each password chunk (not applicable to memorable)
-i, --iteration <number>   Number of chunks or words
-s, --separator <char>     Separator between chunks/words
-c, --clipboard            Copy generated password to clipboard
-h, --help                 Show help
```

### Common Use Cases

**Enterprise & High-Security:**
```bash
# Banking/financial (maximum security)
npx @sebastienrousseau/password-generator -t strong -l 20 -i 4 -s '' --clipboard

# Database connections (strong, readable chunks)
npx @sebastienrousseau/password-generator -t strong -l 12 -i 3 -s '-'
```

**API Keys & Tokens:**
```bash
# OAuth bearer token
npx @sebastienrousseau/password-generator -t base64 -l 32 -i 1 -s ''

# Multi-part API key
npx @sebastienrousseau/password-generator -t base64 -l 16 -i 3 -s '.'
```

**Team & Shared Access:**
```bash
# Shared development accounts (memorable)
npx @sebastienrousseau/password-generator -t memorable -i 4 -s '-'

# Temporary contractor access
npx @sebastienrousseau/password-generator -t memorable -i 3 -s '.'
```

**Compliance-Ready:**
```bash
# PCI-DSS compliant (24+ chars, high entropy)
npx @sebastienrousseau/password-generator -t strong -l 12 -i 2 -s ''

# HIPAA-friendly (readable for healthcare staff)
npx @sebastienrousseau/password-generator -t strong -l 12 -i 3 -s '-'
```

**JavaScript Integration:**
```javascript
// Automated user provisioning
const password = await PasswordGenerator({
  type: "strong", length: 16, iteration: 3, separator: ""
});

// API key generation service
const apiKey = await PasswordGenerator({
  type: "base64", length: 32, iteration: 1, separator: ""
});
```

## API Reference

### PasswordGenerator(options) → Promise\<string>

```javascript
import PasswordGenerator from "@sebastienrousseau/password-generator";

const password = await PasswordGenerator({
  type: "strong",        // "strong" | "base64" | "memorable"
  length: 12,           // chunk length (not for memorable)
  iteration: 3,         // number of chunks/words
  separator: "-"        // separator character(s)
});
```

**Security:** Cryptographically secure using Node.js `crypto.randomInt()`. No predictable patterns. Configurable entropy via length × iteration.

## Programmatic API (Core Package)

For programmatic usage in Node.js or browser environments, use the platform-agnostic core package:

```javascript
import { createQuickService } from '@password-generator/core';
import { NodeCryptoRandom } from './src/adapters/node/crypto-random.js';

// Create service with a random generator adapter
const service = createQuickService(new NodeCryptoRandom());

// Generate passwords
const strongPassword = await service.generate({
  type: 'strong',
  length: 16,
  iteration: 3,
  separator: '-'
});

const memorablePassword = await service.generate({
  type: 'memorable',
  iteration: 4,
  separator: '-'
});

// Calculate entropy before generating
const entropy = service.calculateEntropy({
  type: 'strong',
  length: 16,
  iteration: 3
});
console.log(`Entropy: ${entropy.totalBits} bits (${entropy.securityLevel})`);
```

The core package has zero dependencies and uses a port/adapter pattern for I/O, making it suitable for any JavaScript runtime. See [packages/core/README.md](packages/core/README.md) for details.

## Project Structure

```
password-generator/
├── packages/
│   └── core/             # Platform-agnostic core (zero dependencies)
├── src/
│   ├── adapters/         # Node.js adapters (crypto, clipboard)
│   ├── cli/              # CLI controller (thin adapter)
│   └── ui/web/           # Web UI (thin adapter)
├── benchmarks/           # Performance benchmarks
└── docs/                 # Documentation
```

## Development

**Setup:**
```bash
git clone https://github.com/sebastienrousseau/password-generator.git
cd password-generator
npm install
```

**Available Scripts:**
```bash
npm run build      # Build distribution files
npm run test       # Run tests and coverage
npm run lint       # Check code style
npm run lint:fix   # Fix code style issues
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](.github/CONTRIBUTING.md) for details.

**Quick contribution checklist:**
- [ ] Fork the repository
- [ ] Create a feature branch
- [ ] Write tests for new features
- [ ] Ensure all tests pass
- [ ] Follow the existing code style
- [ ] Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 **Documentation**: [API Reference](docs/)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/sebastienrousseau/password-generator/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/sebastienrousseau/password-generator/discussions)
- 📦 **Releases**: [GitHub Releases](https://github.com/sebastienrousseau/password-generator/releases)

---

**Designed by Sebastien Rousseau — Engineered with Euxis**
