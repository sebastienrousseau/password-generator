<!-- SPDX-License-Identifier: Apache-2.0 OR MIT -->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.11] - 2026-09-09

### Added

- **Quantum-Resistant Password Generation**: New password type (`-t quantum-resistant`) with enhanced entropy using quantum-safe algorithms following NIST Post-Quantum Cryptography standards.
- **KDF Configuration Options**: Configurable Argon2id key derivation parameters via CLI (`--kdf-memory`, `--kdf-time`, `--kdf-parallelism`) and programmatic API.
- **NIST SP 800-132 Compliance**: Key derivation using Argon2id with recommended parameters (64MB memory, 3 iterations, 4 threads).
- **Enhanced Character Sets**: Expanded symbol alphabet (94 printable ASCII characters) for quantum-resistant mode.
- **Minimum Entropy Threshold**: 256-bit entropy guarantee for quantum-resistant passwords.

### Security

- **Post-Quantum Ready**: Passwords resist both classical and quantum computing attacks.
- **Configurable KDF Parameters**: Enterprise-grade security with adjustable memory, time, and parallelism settings.
- **Enhanced Entropy Calculation**: Real-time entropy validation for quantum-resistant generation.

### Documentation

- Added comprehensive Quantum-Resistant Mode section to README.
- Added Key Derivation Functions (KDF) documentation with NIST SP 800-132 guidance.
- Added command-line and programmatic examples for quantum-resistant password generation.
- Updated password types table with quantum-resistant entry.

## [0.0.10] - 2026-02-07

### Added

- **Hexagonal Architecture**: Platform-agnostic core package (`@password-generator/core`) with zero dependencies.
- **Web UI Demo**: Browser-based password generator using the same core as CLI.
- **Port/Adapter Pattern**: Injectable ports for crypto, storage, logging, and dictionary.
- **Cross-Platform Parity Tests**: Ensure CLI and Web UI produce identical results.
- **Benchmarks**: Performance benchmarks for password generation and entropy calculation.

### Changed

- CLI refactored as thin adapter over `packages/core`.
- Web UI implemented as thin adapter over `packages/core`.
- Improved project structure with clear separation of concerns.

### Developer Experience

- 100% test coverage for core package.
- Isolation verification scripts to prevent dependency leakage.
- ESLint configurations for core and web packages.

## [0.0.9] - 2023-11-08

### Added

- Interactive onboarding flow for first-time users.
- Command learning presenter for CLI education.
- Accessibility improvements with proper ARIA support.
- Theming system with design tokens.

### Changed

- Modular architecture following SOLID principles.
- Unified onboarding implementation with consistent API.

### Security

- Hardened against insecure behavior patterns.
- Security audit utilities.

## [0.0.8] - 2023-09-09

### Added

- Enhanced code quality and security of base64 and memorable password generators.
- Expanded test coverage for string converters and array helpers.
- Auto-install-peers dependency configuration.

## [0.0.7] - 2022-09-30

### Changed

- Migrated CI package manager to pnpm.
- Workflow updates for Node.js matrix testing.

## [0.0.6] - 2022-04-26

### Fixed

- Resolved memorable password failure when loading dictionary data entries.

## [0.0.5] - 2022-04-26

### Fixed

- Resolved code scanning alert for missing newline at end of files.

## [0.0.4] - 2022-04-26

### Added

- Currency formatting helper utility (`toCurrency`).
- Unit tests for kebab-case transformation.

### Changed

- Reduced cyclomatic complexity across utility functions.

## [0.0.3] - 2022-04-26

### Added

- Integrated c8 for code coverage reporting.

### Changed

- Remark linting and Codacy style optimizations across documentation.

## [0.0.2] - 2022-04-20

### Added

- Random consonant, vowel, and syllable generators for phonetic passwords.
- String case converter functions (`toSnakeCase`, `toCamelCase`, `toTitleCase`).
- ECMAScript 6 refactoring with Babel support.

## [0.0.1] - 2022-04-10

### Added

- Initial release of `@sebastienrousseau/password-generator`.
- Strong, memorable, and base64 password generation.
- CLI with configurable length, iteration count, and separators.
