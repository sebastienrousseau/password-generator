# JavaScript jspassgen (jspassgen) Documentation

Welcome to the JavaScript jspassgen (jspassgen) documentation. This guide helps developers generate cryptographically secure passwords across Node.js, browser, and other JavaScript environments.

## Navigation

### Essentials

Start here to learn the fundamentals and generate your first password.

| Topic | Description |
|-------|-------------|
| [Getting Started](./essentials/README.md) | Install jspassgen and generate your first password |
| [Installation](../README.md#quick-install--first-password) | Install via npm, yarn, or pnpm |
| [Quick Start](../README.md#get-started-in-30-seconds) | Generate passwords in 30 seconds |
| [Interactive Onboarding](../README.md#interactive-onboarding) | Use the guided setup wizard |

### Guides

Learn how to use jspassgen for specific tasks and environments.

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
| [API Reference](./API.md) | Complete `@jspassgen/core` package API |
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
| [GitHub Discussions](https://github.com/jspassgen/jspassgen/discussions) | Ask questions and share ideas |
| [GitHub Issues](https://github.com/jspassgen/jspassgen/issues) | Report bugs and request features |

---

## Quick Links

### Generate a Password Now

```bash
# Interactive mode
npx jspassgen

# Direct command
jspassgen -t strong -l 16 -i 3 -s '-'
```

### Import in Code

```javascript
import { createQuickService } from 'jspassgen/core';
import { NodeCryptoRandom } from 'jspassgen/adapters/node/crypto-random.js';

const service = createQuickService(new NodeCryptoRandom());
const password = await service.generate({
  type: "strong",
  length: 16,
  iteration: 3,
  separator: "-"
});
```

### Use the Core Package

```javascript
import { createQuickService } from '@jspassgen/core';
import { NodeCryptoRandom } from 'jspassgen/adapters/node/crypto-random.js';

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

---

🎨 Designed by Sebastien Rousseau — https://sebastienrousseau.com/

🚀 Engineered with Euxis — Enterprise Unified eXecution Intelligence System — https://euxis.co/
