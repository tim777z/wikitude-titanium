# Wikitude AR SDK Module for Appcelerator Titanium

[![CI](https://github.com/tim777z/wikitude-titanium/actions/workflows/ci.yml/badge.svg)](https://github.com/tim777z/wikitude-titanium/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

The first Titanium Module providing Image Recognition and Geo-based Augmented Reality. The provided sample projects for Android and iOS demonstrate the most common use cases.

## Table of Contents

- [Documentation & Samples](#documentation--samples)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Building](#building)
- [Project Structure](#project-structure)
- [Security Considerations](#security-considerations)
- [Development](#development)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Contributing](#contributing)
- [License](#license)

## Documentation & Samples

- **Wikitude Developer Portal**: [Documentation & Samples](http://developer.wikitude.com/documentation/appcelerator)
- **Module Downloads**: [Wikitude Website](http://www.wikitude.com/download) or [Appcelerator Marketplace](https://marketplace.appcelerator.com/apps/6755#!overview)
- **Note**: Downloading the Modules via GitHub is no longer supported.

> **Hardware Requirements**: This plugin has hard and software requirements for Android and iOS devices and does not run on a desktop browser.

## Architecture Overview

```
wikitude-titanium/
├── .github/workflows/          # CI/CD pipelines
├── WikitudeTitaniumSample/     # Titanium sample application
│   ├── Resources/
│   │   ├── ui/windows/         # Shared UI components (CommonJS modules)
│   │   │   ├── ARchitectWindow.js      # Main AR view controller
│   │   │   ├── LaunchViaUrlWindow.js   # URL-based launch handler
│   │   │   ├── LocationUpdater.js      # GPS location management
│   │   │   ├── MainWindow.js           # App entry point & sample selector
│   │   │   ├── ModelStorage.js         # Data persistence layer
│   │   │   └── SamplesListWindow.js    # Sample selection UI
│   │   ├── android/assets/     # Android-specific ARchitect worlds
│   │   │   └── [sample_name]/
│   │   │       ├── index.html  # ARchitect world entry point
│   │   │       ├── js/         # World logic (World, Marker, Radar)
│   │   │       ├── css/        # Styling
│   │   │       ├── assets/     # Images, WTC/Wt3 target files
│   │   │       └── jquery/     # jQuery Mobile (vendored)
│   │   └── iphone/             # iOS-specific ARchitect worlds (mirrored structure)
│   ├── tiapp.xml               # Titanium app configuration
│   └── build/                  # Build output (gitignored)
├── .eslintrc.json              # ESLint configuration
├── .eslintignore               # ESLint ignore patterns
├── .env.example                # Environment variable template
├── .nvmrc                      # Node.js version pinning
├── package.json                # Tooling dependencies (lint, test)
├── docker-compose.yml          # Development container (reference)
└── README.md                   # This file
```

### Key Components

| Component | Purpose |
|-----------|---------|
| `ARchitectWindow.js` | Native bridge to Wikitude SDK; manages AR view lifecycle, permissions, and JavaScript bridge |
| `World` (in each sample) | AR experience controller; handles POI loading, marker management, radar, range filtering |
| `Marker` | AR.GeoObject wrapper with animations, selection state, and radar representation |
| `PoiRadar` | Radar UI component showing relative POI positions |
| `ModelStorage` | Persistent storage for user preferences and cached data |

### Data Flow

1. **App Launch** → `MainWindow.js` initializes sample list
2. **Sample Selected** → `ARchitectWindow` created with license key & world URL
3. **AR View Ready** → `World` object initialized in ARchitect world (`index.html`)
4. **Location Updates** → Native `LocationUpdater` → `ARchitectWindow` → `World.locationChanged()`
5. **POI Request** → `World.requestDataFromServer()` → JSONP/XHR → `World.loadPoisFromJsonData()`
6. **User Interaction** → Marker click → `World.onMarkerSelected()` → Detail panel

## Prerequisites

- **Titanium SDK** 5.5.0.GA or later (configured in `tiapp.xml`)
- **Appcelerator CLI** (`npm install -g appcelerator`)
- **Node.js** >= 18.0.0 (see `.nvmrc`)
- **Wikitude SDK Modules** for iOS and Android (downloaded separately)
- **Xcode** (for iOS builds)
- **Android SDK** (for Android builds)

## Installation

```bash
# Clone the repository
git clone https://github.com/tim777z/wikitude-titanium.git
cd wikitude-titanium

# Install development tooling (for linting, testing)
npm ci

# Install Wikitude modules (manual step - download from Wikitude portal)
# Place modules in:
#   - WikitudeTitaniumSample/modules/iphone/com.wikitude.ti
#   - WikitudeTitaniumSample/modules/android/com.wikitude.ti

# Configure environment
cp .env.example .env
# Edit .env with your Wikitude license key and server settings
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `WIKITUDE_LICENSE_KEY` | Your Wikitude SDK license key | **Yes** |
| `POI_DATA_SERVER_URL` | POI data service endpoint | No (uses demo) |
| `APP_ID` | Application bundle identifier | No |
| `LOG_LEVEL` | Logging verbosity (debug, info, warn, error) | No |

### Platform Configuration

**iOS** (`tiapp.xml`):
- Minimum iOS version: 8.0
- Camera, Location, Photo Library usage descriptions (required by App Store)

**Android** (`tiapp.xml`):
- Install location: auto
- Supports all screen densities
- Wikitude BrowserActivity and MediaPlayerActivity declared

## Building

```bash
# Using Titanium CLI
cd WikitudeTitaniumSample

# Build for iOS
titanium build -p ios -T device --device-id <UDID>

# Build for Android
titanium build -p android -T device

# Build for emulator/simulator
titanium build -p ios -T simulator
titanium build -p android -T emulator
```

## Project Structure Details

### Shared UI Layer (`Resources/ui/windows/`)

CommonJS modules shared across platforms:

- **ARchitectWindow.js** - Core AR view controller with:
  - Platform-specific window creation
  - Device capability detection
  - Runtime permission handling (camera, location)
  - ARchitect world loading & JavaScript bridge
  - Lifecycle management (open/close/resume/pause/destroy)

- **LocationUpdater.js** - GPS location provider with:
  - Configurable accuracy/distance filter
  - Background/foreground handling
  - Error recovery

### ARchitect Worlds (`Resources/android/assets/`, `Resources/iphone/`)

Each sample is a self-contained AR experience with:
- `index.html` - Loads Wikitude SDK, jQuery Mobile, and world JS
- `js/*.js` - World logic (`World`, `Marker`, `PoiRadar`, sample-specific)
- `assets/` - Images, target collections (.wtc, .wt3)
- `css/` - jQuery Mobile theme customizations
- `jquery/` - Vendored jQuery 1.9.1 + jQuery Mobile 1.3.2

> **Note**: Android and iOS worlds are currently duplicated. See [Deduplication Roadmap](#deduplication-roadmap).

## Security Considerations

### Threat Model

| Asset | Threat | Mitigation |
|-------|--------|------------|
| Wikitude License Key | Exposure in source control | **Never commit** - use `.env` (gitignored) |
| User Location (GPS) | Unauthorized access | Runtime permissions; purpose strings in `tiapp.xml` |
| Camera Access | Unauthorized access | Runtime permissions; purpose strings in `tiapp.xml` |
| POI Data Server | MITM, injection | HTTPS enforced; input validation on params |
| JavaScript Bridge | XSS via `architectsdk://` URLs | URL scheme validation in `onURLWasInvoked` |
| Third-party JS (jQuery) | Supply chain | Vendored, pinned versions; audit regularly |

### Secure Coding Practices Applied

1. **Input Validation**: All external inputs (URLs, coordinates, server responses) validated before use
2. **No `eval()`/`Function()`**: Dynamic code execution prohibited (ESLint `no-eval`, `no-implied-eval`)
3. **No `alert()` in Production**: Replaced with structured logging (see `ARchitectWindow.js`)
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

## Development

### Tooling Setup

```bash
# Install dependencies
npm ci

# Run linter
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Run tests
npm test

# Security audit
npm run security:audit
```

### Code Style

- **ESLint** with security plugin (`.eslintrc.json`)
- **Strict mode** enforced globally
- **No `var`** - use `const`/`let`
- **No `alert()`** - use `console.log`/`warn`/`error` or custom logger
- **JSDoc** for public APIs
- **Conventional Commits** for git history

### Adding a New Sample

1. Create directory under `Resources/android/assets/` and `Resources/iphone/`
2. Add `index.html`, `js/`, `css/`, `assets/`
3. Register in `MainWindow.js` sample list
4. Update both platforms (see deduplication roadmap)

## Deduplication Roadmap

Currently Android and iOS ARchitect worlds are duplicated. Planned improvements:

1. **Shared JS Core** → `Resources/common/js/` for `World`, `Marker`, `PoiRadar`, `ServerInformation`
2. **Platform-specific Overrides** → Only `index.html` and platform-specific assets differ
3. **Build-time Copy** → Script to sync shared → platform directories

## Testing

```bash
# Run all tests with coverage
npm test

# Watch mode for development
npm run test:watch
```

### Test Strategy

| Layer | Tool | Coverage Target |
|-------|------|-----------------|
| Unit (JS logic) | Jest | 50% branches/functions/lines |
| Integration (Titanium) | Manual/Device | Critical paths |
| Security | `npm audit`, ESLint security | Zero high/critical |

> **Note**: Titanium-specific APIs (`Ti`, `AR`, `Titanium`) are mocked in Jest tests.

## Code Quality

### Linting

```bash
npm run lint        # Check
npm run lint:fix    # Auto-fix
```

Rules include:
- Security: `no-eval`, `detect-eval-with-expression`, `detect-non-literal-regexp`
- Best Practices: `curly`, `eqeqeq`, `no-unused-vars`, `prefer-const`
- Style: `object-shorthand`, `prefer-template`, `radix`

### CI Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs:
1. **Checkout** & **Node Setup** (cached)
2. **Install** (`npm ci`)
3. **Lint** (`npm run lint`)
4. **Test** (`npm test`)
5. **Security Audit** (`npm run security:audit`)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Make changes with tests
4. Run quality checks: `npm run lint && npm test && npm run security:audit`
5. Commit with conventional messages (`feat:`, `fix:`, `docs:`, `chore:`)
6. Push and open a Pull Request

### Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `security`

## License

```
Copyright 2012-2013 Wikitude GmbH, http://www.wikitude.com

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

---

**Maintained by**: Wikitude GmbH • **Issues**: [GitHub Issues](https://github.com/tim777z/wikitude-titanium/issues)