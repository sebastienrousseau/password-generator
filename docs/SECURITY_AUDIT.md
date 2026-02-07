# Security Audit Documentation

## Doc: Cryptographic Implementation Security Audit

### Metadata
- **Type:** Reference
- **Audience:** Security Auditors, DevSecOps Engineers, Compliance Officers
- **Prerequisites:** Understanding of cryptography fundamentals, entropy concepts, and secure coding practices

### Content

## Executive Summary

This document provides a comprehensive security audit of the Password Generator's cryptographic implementation, detailing entropy sources, calculation methods, and security best practices. The implementation follows industry standards including NIST SP 800-132, NIST SP 800-63B, and RFC 9106.

## Cryptographic Sources

### 1. Node.js Environment (Server-Side)

**Primary Entropy Source:** Node.js `crypto` module
**Implementation Location:** `src/utils/crypto.js:4`

```javascript
import { randomBytes, randomInt } from "crypto";
```

**Cryptographic Properties:**
- **Algorithm:** OpenSSL-based Cryptographically Secure Pseudo-Random Number Generator (CSPRNG)
- **Entropy Source:** Operating system entropy pool (`/dev/urandom` on Unix, `CryptGenRandom` on Windows)
- **Security Standard:** NIST SP 800-90A compliant
- **Entropy Per Byte:** 8 bits (full entropy)

**Key Functions:**
- `randomBytes(byteLength)`: Generates cryptographically secure random bytes
- `randomInt(max)`: Generates cryptographically secure random integers in range [0, max)

### 2. Browser Environment (Client-Side)

**Primary Entropy Source:** Web Crypto API
**Implementation Location:** `src/adapters/web/WebCryptoRandom.js:32`

```javascript
crypto.getRandomValues(bytes);
```

**Cryptographic Properties:**
- **Algorithm:** Browser-provided CSPRNG (typically based on OS entropy)
- **Standard:** W3C Web Cryptography API specification
- **Entropy Source:** Operating system entropy pool
- **Bias Mitigation:** Implemented rejection sampling for uniform distribution

**Implementation Details:**
```javascript
// Unbiased random integer generation
const maxValue = Math.floor(256 ** bytesNeeded / max) * max;
do {
  // Generate random bytes and convert to integer
  randomValue = convertBytesToInt(randomBytes);
} while (randomValue >= maxValue); // Reject biased values
```

## Cryptographic Primitives

This section details the specific cryptographic APIs used by the Password Generator and their security properties.

### crypto.getRandomValues() (Browser Environment)

**API Location:** `src/adapters/web/WebCryptoRandom.js:32`

```javascript
export const randomBytes = (size) => {
  if (!Number.isInteger(size) || size < 1) {
    throw new RangeError("size must be a positive integer");
  }

  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    throw new Error("Web Crypto API is not available in this environment");
  }

  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);  // Cryptographically secure random generation
  return bytes;
};
```

**Security Properties:**
- **Standard:** W3C Web Cryptography API specification
- **Entropy Source:** Browser's underlying CSPRNG (varies by browser and OS)
- **Output:** Cryptographically secure random bytes in Uint8Array format
- **Maximum Request:** Limited to 65,536 bytes per call by specification
- **Blocking Behavior:** Synchronous, may block if entropy pool is depleted (rare)

**Browser Implementation Details:**
- **Chrome/Chromium:** Uses BoringSSL's RAND_bytes() which sources from OS entropy
- **Firefox:** Uses NSS PRNG backed by OS entropy sources
- **Safari:** Uses SecRandomCopyBytes() on macOS, similar secure sources on iOS
- **Edge:** Uses Windows CryptGenRandom() API

### crypto.randomBytes() (Node.js Environment)

**API Location:** `src/utils/crypto.js:28`

```javascript
import { randomBytes, randomInt } from "crypto";

export const generateRandomBase64 = (byteLength) => {
  validatePositiveInteger(byteLength, "byteLength");
  const result = randomBytes(byteLength).toString("base64");  // CSPRNG bytes to base64

  // Record entropy usage for audit
  recordEntropyUsage("crypto.randomBytes", 1, calculateBase64Entropy(byteLength), {
    byteLength,
    outputLength: result.length,
    method: "base64-encoding",
  });

  return result;
};
```

