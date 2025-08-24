# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v1.0.12] - 2025-08-24

### Changed
- Version bump to v1.0.12

### Added
- [Add new features here]

### Fixed
- [Add bug fixes here]

### Security
- [Add security updates here]

## [v1.0.11] - 2025-08-23

### Changed
- Version bump to v1.0.11

### Added
- [Add new features here]

### Fixed
- [Add bug fixes here]

### Security
- [Add security updates here]

## [v1.0.10] - 2025-08-23

### Changed
- Version bump to v1.0.10

### Added
- [Add new features here]

### Fixed
- [Add bug fixes here]

### Security
- [Add security updates here]

## [v1.0.9] - 2025-08-23

### Changed
- Version bump to v1.0.9

### Added
- [Add new features here]

### Fixed
- [Add bug fixes here]

### Security
- [Add security updates here]

## [v1.0.8] - 2025-08-23

### Changed
- Version bump to v1.0.8

### Added
- [Add new features here]

### Fixed
- [Add bug fixes here]

### Security
- [Add security updates here]

## [v1.0.7] - 2025-08-22

### Changed
- Version bump to v1.0.7

### Added
- [Add new features here]

### Fixed
- [Add bug fixes here]

### Security
- [Add security updates here]

## [v1.0.6] - 2025-08-22

### Changed
- Version bump to v1.0.6

### Added
- [Add new features here]

### Fixed
- [Add bug fixes here]

### Security
- [Add security updates here]

## [v1.0.5] - 2025-08-22

### Changed
- Version bump to v1.0.5

### Added
- [Add new features here]

### Fixed
- [Add bug fixes here]

### Security
- [Add security updates here]

## [v1.0.4] - 2025-08-22

### Changed
- Version bump to v1.0.4

### Added
- [Add new features here]

### Fixed
- [Add bug fixes here]

### Security
- [Add security updates here]

## [v1.0.3] - 2025-08-22

### Changed
- Version bump to v1.0.3

### Added
- [Add new features here]

### Fixed
- [Add bug fixes here]

### Security
- [Add security updates here]

## [v1.0.2] - 2025-08-22

### Changed
- Version bump to v1.0.2

### Added
- [Add new features here]

### Fixed
- [Add bug fixes here]

### Security
- [Add security updates here]

### Added
- GitHub Actions workflows for automated publishing and releases
- Comprehensive CI/CD pipeline with multi-node testing
- Automated changelog generation

### Changed
- Improved error handling in postinstall script
- Better hook detection for backward compatibility

### Fixed
- Installation failures due to hook configuration conflicts
- Array access errors in Claude Code settings manipulation

## [1.0.1] - 2024-01-XX

### Fixed
- Installation failures when existing hooks are present
- "Cannot read properties of undefined (reading 'push')" error
- Postinstall script now handles errors gracefully
- Better detection of existing claude-code-notifications hooks

### Changed
- Improved hook detection patterns for backward compatibility
- Enhanced error messages for troubleshooting

## [1.0.0] - 2024-01-XX

### Added
- Initial release of claude-code-companion
- CLI tool for iPhone push notifications with Claude Code
- Zero-configuration setup with automatic hook installation
- Device pairing with 6-digit codes
- Smart risk assessment (high/medium/low)
- Professional CLI interface with Commander.js
- Comprehensive error handling and retry logic
- Cross-platform support (macOS, Linux, Windows)
- Real-time polling for user responses
- Environment variable configuration
- Auto-discovery of Claude Code settings

### Features
- `cccompanion setup` - Auto-configure Claude Code integration
- `cccompanion pair <code>` - Pair with iPhone using 6-digit code
- `cccompanion status` - Check connection and pairing status
- `cccompanion config` - Show current configuration

### Security
- Device-only authentication (no user accounts required)
- No embedded secrets or API keys
- Safe default behavior (denies operations on errors)
- Input validation and sanitization

### Documentation
- Comprehensive README with examples
- Troubleshooting guide
- Architecture documentation
- Development guidelines

---

## Release Types

- **Major** (X.0.0): Breaking changes, major new features
- **Minor** (1.X.0): New features, backwards compatible
- **Patch** (1.0.X): Bug fixes, small improvements

## Links

- [NPM Package](https://www.npmjs.com/package/claude-code-companion)
- [GitHub Repository](https://github.com/your-org/claude-code-companion)
- [Issues](https://github.com/your-org/claude-code-companion/issues)