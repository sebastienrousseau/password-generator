# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
