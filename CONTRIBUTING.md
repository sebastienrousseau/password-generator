# Contributing to JavaScript Password Generator

JavaScript Password Generator welcomes community contributions.

## Ways to Contribute

### 🐛 Report Bugs
Found a bug? [Create an issue](https://github.com/sebastienrousseau/jspassgen/issues/new/choose) with:
- Clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Environment details (Node.js version, OS)
- Code samples if applicable

### 💡 Suggest Features
[Open a feature request](https://github.com/sebastienrousseau/jspassgen/issues/new/choose) with:
- Clear description of the proposed feature
- Use cases and benefits
- Implementation considerations

### 📝 Improve Documentation
- Fix typos or unclear explanations
- Add examples for complex use cases
- Improve API documentation
- Update installation guides

### 🔧 Submit Code Changes

## Development Setup

### Prerequisites
- Node.js >= 18.0.0
- Git

### Setup Steps
```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/jspassgen.git
cd jspassgen

# 3. Install dependencies
npm install

# 4. Create a feature branch
git checkout -b feature/your-feature-name

# 5. Make your changes
# Edit files in src/ directory only (dist/ is auto-generated)

# 6. Test your changes
npm test
npm run lint

# 7. Build to verify everything works
npm run build
```

## Code Guidelines

### Style Requirements
- Follow existing code style (ESLint configuration provided)
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Write tests for new features

### Testing
- Write tests for new features
- Ensure existing tests pass
- Run `npm test` before submitting

### Security Considerations
- Use cryptographically secure randomness (`crypto` module)
- Validate all inputs
- Follow secure coding practices

## Pull Request Process

### Before Submitting
- [ ] Tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated (if applicable)
- [ ] CHANGELOG updated (if applicable)

### PR Requirements
1. **Clear title**: Describe what the PR does
2. **Detailed description**: Explain the changes and why they're needed
3. **Link related issues**: Reference any related GitHub issues
4. **Small, focused changes**: Keep PRs focused on a single concern

### Review Process
1. Automated checks run (tests, linting, security)
2. Code review by maintainers
3. Feedback incorporated
4. Final approval and merge

## Project Structure

```
jspassgen/
├── src/
│   ├── bin/              # CLI implementation
│   ├── lib/              # Core password generators
│   │   ├── base64-password.js
│   │   ├── memorable-password.js
│   │   └── strong-password.js
│   ├── dictionaries/     # Word lists for memorable passwords
│   └── utils/            # Utility functions
├── test/                 # Test files
├── docs/                 # Generated documentation
└── .github/              # GitHub templates
```

### File Naming
- Use kebab-case for files: `strong-password.js`
- Match test files to source: `strong-password.test.js`

## Community Guidelines

### Code of Conduct
Please read our [Code of Conduct](./.github/CODE-OF-CONDUCT.md). This project maintains a welcoming and inclusive environment.

### Communication
- Be respectful and constructive
- Ask questions if anything is unclear
- Help others when you can
- Stay focused on the issue at hand

## Recognition

Contributors are recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Project documentation

## Questions?

- 💬 [GitHub Discussions](https://github.com/sebastienrousseau/jspassgen/discussions) for questions
- 🐛 [GitHub Issues](https://github.com/sebastienrousseau/jspassgen/issues) for bugs
- 📧 Contact: hello@jspassgen.com

Thank you for contributing to making JavaScript Password Generator better!

---

**Designed by Sebastien Rousseau - Engineered with Euxis**
