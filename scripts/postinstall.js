#!/usr/bin/env node

/**
 * Post-install script for claude-code-companion
 * 
 * Automatically configures Claude Code hooks after package installation
 */

const chalk = require('chalk');
const path = require('path');

async function postInstall() {
  console.log(chalk.blue('\n🚀 Claude Code Companion installed!\n'));
  
  // Check if this is a global installation
  const isGlobal = __dirname.includes('lib/node_modules') || 
                   __dirname.includes('usr/local/lib/node_modules') ||
                   process.env.npm_config_global === 'true';
  
  if (!isGlobal) {
    console.log(chalk.yellow('📦 Local installation detected.'));
    console.log(chalk.gray('   For global CLI access, install with: npm install -g claude-code-companion\n'));
    return;
  }
  
  // Check if user wants to skip auto-setup
  if (process.env.CCCOMPANION_SKIP_SETUP === 'true') {
    console.log(chalk.gray('⏭️  Auto-setup skipped (CCCOMPANION_SKIP_SETUP=true)\n'));
    console.log(chalk.bold('Manual setup:'));
    console.log(`   ${chalk.cyan('cccompanion setup')}`);
    console.log(`   ${chalk.cyan('cccompanion pair <6-digit-code>')}\n`);
    return;
  }
  
  try {
    // Import required modules
    const setupCommand = require('../lib/commands/setup');
    const hookGenerator = require('../lib/core/hook-generator');
    
    // Check if hook file exists and needs updating
    const hookExists = hookGenerator.hookExists();
    const needsUpdate = await hookGenerator.needsUpdate();
    
    if (hookExists && needsUpdate) {
      console.log(chalk.blue('🔄 Updating existing Claude Code hook...\n'));
      
      // Update the hook file with latest version
      await hookGenerator.updateHook();
      
      console.log(chalk.green('✅ Hook file updated successfully!\n'));
      
      console.log(chalk.bold('Updated features:'));
      console.log('• Latest risk assessment patterns');
      console.log('• Enhanced multi-option support');  
      console.log('• Improved error handling');
      console.log('• Performance optimizations\n');
      
    } else if (hookExists && !needsUpdate) {
      console.log(chalk.green('✅ Hook file is already up to date!\n'));
      
    } else {
      console.log(chalk.blue('🔧 Auto-configuring Claude Code integration...\n'));
      
      // Check if we're in an interactive terminal
      const isInteractive = process.stdin.isTTY && process.stdout.isTTY;
      
      // Run setup with default options
      await setupCommand({
        server: process.env.CC_NOTIFICATIONS_SERVER || 'https://claude-code-companion-backend-production.up.railway.app',
        force: !isInteractive // Force setup in non-interactive environments
      });
      
      console.log(chalk.green('\n✨ Auto-setup complete!\n'));
    }
    
    if (!hookExists) {
      // New installation
      console.log(chalk.bold('Next steps:'));
      console.log('1. Start your backend server');
      console.log(`2. Get pairing code from iPhone app`);
      console.log(`3. Run: ${chalk.cyan('cccompanion pair <6-digit-code>')}`);
      console.log(`4. Enjoy automatic notifications for risky operations!\n`);
    } else if (needsUpdate) {
      // Hook was updated
      console.log(chalk.bold('Your setup is ready!'));
      console.log('• Hook file updated with latest improvements');
      console.log('• Existing configuration preserved');
      console.log(`• Check status: ${chalk.cyan('cccompanion status')}\n`);
    } else {
      // Hook already up to date
      console.log(chalk.bold('Everything is ready!'));
      console.log('• Hook file is current');
      console.log('• Configuration preserved');
      console.log(`• Check status: ${chalk.cyan('cccompanion status')}\n`);
    }
    
  } catch (error) {
    // Don't fail the installation if setup fails
    console.log(chalk.yellow('⚠️  Auto-setup encountered an issue:'));
    console.log(chalk.gray(`   ${error.message}\n`));
    
    console.log(chalk.bold('Manual setup:'));
    console.log(`   ${chalk.cyan('cccompanion setup')}`);
    console.log(`   ${chalk.cyan('cccompanion pair <6-digit-code>')}\n`);
    
    console.log(chalk.gray('💡 Common issues:'));
    console.log(chalk.gray('   - Claude Code CLI not installed'));
    console.log(chalk.gray('   - No ~/.claude/settings.json file exists'));
    console.log(chalk.gray('   - Permission issues with configuration directory'));
    console.log(chalk.gray('   - Existing hook configuration conflicts\n'));
    
    // Exit successfully even if setup fails - don't break npm install
    console.log(chalk.green('✅ Package installed successfully. Run manual setup when ready.'));
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