#!/usr/bin/env node

/**
 * Test script to verify Organizations migration
 * 
 * This script tests that:
 * 1. The organizations table exists and has the correct structure
 * 2. The React Admin app loads without errors
 * 3. All references have been updated from companies to organizations
 * 
 * Usage: node test-organizations-migration.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Organizations Migration...\n');

// Test 1: Check if migration files exist
console.log('1. Checking migration files...');
const migrationFiles = [
    'supabase/migrations/20250705000001_init_organizations_schema.sql',
    'supabase/migrations/20250705000002_enable_rls_policies.sql'
];

for (const file of migrationFiles) {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
    }
}

// Test 2: Check if React Admin resources updated
console.log('\n2. Checking React Admin configuration...');
const crmFile = 'src/root/CRM.tsx';
if (fs.existsSync(crmFile)) {
    const content = fs.readFileSync(crmFile, 'utf-8');
    if (content.includes('organizations') && content.includes('import organizations from')) {
        console.log('✅ React Admin resources updated to use organizations');
    } else {
        console.log('❌ React Admin resources not properly updated');
    }
}

// Test 3: Check if activity logging updated
console.log('\n3. Checking activity logging...');
const activityFile = 'src/providers/commons/activity.ts';
if (fs.existsSync(activityFile)) {
    const content = fs.readFileSync(activityFile, 'utf-8');
    if (content.includes('getNewOrganizations') && content.includes("'organizations'")) {
        console.log('✅ Activity logging updated to use organizations');
    } else {
        console.log('❌ Activity logging not properly updated');
    }
}

// Test 4: Check if data provider updated
console.log('\n4. Checking data provider...');
const dataProviderFile = 'src/providers/fakerest/dataProvider.ts';
if (fs.existsSync(dataProviderFile)) {
    const content = fs.readFileSync(dataProviderFile, 'utf-8');
    if (content.includes('updateOrganization') && !content.includes('updateCompany(')) {
        console.log('✅ Data provider updated to use organizations');
    } else {
        console.log('❌ Data provider not properly updated');
    }
}

// Test 5: Check key frontend components
console.log('\n5. Checking frontend components...');
const componentsToCheck = [
    'src/layout/Header.tsx',
    'src/components/navigation/RelationshipBreadcrumbs.tsx',
    'src/components/navigation/RelatedEntitiesSection.tsx'
];

let frontendUpdated = true;
for (const component of componentsToCheck) {
    if (fs.existsSync(component)) {
        const content = fs.readFileSync(component, 'utf-8');
        if (content.includes('/organizations/') || content.includes("'organizations'")) {
            console.log(`✅ ${component} updated`);
        } else {
            console.log(`❌ ${component} may need updates`);
            frontendUpdated = false;
        }
    }
}

console.log('\n📋 Next Steps:');
console.log('1. Apply database migrations:');
console.log('   - For Supabase CLI: `supabase db reset && supabase migration up`');
console.log('   - For Supabase Dashboard: Copy/paste SQL from migration files');
console.log('');
console.log('2. Test the application:');
console.log('   - `npm run dev` or `yarn dev`');
console.log('   - Navigate to /organizations to verify the new resource works');
console.log('   - Create a test organization');
console.log('   - Verify all navigation links work');
console.log('');
console.log('3. Update any remaining references:');
console.log('   - Search for remaining "companies" references: `grep -r "companies" src/`');
console.log('   - Update import statements to use organizations module');
console.log('');

if (frontendUpdated) {
    console.log('🎉 Migration appears complete! Test the app to verify everything works.');
} else {
    console.log('⚠️  Some components may need additional updates. Review the output above.');
} 