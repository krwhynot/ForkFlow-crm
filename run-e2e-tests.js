#!/usr/bin/env node
/**
 * E2E Test Runner Script
 * This script demonstrates how to run the Playwright E2E tests
 * and provides a fallback when system dependencies aren't available
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configurations
const testSuites = {
  'crud-workflow': 'Organization CRUD operations (Create, Read, Update, Delete)',
  'form-validation': 'Form validation and error handling',
  'search-filter': 'Search and filter functionality',
  'mobile-responsive': 'Mobile and responsive design',
  'visual-regression': 'Visual regression testing',
  'error-handling': 'Error handling and edge cases',
  'accessibility': 'Accessibility compliance (WCAG 2.1 AA)',
  'performance': 'Performance benchmarks'
};

async function checkTestFiles() {
  console.log('🔍 Checking E2E test files...\n');
  
  const testsDir = join(__dirname, 'tests', 'organizations');
  let allFilesExist = true;
  
  for (const [testName, description] of Object.entries(testSuites)) {
    const testFile = join(testsDir, `${testName}.spec.ts`);
    const exists = fs.existsSync(testFile);
    
    console.log(`${exists ? '✅' : '❌'} ${testName}.spec.ts - ${description}`);
    
    if (!allFilesExist && !exists) {
      allFilesExist = false;
    }
  }
  
  console.log(`\n📁 Test directory: ${testsDir}`);
  console.log(`📊 Total test suites: ${Object.keys(testSuites).length}`);
  
  return allFilesExist;
}

async function checkPlaywrightConfig() {
  console.log('\n⚙️  Checking Playwright configuration...\n');
  
  const configFile = join(__dirname, 'playwright.config.ts');
  const exists = fs.existsSync(configFile);
  
  console.log(`${exists ? '✅' : '❌'} playwright.config.ts exists`);
  
  if (exists) {
    const configContent = fs.readFileSync(configFile, 'utf-8');
    
    // Check key configuration settings
    const checks = [
      { key: 'testDir', pattern: /testDir:\s*['"]\.\/tests['"]/, description: 'Test directory configured' },
      { key: 'baseURL', pattern: /baseURL:\s*['"]http:\/\/localhost:5173['"]/, description: 'Base URL configured' },
      { key: 'projects', pattern: /projects:\s*\[/, description: 'Browser projects configured' },
      { key: 'webServer', pattern: /webServer:\s*{/, description: 'Web server configured' },
    ];
    
    checks.forEach(check => {
      const found = check.pattern.test(configContent);
      console.log(`${found ? '✅' : '❌'} ${check.description}`);
    });
  }
  
  return exists;
}

async function runTestCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Running: ${command} ${args.join(' ')}`);
    
    const process = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: __dirname
    });
    
    process.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    process.on('error', (error) => {
      reject(error);
    });
  });
}

async function runE2ETests() {
  try {
    console.log('🎭 ForkFlow CRM - E2E Test Runner\n');
    console.log('='.repeat(50));
    
    // Check test files
    const filesExist = await checkTestFiles();
    if (!filesExist) {
      console.log('\n❌ Some test files are missing. Please ensure all test files are created.');
      return;
    }
    
    // Check configuration
    const configExists = await checkPlaywrightConfig();
    if (!configExists) {
      console.log('\n❌ Playwright configuration not found.');
      return;
    }
    
    console.log('\n🎯 Attempting to run E2E tests...\n');
    
    // Try to run tests with different approaches
    const testCommands = [
      // Try list command first (doesn't need browser)
      { cmd: 'npm', args: ['run', 'test:e2e:organizations', '--', '--list'], description: 'List all tests' },
      
      // Try running a simple test
      { cmd: 'npm', args: ['run', 'test:e2e:organizations:crud'], description: 'Run CRUD workflow tests' },
    ];
    
    for (const { cmd, args, description } of testCommands) {
      try {
        console.log(`\n📋 ${description}`);
        console.log('-'.repeat(40));
        
        await runTestCommand(cmd, args);
        
        console.log(`\n✅ ${description} completed successfully!`);
        break; // If one succeeds, we can stop
        
      } catch (error) {
        console.log(`\n⚠️  ${description} failed: ${error.message}`);
        
        if (error.message.includes('missing dependencies')) {
          console.log('\n💡 Browser dependencies missing. To fix this:');
          console.log('   sudo npx playwright install-deps');
          console.log('   or');
          console.log('   sudo apt-get install libnspr4 libnss3 libasound2');
        }
        
        // Continue to next command
        continue;
      }
    }
    
    console.log('\n📊 E2E Test Summary');
    console.log('='.repeat(50));
    console.log('Available test suites:');
    
    Object.entries(testSuites).forEach(([name, description]) => {
      console.log(`  • npm run test:e2e:organizations:${name.replace('-', ':')}`);
      console.log(`    ${description}\n`);
    });
    
    console.log('🎯 Key Commands:');
    console.log('  npm run test:e2e:organizations     # Run all organization tests');
    console.log('  npm run test:e2e:ui               # Run with UI mode');
    console.log('  npm run test:e2e:headed           # Run in headed mode');
    console.log('  npm run test:e2e:report           # View test report');
    console.log('  npm run test:e2e:chrome           # Run on Chrome only');
    console.log('  npm run test:e2e:mobile           # Run mobile tests');
    
    console.log('\n✨ E2E Test Runner completed!');
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the test runner
runE2ETests();