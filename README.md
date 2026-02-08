<!-- markdownlint-disable MD033 MD041 -->
<img
  src="https://kura.pro/password-generator-pro/images/logos/password-generator-pro.webp"
  alt="Password Generator Logo"
  width="261"
  align="right"
/>
<!-- markdownlint-enable MD033 MD041 -->

# Password Generator

Fast, powerful open-source utility generating cryptographically secure passwords. Supports 8 password types: strong, base64, memorable, quantum-resistant, diceware, honeyword, pronounceable, and custom with template support.

[![Getting Started](https://kura.pro/common/images/buttons/button-primary.svg)](#quick-start)
[![Download v1.1.5](https://kura.pro/common/images/buttons/button-secondary.svg)](https://github.com/sebastienrousseau/password-generator/archive/refs/tags/v1.1.5.zip)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/0acb169c95e443729551979e0fd86eaf)](https://www.codacy.com?utm_source=github.com&utm_medium=referral&utm_content=sebastienrousseau/password-generator&utm_campaign=Badge_Grade)
[![npm](https://img.shields.io/npm/v/@sebastienrousseau/password-generator.svg?style=flat&color=success)](https://www.npmjs.com/package/@sebastienrousseau/password-generator)
[![Release Notes](https://img.shields.io/badge/release-notes-success.svg)](https://github.com/sebastienrousseau/password-generator/releases/)
[![License: MIT](https://img.shields.io/badge/License-MIT-success.svg?style=flat)](https://opensource.org/licenses/MIT)

## Get Started in 30 Seconds

### Quick Install & First Password

**Requirements:** Node.js 20+

```bash
# Install and generate password instantly
npx @sebastienrousseau/password-generator
```

Interactive setup guides password creation.

### Direct Commands

```bash
# Strong password for important accounts
npx @sebastienrousseau/password-generator -t strong -l 12 -i 3 -s '-'
# Output: aB3dEf+/gH1i-Kl2MnOpQr3s-tU4vWxYz5A

# Memorable password for daily use
npx @sebastienrousseau/password-generator -t memorable -i 4 -s '-'
# Output: Apple-Breeze-Castle-Diamond
```

**Code Integration:**
```javascript
import PasswordGenerator from "@sebastienrousseau/password-generator";

const password = await PasswordGenerator({
  type: "strong", length: 12, iteration: 3, separator: "-"
});
```

## Storage Security

**Critical:** Store passwords securely with proper hashing.

### Application Security

Database storage requires secure Key Derivation Functions. **Never store plain text passwords.**

- **Recommended**: Argon2id with NIST SP 800-132 parameters
- **Alternative**: scrypt or PBKDF2 with high iteration counts
- **Prohibited**: MD5, SHA-1, plain SHA-256 for password hashing

### References

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html) - Digital Identity Guidelines

### Features

✅ **Cryptographically secure** passwords using Node.js crypto module
✅ **Interactive guided setup** for first-time users
✅ **8 password types**: strong, base64, memorable, quantum-resistant, diceware, honeyword, pronounceable, custom
✅ **PasswordBuilder fluent API** for advanced programmatic use
✅ **Bulk generation** with `generateMultiple()` function
✅ **Multiple output formats**: JSON, YAML, CSV, text
✅ **Strength analyzer** with entropy calculation
✅ **Web Worker support** for non-blocking bulk operations
✅ **Instant clipboard copy** option
✅ **Zero configuration** required to start

## Interactive Onboarding

Launch `npx @sebastienrousseau/password-generator` without options for 4-step setup:

**Step 1: Choose Password Type** → Select strong, memorable, or base64
**Step 2: Security Level** → Choose quick, secure, memorable, or custom
**Step 3: Clipboard Settings** → Enable auto-copy or display only
**Step 4: Generate** → Receive password plus command-line recreation command

**Navigation:** Arrow keys, numbers (1-3), Space for examples, ESC to return

**Interface Example:**
```
🔐 Welcome to Password Generator!
●○○○ (1/4)

📋 Choose password type:
▶ 1. 🔐 strong - Maximum security for important accounts
  2. 🧠 memorable - Easy to remember for daily use
  3. ⚙️ base64 - For API keys and system integration

Controls: Arrow Keys: Navigate • Enter: Select • Space: Show examples
```

Onboarding displays examples, security implications, and command-line commands for future reference.

## Password Types

| Type | Description | Use Case | Example Output |
|------|-------------|----------|----------------|
| **strong** | Complex passwords with uppercase, lowercase, numbers, symbols | High-security accounts | `aB3dEf+/gH1i-Kl2MnOp` |
| **base64** | Base64-encoded character combinations | API keys, tokens | `YWJjZGVm.ZGhpamts` |
| **memorable** | Dictionary words for easy recall | Personal accounts, shared passwords | `Apple-Castle-River-Moon` |
| **quantum-resistant** | Enhanced entropy with quantum-safe algorithms | Post-quantum security | `QR$v9K#mF2@x7L&nE8!p` |
| **diceware** | EFF Diceware wordlist-based passphrases | High-security passphrases | `unnoticed-repave-scoring-unwind` |
| **pronounceable** | Phonetically pronounceable passwords | Spoken communication scenarios | `Fir-Mov-Lin-Tet` |
| **honeyword** | Deceptive passwords for security honeypots | Intrusion detection systems | `trap-word-honey-pot` |
| **custom** | User-defined character sets and patterns | Specific compliance requirements | Custom charset output |

## Quantum-Resistant Mode

Quantum-resistant password generation withstands classical and quantum computational attacks.

### Quantum-Resistant Features

Generates passwords with enhanced entropy using quantum-safe algorithms following NIST Post-Quantum Cryptography standards:

- **Enhanced Character Sets**: Expanded symbol alphabet (94 printable ASCII characters)
- **Quantum-Safe Entropy**: Minimum 256-bit entropy threshold
- **NIST SP 800-132 Compliance**: Key derivation using Argon2id with recommended parameters
- **Post-Quantum Ready**: Resists quantum computing threats

### Limitations

- Requires proper storage and handling
- Vulnerable to social engineering attacks
- Incompatible with legacy systems requiring simple passwords
- Slower generation due to enhanced security

### Default Configuration

Quantum-resistant mode applies the following defaults:

```bash
# Default quantum-resistant configuration
Type: quantum-resistant
Length: 32 characters per chunk
Iterations: 4 chunks
Separator: '' (concatenated for maximum entropy)
Minimum Entropy: 256 bits
KDF: Argon2id (memory=65536, time=3, parallelism=4)
```

### Command-Line Examples

**Basic Quantum-Resistant Password:**
```bash
npx @sebastienrousseau/password-generator -t quantum-resistant
# Output: QR$v9K#mF2@x7L&nE8!pX3@T5w$nM9&bE8!tZ7%L4@nF6#mR2$w
```

**Enterprise High-Security:**
```bash
npx @sebastienrousseau/password-generator -t quantum-resistant -l 48 -i 6 -s ''
# Output: 288-bit entropy password for post-quantum security
```

**Readable Quantum-Resistant:**
```bash
npx @sebastienrousseau/password-generator -t quantum-resistant -l 24 -i 4 -s '-'
# Output: QR$v9K#mF2@x7L&nE8!p-X3@T5w$nM9&bE8!tZ7%-L4@nF6#mR2$w-M8&vE2#rT9$
```

**Maximum Security:**
```bash
npx @sebastienrousseau/password-generator -t quantum-resistant -l 64 -i 8 -s ''
# Output: 512-bit entropy for ultimate protection
```

### Library Examples

**Node.js Implementation:**
```javascript
import PasswordGenerator from "@sebastienrousseau/password-generator";

// Standard quantum-resistant password
const qrPassword = await PasswordGenerator({
  type: "quantum-resistant",
  length: 32,
  iteration: 4,
  separator: ""
});

// Enterprise-grade with custom KDF
const enterprisePassword = await PasswordGenerator({
  type: "quantum-resistant",
  length: 48,
  iteration: 6,
  separator: "",
  kdf: {
    algorithm: "argon2id",
    memory: 131072,    // 128MB
    time: 5,           // 5 iterations
    parallelism: 8     // 8 threads
  }
});
```

**Browser Implementation:**
```javascript
import { createQuickService } from '@password-generator/core';
import { BrowserQuantumRandom } from './adapters/browser/quantum-random.js';

// Create service with quantum-safe random generator
const service = createQuickService(new BrowserQuantumRandom());

const qrPassword = await service.generate({
  type: 'quantum-resistant',
  length: 32,
  iteration: 4,
  separator: ''
});
```

## Key Derivation Functions (KDF) - NIST SP 800-132 Guidance

### Recommended KDF: Argon2id

Password Generator uses **Argon2id** as the recommended key derivation function for quantum-resistant passwords, following **NIST SP 800-132** guidelines.

#### NIST SP 800-132 Parameters

**Minimum Parameters (NIST Compliance):**
```
Algorithm: Argon2id
Memory: 65536 KB (64 MB)
Time Cost: 3 iterations
Parallelism: 4 threads
Salt: 128-bit random salt
Output: 256-bit derived key
```

**Recommended Parameters (High Security):**
```
Algorithm: Argon2id
Memory: 131072 KB (128 MB)
Time Cost: 5 iterations
Parallelism: 8 threads
Salt: 128-bit random salt
Output: 512-bit derived key
```

**Enterprise Parameters (Maximum Security):**
```
Algorithm: Argon2id
Memory: 262144 KB (256 MB)
Time Cost: 10 iterations
Parallelism: 16 threads
Salt: 256-bit random salt
Output: 512-bit derived key
```

### KDF Configuration Examples

**command-line with Custom KDF Parameters:**
```bash
npx @sebastienrousseau/password-generator \
  -t quantum-resistant \
  --kdf-memory 131072 \
  --kdf-time 5 \
  --kdf-parallelism 8
```

**JavaScript with KDF Configuration:**
```javascript
const password = await PasswordGenerator({
  type: "quantum-resistant",
  kdf: {
    algorithm: "argon2id",
    memory: 131072,      // 128 MB
    time: 5,             // 5 iterations
    parallelism: 8,      // 8 threads
    saltLength: 16       // 128-bit salt
  }
});
```

### Security Recommendations

1. **Memory Parameter**: Use at least 64 MB, prefer 128 MB or higher
2. **Time Parameter**: Minimum 3 iterations, prefer 5+ for sensitive applications
3. **Parallelism**: Match your CPU cores (4-16 typical)
4. **Salt**: Always use random salts, minimum 128-bit
5. **Output Length**: 256-bit minimum, 512-bit for quantum-resistant applications

### References

- **NIST SP 800-132**: [Recommendation for Password-Based Key Derivation](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf)
- **NIST Post-Quantum Cryptography**: [Post-Quantum Cryptography Standards](https://csrc.nist.gov/projects/post-quantum-cryptography)
- **Argon2 RFC**: [RFC 9106 - The Argon2 Memory-Hard Function](https://tools.ietf.org/rfc/rfc9106.txt)

## Usage Guide

Practical examples in [**📖 Recipes Guide**](docs/RECIPES.md) provide ready-to-use commands for web passwords, database secrets, API keys, and more.

### Command-Line Interface

**Basic syntax:**
```bash
npx @sebastienrousseau/password-generator [options]
```

**Options:**
```
-t, --type <type>          Password type (strong, base64, memorable, quantum-resistant, diceware, honeyword, pronounceable, custom)
-l, --length <number>      Length of each password chunk (not applicable to memorable)
-i, --iteration <number>   Number of chunks or words
-s, --separator <char>     Separator between chunks/words
-c, --clipboard            Copy generated password to clipboard
-p, --preset <preset>      Use preset configuration (quick, secure, memorable, quantum)
-a, --audit                Show security audit with entropy sources and algorithms
-n, --count <number>       Number of passwords to generate for bulk operations
-f, --format <format>      Output format for bulk operations (json, yaml, csv, text)
--learn                    Show equivalent CLI command for guided mode
--interactive              Start interactive guided setup
--kdf-memory <number>      Argon2id memory parameter in KB (default: 65536)
--kdf-time <number>        Argon2id time cost parameter (default: 3)
--kdf-parallelism <number> Argon2id parallelism parameter (default: 4)
-h, --help                 Show help
```

> **Note:** Interactive mode (`--interactive` or running without arguments) requires a real terminal (TTY). It does not work with piped input or in CI environments.

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
  type: "strong",        // "strong" | "base64" | "memorable" | "quantum-resistant" | "diceware" | "honeyword" | "pronounceable" | "custom"
  length: 12,           // chunk length (not for memorable/diceware)
  iteration: 3,         // number of chunks/words
  separator: "-"        // separator character(s)
});
```

**Security:** Cryptographically secure using Node.js `crypto.randomInt()`. No predictable patterns. Configure entropy via length × iteration.

## Programmatic API (Core Package)

Platform-agnostic core package supports Node.js and browser environments:

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

Core package uses zero dependencies and port/adapter pattern for I/O, supporting any JavaScript runtime. See [packages/core/README.md](packages/core/README.md) for details.

## Web UI Demo

Modern web interface provides real-time feedback and accessibility features.

### Features

- **Modern Interface** - Clean, responsive design with dark/light theme support
- **Accessibility** - WCAG 2.1 AA compliant with screen reader support
- **Smart Presets** - Quick, Secure, and Memorable password configurations
- **Real-time Feedback** - Visual entropy calculation and strength indicators
- **Keyboard Shortcuts** - Ctrl/Cmd+Enter to generate, Ctrl/Cmd+C to copy
- **Cross-platform** - Runs on all modern browsers

### Quick Start

**Option 1: Local Development Server (Recommended)**
```bash
# Clone and setup
git clone https://github.com/sebastienrousseau/password-generator.git
cd password-generator

# Start development server (typically serves on port 4173)
npx serve src/ui/web/demo
# or
npm install -g http-server && http-server src/ui/web/demo -p 4173
```

**Option 2: Platform-Specific Static Server**

**macOS/Linux:**
```bash
# Using Python 3
python3 -m http.server 4173 --directory src/ui/web/demo

# Using Python 2 (if available)
python -m SimpleHTTPServer 4173
cd src/ui/web/demo

# Using Node.js
npx serve src/ui/web/demo --listen 4173
```

**Windows:**
```cmd
REM Using Python
python -m http.server 4173 --directory src/ui/web/demo
REM Then open: http://localhost:4173

REM Using PowerShell (Windows 10+)
cd src/ui/web/demo
python -m http.server 4173
```

**Option 3: PHP Development Server**
```bash
php -S localhost:4173 -t src/ui/web/demo
```

Open **http://localhost:4173** in browser.

### Development Guide

**Prerequisites:**
- Node.js 20+
- Modern browser with Web Crypto API support

**Architecture Overview:**
```
src/ui/web/
├── demo/               # Standalone web demo
│   ├── index.html      # Main interface
│   ├── styles/         # CSS modules (tokens, components, utilities)
│   └── scripts/        # JavaScript modules (main.js, theme.js)
├── controllers/        # Web UI controllers (thin adapters)
├── state/              # State management
├── view-models/        # UI state models
└── adapters/           # Browser adapters (crypto, clipboard)
```

**Integration Pattern:**
```javascript
import { createWebUIController } from '../controllers/WebUIController.js';
import { FormState } from '../state/FormState.js';

// Create controller (browser adapters + core engine)
const controller = createWebUIController();

// Generate password
const formState = new FormState({
  type: 'strong',
  length: 16,
  iteration: 4,
  separator: '-'
});

const result = await controller.generate(formState);
console.log(result.password); // aB3dEf+/gH1i-Kl2MnOpQr3s
```

**Browser Compatibility:**
- Chrome 90+ | Firefox 88+ | Safari 14+ | Edge 90+
- Requires JavaScript and Web Crypto API

**Development Commands:**
```bash
# Lint web UI code
npm run lint:web

# Run web UI tests
npm run test:web

# Development workflow
npm install
npm run lint:web
npm run test:web
```

### Customization

The web UI uses CSS custom properties for easy theming:
- **Design tokens**: `src/ui/web/demo/styles/tokens.css`
- **Component styles**: `src/ui/web/demo/styles/components.css`
- **Theme switching**: Automatic dark/light mode with manual toggle

## Project Structure

```
password-generator/
├── packages/
│   └── core/             # Platform-agnostic core (zero dependencies)
├── src/
│   ├── adapters/         # Node.js adapters (crypto, clipboard)
│   ├── cli/              # command-line controller (thin adapter)
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

Contributions welcome. See [Contributing Guidelines](.github/CONTRIBUTING.md) for details.

**Contribution checklist:**
- [ ] Fork repository
- [ ] Create feature branch
- [ ] Write tests for new features
- [ ] Ensure all tests pass
- [ ] Follow existing code style
- [ ] Submit pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 **Documentation**: [API Reference](docs/)
- 🧑‍💻 **Practical Recipes**: [Common Use Cases & Examples](docs/RECIPES.md)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/sebastienrousseau/password-generator/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/sebastienrousseau/password-generator/discussions)
- 📦 **Releases**: [GitHub Releases](https://github.com/sebastienrousseau/password-generator/releases)

---

**Designed by Sebastien Rousseau — Engineered with Euxis**
