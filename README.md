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

## Quick Start

### Installation

**Node.js Requirements:** Node.js >= 18.0.0

**Install from npm:**
```bash
npm install @sebastienrousseau/password-generator
```

**Install from source:**
```bash
git clone https://github.com/sebastienrousseau/password-generator.git
cd password-generator
npm install
```

### Generate Your First Password

**Command Line:**
```bash
# Generate a strong password with 3 chunks of 12 characters
npx @sebastienrousseau/password-generator -t strong -l 12 -i 3 -s '-'
# Output: aB3dEf+/gH1i-Kl2MnOpQr3s-tU4vWxYz5A

# Generate a memorable password
npx @sebastienrousseau/password-generator -t memorable -i 4 -s '-'
# Output: Apple-Breeze-Castle-Diamond
```

**Node.js/JavaScript:**
```javascript
import PasswordGenerator from "@sebastienrousseau/password-generator";

const password = await PasswordGenerator({
  type: "strong",
  length: 12,
  iteration: 3,
  separator: "-",
});
console.log(password); // aB3dEf+/gH1i-Kl2MnOpQr3s-tU4vWxYz5A
```

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

### How-To Guides

#### Generate Enterprise-Grade Strong Passwords

**For high-security systems:**
```bash
# Generate a 64-character strong password (4 chunks of 16 chars)
npx @sebastienrousseau/password-generator -t strong -l 16 -i 4 -s '-'
# Output: A9k#mP2q$vZ8-B7n&jX4!wE3-C6r*sY9@uT1-D5h^lI0%fG8
```

**For database connections:**
```javascript
import PasswordGenerator from "@sebastienrousseau/password-generator";

const dbPassword = await PasswordGenerator({
  type: "strong",
  length: 20,
  iteration: 2,
  separator: "",  // No separator for single string
});
console.log(dbPassword); // A9k#mP2q$vZ8B7n&jX4!
```

#### Generate Base64 API Keys

**For REST API authentication:**
```bash
# Generate base64 tokens with dot separators
npx @sebastienrousseau/password-generator -t base64 -l 12 -i 3 -s '.'
# Output: YWJjZGVmZ2hp.amlrbG1ub3Bx.cnN0dXZ3eHl6
```

**For OAuth tokens:**
```javascript
const apiKey = await PasswordGenerator({
  type: "base64",
  length: 32,
  iteration: 1,
  separator: "",
});
console.log(apiKey); // YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=
```

#### Generate Memorable Passwords

**For team sharing:**
```bash
# Generate 5-word memorable password
npx @sebastienrousseau/password-generator -t memorable -i 5 -s '-'
# Output: Ocean-Mountain-Thunder-Crystal-Phoenix
```

**For user onboarding:**
```javascript
const tempPassword = await PasswordGenerator({
  type: "memorable",
  iteration: 3,
  separator: ".",
});
console.log(tempPassword); // Forest.River.Eagle
```

#### Copy to Clipboard

**Quick clipboard copy (all password types):**
```bash
npx @sebastienrousseau/password-generator -t strong -l 12 -i 3 -s '-' --clipboard
# Password copied to clipboard: A9k#mP2q$vZ8-B7n&jX4!wE3-C6r*sY9@uT1
```

## API Reference

### PasswordGenerator(options)

**Description:** Generates a password based on specified options.

**Parameters:**
- `options` (Object) - Configuration object
  - `type` (string) - Password type: `"strong"`, `"base64"`, or `"memorable"`
  - `length` (number) - Length of each chunk (not used for memorable type)
  - `iteration` (number) - Number of chunks or words to generate
  - `separator` (string) - Character(s) to separate chunks/words

**Returns:** Promise\<string> - The generated password

**Example:**
```javascript
const password = await PasswordGenerator({
  type: "strong",
  length: 12,
  iteration: 3,
  separator: "-"
});
```

### Security Features

- **Cryptographically Secure**: Uses Node.js `crypto.randomInt()` and `crypto.randomBytes()`
- **No Predictable Patterns**: Each password is independently generated
- **Configurable Entropy**: Adjust length and iterations for desired security level
- **Dictionary Support**: 24 themed dictionaries for memorable passwords

## Project Structure

```
password-generator/
├── index.js              # Main entry point
├── package.json           # Package configuration
├── src/
│   ├── bin/              # CLI implementation
│   ├── lib/              # Core password generators
│   ├── dictionaries/     # Word lists for memorable passwords
│   └── utils/            # Utility functions
├── docs/                 # Auto-generated API docs (JSDoc)
└── .github/              # GitHub templates and workflows
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
