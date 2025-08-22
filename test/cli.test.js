#!/usr/bin/env node

/**
 * CLI Integration Tests for claude-code-notifications
 * 
 * Tests the main CLI functionality without requiring a real backend
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

// Test configuration
const CLI_PATH = path.join(__dirname, '..', 'bin', 'ccnotify.js');
const TEST_TEMP_DIR = path.join(os.tmpdir(), 'ccnotify-test-' + Date.now());

let testsPassed = 0;
let testsFailed = 0;

console.log('🧪 Running CLI Integration Tests...\n');

/**
 * Helper function to run CLI commands
 */
function runCLI(args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [CLI_PATH, ...args], {
      stdio: 'pipe',
      env: { ...process.env, ...options.env },
      timeout: options.timeout || 10000
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        code,
        stdout,
        stderr,
        success: code === 0
      });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

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

function expectContains(text, substring, message) {
  if (!text.includes(substring)) {
    throw new Error(message || `Expected text to contain "${substring}"`);
  }
}

/**
 * Setup test environment
 */
async function setup() {
  await fs.ensureDir(TEST_TEMP_DIR);
  process.env.HOME = TEST_TEMP_DIR; // Redirect config files to test directory
}

/**
 * Cleanup test environment
 */
async function cleanup() {
  await fs.remove(TEST_TEMP_DIR);
}

/**
 * Test Suite
 */
async function runTests() {
  await setup();

  // Test 1: CLI Help
  await test('CLI shows help by default', async () => {
    const result = await runCLI([]);
    expect(result.code, 0, 'Help should return exit code 0');
    expectContains(result.stdout, 'Claude Code push notifications', 'Help should show description');
    expectContains(result.stdout, 'Commands:', 'Help should show commands');
  });

  // Test 2: Version command
  await test('CLI shows version', async () => {
    const result = await runCLI(['--version']);
    expect(result.code, 0, 'Version should return exit code 0');
    expectContains(result.stdout, '1.0.0', 'Should show correct version');
  });

  // Test 3: Config command
  await test('Config command works', async () => {
    const result = await runCLI(['config']);
    expect(result.code, 0, 'Config should return exit code 0');
    expectContains(result.stdout, 'Current Configuration', 'Should show config header');
    expectContains(result.stdout, 'Not paired', 'Should show not paired initially');
  });

  // Test 4: Status command (no pairing)
  await test('Status command shows not paired', async () => {
    const result = await runCLI(['status']);
    expect(result.code, 0, 'Status should return exit code 0');
    expectContains(result.stdout, 'Device Pairing', 'Should check device pairing');
    expectContains(result.stdout, 'No device paired', 'Should show not paired');
  });

  // Test 5: Invalid pairing code format
  await test('Pair command validates code format', async () => {
    const result = await runCLI(['pair', '123']);
    expect(result.code, 1, 'Should fail with invalid code');
    expectContains(result.stderr, 'Invalid pairing code format', 'Should show validation error');
  });

  // Test 6: Pair command with unreachable server
  await test('Pair command handles server connection error', async () => {
    const result = await runCLI(['pair', '123456'], {
      env: { CC_NOTIFICATIONS_SERVER: 'http://localhost:9999' }
    });
    expect(result.code, 1, 'Should fail with unreachable server');
    expectContains(result.stderr, 'Cannot reach backend server', 'Should show connection error');
  });

  // Test 7: Test command without pairing
  await test('Test command requires pairing', async () => {
    const result = await runCLI(['test']);
    expect(result.code, 1, 'Should fail without pairing');
    expectContains(result.stderr, 'No device paired', 'Should show pairing required error');
  });

  // Test 8: Setup command (dry run)
  await test('Setup command detects missing Claude Code config', async () => {
    const result = await runCLI(['setup']);
    expect(result.code, 1, 'Should fail without Claude Code config');
    expectContains(result.stderr, 'Could not find Claude Code configuration', 'Should show config not found error');
  });

  // Test 9: Help for specific commands
  await test('Pair command help works', async () => {
    const result = await runCLI(['pair', '--help']);
    expect(result.code, 0, 'Help should return exit code 0');
    expectContains(result.stdout, 'Pair with iPhone using 6-digit code', 'Should show pair command description');
  });

  // Test 10: Environment variable handling
  await test('CLI respects environment variables', async () => {
    const result = await runCLI(['config'], {
      env: { 
        CC_NOTIFICATIONS_SERVER: 'https://custom-server.com',
        CC_NOTIFICATIONS_DEVICE_ID: 'test-device-123'
      }
    });
    expect(result.code, 0, 'Config should work with env vars');
    expectContains(result.stdout, 'https://custom-server.com', 'Should show custom server');
    expectContains(result.stdout, 'test-device-123', 'Should show device ID from env');
  });

  await cleanup();

  // Test Summary
  console.log('\n📊 Test Results:');
  console.log(`✅ Passed: ${testsPassed}`);
  console.log(`❌ Failed: ${testsFailed}`);
  console.log(`📈 Total: ${testsPassed + testsFailed}`);

  if (testsFailed > 0) {
    console.log('\n❌ Some tests failed. Please fix the issues above.');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! CLI is working correctly.');
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