const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');

class ClaudeConfigManager {
  constructor() {
    // Possible Claude Code settings locations
    this.configLocations = [
      path.join(os.homedir(), '.claude', 'settings.json'),
      path.join(os.homedir(), '.config', 'claude', 'settings.json'),
      path.join(os.homedir(), '.claude-code', 'settings.json'),
      path.join(os.homedir(), '.config', 'claude-code', 'settings.json')
    ];
  }

  /**
   * Find Claude Code settings file
   */
  findConfig() {
    for (const location of this.configLocations) {
      if (fs.existsSync(location)) {
        try {
          // Verify it's a valid JSON file
          const content = fs.readFileSync(location, 'utf8');
          JSON.parse(content);
          return location;
        } catch (error) {
          // Invalid JSON, continue searching
          continue;
        }
      }
    }
    
    return null;
  }

  /**
   * Read Claude Code settings
   */
  readConfig(configPath) {
    try {
      const content = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Could not read Claude Code settings: ${error.message}`);
    }
  }

  /**
   * Write Claude Code settings
   */
  writeConfig(configPath, config) {
    try {
      const content = JSON.stringify(config, null, 2);
      fs.writeFileSync(configPath, content);
      return true;
    } catch (error) {
      throw new Error(`Could not write Claude Code settings: ${error.message}`);
    }
  }

  /**
   * Check if notification hook is already configured
   */
  isHookConfigured(configPath) {
    try {
      const config = this.readConfig(configPath);
      
      if (!config.hooks || !config.hooks.Notification) {
        return false;
      }

      // Check if our hook exists in Notification hooks
      const notificationHooks = config.hooks.Notification;
      if (!Array.isArray(notificationHooks)) {
        return false;
      }

      // Look for our hook in the array
      for (const hookConfig of notificationHooks) {
        if (hookConfig.hooks && Array.isArray(hookConfig.hooks)) {
          for (const hook of hookConfig.hooks) {
            if (hook.type === 'command' && hook.command && this._isOurHookCommand(hook.command)) {
              return true;
            }
          }
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Install notification hook into Claude Code settings
   */
  async installHook(configPath, hookPath) {
    try {
      // Backup original config
      const backupPath = configPath + '.backup.' + Date.now();
      fs.copyFileSync(configPath, backupPath);
      
      // Read current config
      const config = this.readConfig(configPath);
      
      // Initialize hooks section if it doesn't exist
      if (!config.hooks) {
        config.hooks = {};
      }
      
      // Initialize Notification hooks if they don't exist
      if (!config.hooks.Notification) {
        config.hooks.Notification = [];
      }
      
      // Ensure Notification is an array
      if (!Array.isArray(config.hooks.Notification)) {
        config.hooks.Notification = [];
      }
      
      // Check if our hook is already configured
      if (this.isHookConfigured(configPath)) {
        console.log(chalk.yellow('⚠️  Claude Code notifications hook already configured.'));
        
        // Check if we're in an interactive terminal
        const isInteractive = process.stdin.isTTY && process.stdout.isTTY;
        
        if (!isInteractive) {
          console.log(chalk.gray('   Non-interactive mode: Updating existing hook configuration'));
          this._removeOurHook(config);
        } else {
          const { overwrite } = await require('inquirer').prompt([{
            type: 'confirm',
            name: 'overwrite',
            message: 'Update existing hook configuration?',
            default: false
          }]);
          
          if (!overwrite) {
            fs.unlinkSync(backupPath); // Remove backup
            return false;
          }
          
          // Remove existing hook
          this._removeOurHook(config);
        }
      }
      
      // Add our hook to Notification
      const ourHookConfig = {
        hooks: [
          {
            type: 'command',
            command: `node "${hookPath}"`
          }
        ]
      };
      
      config.hooks.Notification.push(ourHookConfig);
      
      // Write updated config
      this.writeConfig(configPath, config);
      
      // Verify installation
      if (this.isHookConfigured(configPath)) {
        console.log(chalk.green(`✅ Hook installed: ${hookPath}`));
        fs.unlinkSync(backupPath); // Remove backup
        return true;
      } else {
        // Restore backup on failure
        fs.copyFileSync(backupPath, configPath);
        fs.unlinkSync(backupPath);
        throw new Error('Hook installation verification failed');
      }
      
    } catch (error) {
      throw new Error(`Could not install hook: ${error.message}`);
    }
  }

  /**
   * Remove notification hook from Claude Code settings
   */
  async removeHook(configPath) {
    try {
      // Backup original config
      const backupPath = configPath + '.backup.' + Date.now();
      fs.copyFileSync(configPath, backupPath);
      
      // Read current config
      const config = this.readConfig(configPath);
      
      const removed = this._removeOurHook(config);
      
      if (removed) {
        // Write updated config
        this.writeConfig(configPath, config);
        
        fs.unlinkSync(backupPath); // Remove backup
        console.log(chalk.green('✅ Hook removed'));
        return true;
      } else {
        fs.unlinkSync(backupPath); // Remove backup
        console.log(chalk.gray('ℹ️  No hook was configured'));
        return false;
      }
      
    } catch (error) {
      throw new Error(`Could not remove hook: ${error.message}`);
    }
  }

  /**
   * Get hook configuration details
   */
  getHookInfo(configPath) {
    try {
      const config = this.readConfig(configPath);
      
      if (!config.hooks || !config.hooks.Notification) {
        return {
          configured: false,
          hookPath: null,
          exists: false,
          isOurs: false
        };
      }
      
      // Find our hook in the Notification array
      let hookPath = null;
      const notificationHooks = config.hooks.Notification;
      
      if (Array.isArray(notificationHooks)) {
        for (const hookConfig of notificationHooks) {
          if (hookConfig.hooks && Array.isArray(hookConfig.hooks)) {
            for (const hook of hookConfig.hooks) {
              if (hook.type === 'command' && hook.command && this._isOurHookCommand(hook.command)) {
                // Extract path from command (remove 'node "' and '"')
                hookPath = hook.command.replace(/^node\s+"([^"]+)".*$/, '$1');
                break;
              }
            }
          }
          if (hookPath) break;
        }
      }
      
      if (!hookPath) {
        return {
          configured: false,
          hookPath: null,
          exists: false,
          isOurs: false
        };
      }
      
      const exists = fs.existsSync(hookPath);
      const isOurs = exists ? this._isOurHook(hookPath) : false;
      
      return {
        configured: true,
        hookPath,
        exists,
        isOurs
      };
      
    } catch (error) {
      return {
        configured: false,
        hookPath: null,
        exists: false,
        isOurs: false,
        error: error.message
      };
    }
  }

  /**
   * Create Claude Code settings directory if it doesn't exist
   */
  ensureConfigDirectory() {
    const configDir = path.join(os.homedir(), '.claude');
    
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }
    
    return configDir;
  }

  /**
   * Create default Claude Code settings with hook
   */
  createDefaultConfig(hookPath) {
    const configDir = this.ensureConfigDirectory();
    const configPath = path.join(configDir, 'settings.json');
    
    const defaultConfig = {
      hooks: {
        Notification: [
          {
            hooks: [
              {
                type: 'command',
                command: `node "${hookPath}"`
              }
            ]
          }
        ]
      }
    };
    
    this.writeConfig(configPath, defaultConfig);
    return configPath;
  }

  /**
   * Check if a hook file is our notification hook
   */
  _isOurHook(hookPath) {
    try {
      const content = fs.readFileSync(hookPath, 'utf8');
      
      // Check for our signature in the file
      return content.includes('claude-code-notifications') || 
             content.includes('claude-code-companion') ||
             content.includes('CC_NOTIFICATIONS_') ||
             content.includes('ccnotify') ||
             content.includes('cccompanion');
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a hook command is our notification hook command
   */
  _isOurHookCommand(command) {
    // Check if the command contains our hook script patterns
    return command.includes('claude-code-hook') ||
           command.includes('ccnotify') ||
           command.includes('cccompanion') ||
           command.includes('claude-code-notifications') ||
           command.includes('claude-code-companion');
  }

  /**
   * Remove our hook from the config object
   */
  _removeOurHook(config) {
    if (!config.hooks || !config.hooks.Notification) {
      return false;
    }

    const notificationHooks = config.hooks.Notification;
    if (!Array.isArray(notificationHooks)) {
      return false;
    }

    let removed = false;
    
    // Filter out our hooks
    for (let i = notificationHooks.length - 1; i >= 0; i--) {
      const hookConfig = notificationHooks[i];
      if (hookConfig.hooks && Array.isArray(hookConfig.hooks)) {
        
        // Filter out our hook commands
        const filteredHooks = hookConfig.hooks.filter(hook => {
          if (hook.type === 'command' && hook.command && this._isOurHookCommand(hook.command)) {
            removed = true;
            return false; // Remove this hook
          }
          return true; // Keep this hook
        });
        
        // Update or remove the hook config
        if (filteredHooks.length === 0) {
          // Remove entire hook config if no hooks left
          notificationHooks.splice(i, 1);
        } else {
          // Update with filtered hooks
          hookConfig.hooks = filteredHooks;
        }
      }
    }

    // Remove Notification array if empty
    if (notificationHooks.length === 0) {
      delete config.hooks.Notification;
    }

    // Remove hooks object if empty
    if (Object.keys(config.hooks).length === 0) {
      delete config.hooks;
    }

    return removed;
  }

  /**
   * List all possible config locations and their status
   */
  listConfigLocations() {
    return this.configLocations.map(location => ({
      path: location,
      exists: fs.existsSync(location),
      readable: fs.existsSync(location) ? this._isReadable(location) : false
    }));
  }

  /**
   * Check if a file is readable
   */
  _isReadable(filePath) {
    try {
      fs.accessSync(filePath, fs.constants.R_OK);
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
module.exports = new ClaudeConfigManager();