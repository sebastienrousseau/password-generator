# API Documentation

This document covers the `@password-generator/core` package API.

## Table of Contents

- [Service Factory](#service-factory)
- [Service Methods](#service-methods)
- [Port Interfaces](#port-interfaces)
- [Domain Exports](#domain-exports)
- [Generator Functions](#generator-functions)
- [Error Constants](#error-constants)

---

## Service Factory

### createService(config, ports)

Creates a password generation service with full configuration.

```javascript
import { createService } from '@password-generator/core';

const service = createService(config, ports);
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `Object` | No | Service configuration |
| `config.validateOnInit` | `boolean` | No | Validate ports on init (default: `true`) |
| `ports` | `Object` | Yes | Port implementations |
| `ports.randomGenerator` | `RandomGeneratorPort` | Yes | Cryptographic random generator |
| `ports.logger` | `LoggerPort` | No | Logging (default: `NoOpLogger`) |
| `ports.storage` | `StoragePort` | No | Persistence (default: `MemoryStorage`) |
| `ports.clock` | `ClockPort` | No | Time access (default: `FixedClock`) |
| `ports.dictionary` | `DictionaryPort` | No | Word list (default: `MemoryDictionary`) |

**Returns:** Service object with password generation methods.

**Throws:** `Error` when required ports are missing or invalid.

---

### createQuickService(randomGenerator)

Creates a service with minimal configuration. Uses defaults for all optional ports.

```javascript
import { createQuickService } from '@password-generator/core';

const service = createQuickService(randomGenerator);
```

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `randomGenerator` | `RandomGeneratorPort` | Yes | Cryptographic random generator |

**Returns:** Service object with password generation methods.

---

## Service Methods

### service.generate(options)

Generates a password with the specified configuration.

```javascript
const password = await service.generate({
  type: 'strong',
  length: 16,
  iteration: 3,
  separator: '-'
});
```

**Parameters:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `type` | `string` | Yes | - | Password type: `'strong'`, `'base64'`, `'memorable'` |
| `length` | `number` | No | `16` | Characters per chunk (not used for memorable) |
| `iteration` | `number` | No | `1` | Number of chunks or words |
| `separator` | `string` | No | `'-'` | Separator between chunks/words |

**Returns:** `Promise<string>` - The generated password.

**Throws:** `Error` when type or configuration is invalid.

---

### service.generateMultiple(optionsArray)

Generates multiple passwords with different configurations.

```javascript
const passwords = await service.generateMultiple([
  { type: 'strong', length: 16, iteration: 2 },
  { type: 'memorable', iteration: 4 }
]);
```

**Parameters:**

| Name | Type | Description |
|------|------|-------------|
| `optionsArray` | `Array<Object>` | Array of generation options |

**Returns:** `Promise<string[]>` - Array of generated passwords.

---

### service.calculateEntropy(options)

Calculates the entropy for a password configuration.

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

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `type` | `string` | Yes | Password type |
| `length` | `number` | No | Characters per chunk |
| `iteration` | `number` | No | Number of chunks/words |

**Returns:** `Object` with entropy information:

| Property | Type | Description |
|----------|------|-------------|
| `totalBits` | `number` | Total entropy in bits |
| `securityLevel` | `string` | Security classification |
| `recommendation` | `string` | Security recommendation |
| `perUnit` | `number` | Entropy per chunk/word |

---

### service.validateConfig(options)

Validates a password configuration without generating.

```javascript
const result = service.validateConfig({
  type: 'strong',
  length: 8,
  iteration: 2
});

if (!result.isValid) {
  console.error(result.errors);
}
```

**Returns:** `Object`:

| Property | Type | Description |
|----------|------|-------------|
| `isValid` | `boolean` | Whether configuration is valid |
| `errors` | `string[]` | Array of error messages |

---

### service.getSupportedTypes()

Returns the list of supported password types.

```javascript
const types = service.getSupportedTypes();
// ['strong', 'base64', 'memorable']
```

**Returns:** `string[]` - Array of supported type names.

---

### service.getGenerator(type)

Gets the generator for a specific password type.

```javascript
const generator = service.getGenerator('strong');
// { generate: Function, calculateEntropy: Function }
```

**Returns:** Generator object, or `null` when the type does not exist.

---

### service.getPorts()

Gets the resolved ports used by the service.

```javascript
const ports = service.getPorts();
// { randomGenerator, logger, storage, clock, dictionary }
```

**Returns:** `Object` containing all port implementations.

---

## Port Interfaces

### RandomGeneratorPort (Required)

Provides cryptographically secure random generation.

```javascript
class RandomGeneratorPort {
  async generateRandomBytes(byteLength) {}  // Returns Uint8Array
  async generateRandomInt(max) {}           // Returns number in [0, max)
  async generateRandomBase64(byteLength) {} // Returns base64 string (optional)
  async generateRandomString(length, charset) {} // Returns random string (optional)
}
```

**Required Methods:**
- `generateRandomBytes(byteLength)` - Generate random bytes
- `generateRandomInt(max)` - Generate random integer

---

### LoggerPort

Provides logging functionality.

```javascript
class LoggerPort {
  info(message, ...args) {}
  warn(message, ...args) {}
  error(message, ...args) {}
  debug(message, ...args) {}
}
```

**Default:** `NoOpLogger` (silent implementation)

---

### StoragePort

Provides key-value persistence.

```javascript
class StoragePort {
  async read(key) {}   // Returns value or null
  async write(key, value) {}
  async delete(key) {}
  async clear() {}
}
```

**Default:** `MemoryStorage` (in-memory implementation)

---

### ClockPort

Provides time access.

```javascript
class ClockPort {
  now() {}            // Returns Date
  performanceNow() {} // Returns high-resolution timestamp
}
```

**Default:** `FixedClock` (returns fixed timestamp)

---

### DictionaryPort

Provides word list for memorable passwords.

```javascript
class DictionaryPort {
  loadDictionary(words) {}
  getWordCount() {}        // Returns number
  selectRandomWord(randomGenerator) {} // Returns Promise<string>
}
```

**Default:** `MemoryDictionary` with `DEFAULT_WORD_LIST`

---

## Domain Exports

### Character Sets

```javascript
import { BASE64_CHARSET, VOWELS, CONSONANTS } from '@password-generator/core';
```

| Export | Description |
|--------|-------------|
| `BASE64_CHARSET` | Standard Base64 character set |
| `VOWELS` | Vowel characters for syllable generation |
| `CONSONANTS` | Consonant characters for syllable generation |

---

### Password Types

```javascript
import {
  PASSWORD_TYPES,
  VALID_PASSWORD_TYPES,
  isValidPasswordType,
  validatePasswordTypeConfig
} from '@password-generator/core';
```

| Export | Type | Description |
|--------|------|-------------|
| `PASSWORD_TYPES` | `Object` | Enum: `{ STRONG, BASE64, MEMORABLE }` |
| `VALID_PASSWORD_TYPES` | `string[]` | `['strong', 'base64', 'memorable']` |
| `isValidPasswordType(type)` | `Function` | Returns boolean |
| `validatePasswordTypeConfig(type, config)` | `Function` | Returns validation result |

---

### Entropy Functions

```javascript
import {
  calculateTotalEntropy,
  getSecurityLevel,
  getSecurityRecommendation,
  calculateBase64Entropy,
  calculateDictionaryEntropy,
  calculateCharsetEntropy
} from '@password-generator/core';
```

| Function | Description |
|----------|-------------|
| `calculateTotalEntropy(config)` | Total entropy for password config |
| `getSecurityLevel(bits)` | Security level string |
| `getSecurityRecommendation(bits)` | Recommendation string |
| `calculateBase64Entropy(byteLength)` | Entropy for base64 |
| `calculateDictionaryEntropy(size, words)` | Entropy for dictionary |
| `calculateCharsetEntropy(size, length)` | Entropy for charset |

---

## Generator Functions

Low-level generator functions for direct use:

```javascript
import {
  generateStrongPassword,
  generateBase64Password,
  generateMemorablePassword,
  generatePassphrase
} from '@password-generator/core';
```

| Function | Description |
|----------|-------------|
| `generateStrongPassword(config, randomGenerator)` | Generate strong password |
| `generateBase64Password(config, randomGenerator)` | Generate base64 password |
| `generateMemorablePassword(config, randomGenerator, dictionary)` | Generate memorable password |
| `generatePassphrase(config, randomGenerator, dictionary)` | Alias for memorable |

---

## Error Constants

```javascript
import { CRYPTO_ERRORS, PASSWORD_ERRORS, PORT_ERRORS } from '@password-generator/core';
```

### CRYPTO_ERRORS

| Key | Description |
|-----|-------------|
| `MUST_BE_POSITIVE_INTEGER(param)` | Parameter must be positive integer |
| `EMPTY_CHARSET` | Character set is empty |
| `INVALID_BYTE_LENGTH` | Invalid byte length |

### PASSWORD_ERRORS

| Key | Description |
|-----|-------------|
| `TYPE_REQUIRED` | Password type not provided |
| `UNKNOWN_TYPE(type, valid)` | Invalid password type |
| `INVALID_ITERATION` | Invalid iteration count |
| `INVALID_LENGTH` | Invalid length |

### PORT_ERRORS

| Key | Description |
|-----|-------------|
| `MISSING_PORTS(missing, required)` | Required ports not provided |
| `INVALID_PORT(name, expected)` | Port missing required methods |
