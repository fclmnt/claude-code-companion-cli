# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with the `claude-code-companion` npm package.

## Project Overview

**claude-code-companion** is a professional CLI tool that enables iPhone push notifications for Claude Code risky operations. This package provides seamless integration with Claude Code's hook system to automatically request user approval for potentially dangerous operations.

## Package Structure

### **CLI Tool (`bin/`)**
- `bin/cccompanion.js` - Main CLI entry point with Commander.js interface

### **Core Libraries (`lib/`)**
- `lib/core/config.js` - Configuration management (saves to `~/.claude-code-companion`)
- `lib/core/api.js` - HTTP client for backend communication with retry logic
- `lib/core/hook-generator.js` - Generates Claude Code hook scripts dynamically

### **Commands (`lib/commands/`)**
- `lib/commands/setup.js` - Auto-configures Claude Code integration
- `lib/commands/pair.js` - Device pairing with 6-digit codes
- `lib/commands/status.js` - Connection and configuration status
- `lib/commands/test.js` - Send test notifications

### **Utilities (`lib/utils/`)**
- `lib/utils/claude-config.js` - Claude Code settings.json manipulation

### **Scripts (`scripts/`)**
- `scripts/postinstall.js` - Automatic setup after npm install

## Key Features

### **✅ Zero-Config Installation**
- Post-install script automatically configures Claude Code hooks
- Detects Claude Code configuration automatically
- Environment variables managed transparently

### **✅ Device-Only Authentication**
- No user accounts or passwords required
- Simple 6-digit pairing codes with 15-minute expiration
- Device configuration stored in `~/.claude-code-notifications`

### **✅ Intelligent Risk Assessment**
- **High Risk**: `rm -rf`, `sudo`, database operations, secrets
- **Medium Risk**: File modifications, installs, basic admin operations
- **Low Risk**: Read operations, status checks (auto-approved)

### **✅ Production-Ready Architecture**
- Comprehensive error handling and retry logic
- Configurable timeouts and poll intervals
- Environment variable overrides for all settings
- Graceful degradation when backend unavailable

## Development Commands

### **Installation & Setup**
```bash
# Global installation (recommended)
npm install -g claude-code-companion

# Local installation
npm install claude-code-companion

# Manual setup (if auto-setup fails)
cccompanion setup

# Skip auto-setup during install
CCCOMPANION_SKIP_SETUP=true npm install -g claude-code-companion
```

### **Device Management**
```bash
# Pair with iPhone using app-generated code
cccompanion pair 123456

# Check pairing status and configuration
cccompanion status --verbose

# Show current configuration
cccompanion config
```

### **Testing & Debugging**
```bash
# Send test notification
cccompanion test "Delete important file"

# Test with specific risk level
cccompanion test --risk high "sudo rm important.json"

# Development mode (enables debug output)
NODE_ENV=development cccompanion test "debug operation"
```

## Configuration

### **Environment Variables**
- `CC_NOTIFICATIONS_SERVER` - Backend server URL (default: Railway deployment)
- `CC_NOTIFICATIONS_DEVICE_ID` - Paired device ID (auto-managed)
- `CC_NOTIFICATIONS_TIMEOUT` - Request timeout in ms (default: 30000)
- `CC_NOTIFICATIONS_POLL_INTERVAL` - Polling interval in ms (default: 2000)
- `CCCOMPANION_SKIP_SETUP` - Skip post-install auto-setup (default: false)

### **Configuration File**
- Location: `~/.claude-code-companion`
- Format: JSON with device info, server URL, timeouts
- Auto-managed by CLI commands

### **Hook Integration**
- Hook file: `~/.claude/hooks/claude-code-companion-hook.js`
- Integration: Added to `~/.claude/settings.json` automatically
- Trigger: `user-prompt-submit` hook for risky operations

## Backend Integration

### **API Endpoints**
- `POST /api/devices/pair` - Device pairing with 6-digit codes
- `POST /api/notifications` - Send notification requests
- `GET /api/notifications/:id/status` - Poll for user responses
- `GET /api/devices/:id/status` - Check device status
- `GET /health` - Health check endpoint

