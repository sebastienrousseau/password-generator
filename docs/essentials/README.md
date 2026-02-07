# Essentials

Get started with Password Generator. This section covers installation, initial setup, and generating your first password.

## Quick Navigation

| Topic | Description | Time |
|-------|-------------|------|
| [Installation](#installation) | Install Password Generator | 1 min |
| [Quick Start](#quick-start) | Generate your first password | 30 sec |
| [Interactive Setup](#interactive-setup) | Use the guided wizard | 2 min |
| [Password Types](#password-types) | Choose the right password type | 3 min |

---

## Installation

### Requirements

- Node.js 18 or later
- npm, yarn, or pnpm

### Install Globally

```bash
npm install -g @sebastienrousseau/password-generator
```

### Install as Dependency

```bash
npm install @sebastienrousseau/password-generator
```

### Run Without Installing

```bash
npx @sebastienrousseau/password-generator
```

---

## Quick Start

### Generate Your First Password

Run the generator without options to start interactive mode:

```bash
npx @sebastienrousseau/password-generator
```

Generate a strong password directly:

```bash
npx @sebastienrousseau/password-generator -t strong -l 16 -i 3 -s '-'
# Output: aB3dEf+/gH1i-Kl2MnOpQr3s-tU4vWxYz5A
```

Generate a memorable password:

```bash
npx @sebastienrousseau/password-generator -t memorable -i 4 -s '-'
# Output: Apple-Breeze-Castle-Diamond
```

### Use in JavaScript

```javascript
import PasswordGenerator from "@sebastienrousseau/password-generator";

const password = await PasswordGenerator({
  type: "strong",
  length: 16,
  iteration: 3,
  separator: "-"
});

console.log(password);
```

---

## Interactive Setup

Run the interactive wizard to configure password generation step by step:

```bash
npx @sebastienrousseau/password-generator
```

The wizard guides you through four steps:

1. **Choose Password Type** - Select strong, memorable, or base64
2. **Security Level** - Pick quick, secure, memorable, or custom
3. **Clipboard Settings** - Enable auto-copy or display only
4. **Generate** - Create the password and see the CLI command

### Navigation Controls

| Key | Action |
|-----|--------|
| Arrow keys | Navigate options |
| Enter | Select option |
| Space | Show examples |
| ESC | Go back |
| 1-3 | Quick select |

---

## Password Types

### Strong Passwords

Maximum security for important accounts. Contains uppercase, lowercase, numbers, and symbols.

```bash
npx @sebastienrousseau/password-generator -t strong -l 16 -i 3 -s '-'
```

**Example output:** `aB3dEf+/gH1i-Kl2MnOpQr3s-tU4vWxYz5A`

**Best for:** Banking, email, cloud services, enterprise accounts

### Memorable Passwords

Dictionary words for quick recall. Easy to type and remember.

```bash
npx @sebastienrousseau/password-generator -t memorable -i 4 -s '-'
```

**Example output:** `Apple-Castle-River-Moon`

**Best for:** Personal accounts, shared passwords, daily use

### Base64 Passwords

URL-safe character combinations for API keys and tokens.

```bash
npx @sebastienrousseau/password-generator -t base64 -l 32 -i 1 -s ''
```

**Example output:** `YWJjZGVmZGhpamtsbW5vcHFyc3R1dnd4`

**Best for:** API keys, OAuth tokens, system integration

### Quantum-Resistant Passwords

Enhanced entropy for post-quantum security. Follows NIST guidelines.

```bash
npx @sebastienrousseau/password-generator -t quantum-resistant -l 32 -i 4 -s ''
```

**Example output:** `QR$v9K#mF2@x7L&nE8!pX3@T5w$nM9&bE8!tZ7%L4@nF6#mR2$w`

**Best for:** High-security environments, future-proofed systems

---

## Next Steps

- [CLI Guide](../guides/README.md#cli-usage) - Master command-line options
- [Web UI Guide](../guides/README.md#web-ui-usage) - Use the browser interface
- [API Reference](../API.md) - Integrate with JavaScript applications
- [Security Best Practices](../SECURITY.md) - Follow cryptographic guidelines

---

[Back to Documentation Index](../INDEX.md)
