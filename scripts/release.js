#!/usr/bin/env node

/**
 * Release helper script for claude-code-companion
 * 
 * Usage:
 *   npm run release:patch
 *   npm run release:minor  
 *   npm run release:major
 *   npm run release:check
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md');
const PACKAGE_PATH = path.join(__dirname, '..', 'package.json');

function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_PATH, 'utf8'));
  return pkg.version;
}

function updateChangelog(version, changes) {
  const changelog = fs.readFileSync(CHANGELOG_PATH, 'utf8');
  
  const today = new Date().toISOString().split('T')[0];
  const versionEntry = `## [${version}] - ${today}\n\n${changes}\n\n`;
  
  // Insert after "## [Unreleased]" section
  const updated = changelog.replace(
    /(## \[Unreleased\][\s\S]*?\n\n)/,
    `$1${versionEntry}`
  );
  
  fs.writeFileSync(CHANGELOG_PATH, updated);
  console.log(`✅ Updated CHANGELOG.md with version ${version}`);
}

function checkPreReleaseConditions() {
  console.log('🔍 Checking pre-release conditions...\n');
  
  const checks = [
    {
      name: 'Working directory clean',
      check: () => {
        try {
          execSync('git diff-index --quiet HEAD --', { stdio: 'ignore' });
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Tests pass',
      check: () => {
        try {
          execSync('npm test', { stdio: 'ignore' });
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'Linting passes',
      check: () => {
        try {
          execSync('npm run lint', { stdio: 'ignore' });
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'No high/critical vulnerabilities',
      check: () => {
        try {
          execSync('npm audit --audit-level=high', { stdio: 'ignore' });
          return true;
        } catch {
          return false;
        }
      }
    }
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    const passed = check.check();
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
    if (!passed) allPassed = false;
  }
  
  console.log('');
  return allPassed;
}

function showUsage() {
  console.log(`
📦 Claude Code Companion Release Helper

Usage:
  node scripts/release.js <command>

Commands:
  check           Check if ready for release
  prepare <type>  Prepare for release (patch|minor|major)
  
Examples:
  node scripts/release.js check
  node scripts/release.js prepare patch
  node scripts/release.js prepare minor
  node scripts/release.js prepare major

Notes:
  - This script only prepares the release locally
  - Push to main branch to trigger automated publishing
  - Or use GitHub Actions manual release workflow
`);
}

function prepareRelease(versionType) {
  console.log(`🚀 Preparing ${versionType} release...\n`);
  
  // Check conditions
  if (!checkPreReleaseConditions()) {
    console.log('❌ Pre-release checks failed. Please fix issues before releasing.');
    process.exit(1);
  }
  
  // Get current and new version
  const currentVersion = getCurrentVersion();
  console.log(`📋 Current version: ${currentVersion}`);
  
  // Bump version in package.json
  const newVersion = execSync(`npm version ${versionType} --no-git-tag-version`, { encoding: 'utf8' }).trim();
  console.log(`📋 New version: ${newVersion}`);
  
  // Prepare changelog entry
  const changelogEntry = `### Changed
- Version bump to ${newVersion}

### Added
- [Add new features here]

### Fixed
- [Add bug fixes here]

### Security
- [Add security updates here]`;
  
  updateChangelog(newVersion, changelogEntry);
  
  console.log(`
✅ Release prepared successfully!

Next steps:
1. Edit CHANGELOG.md to add actual changes for ${newVersion}
2. Review all changes: git diff
3. Commit and push to trigger automated release:
   
   git add .
   git commit -m "chore: prepare release ${newVersion}"
   git push origin main

4. Or create manual release via GitHub Actions:
   - Go to Actions tab in GitHub
   - Run "Manual Release" workflow
   - Enter version: ${newVersion.replace('v', '')}

The automated workflow will:
- Run tests on multiple Node versions  
- Publish to NPM
- Create GitHub release with changelog
- Generate release notes
`);
}

// Main execution
const command = process.argv[2];
const arg = process.argv[3];

switch (command) {
  case 'check':
    console.log('🔍 Checking release readiness...\n');
    const ready = checkPreReleaseConditions();
    if (ready) {
      console.log('✅ Ready for release!');
      process.exit(0);
    } else {
      console.log('❌ Not ready for release. Please fix issues above.');
      process.exit(1);
    }
    break;
    
  case 'prepare':
    if (!arg || !['patch', 'minor', 'major'].includes(arg)) {
      console.log('❌ Please specify version type: patch, minor, or major');
      showUsage();
      process.exit(1);
    }
    prepareRelease(arg);
    break;
    
  default:
    showUsage();
    process.exit(1);
}