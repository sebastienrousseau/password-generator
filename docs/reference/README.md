# Reference

Technical documentation for Password Generator. This section covers API specifications, architecture patterns, and performance standards.

## Quick Navigation

| Reference | Description |
|-----------|-------------|
| [API Reference](#api-reference) | Core package API documentation |
| [Architecture](#architecture) | Hexagonal architecture with ports and adapters |
| [Ports and Adapters](#ports-and-adapters) | Platform abstraction interfaces |
| [Error Handling](#error-handling) | Error constants and handling patterns |
| [Performance](#performance) | Performance budgets and optimization |
| [Changelog](#changelog) | Version history and releases |

---

## API Reference

The `@password-generator/core` package provides the platform-agnostic password generation engine.

### Service Factory

Create a password service with full configuration:

```javascript
import { createService } from '@password-generator/core';

const service = createService(
  { validateOnInit: true },
  {
    randomGenerator: new NodeCryptoRandom(),
    logger: new ConsoleLogger(),
    storage: new MemoryStorage(),
    clock: new SystemClock(),
    dictionary: new MemoryDictionary()
  }
);
```

Create a minimal service with defaults:

```javascript
import { createQuickService } from '@password-generator/core';

const service = createQuickService(new NodeCryptoRandom());
```

### Service Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `generate(options)` | Generate a single password | `Promise<string>` |
| `generateMultiple(optionsArray)` | Generate multiple passwords | `Promise<string[]>` |
| `calculateEntropy(options)` | Calculate password entropy | `Object` |
| `validateConfig(options)` | Validate configuration | `Object` |
| `getSupportedTypes()` | List supported password types | `string[]` |
| `getGenerator(type)` | Get generator for type | `Object` or `null` |
| `getPorts()` | Get resolved port implementations | `Object` |

### Generation Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `type` | `string` | Yes | - | `'strong'`, `'base64'`, `'memorable'` |
| `length` | `number` | No | `16` | Characters per chunk |
| `iteration` | `number` | No | `1` | Number of chunks/words |
| `separator` | `string` | No | `'-'` | Separator between chunks |

### Entropy Calculation

```javascript
const entropy = service.calculateEntropy({
  type: 'strong',
  length: 16,
  iteration: 3
});

// Returns:
// {
//   totalBits: 288,
//   securityLevel: 'EXCELLENT (256+ bits)',
//   recommendation: 'Excellent security. Suitable for high-security applications.',
//   perUnit: 96
// }
```

See [API.md](../API.md) for complete API documentation.

---

## Architecture

Password Generator uses hexagonal architecture (ports and adapters) for platform independence.

### Layer Overview

```
+------------------------------------------------------------------+
|                         Applications                              |
+------------------------------------------------------------------+
|   CLI (src/bin/)    |    Web UI    |    Programmatic API         |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                      Adapters (src/adapters/)                     |
+------------------------------------------------------------------+
|  Node Adapters              |  Web Adapters                       |
|  - NodeCryptoRandom         |  - WebCryptoRandom                  |
|  - NodeConsoleLogger        |  - WebConsoleLogger                 |
|  - NodeFsStorage            |  - WebLocalStorage                  |
+------------------------------------------------------------------+
                              |
                              v (implements)
+------------------------------------------------------------------+
|                    Ports (packages/core/src/ports/)               |
+------------------------------------------------------------------+
|  RandomGeneratorPort  |  LoggerPort  |  StoragePort  |  ClockPort |
+------------------------------------------------------------------+
                              ^
                              | (depends on)
+------------------------------------------------------------------+
|                    Core (packages/core/)                          |
+------------------------------------------------------------------+
|  Service Layer       |  Generators        |  Domain               |
|  - createService()   |  - strong.js       |  - charset            |
|  - generate()        |  - base64.js       |  - entropy            |
+------------------------------------------------------------------+
```

### Design Principles

| Principle | Implementation |
|-----------|----------------|
| Dependency inversion | Core depends on port interfaces, not implementations |
| Platform independence | Zero platform-specific code in core |
| Testability | Inject mock adapters for deterministic tests |
| Extensibility | Add new platforms by creating adapters |

See [ARCHITECTURE.md](../ARCHITECTURE.md) for complete architecture documentation.

---

## Ports and Adapters

### Port Interfaces

| Port | Purpose | Required |
|------|---------|----------|
| `RandomGeneratorPort` | Cryptographic random generation | Yes |
| `LoggerPort` | Logging operations | No |
| `StoragePort` | Persistent storage | No |
| `ClockPort` | Time operations | No |
| `DictionaryPort` | Word lists for memorable passwords | No |

### RandomGeneratorPort (Required)

```javascript
class RandomGeneratorPort {
  async generateRandomBytes(byteLength) {}  // Returns Uint8Array
  async generateRandomInt(max) {}           // Returns number in [0, max)
}
```

### Node.js Adapter

```javascript
import { randomBytes, randomInt } from 'crypto';

class NodeCryptoRandom extends RandomGeneratorPort {
  async generateRandomBytes(byteLength) {
    return new Uint8Array(randomBytes(byteLength));
  }

  async generateRandomInt(max) {
    return randomInt(max);
  }
}
```

### Web Adapter

```javascript
class WebCryptoRandom extends RandomGeneratorPort {
  async generateRandomBytes(byteLength) {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return bytes;
  }

  async generateRandomInt(max) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const value = new DataView(bytes.buffer).getUint32(0);
    return value % max;
  }
}
```

### Default Implementations

| Port | Default | Behavior |
|------|---------|----------|
| `LoggerPort` | `NoOpLogger` | Silent (no output) |
| `StoragePort` | `MemoryStorage` | In-memory (non-persistent) |
| `ClockPort` | `FixedClock` | Fixed timestamp |
| `DictionaryPort` | `MemoryDictionary` | Built-in word list |

---

## Error Handling

### Error Constants

Import error templates for consistent error messages:

```javascript
import { CRYPTO_ERRORS, PASSWORD_ERRORS, PORT_ERRORS } from '@password-generator/core';
```

### CRYPTO_ERRORS

| Error | Cause |
|-------|-------|
| `MUST_BE_POSITIVE_INTEGER(param)` | Parameter not a positive integer |
| `EMPTY_CHARSET` | Character set is empty |
| `INVALID_BYTE_LENGTH` | Byte length invalid |

### PASSWORD_ERRORS

| Error | Cause |
|-------|-------|
| `TYPE_REQUIRED` | Password type not provided |
| `UNKNOWN_TYPE(type, valid)` | Password type not recognized |
| `INVALID_ITERATION` | Iteration count invalid |
| `INVALID_LENGTH` | Length value invalid |

### PORT_ERRORS

| Error | Cause |
|-------|-------|
| `MISSING_PORTS(missing, required)` | Required ports not provided |
| `INVALID_PORT(name, expected)` | Port missing required methods |

### Error Handling Pattern

```javascript
try {
  const password = await service.generate({
    type: 'invalid',
    length: 16
  });
} catch (error) {
  console.error(`Generation failed: ${error.message}`);
}
```

---

## Performance

### Performance Budgets

The Web UI maintains strict performance budgets:

| Metric | Target | Threshold |
|--------|--------|-----------|
| First Contentful Paint | < 1.2s | < 1.8s |
| Largest Contentful Paint | < 1.8s | < 2.5s |
| Time to Interactive | < 2.0s | < 3.5s |
| Total Bundle Size | < 150KB | < 200KB |

### Interaction Latency

| Interaction | Target |
|-------------|--------|
| Password generation | < 50ms |
| Regenerate button | < 30ms |
| Preset selection | < 20ms |
| Copy to clipboard | < 10ms |

### Lighthouse Scores

| Category | Target | Threshold |
|----------|--------|-----------|
| Performance | >= 90 | >= 80 |
| Accessibility | >= 95 | >= 90 |
| Best Practices | >= 95 | >= 90 |

See [PERFORMANCE_BUDGET.md](../PERFORMANCE_BUDGET.md) for complete performance documentation.

---

## Changelog

### Version 1.1.4 (2026-02-07)

**Added:**
- Hexagonal architecture with platform-agnostic core
- Web UI demo with browser-based generation
- Port/adapter pattern for injectable dependencies
- Cross-platform parity tests
- Performance benchmarks

**Changed:**
- CLI refactored as thin adapter over core
- Web UI implemented as thin adapter over core

See [CHANGELOG.md](../../CHANGELOG.md) for complete version history.

---

## Related Documentation

- [API.md](../API.md) - Complete API reference
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Architecture deep dive
- [SECURITY.md](../SECURITY.md) - Security implementation details
- [PERFORMANCE_BUDGET.md](../PERFORMANCE_BUDGET.md) - Performance standards

---

[Back to Documentation Index](../INDEX.md)
