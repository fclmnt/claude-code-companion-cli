const chalk = require('chalk');
const ora = require('ora');
const os = require('os');
const config = require('../core/config');
const api = require('../core/api');

async function pairCommand(pairingCode, options) {
  const environment = options.sandbox ? 'sandbox' : 'production';
  console.log(chalk.blue(`📱 Pairing with iPhone (${environment} environment)...\n`));
  
  const spinner = ora();
  
  try {
    // Validate pairing code format
    if (!/^\d{6}$/.test(pairingCode)) {
      console.error(chalk.red('❌ Invalid pairing code format.'));
      console.log(chalk.gray('   Pairing code must be exactly 6 digits.'));
      console.log(chalk.gray('   Get a new code from your iPhone app and try again.'));
      process.exit(1);
    }

    // Check if already paired
    const currentConfig = config.getConfig();
    if (currentConfig.deviceId && currentConfig.deviceName) {
      console.log(chalk.yellow(`⚠️  Already paired with: ${currentConfig.deviceName}`));
      console.log(chalk.gray('   Use --force to re-pair or pair with a different device.\n'));
    }

    spinner.start(`Connecting to ${environment} server: ${options.server}`);

    // Test server connection first
    try {
      await api.testConnection(options.server);
      spinner.succeed('Server connection OK');
    } catch (error) {
      spinner.fail('Server connection failed');
      console.error(chalk.red('❌ Cannot reach backend server:'), error.message);
      console.log(chalk.gray('\n   Troubleshooting:'));
      console.log(chalk.gray(`   1. Is the server running? ${options.server}`));
      console.log(chalk.gray('   2. Is the URL correct?'));
      console.log(chalk.gray('   3. Check your internet connection'));
      process.exit(1);
    }

    // Attempt pairing
    spinner.start(`Pairing with code: ${pairingCode}`);
    
    const pairingData = {
      pairing_code: pairingCode,
      cli_info: {
        version: require('../../package.json').version,
        platform: process.platform,
        hostname: os.hostname(),
        user: os.userInfo().username,
        cli_tool: 'cccompanion'
      }
    };

    const response = await api.makeRequest('POST', '/api/devices/pair', pairingData, options.server);
    
    if (!response.success) {
      throw new Error(response.error || 'Pairing failed');
    }

    spinner.succeed(`Paired with: ${chalk.green(response.device_name)}`);

    // Save configuration
    const deviceConfig = {
      deviceId: response.device_id,
      deviceName: response.device_name,
      deviceToken: response.device_token,
      serverUrl: options.server,
      sandbox: options.sandbox || false,
      pairedAt: new Date().toISOString(),
      cliVersion: require('../../package.json').version
    };

    config.saveConfig(deviceConfig);
    
    // Set environment variable for current session
    process.env.CC_NOTIFICATIONS_DEVICE_ID = response.device_id;

    // Success summary
    console.log(chalk.green('\n🎉 Pairing successful!\n'));
    console.log(chalk.bold('Device Information:'));
    console.log(`📱 Device: ${chalk.cyan(response.device_name)}`);
    console.log(`🆔 Device ID: ${chalk.gray(response.device_id)}`);
    console.log(`🔗 Server: ${chalk.cyan(options.server)}`);
    console.log(`⏰ Paired at: ${chalk.gray(new Date().toLocaleString())}\n`);

    console.log(chalk.bold('Environment Setup:'));
    console.log(chalk.green('✅ Configuration saved locally'));
    console.log(chalk.yellow('⚠️  Add this to your shell profile (~/.zshrc or ~/.bashrc):'));
    console.log(chalk.cyan(`export CC_NOTIFICATIONS_DEVICE_ID="${response.device_id}"`));
    console.log(chalk.cyan(`export CC_NOTIFICATIONS_SERVER="${options.server}"`));

    console.log(chalk.bold('\nNext Steps:'));
    console.log(`1. Restart your terminal or run: ${chalk.cyan('source ~/.zshrc')}`);
    console.log(`2. Check connection status: ${chalk.cyan('cccompanion status')}`);
    console.log('3. Run Claude Code commands - risky operations will trigger iPhone notifications!');

    console.log(chalk.green('\n🚀 You\'re all set! Claude Code will now send notifications to your iPhone.'));

  } catch (error) {
    if (spinner.isSpinning) {
      spinner.fail('Pairing failed');
    }
    
    console.error(chalk.red('❌ Pairing failed:'), error.message);
    
    // Specific error guidance
    if (error.message.includes('Invalid pairing code')) {
      console.log(chalk.gray('\n   Troubleshooting:'));
      console.log(chalk.gray('   1. Make sure the 6-digit code is from your iPhone app'));
      console.log(chalk.gray('   2. Code expires in 15 minutes - get a fresh one if needed'));
      console.log(chalk.gray('   3. Each code can only be used once'));
    } else if (error.message.includes('expired')) {
      console.log(chalk.gray('\n   ⏰ The pairing code has expired.'));
      console.log(chalk.gray('   Get a new code from your iPhone app and try again.'));
    } else if (error.message.includes('already paired')) {
      console.log(chalk.gray('\n   📱 This device is already paired with another iPhone.'));
      console.log(chalk.gray('   Use the existing pairing or unpair first.'));
    }
    
    process.exit(1);
  }
}

module.exports = pairCommand;