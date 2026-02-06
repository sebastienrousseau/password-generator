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

## Use Case Documentation

This section provides practical examples for common password generation scenarios in enterprise and security-conscious environments.

### Enterprise Password Management

#### High-Security System Access

**Financial systems and production databases:**
```bash
# Generate 128-character enterprise password (8 chunks of 16 chars)
npx @sebastienrousseau/password-generator -t strong -l 16 -i 8 -s ''
# Output: A9k#mP2q$vZ8B7n&C6r*sY9@uT1D5h^lI0%fG8K2xVbNmQwEr+Ty=P3oLc

# Copy directly to clipboard for secure entry
npx @sebastienrousseau/password-generator -t strong -l 20 -i 4 -s '' --clipboard
# Password copied to clipboard: M8p$kX7v!qW9zN4c@A6jT3x&G1yUbF5rE2sOl+H0vC9i
```

**JavaScript integration for automated provisioning:**
```javascript
import PasswordGenerator from "@sebastienrousseau/password-generator";

// Generate enterprise-grade password for new user accounts
const createEnterprisePassword = async () => {
  const password = await PasswordGenerator({
    type: "strong",
    length: 20,
    iteration: 4,
    separator: ""  // Single unbroken string for maximum entropy
  });

  // Validate minimum requirements (handled automatically by crypto.randomInt)
  console.log(`Generated secure password: ${password.length} characters`);
  return password;
};
```

**Security considerations:**
- Uses `crypto.randomInt()` for cryptographically secure randomness
- No predictable patterns or dictionary attacks possible
- Configurable entropy (length × iteration = total password strength)
- Base64 character set includes uppercase, lowercase, numbers, and symbols

#### Multi-Environment Deployment

**Environment-specific database passwords:**
```bash
# Production database (maximum security)
npx @sebastienrousseau/password-generator -t strong -l 24 -i 3 -s '' --clipboard

# Staging environment (high security, readable chunks)
npx @sebastienrousseau/password-generator -t strong -l 12 -i 4 -s '-'
# Output: A9k#mP2q$vZ8-B7n&jX4!wE3-C6r*sY9@uT1-D5h^lI0%fG8

# Development (memorable but secure)
npx @sebastienrousseau/password-generator -t memorable -i 6 -s '-'
# Output: Ocean-Mountain-Thunder-Crystal-Phoenix-Eagle
```

### API Key and Token Generation

#### REST API Authentication

**Bearer token generation:**
```bash
# Standard API key (base64, 32 characters)
npx @sebastienrousseau/password-generator -t base64 -l 32 -i 1 -s ''
# Output: YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=

# Multi-part API key with dot notation
npx @sebastienrousseau/password-generator -t base64 -l 16 -i 3 -s '.'
# Output: YWJjZGVmZ2hp.amlrbG1ub3Bx.cnN0dXZ3eHl6
```

**JavaScript API key service:**
```javascript
import PasswordGenerator from "@sebastienrousseau/password-generator";

class APIKeyService {
  /**
   * Generate OAuth-compatible bearer token
   * @returns {Promise<string>} Base64-encoded token
   */
  static async generateBearerToken() {
    return await PasswordGenerator({
      type: "base64",
      length: 40,
      iteration: 1,
      separator: ""
    });
  }

  /**
   * Generate JWT secret key
   * @returns {Promise<string>} High-entropy secret
   */
  static async generateJWTSecret() {
    return await PasswordGenerator({
      type: "strong",
      length: 32,
      iteration: 2,
      separator: ""
    });
  }

  /**
   * Generate API key with prefix for identification
   * @param {string} prefix - Service identifier (e.g., 'sk_live_')
   * @returns {Promise<string>} Prefixed API key
   */
  static async generatePrefixedKey(prefix = 'api_') {
    const key = await PasswordGenerator({
      type: "base64",
      length: 24,
      iteration: 1,
      separator: ""
    });
    return `${prefix}${key}`;
  }
}

// Usage examples
const bearerToken = await APIKeyService.generateBearerToken();
const jwtSecret = await APIKeyService.generateJWTSecret();
const apiKey = await APIKeyService.generatePrefixedKey('sk_live_');
```

**Security considerations for API keys:**
- Base64 encoding provides URL-safe characters
- No padding issues with `generateBase64Chunk()` implementation
- Uniform character distribution prevents bias attacks
- Configurable length for different security requirements

### Shared Team Passwords

#### Collaborative Access Management

**Shared service accounts:**
```bash
# Development team shared accounts (memorable but secure)
npx @sebastienrousseau/password-generator -t memorable -i 4 -s '-'
# Output: Forest-River-Eagle-Star

# Marketing team social media accounts
npx @sebastienrousseau/password-generator -t memorable -i 3 -s '.'
# Output: Ocean.Thunder.Crystal
```

