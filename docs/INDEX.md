# Password Generator Documentation

Welcome to the Password Generator documentation. This guide helps developers generate cryptographically secure passwords across Node.js, browser, and other JavaScript environments.

## Navigation

### Essentials

Start here to learn the fundamentals and generate your first password.

| Topic | Description |
|-------|-------------|
| [Getting Started](./essentials/README.md) | Install Password Generator and generate your first password |
| [Installation](../README.md#quick-install--first-password) | Install via npm, yarn, or pnpm |
| [Quick Start](../README.md#get-started-in-30-seconds) | Generate passwords in 30 seconds |
| [Interactive Onboarding](../README.md#interactive-onboarding) | Use the guided setup wizard |

### Guides

Learn how to use Password Generator for specific tasks and environments.

| Guide | Description |
|-------|-------------|
| [CLI Guide](./guides/README.md#cli-usage) | Generate passwords from the command line |
| [Web UI Guide](./guides/README.md#web-ui-usage) | Use the browser-based password generator |
| [Password Types](../README.md#password-types) | Choose between strong, memorable, and base64 passwords |
| [Quantum-Resistant Mode](../README.md#quantum-resistant-mode) | Generate post-quantum secure passwords |
| [Security Best Practices](./SECURITY.md) | Follow cryptographic security guidelines |
| [Contributing](../.github/CONTRIBUTING.md) | Contribute code, documentation, or bug reports |

### Reference

Explore the technical architecture, API specifications, and performance standards.

| Reference | Description |
|-----------|-------------|
| [API Reference](./API.md) | Complete `@password-generator/core` package API |
| [Architecture](./ARCHITECTURE.md) | Hexagonal architecture with ports and adapters |
| [Changelog](../CHANGELOG.md) | Version history and release notes |
| [Performance Budget](./PERFORMANCE_BUDGET.md) | Web UI performance targets and budgets |
| [Style Guide](./STYLE_GUIDE.md) | Documentation writing standards |

### Community

Connect with contributors and report issues.

| Resource | Description |
|----------|-------------|
| [Code of Conduct](../.github/CODE-OF-CONDUCT.md) | Community behavior guidelines |
| [Security Reporting](../SECURITY.md) | Report security vulnerabilities |
| [GitHub Discussions](https://github.com/sebastienrousseau/password-generator/discussions) | Ask questions and share ideas |
| [GitHub Issues](https://github.com/sebastienrousseau/password-generator/issues) | Report bugs and request features |

---

## Quick Links

### Generate a Password Now

```bash
# Interactive mode
npx @sebastienrousseau/password-generator

# Direct command
npx @sebastienrousseau/password-generator -t strong -l 16 -i 3 -s '-'
```

### Import in Code

```javascript
import PasswordGenerator from "@sebastienrousseau/password-generator";

const password = await PasswordGenerator({
  type: "strong",
  length: 16,
  iteration: 3,
  separator: "-"
});
```

### Use the Core Package

```javascript
import { createQuickService } from '@password-generator/core';
import { NodeCryptoRandom } from './src/adapters/node/crypto-random.js';

const service = createQuickService(new NodeCryptoRandom());
const password = await service.generate({
  type: 'memorable',
  iteration: 4,
  separator: '-'
});
```

---

## Documentation Structure

This documentation follows Apple's Topic-Task-Reference hierarchy:

```
docs/
├── INDEX.md              # Master navigation (this file)
├── essentials/           # Getting started guides
│   └── README.md         # Essentials index
├── guides/               # How-to guides and tutorials
│   └── README.md         # Guides index
├── reference/            # API and architecture documentation
│   └── README.md         # Reference index
└── community/            # Community resources
    └── README.md         # Community index
```

---

**Designed by Sebastien Rousseau**
