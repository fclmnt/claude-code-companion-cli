# Claude Code Companion

> iPhone push notifications for Claude Code risky operations

Get instant iPhone notifications when Claude Code performs potentially risky operations. Simple device pairing, intelligent risk assessment, and seamless approval workflow.

[![npm version](https://badge.fury.io/js/claude-code-companion.svg)](https://www.npmjs.com/package/claude-code-companion)
[![Node.js CI](https://github.com/your-org/claude-code-companion/workflows/Node.js%20CI/badge.svg)](https://github.com/your-org/claude-code-companion/actions)

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

### 4. Test the system
```bash
cccompanion test "Delete important file"
```

## Commands

```bash
cccompanion setup                    # Configure Claude Code integration
cccompanion pair <code>              # Pair with iPhone using 6-digit code
cccompanion status                   # Check connection and pairing status
cccompanion test [message]           # Send test notification
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

# Testing different risk levels  
cccompanion test "rm important.json"           # High risk
cccompanion test "chmod +x script.sh"          # Medium risk
cccompanion test --risk low "ls files"         # Low risk (auto-approved)

# Check configuration
cccompanion config
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

# Test CLI
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
# Test backend connectivity
cccompanion status

# Check device pairing
cccompanion config

# Reset configuration
rm ~/.claude-code-companion
cccompanion setup
```

## Support

- 📖 [Documentation](https://github.com/your-org/claude-code-companion#readme)
- 🐛 [Report Issues](https://github.com/your-org/claude-code-companion/issues)
- 💬 [Discussions](https://github.com/your-org/claude-code-companion/discussions)

## License

MIT © Claude Code Companion

---

**Made for Claude Code developers who value safety and control**