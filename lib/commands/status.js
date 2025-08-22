const chalk = require('chalk');
const ora = require('ora');
const config = require('../core/config');
const api = require('../core/api');
const claudeConfig = require('../utils/claude-config');

async function statusCommand(options) {
  console.log(chalk.blue('📊 Claude Code Notifications Status\n'));
  
  const spinner = ora();
  const checks = [];

  try {
    // Check 1: Device pairing
    spinner.start('Checking device pairing...');
    const deviceConfig = config.getConfig();
    
    if (deviceConfig.deviceId && deviceConfig.deviceName) {
      checks.push({
        name: 'Device Pairing',
        status: 'success',
        message: `Paired with ${deviceConfig.deviceName}`,
        details: options.verbose ? {
          'Device ID': deviceConfig.deviceId,
          'Paired At': new Date(deviceConfig.pairedAt).toLocaleString(),
          'CLI Version': deviceConfig.cliVersion || 'Unknown'
        } : null
      });
      spinner.succeed('Device paired');
    } else {
      checks.push({
        name: 'Device Pairing',
        status: 'error',
        message: 'No device paired',
        fix: 'Run: cccompanion pair <6-digit-code>'
      });
      spinner.fail('No device paired');
    }

    // Check 2: Backend connection
    spinner.start('Testing backend connection...');
    const serverUrl = deviceConfig.serverUrl || process.env.CC_NOTIFICATIONS_SERVER || 'https://claude-code-companion-backend-production.up.railway.app';
    
    try {
      await api.testConnection(serverUrl);
      checks.push({
        name: 'Backend Connection',
        status: 'success',
        message: 'Server reachable',
        details: options.verbose ? {
          'Server URL': serverUrl,
          'Response Time': '< 1s'
        } : null
      });
      spinner.succeed('Backend connection OK');
    } catch (error) {
      checks.push({
        name: 'Backend Connection',
        status: 'error',
        message: `Server unreachable: ${error.message}`,
        fix: 'Check if backend server is running'
      });
      spinner.fail('Backend connection failed');
    }

    // Check 3: Claude Code hook
    spinner.start('Checking Claude Code hook...');
    const claudeConfigPath = claudeConfig.findConfig();
    
    if (claudeConfigPath) {
      const hookConfigured = claudeConfig.isHookConfigured(claudeConfigPath);
      if (hookConfigured) {
        checks.push({
          name: 'Claude Code Hook',
          status: 'success',
          message: 'Hook configured and active',
          details: options.verbose ? {
            'Config File': claudeConfigPath,
            'Hook Type': 'user-prompt-submit'
          } : null
        });
        spinner.succeed('Claude Code hook configured');
      } else {
        checks.push({
          name: 'Claude Code Hook',
          status: 'warning',
          message: 'Hook not configured',
          fix: 'Run: cccompanion setup'
        });
        spinner.warn('Hook not configured');
      }
    } else {
      checks.push({
        name: 'Claude Code Hook',
        status: 'error',
        message: 'Claude Code config not found',
        fix: 'Install and configure Claude Code CLI'
      });
      spinner.fail('Claude Code config not found');
    }

    // Check 4: Environment variables
    spinner.start('Checking environment variables...');
    const envVars = {
      'CC_NOTIFICATIONS_DEVICE_ID': process.env.CC_NOTIFICATIONS_DEVICE_ID,
      'CC_NOTIFICATIONS_SERVER': process.env.CC_NOTIFICATIONS_SERVER
    };

    const missingVars = Object.entries(envVars).filter(([_key, value]) => !value);
    
    if (missingVars.length === 0) {
      checks.push({
        name: 'Environment Variables',
        status: 'success',
        message: 'All required variables set',
        details: options.verbose ? envVars : null
      });
      spinner.succeed('Environment variables OK');
    } else {
      checks.push({
        name: 'Environment Variables',
        status: 'warning',
        message: `Missing: ${missingVars.map(([key]) => key).join(', ')}`,
        fix: 'Add variables to ~/.zshrc or ~/.bashrc'
      });
      spinner.warn('Some environment variables missing');
    }

    // Check 5: Overall system test
    if (deviceConfig.deviceId && checks.find(c => c.name === 'Backend Connection' && c.status === 'success')) {
      spinner.start('Testing end-to-end system...');
      
      try {
        // This would be a lightweight ping to verify the device is still active
        const testResponse = await api.makeRequest('GET', `/api/devices/${deviceConfig.deviceId}/status`, null, serverUrl);
        
        if (testResponse.success && testResponse.active) {
          checks.push({
            name: 'System Health',
            status: 'success',
            message: 'All systems operational'
          });
          spinner.succeed('System health check passed');
        } else {
          checks.push({
            name: 'System Health',
            status: 'warning',
            message: 'Device may need re-pairing'
          });
          spinner.warn('System health check warning');
        }
      } catch (error) {
        checks.push({
          name: 'System Health',
          status: 'warning',
          message: 'Cannot verify device status'
        });
        spinner.warn('System health check incomplete');
      }
    }

    // Display results
    console.log('\n' + chalk.bold('📋 Status Summary:\n'));

    checks.forEach(check => {
      let icon, color;
      switch (check.status) {
        case 'success':
          icon = '✅';
          color = chalk.green;
          break;
        case 'warning':
          icon = '⚠️ ';
          color = chalk.yellow;
          break;
        case 'error':
          icon = '❌';
          color = chalk.red;
          break;
      }

      console.log(`${icon} ${chalk.bold(check.name)}: ${color(check.message)}`);
      
      if (check.details && options.verbose) {
        Object.entries(check.details).forEach(([key, value]) => {
          console.log(`   ${chalk.gray(key + ':')} ${value}`);
        });
      }
      
      if (check.fix && check.status !== 'success') {
        console.log(`   ${chalk.gray('Fix:')} ${chalk.cyan(check.fix)}`);
      }
      
      console.log('');
    });

    // Overall status
    const errors = checks.filter(c => c.status === 'error').length;
    const warnings = checks.filter(c => c.status === 'warning').length;

    if (errors === 0 && warnings === 0) {
      console.log(chalk.green('🎉 All systems operational! Claude Code notifications are ready.'));
    } else if (errors === 0) {
      console.log(chalk.yellow('⚠️  System mostly functional with minor issues.'));
    } else {
      console.log(chalk.red('❌ System has critical issues that need attention.'));
    }

    // Quick help
    console.log(chalk.gray('\nQuick commands:'));
    console.log(chalk.gray('  cccompanion setup          Configure hooks and environment'));
    console.log(chalk.gray('  cccompanion pair <code>    Pair with iPhone'));

  } catch (error) {
    if (spinner.isSpinning) {
      spinner.fail('Status check failed');
    }
    console.error(chalk.red('❌ Status check failed:'), error.message);
    process.exit(1);
  }
}

module.exports = statusCommand;