### **Server Configuration**
```bash
# Default backend (production)
https://claude-code-companion-backend-production.up.railway.app

# Custom backend
cccompanion setup --server https://your-backend.com

# Local development
cccompanion setup --server http://localhost:3000
```

## Risk Assessment Engine

### **Pattern Matching**
The hook uses regex patterns to assess operation risk:

```javascript
// High risk patterns
/rm\s+-rf/i, /sudo/i, /DELETE\s+FROM/i, /secret/i

// Medium risk patterns  
/rm\s+[^-]/i, /chmod/i, /UPDATE\s+.*SET/i

// Low risk (auto-approved)
Read operations, status checks, basic queries
```

### **Operation Classification**
- `delete` - File/data deletion operations
- `modify` - File/config modifications
- `create` - New file/directory creation
- `install` - Package installations
- `execute` - Command execution
- `move` - File/directory moves
- `copy` - File copying operations

## Error Handling

### **Connection Issues**
- Automatic retry with exponential backoff
- Graceful degradation when backend unavailable
- Clear error messages for common network issues

### **Configuration Problems**
- Validates all settings on startup
- Provides helpful error messages with fix suggestions
- Automatic detection and repair of common issues

### **Hook Failures**
- Default to denying operations for safety
- Comprehensive logging in development mode
- Non-blocking errors don't break Claude Code workflow

## Development Guidelines

### **Adding New Commands**
1. Create command file in `lib/commands/`
2. Import and register in `bin/cccompanion.js`
3. Add help text and examples
4. Test with various input scenarios

### **Extending Risk Assessment**
1. Add patterns to `RISK_PATTERNS` in hook generator
2. Test with representative commands
3. Consider false positives and edge cases
4. Update documentation with new patterns

### **Backend API Changes**
1. Update `lib/core/api.js` methods
2. Ensure backward compatibility
3. Add proper error handling
4. Test with different server versions

## Testing Strategy

### **Unit Tests**
- `test/unit.test.js` - Core functionality testing
- Mock API responses and file system operations
- Test error conditions and edge cases

### **CLI Integration Tests**
- `test/cli.test.js` - End-to-end command testing
- Test all CLI commands and options
- Verify configuration management

### **Manual Testing Checklist**
```bash
# Installation flow
npm install -g claude-code-companion

# Configuration
cccompanion setup
cccompanion status

# Pairing flow
cccompanion pair 123456
cccompanion status --verbose

# Notification testing
cccompanion test "rm important.json"
cccompanion test --risk low "ls files"
```

## Deployment & Distribution

### **NPM Package**
- Global installation recommended for CLI access
- Includes all dependencies for standalone operation
- Post-install script handles Claude Code integration

### **Backend Requirements**
- Node.js backend with device pairing API
- PostgreSQL database for device/request storage
- APNs integration for iPhone notifications

### **iOS App Integration**
- Device registration and pairing interface
- Push notification handling and user responses
- Backend communication for approval workflow

## Security Considerations

### **No Embedded Secrets**
- All sensitive data via environment variables
- No hardcoded API keys or tokens
- Configuration stored in user home directory

### **Safe Default Behavior**
- Denies operations by default on errors
- Validates all user inputs
- Sanitizes file paths and commands

### **Network Security**
- HTTPS for all backend communication
- Request timeouts prevent hanging
- Retry limits prevent DoS scenarios

## Future Enhancements

### **Planned Features**
- Multiple device support per user
- Custom risk assessment rules
- Operation history and analytics
- Integration with other CLI tools

### **Extensibility Points**
- Plugin system for custom risk assessments
- Webhook support for external integrations
- Configuration presets for different environments

---

**Package Status**: ✅ Production Ready  
**Version**: 1.0.0  
**License**: MIT  
**Maintainer**: Claude Code Companion  
**Repository**: https://github.com/your-org/claude-code-companion