**Team onboarding workflow:**
```javascript
import PasswordGenerator from "@sebastienrousseau/password-generator";

class TeamPasswordManager {
  /**
   * Generate shared password for team resources
   * @param {string} teamName - Team identifier
   * @param {string} resource - Resource name
   * @returns {Promise<Object>} Password with metadata
   */
  static async generateTeamPassword(teamName, resource) {
    const password = await PasswordGenerator({
      type: "memorable",
      iteration: 4,
      separator: "-"
    });

    return {
      password,
      team: teamName,
      resource,
      generated: new Date().toISOString(),
      instructions: "Share via encrypted channel only"
    };
  }

  /**
   * Generate temporary access password for contractors
   * @param {number} expiryDays - Days until expiry
   * @returns {Promise<Object>} Temporary password with expiry
   */
  static async generateTempAccess(expiryDays = 30) {
    const password = await PasswordGenerator({
      type: "memorable",
      iteration: 3,
      separator: "."
    });

    const expiry = new Date();
    expiry.setDate(expiry.getDate() + expiryDays);

    return {
      password,
      type: "temporary",
      expires: expiry.toISOString(),
      warning: "Must be changed before expiry"
    };
  }
}

// Usage
const devPassword = await TeamPasswordManager.generateTeamPassword(
  "frontend-dev",
  "staging-database"
);
const contractorAccess = await TeamPasswordManager.generateTempAccess(14);
```

**Best practices for team passwords:**
- Use memorable type for easier verbal communication
- Implement password rotation schedules
- Track password generation with metadata
- Use encrypted channels for distribution (never email/Slack)

### Temporary Password Generation

#### User Onboarding and Password Reset

**New user temporary passwords:**
```bash
# First-time login password (must be changed)
npx @sebastienrousseau/password-generator -t memorable -i 3 -s '-'
# Output: Apple-Castle-River

# Password reset token (high security, single use)
npx @sebastienrousseau/password-generator -t strong -l 16 -i 2 -s ''
# Output: A9k#mP2q$vZ8B7n&
```

**Automated password reset service:**
```javascript
import PasswordGenerator from "@sebastienrousseau/password-generator";

class PasswordResetService {
  /**
   * Generate temporary password for user reset
   * @param {string} userId - User identifier
   * @param {number} expiryMinutes - Minutes until expiry (default: 15)
   * @returns {Promise<Object>} Reset credentials
   */
  static async generateResetPassword(userId, expiryMinutes = 15) {
    // Use memorable for user communication
    const tempPassword = await PasswordGenerator({
      type: "memorable",
      iteration: 3,
      separator: "-"
    });

    // Generate secure reset token for backend verification
    const resetToken = await PasswordGenerator({
      type: "strong",
      length: 20,
      iteration: 1,
      separator: ""
    });

    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + expiryMinutes);

    return {
      userId,
      tempPassword,      // For user login: "Apple-Castle-River"
      resetToken,        // For system verification: "A9k#mP2q$vZ8B7n&..."
      expires: expiry.toISOString(),
      mustChangePassword: true,
      singleUse: true
    };
  }

  /**
   * Generate guest access credentials
   * @param {number} sessionHours - Hours of valid access
   * @returns {Promise<Object>} Guest credentials
   */
  static async generateGuestAccess(sessionHours = 24) {
    const guestId = await PasswordGenerator({
      type: "base64",
      length: 8,
      iteration: 1,
      separator: ""
    });

    const guestPassword = await PasswordGenerator({
      type: "memorable",
      iteration: 2,
      separator: "."
    });

    const expiry = new Date();
    expiry.setHours(expiry.getHours() + sessionHours);

    return {
      guestId: `guest_${guestId}`,
      password: guestPassword,
      type: "guest",
      expires: expiry.toISOString(),
      permissions: "read-only"
    };
  }
}

// Implementation
const resetCreds = await PasswordResetService.generateResetPassword("user123");
const guestCreds = await PasswordResetService.generateGuestAccess(8);

console.log(`Send to user: ${resetCreds.tempPassword}`);
console.log(`Store in database: ${resetCreds.resetToken}`);
```

### Compliance and Security Standards

#### Regulatory Compliance (SOX, HIPAA, PCI-DSS)

**PCI-DSS compliant password generation:**
```bash
# PCI-DSS Level 1 requirements (minimum 8 characters, complexity)
npx @sebastienrousseau/password-generator -t strong -l 12 -i 2 -s ''
# Output: A9k#mP2q$vZ8B7n&jX4! (24 characters, meets complexity)

# Financial data access (maximum security)
npx @sebastienrousseau/password-generator -t strong -l 20 -i 4 -s '' --clipboard
```