**Security Properties:**
- **Implementation:** OpenSSL RAND_bytes() function
- **Entropy Source:** Operating system entropy pool
- **Output:** Cryptographically secure random Buffer
- **Blocking Behavior:** Non-blocking, uses entropy pool seeded by OS
- **Maximum Request:** Limited by available system memory

**OS-Specific Entropy Sources:**
- **Linux:** `/dev/urandom` (non-blocking) backed by kernel CSPRNG
- **macOS:** `SecRandomCopyBytes()` via Security framework
- **Windows:** `CryptGenRandom()` or `RtlGenRandom()` Windows APIs
- **FreeBSD/OpenBSD:** `arc4random()` family functions

### crypto.randomInt() Implementation

**API Location:** `src/utils/crypto.js:58` and `src/adapters/web/WebCryptoRandom.js:45`

**Node.js Implementation:**
```javascript
export const generateBase64Chunk = (length) => {
  validatePositiveInteger(length, "length");
  let result = "";
  for (let i = 0; i < length; i++) {
    result += BASE64_CHARSET[randomInt(BASE64_CHARSET.length)];  // Uniform distribution
  }
  return result;
};
```

**Browser Implementation (Bias-Free):**
```javascript
export const randomInt = (max) => {
  const bytesNeeded = Math.ceil(Math.log2(max) / 8);
  const maxValue = Math.floor(256 ** bytesNeeded / max) * max;

  let randomValue;
  do {
    const randomBytes = new Uint8Array(bytesNeeded);
    crypto.getRandomValues(randomBytes);

    randomValue = 0;
    for (let i = 0; i < bytesNeeded; i++) {
      randomValue = randomValue * 256 + randomBytes[i];
    }
  } while (randomValue >= maxValue); // Rejection sampling eliminates bias

  return randomValue % max;
};
```

## Why Not Math.random()?

Understanding the critical difference between Pseudo-Random Number Generators (PRNG) and Cryptographically Secure Pseudo-Random Number Generators (CSPRNG) is essential for security-sensitive applications.

### Math.random() Security Issues

**Algorithm:** Most JavaScript engines implement Math.random() using fast PRNG algorithms optimized for performance, not security:
- **V8 (Chrome/Node.js):** XorShift128+ algorithm (predictable with sufficient output)
- **SpiderMonkey (Firefox):** Linear congruential generator variants
- **JavaScriptCore (Safari):** Fast but cryptographically weak algorithms

**Predictability Demonstration:**
```javascript
// NEVER USE FOR PASSWORDS - PREDICTABLE SEQUENCE
function insecurePassword(length) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];  // INSECURE
  }
  return result;
}

// Attack scenario: If attacker observes 32 consecutive outputs,
// they can predict all future Math.random() values with 100% accuracy
```

### PRNG vs CSPRNG Comparison

| Property | PRNG (Math.random) | CSPRNG (crypto APIs) |
|----------|-------------------|---------------------|
| **Performance** | ~10-50ns per call | ~100-500ns per call |
| **Predictability** | Predictable with enough samples | Computationally infeasible to predict |
| **Periodicity** | Known cycle length (2^32 to 2^64) | Astronomically long periods |
| **Entropy Source** | Deterministic seed | OS entropy pool + hardware RNG |
| **Standards Compliance** | None | NIST SP 800-90A, FIPS 140-2 |
| **Attack Resistance** | Vulnerable to state recovery | Resistant to cryptanalytic attacks |

### Security Vulnerability Examples

**1. State Recovery Attack:**
```javascript
// Vulnerability: Math.random() state can be recovered
const observedOutputs = [];
for (let i = 0; i < 32; i++) {
  observedOutputs.push(Math.random());
}
// With these 32 outputs, an attacker can compute the internal state
// and predict ALL future Math.random() outputs
```

**2. Birthday Attack on Weak Seeds:**
```javascript
// Vulnerability: Limited seed space makes collision attacks practical
// If Math.random() is seeded with timestamp (32-bit), only 2^32 possible states
// Birthday paradox: 50% collision probability after 2^16 samples
```

**3. Timing-Based Seed Prediction:**
```javascript
// Vulnerability: Predictable seeding
if (typeof window !== 'undefined') {
  // Browser: Often seeded with Date.now() or performance.now()
  // Attacker can guess seed within small time window
}
```

### Cryptographic Strength Comparison

