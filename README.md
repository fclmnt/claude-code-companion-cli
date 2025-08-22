# Claude Code Notifications

> 📱 Get iPhone push notifications for Claude Code risky operations

**Professional CLI tool for iPhone approval workflow - Zero maintenance, maximum safety.**

[![npm version](https://badge.fury.io/js/claude-code-notifications.svg)](https://www.npmjs.com/package/claude-code-notifications)
[![Node.js CI](https://github.com/claude-code-notifications/cli/workflows/Node.js%20CI/badge.svg)](https://github.com/claude-code-notifications/cli/actions)

## 🚀 **Quick Start**

```bash
# 1. Install globally
npm install -g claude-code-notifications

# 2. Auto-setup (one command does everything)
ccnotify setup

# 3. Pair with iPhone
ccnotify pair 123456

# 4. Done! All risky operations now require iPhone approval
claude-code "rm important-file.json"
# → 📱 iPhone notification appears
# → You tap Approve/Deny  
# → Operation proceeds/stops based on your choice
```

## ✨ **Why NPM Package vs Manual Scripts?**

| Manual Scripts (Current) | NPM Package |
|--------------------------|-------------|
| `curl` + `chmod` + manual setup | `npm install -g` |
| `node claude-code-pairing.js` | `ccnotify pair` |
| Manual environment variables | Auto-configured |
| Manual hook configuration | `ccnotify setup` |
| No version management | `npm update -g` |
| Hard to discover | Searchable on npm |
| Platform compatibility issues | Cross-platform ready |
| **12 manual steps** | **3 commands** |

## 📋 **Features**

- ✅ **One-Command Setup**: `ccnotify setup` configures everything automatically
- ✅ **Professional CLI**: Built with Commander.js, colored output, progress bars
- ✅ **Smart Risk Assessment**: High/Medium/Low risk classification with customizable patterns
- ✅ **Auto-Discovery**: Finds Claude Code config automatically
- ✅ **Robust Error Handling**: Clear error messages with troubleshooting guidance
- ✅ **Cross-Platform**: Works on macOS, Linux, and Windows
- ✅ **Real-time Polling**: Waits for iPhone response with timeout handling
- ✅ **Environment Integration**: Seamless environment variable management
- ✅ **Update Management**: Easy updates via `npm update -g`

## 🛠️ **Commands**

### `ccnotify setup`
Auto-configure Claude Code hooks and environment
- Detects Claude Code configuration automatically
- Installs notification hook
- Configures environment variables
- Tests backend connection

### `ccnotify pair <code>`
Pair with iPhone using 6-digit code from app
- Validates code format
- Tests server connection
- Saves device configuration
- Provides environment setup guidance

### `ccnotify status`
Check pairing status and system health
- Device pairing status
- Backend connection test  
- Claude Code hook verification
- Environment variable check
- End-to-end system test

### `ccnotify test [message]`
Send test notification to iPhone
- Custom test messages
- Risk level simulation (--risk high/medium/low)
- Real-time response polling
- Success/failure feedback

### `ccnotify config`
Show current configuration and troubleshooting info

## 🔧 **Installation & Setup**

### Prerequisites
- Node.js 14+ 
- Claude Code CLI installed and configured
- iPhone with CCNotifications app
- Backend server running (local or hosted)

### Step-by-Step Setup

1. **Install the CLI tool**
   ```bash
   npm install -g claude-code-notifications
   ```

2. **Auto-configure Claude Code integration**
   ```bash
   ccnotify setup
   # ✅ Found Claude Code config at ~/.claude/config.json  
   # ✅ Notification hook installed
   # ✅ Environment configured
   # 📱 Ready to pair with iPhone!
   ```

3. **Pair with iPhone**
   - Open iPhone app, get 6-digit code
   - Run pairing command:
   ```bash
   ccnotify pair 123456
   # 🔗 Pairing with iPhone...
   # ✅ Paired with "John's iPhone"
   # 🎉 Setup complete!
   ```

4. **Add environment variables** (shown after pairing)
   ```bash
   export CC_NOTIFICATIONS_DEVICE_ID="your-device-id"
   export CC_NOTIFICATIONS_SERVER="https://claude-code-companion-backend-production.up.railway.app"
   ```

5. **Test the system**
   ```bash
   ccnotify test "Delete important file"
   # 📱 Sent notification to iPhone
   # ⏳ Waiting for response...
   # ✅ User approved the operation
   ```

**That's it! 🎉 All Claude Code risky operations now require iPhone approval.**

## 🔒 **Security & Risk Assessment**

### Risk Levels

**🔴 High Risk** (Always notifies)
- `rm -rf`, `sudo` commands
- Database operations: `DELETE FROM`, `DROP TABLE`
- Configuration files: `.env`, `config.json`, `package.json`
- Security files: API keys, certificates, secrets
- System operations: `shutdown`, `reboot`, `kill -9`

**🟡 Medium Risk** (Configurable)
- File operations: `rm`, `mv` of important files
- Permission changes: `chmod`, `chown`
- Database updates: `UPDATE`, `ALTER TABLE`
- Package installations: `npm install`, `pip install`

**🟢 Low Risk** (Typically skipped)
- Read operations: `cat`, `ls`, `grep`
- Safe file operations: `mkdir`, `touch`
- Version checks: `node --version`, `git status`

## 🎨 **User Experience**

### Beautiful CLI Output
```bash
$ ccnotify status
📊 Claude Code Notifications Status

✅ Device Pairing: Paired with John's iPhone
✅ Backend Connection: Server reachable  
✅ Claude Code Hook: Hook configured and active
⚠️  Environment Variables: Missing CC_NOTIFICATIONS_DEVICE_ID
✅ System Health: All systems operational

🎉 System mostly functional with minor issues.
```

### Rich Error Messages
```bash
$ ccnotify pair 12345
❌ Invalid pairing code format.
   Pairing code must be exactly 6 digits.
   Get a new code from your iPhone app and try again.
```

### Progress Indicators
```bash
$ ccnotify setup
🚀 Setting up Claude Code notifications...

✅ Found Claude Code config: ~/.claude/config.json
✅ Notification hook installed
✅ Environment configured  
⚠️  Backend connection failed: Server not running
```

## 🚀 **Development & Contributing**

### Project Structure
```
claude-code-notifications/
├── bin/ccnotify.js              # Main CLI entry point
├── lib/
│   ├── commands/                # Command implementations
│   │   ├── setup.js
│   │   ├── pair.js
│   │   ├── status.js
│   │   └── test.js
│   ├── core/                    # Core functionality
│   │   ├── config.js            # Configuration management
│   │   ├── api.js               # Backend API client
│   │   └── hook-generator.js    # Hook file generation
│   └── utils/
│       └── claude-config.js     # Claude Code config utilities
└── templates/
    └── hook.js                  # Hook template
```

### Publishing to NPM
```bash
npm version patch
npm publish
npm install -g claude-code-notifications
```

## 🎯 **Migration from Manual Scripts**

Already using manual scripts? Easy migration:

```bash
# Remove old files
rm claude-code-hook.js claude-code-pairing.js

# Install npm package
npm install -g claude-code-notifications

# Your existing pairing is preserved!
ccnotify status
# ✅ Paired with: Your iPhone (migrated from manual setup)
```

## 🆚 **Comparison: Manual vs NPM**

### User Adoption Perspective

**Manual Script Approach:**
```bash
# User journey - 12 steps, multiple failure points
curl -o claude-code-hook.js https://example.com/claude-code-hook.js
curl -o claude-code-pairing.js https://example.com/claude-code-pairing.js
chmod +x *.js
node claude-code-pairing.js 123456
export CC_NOTIFICATIONS_DEVICE_ID="..."
export CC_NOTIFICATIONS_SERVER="..."
# Edit Claude Code config manually
# Add hook path manually
# Test manually
# Update manually
```

**NPM Package Approach:**
```bash
# User journey - 3 steps, bulletproof
npm install -g claude-code-notifications
ccnotify setup
ccnotify pair 123456
```

### Developer Maintenance Perspective

**Manual Scripts:**
- ❌ Users download wrong versions
- ❌ No automatic updates
- ❌ Platform compatibility issues  
- ❌ Hard to debug user installations
- ❌ Poor error messages
- ❌ No analytics on adoption

**NPM Package:**
- ✅ Semantic versioning
- ✅ Automatic dependency management
- ✅ Cross-platform compatibility
- ✅ Rich error handling and logging
- ✅ Professional CLI experience
- ✅ npm download statistics
- ✅ Established distribution ecosystem

## 📈 **Adoption Success Metrics**

The NPM approach will dramatically increase adoption because:

1. **Discovery**: Searchable on npmjs.com
2. **Trust**: Professional package in established ecosystem  
3. **Simplicity**: 3 commands vs 12 manual steps
4. **Maintenance**: `npm update -g` vs re-downloading files
5. **Developer Experience**: Rich CLI vs basic Node scripts
6. **Cross-platform**: Works everywhere vs platform issues
7. **Documentation**: Integrated help vs external docs
8. **Community**: GitHub stars, npm downloads, issue tracking

---

## 🎉 **Conclusion**

**NPM package is unquestionably the better approach for production release.**

It transforms a complex 12-step manual process into a 3-command professional tool that "just works" for everyone. The user experience is night-and-day better, maintenance is automated, and adoption will be significantly higher.

Ready to publish: **This package is production-ready and will dramatically improve user adoption! 🚀**