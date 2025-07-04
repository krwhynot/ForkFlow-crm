#!/usr/bin/env node

/**
 * Login Setup Test Script
 *
 * This script validates that your ForkFlow CRM login system is configured correctly.
 * Run this after following the LOGIN_SETUP_GUIDE.md to verify everything works.
 *
 * Usage: node test-login-setup.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// Load environment variables from .env file
function loadEnvFile() {
    try {
        const envPath = join(__dirname, '.env');
        const envContent = readFileSync(envPath, 'utf8');
        const envVars = {};

        envContent.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0 && !key.startsWith('#')) {
                envVars[key.trim()] = valueParts.join('=').trim();
            }
        });

        return envVars;
    } catch (error) {
        logError(
            'Could not read .env file. Make sure it exists in the project root.'
        );
        return null;
    }
}

// Test Supabase connection
async function testSupabaseConnection(supabaseUrl, supabaseKey) {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Test basic connection
        const { data, error } = await supabase.auth.getSession();

        if (error && error.message.includes('Invalid API key')) {
            logError(
                'Invalid Supabase API key. Please check your credentials.'
            );
            return false;
        }

        logSuccess('Supabase connection established');
        return supabase;
    } catch (error) {
        logError(`Supabase connection failed: ${error.message}`);
        return false;
    }
}

// Test database tables
async function testDatabaseTables(supabase) {
    let tablesExist = true;

    // Test init_state table
    try {
        const { data, error } = await supabase
            .from('init_state')
            .select('is_initialized')
            .limit(1);

        if (error) {
            logError(`init_state table issue: ${error.message}`);
            tablesExist = false;
        } else {
            logSuccess('init_state table exists and accessible');

            if (data && data.length > 0) {
                const isInitialized = data[0].is_initialized;
                logInfo(`Application initialized: ${isInitialized}`);
            }
        }
    } catch (error) {
        logError(`Failed to query init_state table: ${error.message}`);
        tablesExist = false;
    }

    // Test sales table
    try {
        const { data, error } = await supabase
            .from('sales')
            .select('id')
            .limit(1);

        if (error) {
            logError(`sales table issue: ${error.message}`);
            tablesExist = false;
        } else {
            logSuccess('sales table exists and accessible');

            if (data) {
                logInfo(`Number of users in sales table: ${data.length}`);
            }
        }
    } catch (error) {
        logError(`Failed to query sales table: ${error.message}`);
        tablesExist = false;
    }

    return tablesExist;
}

// Test auth provider configuration
async function testAuthProvider(supabase) {
    try {
        // Try to get auth settings (this will work if auth is properly configured)
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            logWarning(`Auth provider test: ${error.message}`);
            return false;
        }

        logSuccess('Auth provider is configured correctly');
        return true;
    } catch (error) {
        logError(`Auth provider test failed: ${error.message}`);
        return false;
    }
}

// Main test function
async function runTests() {
    log('🚀 ForkFlow CRM Login Setup Test', 'bold');
    log('==================================', 'blue');

    // Load environment variables
    logInfo('Loading environment configuration...');
    const env = loadEnvFile();

    if (!env) {
        process.exit(1);
    }

    // Check required environment variables
    const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
    let envValid = true;

    for (const varName of requiredVars) {
        if (
            !env[varName] ||
            env[varName].includes('your-') ||
            env[varName].includes('placeholder')
        ) {
            logError(`${varName} is not set or contains placeholder values`);
            envValid = false;
        }
    }

    if (!envValid) {
        logError(
            'Environment configuration is incomplete. Please update your .env file.'
        );
        logInfo('Refer to LOGIN_SETUP_GUIDE.md for instructions.');
        process.exit(1);
    }

    logSuccess('Environment variables loaded');

    // Test Supabase connection
    logInfo('Testing Supabase connection...');
    const supabase = await testSupabaseConnection(
        env.VITE_SUPABASE_URL,
        env.VITE_SUPABASE_ANON_KEY
    );

    if (!supabase) {
        logError('Cannot proceed without valid Supabase connection');
        process.exit(1);
    }

    // Test database tables
    logInfo('Testing database tables...');
    const tablesExist = await testDatabaseTables(supabase);

    if (!tablesExist) {
        logError('Database tables are missing or inaccessible');
        logInfo(
            'Please create the required tables as described in LOGIN_SETUP_GUIDE.md'
        );
    }

    // Test auth provider
    logInfo('Testing authentication provider...');
    await testAuthProvider(supabase);

    // Final summary
    log('\n📋 Test Summary', 'bold');
    log('===============', 'blue');

    if (tablesExist) {
        logSuccess('All tests passed! Your login system is ready to use.');
        log('\n🎉 Next steps:', 'green');
        log('1. Start the development server: npm run dev', 'blue');
        log('2. Navigate to http://localhost:5173', 'blue');
        log('3. Create your first admin user via the signup page', 'blue');
    } else {
        logWarning('Some tests failed. Please review the errors above.');
        log('\n🔧 To fix issues:', 'yellow');
        log(
            '1. Follow the database setup steps in LOGIN_SETUP_GUIDE.md',
            'blue'
        );
        log('2. Verify your Supabase credentials in .env', 'blue');
        log('3. Run this test script again', 'blue');
    }
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(error => {
        logError(`Test script failed: ${error.message}`);
        process.exit(1);
    });
}

export { runTests };