**Math.random() Security Analysis:**
- **Effective Entropy:** ~32-48 bits (due to limited internal state)
- **Attack Complexity:** Trivial with observed outputs
- **Regulatory Compliance:** Fails all cryptographic standards
- **Time to Crack:** Minutes to hours with modern hardware

**crypto APIs Security Analysis:**
- **Effective Entropy:** Full entropy of requested bits (128, 256, 512+ bits)
- **Attack Complexity:** 2^128 to 2^256 operations (computationally infeasible)
- **Regulatory Compliance:** NIST, FIPS, Common Criteria approved
- **Time to Crack:** Longer than age of universe (with sufficient entropy)

## Entropy Sources

Platform-specific documentation of where cryptographic randomness originates and how it's collected.

### Linux Entropy Sources

**Primary Sources:**
- **`/dev/urandom`:** Non-blocking entropy device used by Node.js crypto.randomBytes()
- **`getrandom()`:** System call providing direct access to kernel CSPRNG
- **Kernel CSPRNG:** ChaCha20-based generator in modern kernels (5.6+)

**Hardware Entropy Collection:**
```bash
# Entropy sources feeding /dev/urandom
cat /proc/sys/kernel/random/entropy_avail  # Current entropy pool size
cat /sys/devices/virtual/misc/hw_random/rng_available  # Hardware RNG devices
```

**Entropy Gathering Process:**
1. **Hardware Events:** CPU interrupt timing, disk I/O timing, network packet arrival
2. **Hardware RNG:** Intel RDRAND/RDSEED, AMD TRNG, ARM TrustZone RNG
3. **Environmental Noise:** Memory allocation patterns, process scheduling jitter
4. **User Input:** Mouse movements, keyboard timing (less significant on servers)

**Security Properties:**
- **Minimum Entropy:** 256 bits maintained in pool at all times
- **Reseeding:** Automatic reseeding from entropy sources every 5 minutes
- **Forward Security:** Previous outputs don't compromise future outputs
- **Catastrophic Reseeding:** Full state refresh on significant entropy addition

### macOS/iOS Entropy Sources

**Primary API:** `SecRandomCopyBytes()` via Security.framework
**Implementation:** Common Crypto library with hardware acceleration

**Hardware Sources:**
- **Intel Macs:** Intel Secure Key (RDRAND) instruction
- **Apple Silicon:** Dedicated hardware entropy source in Secure Enclave
- **iOS Devices:** A-series chip hardware TRNG, Secure Enclave entropy

**System Integration:**
```c
// Simplified entropy flow on macOS
Hardware TRNG -> Secure Enclave -> Kernel CSPRNG -> SecRandomCopyBytes()
              -> Environmental entropy (I/O timing, interrupts)
```

**Security Features:**
- **Hardware Isolation:** Entropy generation isolated in Secure Enclave
- **Tamper Detection:** Hardware protection against physical attacks
- **Continuous Testing:** Built-in health monitoring of entropy sources
- **FIPS 140-2 Level 1:** Validated cryptographic implementation

### Windows Entropy Sources

**Primary APIs:**
- **`CryptGenRandom()`:** Legacy Windows crypto API (pre-Vista)
- **`BCryptGenRandom()`:** Modern Windows crypto API (Vista+)
- **`RtlGenRandom()`:** System-level API used by Node.js

**Hardware Sources:**
- **Intel/AMD:** RDRAND/RDSEED CPU instructions when available
- **TPM (Trusted Platform Module):** Hardware security chip entropy
- **System Timer:** High-resolution performance counter entropy

**Entropy Collection:**
```powershell
# Windows entropy sources
# CPU hardware random: RDRAND instruction
# System events: Keyboard/mouse input, disk I/O, network activity
# Environment: Memory addresses, process IDs, thread timing
# TPM: Hardware-based random number generation
```

**Windows 10+ Enhancements:**
- **Kernel Pool:** Fortuna-based CSPRNG with continuous entropy gathering
- **Per-Process State:** Isolated CSPRNG state per process
- **Backward Compatibility:** Secure implementations of legacy APIs
- **Hardware Integration:** Automatic use of CPU RDRAND when available

### Browser Environment Sources

**Chrome/Chromium Entropy Chain:**
```
Hardware RNG -> OS Entropy Pool -> BoringSSL -> V8 -> crypto.getRandomValues()
```

**Firefox Entropy Chain:**
```
Hardware RNG -> OS Entropy Pool -> NSS Library -> Gecko -> crypto.getRandomValues()
```

