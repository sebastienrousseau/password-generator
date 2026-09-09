# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.5] - 2026-02-07

### Added

- **Quantum-Resistant Password Generation**: New password type (`-t quantum-resistant`) with enhanced entropy using quantum-safe algorithms following NIST Post-Quantum Cryptography standards
- **KDF Configuration Options**: Configurable Argon2id key derivation parameters via CLI (`--kdf-memory`, `--kdf-time`, `--kdf-parallelism`) and programmatic API
- **NIST SP 800-132 Compliance**: Key derivation using Argon2id with recommended parameters (64MB memory, 3 iterations, 4 threads)
- **Enhanced Character Sets**: Expanded symbol alphabet (94 printable ASCII characters) for quantum-resistant mode
- **Minimum Entropy Threshold**: 256-bit entropy guarantee for quantum-resistant passwords

### Security

- **Post-Quantum Ready**: Passwords resist both classical and quantum computing attacks
- **Configurable KDF Parameters**: Enterprise-grade security with adjustable memory, time, and parallelism settings
- **Enhanced Entropy Calculation**: Real-time entropy validation for quantum-resistant generation

### Documentation

- Added comprehensive Quantum-Resistant Mode section to README
- Added Key Derivation Functions (KDF) documentation with NIST SP 800-132 guidance
- Added command-line and programmatic examples for quantum-resistant password generation
- Updated password types table with quantum-resistant entry

## [1.1.4] - 2026-02-07

### Added

- **Hexagonal Architecture**: Platform-agnostic core package (`@password-generator/core`) with zero dependencies
- **Web UI Demo**: Browser-based password generator using the same core as CLI
- **Port/Adapter Pattern**: Injectable ports for crypto, storage, logging, and dictionary
- **Cross-Platform Parity Tests**: Ensure CLI and Web UI produce identical results
- **Benchmarks**: Performance benchmarks for password generation and entropy calculation

### Changed

- CLI refactored as thin adapter over `packages/core`
- Web UI implemented as thin adapter over `packages/core`
- Improved project structure with clear separation of concerns

### Developer Experience

- 100% test coverage for core package
- Isolation verification scripts to prevent dependency leakage
- ESLint configurations for core and web packages

## [1.1.3] - 2024

### Added

- Interactive onboarding flow for first-time users
- Command learning presenter for CLI education
- Accessibility improvements with proper ARIA support
- Theming system with design tokens

### Changed

- Modular architecture following SOLID principles
- Unified onboarding implementation with consistent API

### Security

- Hardened against insecure behavior patterns
- Security audit utilities

## [1.1.0] - 2024

### Added

- Memorable password type using dictionary words
- Clipboard integration with auto-copy option
- Security level recommendations based on entropy

### Changed

- Improved CLI with commander.js
- Better error messages and validation

## [1.0.x] - 2022-2024

### Initial Releases

- Strong password generation with configurable length and iterations
- Base64 password generation for API keys
- Cryptographically secure random generation using Node.js crypto
- CLI interface with customizable options
- NPM package publishing
