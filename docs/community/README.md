# Community

Connect with the Password Generator community. Report issues, contribute code, and follow project guidelines.

## Quick Navigation

| Resource | Description |
|----------|-------------|
| [Code of Conduct](#code-of-conduct) | Community behavior guidelines |
| [Contributing](#contributing) | Contribute code and documentation |
| [Security Reporting](#security-reporting) | Report security vulnerabilities |
| [Get Help](#get-help) | Ask questions and get support |
| [Stay Updated](#stay-updated) | Follow releases and announcements |

---

## Code of Conduct

Password Generator maintains a welcoming and inclusive environment. All contributors and participants agree to follow the [Code of Conduct](../../.github/CODE-OF-CONDUCT.md).

### Standards

**Positive behaviors:**
- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what benefits the community
- Show empathy toward other community members

**Unacceptable behaviors:**
- Sexualized language or imagery
- Trolling, insults, or derogatory comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information

### Reporting

Report Code of Conduct violations to the project team. All complaints receive review and investigation, with responses appropriate to the circumstances.

---

## Contributing

Password Generator welcomes contributions from the community.

### Ways to Contribute

| Contribution | Description |
|--------------|-------------|
| Bug reports | Report issues with reproduction steps |
| Feature requests | Propose new functionality |
| Documentation | Fix typos, add examples, improve clarity |
| Code changes | Implement features, fix bugs, refactor |

### Development Setup

```bash
# Clone the repository
git clone https://github.com/sebastienrousseau/password-generator.git
cd password-generator

# Install dependencies
npm install

# Run tests
npm test

# Check code style
npm run lint

# Build distribution files
npm run build
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make changes and add tests
4. Verify tests pass: `npm test`
5. Verify linting passes: `npm run lint`
6. Commit with clear message
7. Push to your fork
8. Open a pull request

### Pull Request Checklist

- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG updated (if applicable)

See the [Contributing Guide](../../.github/CONTRIBUTING.md) for detailed instructions.

---

## Security Reporting

### Report a Vulnerability

Report security vulnerabilities through the [Security Policy](../../SECURITY.md).

**Do:**
- Report privately before public disclosure
- Include reproduction steps
- Provide system and version details
- Allow time for remediation

**Do not:**
- Disclose vulnerabilities publicly before fix
- Exploit vulnerabilities for gain
- Access others' data without permission

### Security Guidelines

Password Generator follows security best practices:

| Practice | Implementation |
|----------|----------------|
| Cryptographic randomness | Node.js `crypto` module and Web Crypto API |
| No plain-text storage | Recommend Argon2id for password hashing |
| Input validation | Validate all user inputs |
| Dependency security | Regular security audits |

See [SECURITY.md](../SECURITY.md) for detailed security documentation.

---

## Get Help

### GitHub Discussions

Ask questions and share ideas on [GitHub Discussions](https://github.com/sebastienrousseau/password-generator/discussions).

**Discussion categories:**
- **Q&A** - Ask questions and get answers
- **Ideas** - Propose new features
- **Show and Tell** - Share projects using Password Generator
- **General** - General discussion

### GitHub Issues

Report bugs on [GitHub Issues](https://github.com/sebastienrousseau/password-generator/issues).

**Issue requirements:**
- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS)
- Code samples (if applicable)

### Documentation

| Resource | Description |
|----------|-------------|
| [Getting Started](../essentials/README.md) | Installation and first steps |
| [Guides](../guides/README.md) | How-to guides and tutorials |
| [API Reference](../API.md) | Complete API documentation |
| [Architecture](../ARCHITECTURE.md) | System design patterns |

---

## Stay Updated

### GitHub Releases

Follow [GitHub Releases](https://github.com/sebastienrousseau/password-generator/releases) for version updates and release notes.

### Changelog

Review the [CHANGELOG.md](../../CHANGELOG.md) for detailed version history.

### Watch the Repository

Click **Watch** on the GitHub repository to receive notifications for:
- New releases
- Issues and discussions
- Pull requests

---

## Recognition

Contributors receive recognition in:

| Location | Recognition |
|----------|-------------|
| GitHub contributors | Automatic listing |
| Release notes | Significant contributions |
| Project documentation | Notable contributions |

---

## Contact

| Channel | Purpose |
|---------|---------|
| [GitHub Issues](https://github.com/sebastienrousseau/password-generator/issues) | Bug reports |
| [GitHub Discussions](https://github.com/sebastienrousseau/password-generator/discussions) | Questions and ideas |
| Email: hello@password-generator.pro | Direct contact |

---

[Back to Documentation Index](../INDEX.md)