**Safari Entropy Chain:**
```
Secure Enclave -> macOS/iOS Crypto -> WebKit -> crypto.getRandomValues()
```

**Security Considerations:**
- **Sandbox Limitations:** Browsers may have restricted access to some entropy sources
- **Cross-Origin Isolation:** Each origin gets independent entropy stream
- **Performance Throttling:** Browsers may limit high-frequency entropy requests
- **Fallback Sources:** Multiple entropy sources prevent single points of failure

## Security Guarantees

Explicit documentation of what the Password Generator protects against and what additional security measures are required.

### What This Library DOES Protect Against

**✅ Cryptographic Attacks:**
- **Brute Force Attacks:** 128+ bit entropy makes exhaustive search computationally infeasible
- **Dictionary Attacks:** Random generation eliminates common password patterns
- **Rainbow Table Attacks:** Unique random generation prevents precomputed lookup attacks
- **Statistical Analysis:** CSPRNG output is indistinguishable from true random data
- **Pattern Recognition:** No predictable sequences or character frequency biases

**✅ Implementation Vulnerabilities:**
- **PRNG State Recovery:** Uses OS-backed CSPRNGs immune to state prediction
- **Modulo Bias:** Implements rejection sampling for uniform distribution
- **Timing Attacks:** Constant-time operations where cryptographically relevant
- **Memory Disclosure:** No reuse of entropy across password generations
- **Weak Seeding:** Relies on OS entropy pools with continuous reseeding

**✅ Compliance Requirements:**
- **NIST SP 800-132:** Argon2id configuration recommendations provided
- **NIST SP 800-63B:** Entropy requirements exceeded for all security levels
- **RFC 9106:** Argon2 parameter guidance for secure password hashing
- **OWASP ASVS:** Cryptographically secure password generation requirements
- **PCI DSS:** Strong cryptography requirements for password handling

### What This Library Does NOT Protect Against

**❌ Post-Generation Vulnerabilities:**
- **Shoulder Surfing:** Visual observation of displayed passwords
- **Clipboard Interception:** Malicious software accessing clipboard contents
- **Memory Dumps:** Password strings in process memory until garbage collection
- **Network Transmission:** Requires HTTPS/TLS for secure password delivery
- **Storage Security:** Application must implement secure password storage (hashing)

**❌ System-Level Attacks:**
- **Compromised OS:** Malware with system-level access can intercept entropy
- **Hardware Backdoors:** Malicious hardware affecting entropy sources
- **Side-Channel Attacks:** Power analysis, electromagnetic emanation, timing analysis
- **Physical Access:** Attacks requiring physical access to the system
- **Social Engineering:** Human factors bypassing technical controls

**❌ Application Security:**
- **Cross-Site Scripting (XSS):** Malicious scripts accessing generated passwords
- **Man-in-the-Middle:** Network attackers intercepting password transmission
- **Credential Reuse:** Users reusing generated passwords across multiple systems
- **Insecure Storage:** Applications storing passwords without proper hashing
- **Authentication Bypass:** Vulnerabilities in authentication mechanisms

### Required Additional Security Measures

**1. Secure Password Storage:**
```javascript
// REQUIRED: Hash passwords with Argon2id before storage
import argon2 from 'argon2';

const hashPassword = async (password) => {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 131072,    // 128 MB
    timeCost: 5,           // 5 iterations
    parallelism: 8,        // 8 threads
    saltLength: 16,        // 128-bit salt
    hashLength: 32         // 256-bit output
  });
};
```

**2. Secure Network Transmission:**
```javascript
// REQUIRED: Use HTTPS/TLS 1.3 for password transmission
const securePasswordUpdate = async (password) => {
  const response = await fetch('https://api.example.com/password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    },
    body: JSON.stringify({ password: await hashPassword(password) })
  });
};
```

**3. Memory Security:**
```javascript
// RECOMMENDED: Clear sensitive data from memory
const generateAndClearPassword = () => {
  let password = generateRandomBase64(16);

  // Use password immediately
  const hash = hashPassword(password);

  // Clear original password (limited effectiveness in JavaScript)
  password = null;

  return hash;
};
```

**4. Content Security Policy:**
```html
<!-- REQUIRED: Prevent XSS attacks on password forms -->
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; object-src 'none';">
```

