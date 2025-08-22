#!/usr/bin/env node

/**
 * Claude Code Companion CLI
 * 
 * iPhone push notifications for Claude Code risky operations
 */

const { Command } = require('commander');
const chalk = require('chalk');
const packageInfo = require('../package.json');

// Import command handlers
const setupCommand = require('../lib/commands/setup');
const pairCommand = require('../lib/commands/pair'); 
const statusCommand = require('../lib/commands/status');
const testCommand = require('../lib/commands/test');

const program = new Command();

// Program configuration
program
  .name('cccompanion')
  .description('🚀 iPhone push notifications for Claude Code risky operations')
  .version(packageInfo.version)
  .configureOutput({
    writeOut: (str) => process.stdout.write(str),
    writeErr: (str) => process.stderr.write(chalk.red(str))
  });

// Setup command - Auto-configure Claude Code integration
program
  .command('setup')
  .description('🔧 Auto-configure Claude Code hooks and environment')  
  .option('-s, --server <url>', 'Backend server URL', 'https://claude-code-companion-backend-production.up.railway.app')
  .option('--force', 'Force reconfiguration even if already set up')
  .action(setupCommand);

// Pair command - Connect with iPhone
program
  .command('pair <code>')
  .description('📱 Pair with iPhone using 6-digit code from app')
  .option('-s, --server <url>', 'Backend server URL', 'https://claude-code-companion-backend-production.up.railway.app')
  .action(pairCommand);

// Status command - Check connection and configuration
program  
  .command('status')
  .description('📊 Check pairing status and connection')
  .option('-v, --verbose', 'Show detailed status information')
  .action(statusCommand);

// Test command - Send test notification
program
  .command('test [message]')
  .description('🧪 Send test notification to iPhone')
  .option('-r, --risk <level>', 'Risk level: low, medium, high', 'medium')
  .action(testCommand);

// Config command - Manage configuration
program
  .command('config')
  .description('⚙️  Show current configuration')
  .action(() => {
    console.log(chalk.blue('📋 Current Configuration:'));
    require('../lib/core/config').showConfig();
  });

// Examples in help
program.addHelpText('after', `

${chalk.bold('Examples:')}
  ${chalk.cyan('cccompanion setup')}                    Auto-configure Claude Code integration
  ${chalk.cyan('cccompanion pair 123456')}              Pair with iPhone using code from app  
  ${chalk.cyan('cccompanion status')}                   Check connection status
  ${chalk.cyan('cccompanion test "rm important.json"')} Send test notification
  
${chalk.bold('Getting Started:')}
  1. Install the iPhone app and allow notifications
  2. Run ${chalk.cyan('cccompanion setup')} to configure Claude Code integration
  3. Get 6-digit code from iPhone app
  4. Run ${chalk.cyan('cccompanion pair <code>')} to connect
  5. Enjoy automatic notifications for risky operations!

${chalk.bold('Environment Variables:')}
  CC_NOTIFICATIONS_SERVER          Backend server URL
  CC_NOTIFICATIONS_DEVICE_ID       Your paired device ID
  CC_NOTIFICATIONS_TIMEOUT         Request timeout (default: 30000ms)

${chalk.bold('Learn More:')}
  📖 Full documentation: https://github.com/your-org/claude-code-companion
  🐛 Report issues: https://github.com/your-org/claude-code-companion/issues
`);

// Global error handler
process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Unexpected error:'), error.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red('❌ Unhandled promise rejection:'), reason);
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no arguments provided
if (process.argv.length <= 2) {
  program.help();
}