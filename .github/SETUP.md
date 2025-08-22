# GitHub Actions Setup Guide

This guide explains how to configure the automated release and publishing workflows for claude-code-companion.

## Prerequisites

1. **NPM Account**: You need an NPM account with publish permissions
2. **GitHub Repository**: Repository with admin access
3. **Secrets Configuration**: Required secrets in GitHub repository settings

## Required Secrets

Navigate to your GitHub repository → Settings → Secrets and variables → Actions

### NPM_TOKEN
1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Click your profile → Access Tokens → Generate New Token
3. Choose "Automation" token type
4. Copy the token and add it as `NPM_TOKEN` secret in GitHub

### GITHUB_TOKEN
- This is automatically provided by GitHub Actions
- No manual setup required

## Workflow Overview

### 1. Continuous Integration (ci.yml)
**Triggers**: Pull requests, pushes to main
- Runs tests on Node.js 16, 18, 20
- Runs linting and security audits
- Validates package can be built

### 2. Automatic Release (release.yml)
**Triggers**: Version changes in package.json, manual dispatch
- Detects version changes in package.json
- Runs full test suite
- Publishes to NPM
- Creates GitHub release with auto-generated changelog
- Uploads package artifacts

### 3. Manual Release (manual-release.yml)  
**Triggers**: Manual workflow dispatch
- Allows custom version and release notes
- Full validation and testing
- Publishes to NPM and GitHub
- Supports pre-releases

## Release Process Options

### Option 1: Automated (Recommended)
```bash
# 1. Prepare release locally
npm run release:check          # Check if ready
npm run release:patch          # Prepare patch release
# or npm run release:minor
# or npm run release:major

# 2. Review and edit CHANGELOG.md

# 3. Commit and push (triggers automatic release)
git add .
git commit -m "chore: prepare release v1.0.2"
git push origin main
```

### Option 2: Manual via GitHub UI
1. Go to repository → Actions tab
2. Select "Manual Release" workflow  
3. Click "Run workflow"
4. Enter version and optional release notes
5. Click "Run workflow"

### Option 3: CLI Version Bump
```bash
# Bump version and push (triggers automatic release)
npm version patch              # or minor/major
git push origin main
git push origin --tags
```

## Workflow Features

### ✅ Automated Testing
- Multi-version Node.js testing (16, 18, 20)
- Linting with ESLint
- Security vulnerability scanning
- Package build verification

### ✅ Smart Release Detection
- Only releases when package.json version changes
- Skips releases for documentation-only changes
- Validates semantic versioning format

### ✅ Comprehensive Publishing
- NPM package publishing
- GitHub release creation
- Automatic changelog generation
- Package artifact uploads

### ✅ Error Handling
- Backup and rollback capabilities
- Graceful failure modes
- Detailed error reporting

## Customization

### Modify Release Notes
Edit `.github/workflows/release.yml` line ~95 to customize changelog generation:

```yaml
git log --oneline --pretty=format:"- %s (%h)" ${PREVIOUS_VERSION}..HEAD >> changelog.md
```

### Change Node.js Versions
Edit the matrix in workflow files:

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]  # Add or remove versions
```

### Add Additional Checks
Add steps to the `test` job in workflows:

```yaml
- name: Custom Check
  run: npm run your-custom-check
```

## Troubleshooting

### NPM Publish Fails
- Check NPM_TOKEN is valid and has publish permissions
- Verify package name is available on NPM
- Check for version conflicts

### GitHub Release Fails  
- Ensure GITHUB_TOKEN has necessary permissions
- Check if tag already exists
- Verify changelog.md format

### Version Detection Issues
- Ensure package.json version follows semantic versioning
- Check that version actually changed in commit
- Verify git history is clean

### Workflow Not Triggering
- Check workflow file syntax with [GitHub Actions Validator](https://rhymond.github.io/validate-github-actions/)
- Verify push includes changed files in trigger paths
- Check repository permissions and secrets

## Security Considerations

### Token Permissions
- NPM_TOKEN: Minimal scope, automation tokens only
- Use environment protection for production deployments
- Regularly rotate tokens

### Workflow Security
- All workflows run in isolated environments
- No secrets are logged or exposed
- Package contents are validated before publishing

### Branch Protection
Consider enabling branch protection rules:
- Require PR reviews before merging to main
- Require status checks to pass
- Restrict force pushes

## Monitoring

### Release Success
- Check Actions tab for workflow status
- Verify NPM package published: `npm view claude-code-companion`
- Confirm GitHub release created

### Email Notifications
- GitHub sends emails for failed workflows
- Configure notification preferences in GitHub settings
- Monitor NPM package download statistics

## Manual Rollback

If a problematic version is published:

```bash
# Deprecate version (recommended)
npm deprecate claude-code-companion@1.0.2 "Known issue, use 1.0.1"

# Unpublish (within 24 hours only)
npm unpublish claude-code-companion@1.0.2
```

---

## Quick Setup Checklist

- [ ] Add NPM_TOKEN secret to GitHub repository
- [ ] Test workflows with a patch release
- [ ] Configure branch protection rules (optional)
- [ ] Set up notification preferences
- [ ] Document release process for team members

For questions or issues, check the [GitHub Actions documentation](https://docs.github.com/en/actions) or create an issue in this repository.