### Threat Model Boundaries

**IN SCOPE (Protected):**
- Cryptographic weakness in password generation
- Bias in random number generation
- Insufficient entropy for given security level
- Implementation vulnerabilities in CSPRNG usage
- Standards compliance failures

**OUT OF SCOPE (Requires External Protection):**
- Post-generation password handling and storage
- Network transmission security
- Authentication and authorization mechanisms
- System and application security hardening
- User education and security awareness
- Physical and environmental security

### Security Level Guarantees

| Entropy Level | Attack Resistance | Quantum Safety | Compliance |
|---------------|------------------|----------------|------------|
| 256+ bits | 2^256 operations | Quantum-resistant | NIST Post-Quantum |
| 128-255 bits | 2^128 operations | Current algorithms only | NIST SP 800-131A |
| 80-127 bits | 2^80 operations | Vulnerable to quantum | Legacy compliance |
| 64-79 bits | 2^64 operations | Brute-forceable | Below standards |
| <64 bits | Practical attacks | Trivially broken | Non-compliant |

**Attack Time Estimates (Conservative):**
- **2^64 operations:** ~1 year with dedicated hardware (2024 technology)
- **2^80 operations:** ~65,000 years with current supercomputers
- **2^128 operations:** Longer than universe age with all Earth's energy
- **2^256 operations:** Physically impossible with known physics

## Entropy Calculations

### Mathematical Foundation

**Implementation Location:** `packages/core/src/domain/entropy-calculator.js`

### 1. Base64 Password Entropy

```javascript
// Each random byte provides 8 bits of entropy
export const calculateBase64Entropy = (byteLength) => {
  return byteLength * 8;
};
```

**Formula:** `H = n × 8 bits`
- `n` = number of random bytes
- Each byte represents 256 possible values = 8 bits entropy

### 2. Character Set Entropy

```javascript
// Each character provides log₂(charset_size) bits
export const calculateCharsetEntropy = (charsetSize, length) => {
  const bitsPerChar = Math.log2(charsetSize);
  return length * bitsPerChar;
};
```

**Formula:** `H = L × log₂(C)`
- `L` = password length
- `C` = character set size
- Example: 94 printable ASCII chars = 6.55 bits per character

### 3. Dictionary-Based Entropy

```javascript
// Each word provides log₂(dictionary_size) bits
export const calculateDictionaryEntropy = (dictionarySize, wordCount) => {
  const bitsPerWord = Math.log2(dictionarySize);
  return wordCount * bitsPerWord;
};
```

**Formula:** `H = W × log₂(D)`
- `W` = number of words
- `D` = dictionary size
- Example: EFF wordlist (7776 words) = 12.9 bits per word

### Security Level Classification

**Implementation Location:** `packages/core/src/domain/entropy-calculator.js:82`

| Entropy Range | Security Level | Quantum Resistance | Use Case |
|---------------|----------------|-------------------|----------|
| 256+ bits | EXCELLENT | Yes | Maximum security, quantum-resistant |
| 128-255 bits | STRONG | Partial | High-security applications |
| 80-127 bits | GOOD | No | Standard business applications |
| 64-79 bits | MODERATE | No | Low-sensitivity applications |
| <64 bits | WEAK | No | Not recommended |

## Security Architecture

### Platform-Agnostic Design

