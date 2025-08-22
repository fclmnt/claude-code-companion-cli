#!/usr/bin/env node

/**
 * Post-install script for claude-code-notifications
 * 
 * Automatically configures Claude Code hooks after package installation
 */

const chalk = require('chalk');
const path = require('path');

async function postInstall() {
  console.log(chalk.blue('\n🚀 Claude Code Notifications installed!\n'));
  
  // Check if this is a global installation
  const isGlobal = __dirname.includes('lib/node_modules') || 
                   __dirname.includes('usr/local/lib/node_modules') ||
                   process.env.npm_config_global === 'true';
  
  if (!isGlobal) {
    console.log(chalk.yellow('📦 Local installation detected.'));
    console.log(chalk.gray('   For global CLI access, install with: npm install -g claude-code-notifications\n'));
    return;
  }
  
  // Check if user wants to skip auto-setup
  if (process.env.CCNOTIFY_SKIP_SETUP === 'true') {
    console.log(chalk.gray('⏭️  Auto-setup skipped (CCNOTIFY_SKIP_SETUP=true)\n'));
    console.log(chalk.bold('Manual setup:'));
    console.log(`   ${chalk.cyan('ccnotify setup')}`);
    console.log(`   ${chalk.cyan('ccnotify pair <6-digit-code>')}\n`);
    return;
  }
  
  try {
    // Import setup command
    const setupCommand = require('../lib/commands/setup');
    
    console.log(chalk.blue('🔧 Auto-configuring Claude Code integration...\n'));
    
    // Check if we're in an interactive terminal
    const isInteractive = process.stdin.isTTY && process.stdout.isTTY;
    
    // Run setup with default options
    await setupCommand({
      server: process.env.CC_NOTIFICATIONS_SERVER || 'https://claude-code-companion-backend-production.up.railway.app',
      force: !isInteractive // Force setup in non-interactive environments
    });
    
    console.log(chalk.green('\n✨ Auto-setup complete!\n'));
    
    console.log(chalk.bold('Next steps:'));
    console.log('1. Start your backend server');
    console.log(`2. Get pairing code from iPhone app`);
    console.log(`3. Run: ${chalk.cyan('ccnotify pair <6-digit-code>')}`);
    console.log(`4. Test: ${chalk.cyan('ccnotify test "Test notification"')}\n`);
    
  } catch (error) {
    // Don't fail the installation if setup fails
    console.log(chalk.yellow('⚠️  Auto-setup encountered an issue:'));
    console.log(chalk.gray(`   ${error.message}\n`));
    
    console.log(chalk.bold('Manual setup:'));
    console.log(`   ${chalk.cyan('ccnotify setup')}`);
    console.log(`   ${chalk.cyan('ccnotify pair <6-digit-code>')}\n`);
    
    console.log(chalk.gray('💡 Common issues:'));
    console.log(chalk.gray('   - Claude Code CLI not installed'));
    console.log(chalk.gray('   - No ~/.claude/settings.json file exists'));
    console.log(chalk.gray('   - Permission issues with configuration directory\n'));
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  postInstall().catch((error) => {
    console.error(chalk.red('❌ Post-install failed:'), error.message);
    process.exit(0); // Don't fail the npm install
  });
}

module.exports = postInstall;