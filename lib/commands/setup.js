const chalk = require('chalk');
const ora = require('ora');
// const path = require('path');
// const fs = require('fs-extra');
const inquirer = require('inquirer');
const config = require('../core/config');
const claudeConfig = require('../utils/claude-config');
const hookGenerator = require('../core/hook-generator');

async function setupCommand(options) {
  // Auto-select server URL based on sandbox flag if not explicitly set
  if (!options.server || options.server === 'https://claude-code-companion-backend-production.up.railway.app') {
    options.server = options.sandbox 
      ? 'https://claude-code-companion-backend-develop.up.railway.app'
      : 'https://claude-code-companion-backend-production.up.railway.app';
  }
  
  const environment = options.sandbox ? 'sandbox' : 'production';
  console.log(chalk.blue(`🚀 Setting up Claude Code Companion (${environment} environment)...\n`));
  
  const spinner = ora();
  
  try {
    // Step 1: Check if already configured
    if (config.isSetup() && !options.force) {
      // Check if we're in an interactive terminal
      const isInteractive = process.stdin.isTTY && process.stdout.isTTY;
      
      if (!isInteractive) {
        console.log(chalk.yellow('⚠️  Claude Code Companion already configured. Use --force to reconfigure.'));
        return;
      }
      
      const { reconfigure } = await inquirer.prompt([{
        type: 'confirm',
        name: 'reconfigure',
        message: 'Claude Code Companion already configured. Reconfigure?',
        default: false
      }]);
      
      if (!reconfigure) {
        console.log(chalk.yellow('⚠️  Setup cancelled. Use --force to reconfigure.'));
        return;
      }
    }

    // Step 2: Detect Claude Code configuration
    spinner.start('Detecting Claude Code configuration...');
    const claudeConfigPath = claudeConfig.findConfig();
    
    if (!claudeConfigPath) {
      spinner.fail('Claude Code configuration not found');
      console.log(chalk.red('❌ Could not find Claude Code configuration.'));
      console.log(chalk.gray('   Make sure Claude Code CLI is installed and configured.'));
      console.log(chalk.gray('   Expected locations:'));
      console.log(chalk.gray('   - ~/.claude/settings.json'));
      console.log(chalk.gray('   - ~/.config/claude/settings.json'));
      process.exit(1);
    }
    
    spinner.succeed(`Found Claude Code config: ${chalk.cyan(claudeConfigPath)}`);

    // Step 3: Generate and install hook
    spinner.start('Installing notification hook...');
    
    const hookPath = await hookGenerator.generateHook();
    const hookInstalled = await claudeConfig.installHook(claudeConfigPath, hookPath);
    
    if (!hookInstalled) {
      spinner.fail('Failed to install hook');
      console.log(chalk.red('❌ Could not install notification hook.'));
      console.log(chalk.gray('   You may need to manually add the hook to your Claude Code config:'));
      console.log(chalk.gray(`   "hooks": { "user-prompt-submit": "${hookPath}" }`));
      process.exit(1);
    }
    
    spinner.succeed('Notification hook installed');

    // Step 4: Configure environment variables
    spinner.start('Setting up environment...');
    
    config.setServerUrl(options.server);
    
    spinner.succeed('Environment configured');

    // Step 5: Test backend connection
    spinner.start('Testing backend connection...');
    
    try {
      await require('../core/api').testConnection(options.server);
      spinner.succeed('Backend connection OK');
    } catch (error) {
      spinner.warn(`Backend connection failed: ${error.message}`);
      console.log(chalk.yellow('⚠️  Backend server not reachable. Make sure it\'s running:'));
      console.log(chalk.gray(`   Server URL: ${options.server}`));
      console.log(chalk.gray('   You can still pair devices when the server is available.'));
    }

    // Success summary
    console.log(chalk.green('\n✅ Setup complete!\n'));
    console.log(chalk.bold('Next steps:'));
    console.log('1. Get pairing code from iPhone app');
    console.log(`2. Pair your device: ${chalk.cyan('cccompanion pair <6-digit-code>')}`);
    console.log(`3. Test the system: ${chalk.cyan('cccompanion test "Delete important file"')}\n`);
    
    console.log(chalk.bold('Environment variables added:'));
    console.log(`${chalk.gray('CC_NOTIFICATIONS_SERVER=')}${chalk.cyan(options.server)}`);
    
    if (!process.env.CC_NOTIFICATIONS_DEVICE_ID) {
      console.log(chalk.yellow('ℹ️  CC_NOTIFICATIONS_DEVICE_ID will be set after pairing'));
    }

  } catch (error) {
    if (spinner.isSpinning) {
      spinner.fail('Setup failed');
    }
    console.error(chalk.red('❌ Setup failed:'), error.message);
    
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack);
    }
    
    process.exit(1);
  }
}

module.exports = setupCommand;