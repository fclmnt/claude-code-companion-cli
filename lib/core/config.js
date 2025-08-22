const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

class Config {
  constructor() {
    this.configFile = path.join(os.homedir(), '.claude-code-companion');
    this._config = null;
  }

  /**
   * Get the configuration file path
   */
  getConfigPath() {
    return this.configFile;
  }

  /**
   * Load configuration from file and environment
   */
  getConfig() {
    if (this._config) {
      return this._config;
    }

    let fileConfig = {};
    
    // Load from file if exists
    if (fs.existsSync(this.configFile)) {
      try {
        const data = fs.readFileSync(this.configFile, 'utf8');
        fileConfig = JSON.parse(data);
      } catch (error) {
        console.warn(chalk.yellow('⚠️  Could not read config file:'), error.message);
      }
    }

    // Merge with environment variables
    this._config = {
      deviceId: process.env.CC_NOTIFICATIONS_DEVICE_ID || fileConfig.deviceId || null,
      deviceName: fileConfig.deviceName || null,
      deviceToken: fileConfig.deviceToken || null,
      serverUrl: process.env.CC_NOTIFICATIONS_SERVER || fileConfig.serverUrl || 'https://claude-code-companion-backend-production.up.railway.app',
      pairedAt: fileConfig.pairedAt || null,
      cliVersion: fileConfig.cliVersion || null,
      timeout: parseInt(process.env.CC_NOTIFICATIONS_TIMEOUT) || fileConfig.timeout || 30000,
      pollInterval: parseInt(process.env.CC_NOTIFICATIONS_POLL_INTERVAL) || fileConfig.pollInterval || 2000
    };

    return this._config;
  }

  /**
   * Save configuration to file
   */
  saveConfig(newConfig) {
    try {
      const currentConfig = this.getConfig();
      const mergedConfig = { ...currentConfig, ...newConfig };
      
      // Remove null values
      const cleanConfig = Object.entries(mergedConfig)
        .filter(([_key, value]) => value !== null)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

      fs.writeFileSync(this.configFile, JSON.stringify(cleanConfig, null, 2));
      this._config = mergedConfig; // Update cached config
      
      return true;
    } catch (error) {
      console.error(chalk.red('❌ Could not save configuration:'), error.message);
      return false;
    }
  }

  /**
   * Set server URL
   */
  setServerUrl(serverUrl) {
    return this.saveConfig({ serverUrl });
  }

  /**
   * Set device information
   */
  setDevice(deviceId, deviceName, deviceToken = null) {
    return this.saveConfig({
      deviceId,
      deviceName,
      deviceToken,
      pairedAt: new Date().toISOString(),
      cliVersion: require('../../package.json').version
    });
  }

  /**
   * Clear device pairing
   */
  unpairDevice() {
    return this.saveConfig({
      deviceId: null,
      deviceName: null,
      deviceToken: null,
      pairedAt: null
    });
  }

  /**
   * Check if system is set up
   */
  isSetup() {
    const config = this.getConfig();
    return !!(config.deviceId && config.serverUrl);
  }

  /**
   * Check if device is paired
   */
  isPaired() {
    const config = this.getConfig();
    return !!(config.deviceId && config.deviceName);
  }

  /**
   * Validate configuration
   */
  validate() {
    const config = this.getConfig();
    const errors = [];

    if (!config.serverUrl) {
      errors.push('Server URL is required');
    }

    if (!config.deviceId) {
      errors.push('Device ID is required (pair with iPhone first)');
    }

    if (config.timeout < 1000 || config.timeout > 300000) {
      errors.push('Timeout must be between 1000ms and 300000ms');
    }

    if (config.pollInterval < 500 || config.pollInterval > 10000) {
      errors.push('Poll interval must be between 500ms and 10000ms');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Show current configuration
   */
  showConfig() {
    const config = this.getConfig();
    const validation = this.validate();

    console.log(chalk.bold('📋 Current Configuration:\n'));

    // Device info
    console.log(chalk.bold('Device:'));
    if (config.deviceId) {
      console.log(`  Device Name: ${chalk.cyan(config.deviceName || 'Unknown')}`);
      console.log(`  Device ID: ${chalk.gray(config.deviceId)}`);
      console.log(`  Paired At: ${chalk.gray(config.pairedAt ? new Date(config.pairedAt).toLocaleString() : 'Unknown')}`);
    } else {
      console.log(`  ${chalk.red('Not paired')}`);
    }

    // Server info
    console.log(chalk.bold('\nServer:'));
    console.log(`  URL: ${chalk.cyan(config.serverUrl)}`);

    // Settings
    console.log(chalk.bold('\nSettings:'));
    console.log(`  Timeout: ${chalk.cyan(config.timeout + 'ms')}`);
    console.log(`  Poll Interval: ${chalk.cyan(config.pollInterval + 'ms')}`);
    console.log(`  CLI Version: ${chalk.cyan(config.cliVersion || 'Unknown')}`);

    // Environment variables (optional overrides)
    console.log(chalk.bold('\nEnvironment Variables (Optional):'));
    console.log(`  CC_NOTIFICATIONS_DEVICE_ID: ${chalk.cyan(process.env.CC_NOTIFICATIONS_DEVICE_ID || 'Not set (auto-managed)')}`);
    console.log(`  CC_NOTIFICATIONS_SERVER: ${chalk.cyan(process.env.CC_NOTIFICATIONS_SERVER || 'Not set (using default)')}`);
    console.log(`  CC_NOTIFICATIONS_TIMEOUT: ${chalk.cyan(process.env.CC_NOTIFICATIONS_TIMEOUT || 'Not set (using default)')}`);

    // Configuration file
    console.log(chalk.bold('\nFiles:'));
    console.log(`  Config File: ${chalk.cyan(this.configFile)}`);
    console.log(`  Exists: ${chalk.cyan(fs.existsSync(this.configFile) ? 'Yes' : 'No')}`);

    // Validation
    console.log(chalk.bold('\nValidation:'));
    if (validation.valid) {
      console.log(`  Status: ${chalk.green('✅ Valid')}`);
    } else {
      console.log(`  Status: ${chalk.red('❌ Invalid')}`);
      validation.errors.forEach(error => {
        console.log(`  Error: ${chalk.red(error)}`);
      });
    }
  }

  /**
   * Reset configuration
   */
  reset() {
    try {
      if (fs.existsSync(this.configFile)) {
        fs.unlinkSync(this.configFile);
      }
      this._config = null;
      return true;
    } catch (error) {
      console.error(chalk.red('❌ Could not reset configuration:'), error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new Config();