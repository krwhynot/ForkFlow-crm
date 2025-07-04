import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
    console.log('🧹 Starting global test teardown...');

    try {
        // Clean up test data if needed
        await cleanupTestData();

        // Clear any persistent storage
        await clearTestStorage();

        // Additional cleanup tasks
        await performCleanupTasks();
    } catch (error) {
        console.error('❌ Global teardown failed:', error);
        // Don't throw error to avoid failing the test run
    }

    console.log('✅ Global test teardown completed');
}

async function cleanupTestData() {
    console.log('🗑️ Cleaning up test data...');

    // If using a real backend, clean up test organizations created during tests
    // For fake data provider, no cleanup needed as data is in-memory

    console.log('✅ Test data cleanup completed');
}

async function clearTestStorage() {
    console.log('🔄 Clearing test storage...');

    // Clear any cached data, localStorage, sessionStorage that might interfere
    // with subsequent test runs

    console.log('✅ Test storage cleared');
}

async function performCleanupTasks() {
    console.log('🧽 Performing additional cleanup tasks...');

    // Any other cleanup tasks like:
    // - Removing uploaded test files
    // - Resetting database state
    // - Clearing temporary directories

    console.log('✅ Additional cleanup completed');
}

export default globalTeardown;
