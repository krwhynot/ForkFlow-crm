#!/usr/bin/env node
/**
 * Script to verify lazy loading implementation
 * This script checks if the lazy loading components are properly structured
 */

import { promises as fs } from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// Files to check
const filesToCheck = [
  'src/common/LoadingComponent.tsx',
  'src/common/LazyLoadingUtils.tsx',
  'src/root/LazyResources.tsx',
  'src/root/CRM.tsx',
  'vite.config.ts',
];

async function verifyFile(filePath) {
  try {
    const fullPath = path.join(projectRoot, filePath);
    const content = await fs.readFile(fullPath, 'utf8');
    
    console.log(`✅ ${filePath} - File exists (${content.length} chars)`);
    
    // Check for key patterns
    if (filePath.includes('LazyResources')) {
      const hasLazyImports = content.includes('React.lazy');
      const hasSuspense = content.includes('Suspense');
      console.log(`   - React.lazy usage: ${hasLazyImports ? '✅' : '❌'}`);
      console.log(`   - Suspense usage: ${hasSuspense ? '✅' : '❌'}`);
    }
    
    if (filePath.includes('vite.config')) {
      const hasManualChunks = content.includes('manualChunks');
      const hasRollupOptions = content.includes('rollupOptions');
      console.log(`   - Manual chunks config: ${hasManualChunks ? '✅' : '❌'}`);
      console.log(`   - Rollup options: ${hasRollupOptions ? '✅' : '❌'}`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ ${filePath} - Error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 Verifying ForkFlow CRM Bundle Optimization Implementation\n');
  
  let allFilesOk = true;
  
  for (const file of filesToCheck) {
    const fileOk = await verifyFile(file);
    allFilesOk = allFilesOk && fileOk;
    console.log();
  }
  
  // Check package.json for new scripts
  try {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageContent = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageContent);
    
    const bundleScripts = [
      'bundle:analyze',
      'bundle:visualize', 
      'bundle:size',
      'bundle:stats'
    ];
    
    console.log('📦 Package.json bundle scripts:');
    bundleScripts.forEach(script => {
      const exists = packageJson.scripts && packageJson.scripts[script];
      console.log(`   - ${script}: ${exists ? '✅' : '❌'}`);
    });
    
  } catch (error) {
    console.log(`❌ Error checking package.json: ${error.message}`);
    allFilesOk = false;
  }
  
  console.log(`\n${allFilesOk ? '🎉' : '❌'} Implementation ${allFilesOk ? 'verified successfully' : 'has issues'}`);
  
  if (allFilesOk) {
    console.log('\n📋 Next steps:');
    console.log('1. Run `npm run bundle:size` to check current bundle size');
    console.log('2. Run `npm run bundle:analyze` to see detailed chunk breakdown');
    console.log('3. Test the app to ensure lazy loading works correctly');
    console.log('4. Compare bundle sizes before and after optimization');
  }
  
  process.exit(allFilesOk ? 0 : 1);
}

main().catch(console.error);