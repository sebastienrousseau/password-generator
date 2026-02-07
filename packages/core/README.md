# @password-generator/core

Platform-agnostic password generation core with zero runtime dependencies.

## Features

- Zero dependencies: Pure JavaScript with no Node.js or browser-specific APIs
- Port/Adapter pattern: All I/O abstracted through injectable ports
- Three password types: strong, base64, memorable
- Entropy calculation: Security analysis for any configuration
- Type-safe: Full JSDoc annotations

## Installation

```bash
npm install @password-generator/core
```

## Quick Start

```javascript
import { createQuickService } from '@password-generator/core';

// Provide your own RandomGeneratorPort implementation
const service = createQuickService(myRandomGenerator);

// Generate a strong password
const password = await service.generate({
  type: 'strong',
  length: 16,
  iteration: 3,
  separator: '-'
});
```

## Zero-Dependency Guarantee

This package contains only pure JavaScript logic with no platform-specific dependencies:

- No `crypto` module (Node.js)
- No `window` or `document` (Browser)
- No file system access
- No network calls

All external functionality is provided through port interfaces that you implement for your platform.

## Port/Adapter Pattern

The core package uses hexagonal architecture (ports and adapters) to remain platform-agnostic:

```
+------------------+     +------------------+     +------------------+
|   Node.js CLI    |     |   Browser UI     |     |   Your App       |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         v                        v                        v
+--------+---------+     +--------+---------+     +--------+---------+
| NodeCryptoRandom |     | BrowserCrypto    |     | YourAdapter      |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         +------------------------+------------------------+
                                  |
                                  v
                    +-------------+-------------+
                    |   @password-generator/core |
                    |   (RandomGeneratorPort)    |
                    +---------------------------+
```

### Required Port: RandomGeneratorPort

The only required port is `RandomGeneratorPort`. Implement these methods:

```javascript
class MyRandomGenerator {
  async generateRandomBytes(byteLength) {
    // Return Uint8Array of random bytes
  }

  async generateRandomInt(max) {
    // Return random integer in [0, max)
  }
}
```

### Optional Ports

| Port | Purpose | Default |
|------|---------|---------|
| `LoggerPort` | Logging | `NoOpLogger` (silent) |
| `StoragePort` | Persistence | `MemoryStorage` |
| `ClockPort` | Time access | `FixedClock` |
| `DictionaryPort` | Word lists | `MemoryDictionary` |

## API Reference

### createQuickService(randomGenerator)

Creates a service with minimal configuration:

```javascript
import { createQuickService } from '@password-generator/core';

const service = createQuickService(randomGenerator);
```

### createService(config, ports)

Creates a service with full port configuration:

```javascript
import { createService } from '@password-generator/core';

const service = createService(
  { validateOnInit: true },
  {
    randomGenerator: myRandomGenerator,
    logger: myLogger,           // optional
    storage: myStorage,         // optional
    clock: myClock,             // optional
    dictionary: myDictionary    // optional
  }
);
```

### service.generate(options)

Generates a password:

```javascript
const password = await service.generate({
  type: 'strong',      // 'strong' | 'base64' | 'memorable'
  length: 16,          // chunk length (not for memorable)
  iteration: 3,        // number of chunks/words
  separator: '-'       // separator between chunks
});
```

### service.calculateEntropy(options)

Calculates entropy for a configuration:

```javascript
const entropy = service.calculateEntropy({
  type: 'strong',
  length: 16,
  iteration: 3
});

console.log(entropy.totalBits);      // e.g., 288
console.log(entropy.securityLevel);  // e.g., 'excellent'
console.log(entropy.recommendation); // e.g., 'Suitable for high-security...'
```

### service.validateConfig(options)

Validates configuration without generating:

```javascript
const result = service.validateConfig({ type: 'strong', length: 8 });
if (!result.isValid) {
  console.error(result.errors);
}
```

### service.getSupportedTypes()

Returns available password types:

```javascript
const types = service.getSupportedTypes();
// ['strong', 'base64', 'memorable']
```

## Password Types

| Type | Description | Options |
|------|-------------|---------|
| `strong` | Complex characters (A-Z, a-z, 0-9, symbols) | `length`, `iteration`, `separator` |
| `base64` | Base64-encoded random bytes | `length`, `iteration`, `separator` |
| `memorable` | Dictionary words | `iteration`, `separator` |

## Examples

### Node.js with crypto module

```javascript
import { createQuickService } from '@password-generator/core';
import { randomBytes, randomInt } from 'crypto';

const nodeRandom = {
  async generateRandomBytes(n) {
    return new Uint8Array(randomBytes(n));
  },
  async generateRandomInt(max) {
    return randomInt(max);
  }
};

const service = createQuickService(nodeRandom);
const password = await service.generate({ type: 'strong', length: 16, iteration: 2 });
```

### Browser with Web Crypto API

```javascript
import { createQuickService } from '@password-generator/core';

const browserRandom = {
  async generateRandomBytes(n) {
    const bytes = new Uint8Array(n);
    crypto.getRandomValues(bytes);
    return bytes;
  },
  async generateRandomInt(max) {
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const value = bytes.reduce((acc, b) => acc * 256 + b, 0);
    return value % max;
  }
};

const service = createQuickService(browserRandom);
const password = await service.generate({ type: 'memorable', iteration: 4 });
```

## License

MIT
