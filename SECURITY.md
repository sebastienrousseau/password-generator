# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Email security concerns to: hello@password-generator.pro
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

### Response Timeline

- **Initial Response:** Within 48 hours
- **Assessment:** Within 7 days
- **Fix Timeline:** Depends on severity
  - Critical: 24-72 hours
  - High: 7 days
  - Medium: 30 days
  - Low: Next release

### What to Expect

1. Acknowledgment of your report
2. Assessment and validation of the issue
3. Development of a fix
4. Coordinated disclosure (if applicable)
5. Credit in release notes (unless you prefer anonymity)

## Security Practices

### Cryptographic Security

This library uses cryptographically secure random number generation:

- **Node.js**: `crypto.randomInt()` from the native crypto module
- **Browser**: `crypto.getRandomValues()` from the Web Crypto API

Both methods are backed by operating system entropy sources and are suitable for cryptographic purposes.

### Dependency Security

- Dependencies are regularly audited using `npm audit`
- Automated dependency updates via Dependabot
- Core password generation has zero runtime dependencies

### Code Quality

- ESLint static analysis on all code
- 100% test coverage on core package
- Parity tests ensure consistent behavior across environments

## Security Considerations for Users

### Password Storage

This library generates passwords but does not store them. Users are responsible for:

- Secure password storage (use a password manager)
- Not logging generated passwords
- Clearing clipboard after use

### Entropy Recommendations

| Use Case | Minimum Entropy | Recommended Configuration |
|----------|-----------------|---------------------------|
| General accounts | 60 bits | `strong`, length=12, iteration=2 |
| High-security | 80 bits | `strong`, length=16, iteration=3 |
| Maximum security | 128+ bits | `strong`, length=24, iteration=4 |

### Environment Variables

The library respects these environment variables:

- `NO_COLOR`: Disables colored output
- `FORCE_COLOR`: Forces colored output

No sensitive data is read from or written to environment variables.

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Adapters                         │
│  ┌──────────────┐  ┌──────────────┐                │
│  │ Node Crypto  │  │ Web Crypto   │                │
│  │   Adapter    │  │   Adapter    │                │
│  └──────┬───────┘  └──────┬───────┘                │
│         │                 │                         │
│         └────────┬────────┘                         │
│                  │                                  │
│  ┌───────────────▼───────────────┐                 │
│  │    RandomGeneratorPort        │ ◄── Interface   │
│  └───────────────┬───────────────┘                 │
│                  │                                  │
├──────────────────┼──────────────────────────────────┤
│                  │     Core Package                 │
│  ┌───────────────▼───────────────┐                 │
│  │     PasswordService           │                 │
│  │  (Platform-Agnostic)          │                 │
│  └───────────────────────────────┘                 │
│                                                     │
│  Zero External Dependencies                         │
│  Deterministic for Given Random Input              │
│  100% Test Coverage                                │
└─────────────────────────────────────────────────────┘
```

### Core Isolation

The core package (`packages/core`) is completely isolated:

- No Node.js built-ins
- No browser APIs
- No external dependencies
- All platform-specific functionality injected via ports

This architecture ensures:
- Testability with deterministic mocks
- Portability across platforms
- Auditability of security-critical code

## Audit History

| Date | Auditor | Scope | Result |
|------|---------|-------|--------|
| 2024 | Internal | Full codebase | Passed |

## Known Limitations

1. **Clipboard Security**: Clipboard contents may be accessible to other applications
2. **Memory**: Passwords may remain in process memory until garbage collected
3. **Terminal History**: CLI passwords may appear in shell history if used in commands

## License

This security policy is part of the Password Generator project, licensed under MIT.
