# Contributing to Wikitude Titanium

Thank you for your interest in contributing to the Wikitude AR SDK Module for Appcelerator Titanium! This document provides guidelines for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style & Standards](#code-style--standards)
- [Testing Requirements](#testing-requirements)
- [Security Considerations](#security-considerations)
- [Pull Request Process](#pull-request-process)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0 (see `.nvmrc` for exact version)
- **npm** (comes with Node.js)
- **Titanium SDK** 5.5.0.GA or later
- **Appcelerator CLI** (`npm install -g appcelerator`)
- **Wikitude SDK Modules** for iOS and Android (downloaded separately from Wikitude portal)

### Initial Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/wikitude-titanium.git
cd wikitude-titanium

# Install development dependencies
npm ci

# Install git hooks
npm run prepare

# Configure environment
cp .env.example .env
# Edit .env with your Wikitude license key and server settings
```

### Installing Wikitude Modules

Download the Wikitude SDK modules from the [Wikitude Developer Portal](https://www.wikitude.com/download/) and place them in:

```
WikitudeTitaniumSample/modules/iphone/com.wikitude.ti
WikitudeTitaniumSample/modules/android/com.wikitude.ti
```

## Development Workflow

### Branch Naming

Use descriptive branch names following this pattern:

- `feat/<short-description>` - New features
- `fix/<short-description>` - Bug fixes
- `docs/<short-description>` - Documentation updates
- `refactor/<short-description>` - Code refactoring
- `test/<short-description>` - Test additions/improvements
- `security/<short-description>` - Security improvements
- `chore/<short-description>` - Maintenance tasks

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting, missing semicolons, etc.
- `refactor` - Code restructuring
- `test` - Adding/updating tests
- `chore` - Maintenance, build changes
- `security` - Security improvements

Examples:
```
feat(validator): add coordinate bounds checking
fix(architect-window): handle null location object
docs(readme): update installation instructions
security(ci): add secret scanning with TruffleHog
```

### Pre-commit Checks

Before committing, run:

```bash
# Lint and auto-fix
npm run lint:fix

# Run tests with coverage
npm test

# Security audit
npm run security:audit
```

The pre-commit hook (via Husky) will run linting automatically.

## Code Style & Standards

### JavaScript/ES5 (Titanium Runtime)

The Titanium runtime uses ES5. Follow these conventions:

- **Strict mode** - Always use `'use strict';` at file top
- **No `var`** - Use `const`/`let` (transpiled for ES5 target)
- **CommonJS modules** - Use `require()` and `module.exports`
- **JSDoc** - Document all public APIs with JSDoc comments
- **No `alert()`** - Use `Logger` utility or `console.log/warn/error`
- **No `eval()`/`Function()`** - Dynamic code execution prohibited
- **Input validation** - Validate all external inputs (URLs, coordinates, server responses)

### ESLint Configuration

The project uses ESLint with security plugin. Key rules:

- `security/detect-eval-with-expression`: error
- `security/detect-non-literal-regexp`: warn
- `no-eval`: error
- `no-implied-eval`: error
- `no-new-func`: error
- `no-script-url`: error
- `strict`: error (global)
- `no-var`: error
- `prefer-const`: error

Run linting:
```bash
npm run lint        # Check
npm run lint:fix    # Auto-fix
```

### File Organization

```
WikitudeTitaniumSample/Resources/
├── ui/windows/           # Shared UI components (CommonJS)
│   ├── ARchitectWindow.js    # Main AR view controller
│   ├── LaunchViaUrlWindow.js # URL-based launch handler
│   ├── LocationUpdater.js    # GPS location management
│   ├── MainWindow.js         # App entry point & sample selector
│   ├── ModelStorage.js       # Data persistence layer
│   └── SamplesListWindow.js  # Sample selection UI
├── android/assets/       # Android-specific ARchitect worlds
└── iphone/               # iOS-specific ARchitect worlds (mirrored)
```

### Deduplication Roadmap

Currently Android and iOS ARchitect worlds are duplicated. When adding samples:

1. **Shared JS Core** → Add to `Resources/common/js/` for `World`, `Marker`, `PoiRadar`, `ServerInformation`
2. **Platform-specific Overrides** → Only `index.html` and platform-specific assets differ
3. **Build-time Copy** → Script to sync shared → platform directories (future)

## Testing Requirements

### Test Strategy

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit (JS logic) | Jest | 50% branches/functions/lines |
| Integration (Titanium) | Manual/Device | Critical paths |
| Security | `npm audit`, ESLint security | Zero high/critical |

### Writing Tests

- Place tests in `__tests__/` directory with `.test.js` suffix
- Mock Titanium APIs (`Ti`, `Titanium`, `AR`) in test setup
- Test both positive and negative cases
- Focus on security-critical functions (validation, sanitization)
- Use descriptive test names: `should reject invalid license keys`

### Running Tests

```bash
# Run all tests with coverage
npm test

# Watch mode for development
npm run test:watch

# Run specific test file
npx jest __tests__/validator.test.js
```

### Coverage Thresholds

Current thresholds (enforced in CI):
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

New code should maintain or improve these thresholds.

## Security Considerations

### Threat Model

| Asset | Threat | Mitigation |
|-------|--------|------------|
| Wikitude License Key | Exposure in source control | Never commit - use `.env` (gitignored) |
| User Location (GPS) | Unauthorized access | Runtime permissions; purpose strings in `tiapp.xml` |
| Camera Access | Unauthorized access | Runtime permissions; purpose strings in `tiapp.xml` |
| POI Data Server | MITM, injection | HTTPS enforced; input validation on params |
| JavaScript Bridge | XSS via `architectsdk://` URLs | URL scheme validation in `onURLWasInvoked` |
| Third-party JS (jQuery) | Supply chain | Vendored, pinned versions; audit regularly |

### Secure Coding Practices

1. **Input Validation**: All external inputs validated before use
2. **No `eval()`/`Function()`**: Dynamic code execution prohibited
3. **No `alert()` in Production**: Replaced with structured logging
4. **Content Security**: `architectsdk://` URL scheme allowlisted actions only
5. **Permission Least Privilege**: Camera/Location requested only when AR view opens
6. **Dependency Hygiene**: `npm audit` in CI; vendored libs pinned

### Security Checklist for Contributors

- [ ] No secrets in source code (license keys, API tokens)
- [ ] All user inputs validated/sanitized
- [ ] HTTPS used for all network requests
- [ ] Error messages don't leak sensitive data
- [ ] Permissions requested with clear purpose strings
- [ ] Third-party dependencies audited (`npm audit`)

### Reporting Security Issues

Report security vulnerabilities privately to the maintainers via GitHub Security Advisories or email. Do not open public issues for security problems.

## Pull Request Process

### Before Submitting

1. **Run all checks locally**:
   ```bash
   npm run lint && npm test && npm run security:audit
   ```

2. **Update documentation** if you changed user-facing behavior

3. **Add tests** for new functionality

4. **Update CHANGELOG.md** with your changes (under "Unreleased" section)

### PR Requirements

- [ ] All CI checks pass (lint, test, security audit, secret scan)
- [ ] Code follows project style guidelines
- [ ] Tests added/updated for changes
- [ ] Documentation updated if needed
- [ ] CHANGELOG.md updated
- [ ] No merge conflicts with base branch
- [ ] Descriptive PR title and description

### Review Process

1. Automated checks run on all PRs
2. At least one maintainer review required
3. Security-focused review for changes to validation/auth code
4. Address all review comments before merge

### Merge Strategy

- Squash and merge for feature branches
- Rebase and merge for small fixes
- Maintain linear history on main branch

## Release Process

Releases are managed by maintainers:

1. Update version in `package.json` and `WikitudeTitaniumSample/tiapp.xml`
2. Update `CHANGELOG.md` with release notes
3. Create git tag: `git tag v<version>`
4. Push tag: `git push origin v<version>`
5. GitHub Actions builds and publishes release artifacts

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/tim777z/wikitude-titanium/issues)
- **Documentation**: [Wikitude Developer Portal](http://developer.wikitude.com/documentation/appcelerator)
- **Discussions**: [GitHub Discussions](https://github.com/tim777z/wikitude-titanium/discussions)

## License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0 (same as the project).