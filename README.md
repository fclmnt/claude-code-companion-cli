# Claude Code Companion

> iPhone push notifications for Claude Code risky operations

Get instant iPhone notifications when Claude Code performs potentially risky operations. Simple device pairing, intelligent risk assessment, and seamless approval workflow.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-%3E%3D14.0.0-brightgreen)

## Features

- 🚀 **Zero Configuration** - Auto-configures Claude Code hooks on install
- 📱 **iPhone Integration** - Native push notifications with approval workflow  
- 🛡️ **Smart Risk Assessment** - Automatically detects high/medium/low risk operations
- ⚡ **Instant Setup** - Pair with 6-digit code, no accounts required
- 🔒 **Secure** - Device-only authentication, no sensitive data stored

## Quick Start

### 1. Install globally
```bash
npm install -g claude-code-companion
```

### 2. Auto-setup Claude Code integration
```bash
cccompanion setup
```

### 3. Pair with iPhone
```bash
# Get 6-digit code from iPhone app, then:
cccompanion pair 123456
```

### 4. Ready to use!
Your Claude Code operations will now prompt for iPhone approval automatically.

## Commands

```bash
cccompanion setup                    # Configure Claude Code integration
cccompanion pair <code>              # Pair with iPhone using 6-digit code
cccompanion status                   # Check connection and pairing status
cccompanion config                   # Show current configuration
```

## How It Works

1. **Risk Detection** - Hooks into Claude Code to detect risky operations
2. **iPhone Notification** - Sends push notification with operation details
3. **User Approval** - User approves/denies on iPhone
4. **Operation Control** - Claude Code proceeds or stops based on response

### Risk Levels

- **High Risk** - `rm -rf`, `sudo`, database drops, secret files → Always requires approval
- **Medium Risk** - File modifications, installs, admin operations → Requires approval  
- **Low Risk** - Read operations, status checks → Auto-approved

## Requirements

- **Claude Code CLI** - Must be installed and configured
- **iPhone App** - Companion iOS app for notifications
- **Backend Server** - For notification routing (provided)

## Configuration

### Environment Variables
```bash
CC_NOTIFICATIONS_SERVER=https://your-backend.com  # Backend server URL
CC_NOTIFICATIONS_DEVICE_ID=your-device-id         # Auto-managed after pairing
CC_NOTIFICATIONS_TIMEOUT=30000                    # Request timeout (ms)
```

### Configuration File
Location: `~/.claude-code-companion`

Contains device info, server settings, and pairing status.

## Examples

```bash
# Setup and pairing
cccompanion setup
cccompanion pair 123456
cccompanion status --verbose

# Check configuration
cccompanion config

# Real usage - automatic notifications when Claude Code runs risky operations
# No manual testing needed - works automatically with Claude Code!
```

## Architecture

### Components
- **CLI Tool** - This npm package
- **Claude Code Hook** - Auto-generated integration script
- **iPhone App** - Native iOS app for notifications
- **Backend Service** - Node.js API for notification routing

### Workflow
```
Claude Code → Hook → Backend → iPhone → User → Backend → Hook → Claude Code
```

## Development

```bash
# Clone and install
git clone https://github.com/your-org/claude-code-companion.git
cd claude-code-companion
npm install

# Run tests
npm test

# Lint code
npm run lint
```

## Troubleshooting

### Setup Issues
```bash
# Check Claude Code installation
claude --version

# Verify hook installation
cccompanion status --verbose

# Force reconfiguration
cccompanion setup --force
```

### Connection Issues
```bash
# Check backend connectivity and device pairing
cccompanion status

# View detailed configuration
cccompanion config

# Reset configuration
rm ~/.claude-code-companion
cccompanion setup
```

## Support

- 📖 Documentation - See this README for complete usage guide
- 🐛 Issues - Use GitHub Issues for bug reports and feature requests
- 💬 Questions - Check troubleshooting section or create an issue

## License

MIT © Claude Code Companion

---

**Made for Claude Code developers who value safety and control**