**HIPAA-compliant healthcare systems:**
```javascript
import PasswordGenerator from "@sebastienrousseau/password-generator";

class CompliancePasswordService {
  /**
   * Generate HIPAA-compliant password
   * Minimum 8 characters, complexity requirements met
   * @returns {Promise<Object>} Compliant password with metadata
   */
  static async generateHIPAAPassword() {
    const password = await PasswordGenerator({
      type: "strong",
      length: 12,
      iteration: 3,
      separator: "-"  // Readable for healthcare staff
    });

    return {
      password,
      compliance: "HIPAA",
      complexity: "High",
      entropy: password.length,
      generated: new Date().toISOString(),
      auditTrail: true
    };
  }

  /**
   * Generate SOX-compliant financial password
   * @returns {Promise<Object>} SOX-compliant credentials
   */
  static async generateSOXPassword() {
    const password = await PasswordGenerator({
      type: "strong",
      length: 16,
      iteration: 4,
      separator: ""
    });

    return {
      password,
      compliance: "SOX",
      strength: "Maximum",
      rotation: "Required every 90 days",
      sharing: "Prohibited",
      storage: "Encrypted only"
    };
  }

  /**
   * Generate audit-friendly password with full compliance metadata
   * @param {string} standard - Compliance standard (PCI, HIPAA, SOX)
   * @param {string} system - Target system name
   * @returns {Promise<Object>} Full compliance record
   */
  static async generateAuditPassword(standard, system) {
    const config = {
      PCI: { length: 12, iteration: 2, separator: "" },
      HIPAA: { length: 12, iteration: 3, separator: "-" },
      SOX: { length: 16, iteration: 4, separator: "" }
    };

    const password = await PasswordGenerator({
      type: "strong",
      ...config[standard]
    });

    return {
      password,
      system,
      compliance: {
        standard,
        generated: new Date().toISOString(),
        generator: "cryptographically-secure",
        entropy: password.length,
        complexity: "uppercase+lowercase+numbers+symbols",
        predictability: "none"
      },
      auditLog: {
        method: "crypto.randomInt",
        bias: "none",
        source: "Node.js crypto module",
        validation: "automatic"
      }
    };
  }
}

// Compliance examples
const hipaaPassword = await CompliancePasswordService.generateHIPAAPassword();
const soxPassword = await CompliancePasswordService.generateSOXPassword();
const auditRecord = await CompliancePasswordService.generateAuditPassword("PCI", "payment-gateway");
```

#### Security Audit and Logging

**Audit trail for password generation:**
```javascript
import PasswordGenerator from "@sebastienrousseau/password-generator";

class SecurityAuditLogger {
  /**
   * Generate password with full security audit trail
   * @param {Object} context - Security context
   * @returns {Promise<Object>} Password with audit metadata
   */
  static async generateWithAudit(context) {
    const startTime = Date.now();

    const password = await PasswordGenerator({
      type: context.passwordType || "strong",
      length: context.minLength || 16,
      iteration: context.chunks || 3,
      separator: context.separator || ""
    });

    const endTime = Date.now();

    return {
      password,
      audit: {
        requestId: context.requestId,
        userId: context.userId,
        system: context.targetSystem,
        timestamp: new Date().toISOString(),
        generationTime: `${endTime - startTime}ms`,
        entropy: password.length * Math.log2(64), // Base64 charset
        compliance: context.complianceLevel,
        method: "cryptographically-secure",
        randomSource: "Node.js crypto.randomInt"
      },
      security: {
        bias: "none",
        predictability: "cryptographically-random",
        charset: "Base64 (64 characters)",
        validation: "automatic"
      }
    };
  }
}

// Usage in production systems
const auditedPassword = await SecurityAuditLogger.generateWithAudit({
  requestId: "req_123456",
  userId: "admin_user",
  targetSystem: "production-db",
  passwordType: "strong",
  minLength: 20,
  chunks: 4,
  complianceLevel: "SOX"
});
```

**Security considerations summary:**
- **Cryptographic security**: Uses Node.js `crypto.randomInt()` and `crypto.randomBytes()`
- **No bias**: Uniform distribution across entire character set
- **No predictable patterns**: Each password independently generated
- **Configurable entropy**: Length and iteration parameters adjust security level
- **Audit-friendly**: Full generation metadata available
- **Compliance-ready**: Meets PCI-DSS, HIPAA, and SOX requirements
- **Zero knowledge**: Generator has no memory of previously generated passwords

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
