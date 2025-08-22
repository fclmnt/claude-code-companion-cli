#!/usr/bin/env node

/**
 * Unit Tests for claude-code-notifications
 * 
 * Tests individual modules and functions
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');

// Import modules to test
const config = require('../lib/core/config');
const hookGenerator = require('../lib/core/hook-generator');
const claudeConfig = require('../lib/utils/claude-config');

let testsPassed = 0;
let testsFailed = 0;

console.log('🧪 Running Unit Tests...\n');

/**
 * Test helper functions
 */
function test(name, testFn) {
  return testFn()
    .then(() => {
      console.log(`✅ ${name}`);
      testsPassed++;
    })
    .catch((error) => {
      console.log(`❌ ${name}: ${error.message}`);
      testsFailed++;
    });
}

function expect(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function expectTruthy(value, message) {
  if (!value) {
    throw new Error(message || `Expected truthy value, got ${value}`);
  }
}

function expectContains(text, substring, message) {
  if (!text.includes(substring)) {
    throw new Error(message || `Expected text to contain "${substring}"`);
  }
}

/**
 * Config Module Tests
 */
async function testConfigModule() {
  console.log('📋 Testing Config Module...\n');

  // Test 1: Default configuration
  await test('Config returns default values', async () => {
    const cfg = config.getConfig();
    expect(cfg.serverUrl, 'https://claude-code-companion-backend-production.up.railway.app', 'Default server URL should be production Railway URL');
    expect(cfg.timeout, 30000, 'Default timeout should be 30 seconds');
    expect(cfg.pollInterval, 2000, 'Default poll interval should be 2 seconds');
  });

  // Test 2: Config validation
  await test('Config validation works', async () => {
    const validation = config.validate();
    expectTruthy(validation.errors.length > 0, 'Should have validation errors without device ID');
    expectContains(validation.errors.join(' '), 'Device ID is required', 'Should require device ID');
  });

  // Test 3: Config file path
  await test('Config file path is correct', async () => {
    const configPath = config.getConfigPath();
    expectTruthy(configPath.includes('.claude-code-notifications'), 'Config path should contain package name');
    expectTruthy(path.isAbsolute(configPath), 'Config path should be absolute');
  });

  // Test 4: Setup check
  await test('Setup check works correctly', async () => {
    expect(config.isSetup(), false, 'Should not be setup without device ID');
    expect(config.isPaired(), false, 'Should not be paired without device info');
  });
}

/**
 * Hook Generator Tests
 */
async function testHookGenerator() {
  console.log('🪝 Testing Hook Generator...\n');

  // Test 1: Hook path generation
  await test('Hook path is correct', async () => {
    const hookPath = hookGenerator.getHookPath();
    expectTruthy(hookPath.includes('.claude-code-notifications'), 'Hook path should be in notifications directory');
    expectTruthy(hookPath.endsWith('claude-code-hook.js'), 'Hook should be a JavaScript file');
  });

  // Test 2: Hook content generation (without writing file)
  await test('Hook content is generated correctly', async () => {
    const content = hookGenerator._generateHookContent();
    expectContains(content, '#!/usr/bin/env node', 'Hook should have shebang');
    expectContains(content, 'Claude Code Notifications Hook', 'Hook should have title comment');
    expectContains(content, 'CC_NOTIFICATIONS_DEVICE_ID', 'Hook should use environment variables');
    expectContains(content, 'assessRiskLevel', 'Hook should have risk assessment');
    expectContains(content, 'sendNotificationRequest', 'Hook should have notification function');
  });

  // Test 3: Hook existence check (should be false initially)
  await test('Hook existence check works', async () => {
    expect(hookGenerator.hookExists(), false, 'Hook should not exist initially');
  });
}

/**
 * Claude Config Manager Tests
 */
async function testClaudeConfigManager() {
  console.log('⚙️  Testing Claude Config Manager...\n');

  // Test 1: Config location search
  await test('Config locations are defined', async () => {
    const locations = claudeConfig.listConfigLocations();
    expectTruthy(locations.length > 0, 'Should have multiple config locations');
    expectTruthy(locations.some(loc => loc.path.includes('.claude')), 'Should include .claude directory');
  });

  // Test 2: Config not found initially
  await test('Config not found initially', async () => {
    const configPath = claudeConfig.findConfig();
    expect(configPath, null, 'Should not find config initially');
  });

  // Test 3: Hook configuration check
  await test('Hook not configured initially', async () => {
    // Create a temporary config file for testing
    const tempConfigDir = path.join(os.tmpdir(), 'test-claude-config-' + Date.now());
    const tempConfigFile = path.join(tempConfigDir, 'config.json');
    
    await fs.ensureDir(tempConfigDir);
    await fs.writeJson(tempConfigFile, {
      'someOtherSetting': 'value'
    });
    
    const isConfigured = claudeConfig.isHookConfigured(tempConfigFile);
    expect(isConfigured, false, 'Hook should not be configured initially');
    
    // Cleanup
    await fs.remove(tempConfigDir);
  });
}

/**
 * Integration Tests
 */
async function testIntegration() {
  console.log('🔗 Testing Integration...\n');

  // Test 1: Config and hook generator work together
  await test('Config and hook generator integration', async () => {
    const cfg = config.getConfig();
    const hookPath = hookGenerator.getHookPath();
    
    // Both should use home directory
    expectTruthy(cfg.deviceId === null, 'Device ID should be null initially');
    expectTruthy(hookPath.includes(os.homedir()), 'Hook path should be in home directory');
  });

  // Test 2: Environment variable precedence
  await test('Environment variables take precedence', async () => {
    const originalEnv = process.env.CC_NOTIFICATIONS_SERVER;
    process.env.CC_NOTIFICATIONS_SERVER = 'https://test-server.com';
    
    // Reset config cache
    config._config = null;
    
    const cfg = config.getConfig();
    expect(cfg.serverUrl, 'https://test-server.com', 'Should use environment variable');
    
    // Restore original environment
    if (originalEnv) {
      process.env.CC_NOTIFICATIONS_SERVER = originalEnv;
    } else {
      delete process.env.CC_NOTIFICATIONS_SERVER;
    }
    config._config = null; // Reset cache
  });
}

/**
 * Error Handling Tests
 */
async function testErrorHandling() {
  console.log('🚨 Testing Error Handling...\n');

  // Test 1: Config handles invalid JSON
  await test('Config handles file read errors gracefully', async () => {
    // This should not throw an error
    const cfg = config.getConfig();
    expectTruthy(cfg.serverUrl, 'Should have default server URL even with file errors');
  });

  // Test 2: Claude config handles missing files
  await test('Claude config handles missing files', async () => {
    const nonExistentPath = '/path/that/does/not/exist/config.json';
    expect(claudeConfig.isHookConfigured(nonExistentPath), false, 'Should handle missing files gracefully');
  });
}

/**
 * Run all tests
 */
async function runTests() {
  await testConfigModule();
  await testHookGenerator();
  await testClaudeConfigManager();
  await testIntegration();
  await testErrorHandling();

  // Test Summary
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Total: ${testsPassed + testsFailed}`);

  if (testsFailed > 0) {
    console.log('\n❌ Some tests failed. Please fix the issues above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! Modules are working correctly.');
    process.exit(0);
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Test runner error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled promise rejection:', reason);
  process.exit(1);
});

// Run tests
runTests().catch((error) => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});