```
┌─────────────────────────────────────────────────────────┐
│                   Adapters Layer                        │
│  ┌──────────────────┐    ┌──────────────────┐          │
│  │  Node.js Crypto  │    │   Web Crypto     │          │
│  │   randomBytes()  │    │ getRandomValues()│          │
│  │   randomInt()    │    │    (Uint8Array)  │          │
│  └────────┬─────────┘    └─────────┬────────┘          │
│           │                        │                   │
│           └────────────┬───────────┘                   │
├────────────────────────┼───────────────────────────────┤
│                        │   Core Domain                 │
│  ┌─────────────────────▼─────────────────────┐         │
│  │        Entropy Calculator                │         │
│  │   calculateBase64Entropy()              │         │
│  │   calculateCharsetEntropy()             │         │
│  │   calculateDictionaryEntropy()          │         │
│  │   getSecurityLevel()                    │         │
│  └─────────────────────┬─────────────────────┘         │
│                        │                               │
│  ┌─────────────────────▼─────────────────────┐         │
│  │       Password Generator Service          │         │
│  │   (Platform-Independent Logic)            │         │
│  └─────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

### Security Properties

1. **Zero External Dependencies:** Core cryptographic logic has no runtime dependencies
2. **Deterministic Testing:** Cryptographic functions can be tested with mock entropy sources
3. **Platform Isolation:** All platform-specific code isolated in adapters
4. **Audit Transparency:** All entropy usage tracked and reported

## Security Audit System

### Real-Time Entropy Tracking

**Implementation Location:** `src/utils/security-audit.js:86`

```javascript
export const recordEntropyUsage = (source, calls, entropyBits, details) => {
  entropyLog.push({
    source,           // 'crypto.randomBytes' or 'crypto.randomInt'
    calls,            // Number of crypto calls
    entropyBits,      // Calculated entropy
    details,          // Implementation details
    timestamp: Date.now()
  });
};
```

### Audit Report Generation

**Sample Audit Output:**
```json
{
  "auditEnabled": true,
  "summary": {
    "totalEntropyBits": 192.0,
    "securityLevel": "STRONG (128-255 bits)",
    "algorithmsUsed": 2,
    "entropySourcesUsed": 3
  },
  "entropyDetails": {
    "sources": [
      {
        "source": "crypto.randomBytes",
        "calls": 1,
        "entropyBits": 128.0,
        "details": {
          "byteLength": 16,
          "outputLength": 24,
          "method": "base64-encoding"
        }
      },
      {
        "source": "crypto.randomInt",
        "calls": 12,
        "entropyBits": 64.0,
        "details": {
          "charsetSize": 64,
          "outputLength": 12,
          "method": "character-by-character"
        }
      }
    ]
  },
  "compliance": {
    "cryptographicStandard": "Uses Node.js crypto module (OpenSSL-based CSPRNG)",
    "entropySource": "OS-provided cryptographically secure random number generator"
  }
}
```

## Password Storage Security Guidelines

### Industry Standards Compliance

**NIST SP 800-132 Requirements:**
- **Memory-Hard Function:** Argon2id (recommended)
- **Salt Requirements:** Minimum 128-bit (16 bytes) cryptographically random salt
- **Iteration Count:** Minimum 3, recommended 5+ iterations
- **Memory Requirements:** Minimum 64MB, recommended 128MB+

### Argon2id Configuration

**Minimum Security Configuration:**
```javascript
const minSecurityConfig = {
  algorithm: 'argon2id',
  memory: 65536,        // 64 MB
  time: 3,              // 3 iterations
  parallelism: 4,       // 4 threads
  saltLength: 16,       // 128-bit salt
  keyLength: 32         // 256-bit output (quantum-resistant)
};
```

**Recommended Production Configuration:**
```javascript
const productionConfig = {
  algorithm: 'argon2id',
  memory: 131072,       // 128 MB
  time: 5,              // 5 iterations
  parallelism: 8,       // 8 threads
  saltLength: 16,       // 128-bit salt
  keyLength: 32         // 256-bit output
};
```

**High-Security Configuration:**
```javascript
const highSecurityConfig = {
  algorithm: 'argon2id',
  memory: 262144,       // 256 MB
  time: 10,             // 10 iterations
  parallelism: 16,      // 16 threads
  saltLength: 32,       // 256-bit salt
  keyLength: 64         // 512-bit output
};
```

### Implementation Example

```javascript
import argon2 from 'argon2';
import { randomBytes } from 'crypto';

async function hashPassword(password, config = productionConfig) {
  // Generate cryptographically secure salt
  const salt = randomBytes(config.saltLength);

  // Hash password using Argon2id
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: config.memory,
    timeCost: config.time,
    parallelism: config.parallelism,
    salt,
    hashLength: config.keyLength
  });

  return hash;
}

