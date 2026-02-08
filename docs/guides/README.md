# Guides

Learn how to use Password Generator for specific tasks. Each guide provides step-by-step instructions for common use cases.

## Quick Navigation

| Guide | Description |
|-------|-------------|
| [CLI Usage](#cli-usage) | Generate passwords from the command line |
| [Web UI Usage](#web-ui-usage) | Use the browser-based interface |
| [JavaScript Integration](#javascript-integration) | Integrate with Node.js or browser apps |
| [Security Practices](#security-practices) | Follow cryptographic security guidelines |
| [Enterprise Use Cases](#enterprise-use-cases) | Deploy in production environments |
| [Contributing](#contributing) | Contribute to the project |

---

## CLI Usage

### Basic Commands

Generate a password with default settings:

```bash
npx @aspect/jspassgen
```

Specify password type and parameters:

```bash
npx @aspect/jspassgen -t <type> -l <length> -i <iteration> -s <separator>
```

### Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --type` | Password type: strong, base64, memorable, quantum-resistant | (interactive) |
| `-l, --length` | Characters per chunk | 16 |
| `-i, --iteration` | Number of chunks or words | 1 |
| `-s, --separator` | Separator between chunks | `-` |
| `-c, --clipboard` | Copy to clipboard | false |
| `-h, --help` | Show help | - |

### Common CLI Patterns

**High-security password:**

```bash
npx @aspect/jspassgen -t strong -l 20 -i 4 -s '' --clipboard
```

**Readable password with separators:**

```bash
npx @aspect/jspassgen -t strong -l 12 -i 3 -s '-'
```

**API key or token:**

```bash
npx @aspect/jspassgen -t base64 -l 32 -i 1 -s ''
```

**Memorable team password:**

```bash
npx @aspect/jspassgen -t memorable -i 4 -s '-'
```

---

## Web UI Usage

### Quick Start

Start a local development server:

```bash
# Clone the repository
git clone https://github.com/sebastienrousseau/jspassgen.git
cd password-generator

# Serve the demo
npx serve src/ui/web/demo
```

Open **http://localhost:3000** in your browser.

### Alternative Servers

**Python 3:**

```bash
python3 -m http.server 4173 --directory src/ui/web/demo
```

**PHP:**

```bash
php -S localhost:4173 -t src/ui/web/demo
```

### Web UI Features

| Feature | Description |
|---------|-------------|
| Password types | Strong, memorable, base64 |
| Presets | Quick, Secure, Memorable configurations |
| Entropy display | Real-time strength calculation |
| Dark/Light theme | Automatic or manual toggle |
| Keyboard shortcuts | Ctrl/Cmd+Enter to generate, Ctrl/Cmd+C to copy |
| Accessibility | WCAG 2.1 AA compliant |

### Browser Compatibility

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

---

## JavaScript Integration

### Node.js Usage

Import and use the main package:

```javascript
import PasswordGenerator from "@aspect/jspassgen";

const password = await PasswordGenerator({
  type: "strong",
  length: 16,
  iteration: 3,
  separator: "-"
});
```

### Core Package Usage

Import the platform-agnostic core for maximum control:

```javascript
import { createQuickService } from '@password-generator/core';
import { NodeCryptoRandom } from './src/adapters/node/crypto-random.js';

const service = createQuickService(new NodeCryptoRandom());

// Generate password
const password = await service.generate({
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
console.log(`Entropy: ${entropy.totalBits} bits`);
```

### Browser Usage

Use the core package with Web Crypto API:

```javascript
import { createQuickService } from '@password-generator/core';
import { WebCryptoRandom } from './adapters/web/WebCryptoRandom.js';

const service = createQuickService(new WebCryptoRandom());

const password = await service.generate({
  type: 'strong',
  length: 16,
  iteration: 1,
  separator: '-'
});
```

### Generate Multiple Passwords

```javascript
const passwords = await service.generateMultiple([
  { type: 'strong', length: 16, iteration: 2 },
  { type: 'memorable', iteration: 4 },
  { type: 'base64', length: 32, iteration: 1 }
]);
```

---

## Security Practices

### Password Storage

**Never store passwords in plain text.** Apply a secure Key Derivation Function:

```javascript
// Recommended: Argon2id with NIST SP 800-132 parameters
const kdfConfig = {
  algorithm: 'argon2id',
  memory: 131072,    // 128 MB
  time: 5,           // 5 iterations
  parallelism: 8     // 8 threads
};
```

### Entropy Guidelines

| Use Case | Minimum Entropy | Recommended |
|----------|-----------------|-------------|
| Personal accounts | 60 bits | 80 bits |
| Enterprise systems | 100 bits | 128 bits |
| High-security | 128 bits | 256 bits |
| Quantum-resistant | 256 bits | 512 bits |

### Calculate Entropy

```javascript
const entropy = service.calculateEntropy({
  type: 'strong',
  length: 16,
  iteration: 3
});

console.log(`Total bits: ${entropy.totalBits}`);
console.log(`Security level: ${entropy.securityLevel}`);
console.log(`Recommendation: ${entropy.recommendation}`);
```

### Security References

- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html) - Digital Identity Guidelines
- [NIST SP 800-132](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-132.pdf) - Password-Based Key Derivation

---

## Enterprise Use Cases

### Banking and Financial

Maximum security for sensitive accounts:

```bash
npx @aspect/jspassgen -t strong -l 20 -i 4 -s '' --clipboard
```

### Database Connections

Strong, readable chunks for configuration:

```bash
npx @aspect/jspassgen -t strong -l 12 -i 3 -s '-'
```

### OAuth Bearer Tokens

URL-safe tokens for API authentication:

```bash
npx @aspect/jspassgen -t base64 -l 32 -i 1 -s ''
```

### Team Access

Memorable passwords for shared accounts:

```bash
npx @aspect/jspassgen -t memorable -i 4 -s '-'
```

### PCI-DSS Compliance

24+ character passwords with high entropy:

```bash
npx @aspect/jspassgen -t strong -l 12 -i 2 -s ''
```

---

## Contributing

### Set Up Development Environment

```bash
# Clone the repository
git clone https://github.com/sebastienrousseau/jspassgen.git
cd password-generator

# Install dependencies
npm install

# Run tests
npm test

# Check code style
npm run lint
```

### Contribution Types

| Type | Description |
|------|-------------|
| Bug reports | Report issues with steps to reproduce |
| Feature requests | Propose new functionality |
| Documentation | Fix typos, add examples, clarify explanations |
| Code changes | Implement features, fix bugs, refactor |

### Pull Request Checklist

1. Tests pass (`npm test`)
2. Linting passes (`npm run lint`)
3. Build succeeds (`npm run build`)
4. Documentation updated (if applicable)
5. CHANGELOG updated (if applicable)

See the [Contributing Guide](../../.github/CONTRIBUTING.md) for detailed instructions.

---

## Related Documentation

- [API Reference](../API.md) - Complete API documentation
- [Architecture](../ARCHITECTURE.md) - System design and patterns
- [Security Documentation](../SECURITY.md) - Cryptographic security details
- [Performance Budget](../PERFORMANCE_BUDGET.md) - Web UI performance targets

---

[Back to Documentation Index](../INDEX.md)
