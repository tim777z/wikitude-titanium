# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions CI workflow with lint, test, security audit, and secret scanning
- Dependabot configuration for automated dependency updates
- TruffleHog secret scanning in CI pipeline
- CONTRIBUTING.md with development guidelines
- Dockerfile for containerized development environment
- Enhanced input validation in ARchitectWindow.js
- Structured error handling with error codes
- Additional unit tests for LocationUpdater and ModelStorage modules

### Changed
- Enabled titanium-validate job in CI (conditional on macOS runner)
- Improved ESLint configuration with stricter rules
- Updated CI to run on schedule (weekly) for dependency monitoring
- Enhanced secret detection in pre-commit and CI

### Fixed
- CI workflow now properly enforces lint and test gates
- Removed overly broad ESLint ignores for source files
- Added coordinate validation for altitude in location listener

### Security
- Added secret scanning with TruffleHog in CI
- Strengthened architectsdk:// URL action allowlisting
- Improved input sanitization for JavaScript bridge calls
- Added license compliance checking in CI

## [5.3.1] - 2024-09-27

### Added
- Initial CI/CD pipeline with GitHub Actions
- ESLint configuration with security plugin
- Jest test framework with coverage thresholds
- Husky pre-commit hooks
- .env.example with 19 configuration variables
- Comprehensive README with architecture documentation
- Security considerations section in README

### Changed
- Updated to Node.js 18+ requirement
- Modernized package.json with current dev dependencies
- Improved project structure documentation

### Security
- Added npm audit to CI pipeline
- Configured ESLint security rules (no-eval, detect-eval-with-expression, etc.)
- Added .env to .gitignore
- Vendored jQuery/jQuery Mobile pinned to specific versions

## [5.3.0] - 2023-XX-XX

### Added
- Wikitude AR SDK Module for Appcelerator Titanium
- Sample applications for Android and iOS
- ARchitectWindow - Main AR view controller
- LocationUpdater - GPS location management
- ModelStorage - Data persistence layer
- Multiple AR samples (Image Recognition, Geo POIs, 3D Models, Video, Hardware Control)

### Features
- Image Recognition (Client & Cloud)
- 3D Model rendering on targets
- Geo-based Points of Interest
- Video playback in AR
- Hardware control (camera switching, front camera)
- Radar UI component
- Screen capture functionality

---

## Release Notes Template

When releasing a new version, use this template:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security improvements
```