async function verifyPassword(password, hash) {
  return await argon2.verify(hash, password);
}
```

## Security Best Practices

### 1. Cryptographic Hygiene

**DO:**
- Use platform-provided CSPRNGs (`crypto.randomBytes`, `crypto.getRandomValues`)
- Implement proper bias mitigation for uniform distribution
- Validate all input parameters to cryptographic functions
- Clear sensitive data from memory when possible

**DON'T:**
- Use `Math.random()` for any security-sensitive operations
- Implement custom random number generators
- Reuse salts across different passwords
- Store passwords in plain text or reversibly encrypted

### 2. Entropy Best Practices

**Minimum Entropy Requirements:**
- **General Use:** 80+ bits (e.g., 12-character base64)
- **Business Applications:** 128+ bits (e.g., 16-character base64)
- **High Security:** 256+ bits (e.g., 32-character base64)
- **Quantum Resistant:** 256+ bits with Argon2id hashing

### 3. Implementation Security

**Code Review Checklist:**
- [ ] All random number generation uses platform CSPRNGs
- [ ] Uniform distribution is properly maintained
- [ ] Input validation prevents integer overflow/underflow
- [ ] Sensitive data is cleared from memory
- [ ] Error handling doesn't leak timing information
- [ ] All cryptographic parameters meet minimum standards

### 4. Threat Modeling

**Protected Against:**
- Brute force attacks (sufficient entropy)
- Dictionary attacks (random generation)
- Rainbow table attacks (unique salts)
- Side-channel attacks (memory-hard functions)
- Quantum computer attacks (256+ bit entropy)

**Additional Protection Required:**
- **Key Management:** Secure storage and rotation of encryption keys
- **Access Control:** Authentication and authorization mechanisms
- **Network Security:** TLS 1.3+ for transmission security
- **Physical Security:** Secure storage of password databases

## Compliance Matrix

| Standard | Requirement | Implementation | Status |
|----------|-------------|----------------|---------|
| NIST SP 800-132 | Memory-hard KDF | Argon2id support | ✅ Compliant |
| NIST SP 800-63B | 80+ bit entropy | Configurable up to 512+ bits | ✅ Compliant |
| RFC 9106 | Argon2 parameters | NIST-recommended configs | ✅ Compliant |
| RFC 4086 | Cryptographic randomness | OS-backed CSPRNGs | ✅ Compliant |
| OWASP ASVS | Secure password storage | Argon2id implementation | ✅ Compliant |
| PCI DSS | Strong cryptography | AES-256 equivalent strength | ✅ Compliant |

## Audit Procedures

### 1. Entropy Source Verification

```bash
# Verify Node.js crypto usage
grep -r "randomBytes\|randomInt" src/
grep -r "Math.random" src/ --exclude-dir=test  # Should return no results

# Verify Web Crypto usage
grep -r "getRandomValues" src/
grep -r "crypto\.random" src/  # Should only find crypto.getRandomValues
```

### 2. Security Configuration Validation

```javascript
// Test entropy calculation accuracy
const config = { type: 'strong', length: 16, iteration: 1 };
const entropy = calculateTotalEntropy(config);
console.log(`Entropy: ${entropy} bits`);  // Should be 96 bits for 16-char base64
```

### 3. Audit Report Generation

```bash
# Generate comprehensive security audit
npx @sebastienrousseau/password-generator \
  --type strong \
  --length 16 \
  --iteration 2 \
  --audit

# Verify audit output includes:
# - Total entropy calculation
# - Entropy source breakdown
# - Algorithm usage tracking
# - Security level classification
# - NIST compliance status
```

## Known Security Considerations

### 1. Memory Security
- **Issue:** Passwords may remain in process memory until garbage collection
- **Mitigation:** Use secure memory allocation where available, implement explicit zeroing

### 2. Side-Channel Attacks
- **Issue:** Timing differences in password verification
- **Mitigation:** Use constant-time comparison functions, implement Argon2id

### 3. Clipboard Security
- **Issue:** Clipboard contents accessible to other applications
- **Mitigation:** User education, implement clipboard auto-clear timers

### 4. Terminal History
- **Issue:** CLI passwords may appear in shell history
- **Mitigation:** Use secure input methods, educate users on history management

## Recommendations for Auditors

1. **Verify Cryptographic Sources:** Ensure all randomness comes from platform CSPRNGs
2. **Validate Entropy Calculations:** Test entropy math against known standards
3. **Review Configuration Management:** Verify Argon2id parameters meet NIST guidelines
4. **Test Implementation Security:** Verify uniform distribution and bias mitigation
5. **Assess Threat Model:** Confirm protection against relevant attack vectors

### Validation Checklist

- [ ] All code examples tested and working against current version
- [ ] All links verified and not broken
- [ ] Terminology matches project glossary
- [ ] Tone audit: professional but accessible
- [ ] No assumptions about reader's environment left unstated

---

**Designed by Sebastien Rousseau — Engineered with Euxis**