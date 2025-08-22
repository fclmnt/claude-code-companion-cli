# Claude Code Companion Release Template

Use this template when creating manual releases or reviewing automated releases.

## Pre-Release Checklist

- [ ] All tests pass (`npm test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Version number follows [Semantic Versioning](https://semver.org/)
- [ ] CHANGELOG.md is updated with new changes
- [ ] README.md is accurate for new version
- [ ] No breaking changes without major version bump
- [ ] Security audit passes (`npm audit`)

## Release Notes Template

```markdown
## Claude Code Companion vX.Y.Z

### 🚀 New Features
- Feature description

### 🐛 Bug Fixes  
- Bug fix description

### 🔧 Improvements
- Improvement description

### ⚠️ Breaking Changes (Major releases only)
- Breaking change description
- Migration instructions

### 📦 Installation

```bash
npm install -g claude-code-companion@X.Y.Z
```

### 🔗 Links
- [NPM Package](https://www.npmjs.com/package/claude-code-companion)
- [Documentation](https://github.com/your-org/claude-code-companion#readme)
- [Full Changelog](https://github.com/your-org/claude-code-companion/compare/vX.Y.Z-1...vX.Y.Z)
```

## Post-Release Checklist

- [ ] GitHub release created successfully
- [ ] NPM package published
- [ ] Version tag created
- [ ] CHANGELOG.md updated
- [ ] No immediate bug reports
- [ ] Documentation links work correctly

## Rollback Procedure

If issues are discovered after release:

1. **Immediate**: Deprecate problematic version on NPM
   ```bash
   npm deprecate claude-code-companion@X.Y.Z "Issue found, use vX.Y.Z-1 instead"
   ```

2. **Quick Fix**: Create patch release (X.Y.Z+1)
   - Fix the issue
   - Increment patch version
   - Release immediately

3. **Major Issue**: Unpublish if within 24 hours
   ```bash
   npm unpublish claude-code-companion@X.Y.Z
   ```

## Version Strategy

- **Patch** (1.0.X): Bug fixes, dependency updates, minor improvements
- **Minor** (1.X.0): New features, CLI enhancements, new commands
- **Major** (X.0.0): Breaking changes, CLI interface changes, major architecture changes

## Automated vs Manual Releases

### Automated (Recommended)
- Triggered by version changes in package.json
- Full testing on multiple Node versions
- Automatic changelog generation
- Consistent release process

### Manual (Special Cases)
- Emergency fixes
- Custom release notes needed
- Pre-releases/beta versions
- When automated process fails