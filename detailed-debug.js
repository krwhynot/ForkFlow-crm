import { chromium } from 'playwright';

async function detailedDebug() {
  console.log('🔍 Detailed Debugging of ForkFlow CRM...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all console messages with more detail
  page.on('console', msg => {
    console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
    if (msg.args().length > 0) {
      console.log(`  Args: ${msg.args().map(arg => arg.toString()).join(', ')}`);
    }
  });

  // Capture page errors with stack traces
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.name}: ${error.message}`);
    console.log(`Stack: ${error.stack}`);
  });

  // Capture failed requests
  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED] ${request.method()} ${request.url()}`);
    console.log(`  Failure: ${request.failure()?.errorText}`);
  });

  try {
    console.log('📍 Navigating with extended wait...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    // Wait longer to see if content eventually loads
    console.log('⏳ Waiting 10 seconds for content to load...');
    await page.waitForTimeout(10000);
    
    // Check what's actually in the DOM
    const bodyContent = await page.evaluate(() => {
      return {
        html: document.body.innerHTML.substring(0, 1000),
        elements: Array.from(document.querySelectorAll('*')).length,
        reactRoot: !!document.querySelector('#root'),
        hasError: !!document.querySelector('.error, [class*="error"]'),
        hasLoader: !!document.querySelector('.loading, .spinner, [class*="loading"]')
      };
    });
    
    console.log('\n📊 DOM Analysis:');
    console.log(`  Total elements: ${bodyContent.elements}`);
    console.log(`  React root exists: ${bodyContent.reactRoot}`);
    console.log(`  Error elements: ${bodyContent.hasError}`);
    console.log(`  Loading elements: ${bodyContent.hasLoader}`);
    console.log(`  HTML preview: ${bodyContent.html.substring(0, 200)}...`);
    
    // Check for specific component selectors
    const componentCheck = await page.evaluate(() => {
      return {
        dashboard: !!document.querySelector('[class*="dashboard"]'),
        metricCard: !!document.querySelector('[class*="metric"]'),
        header: !!document.querySelector('header'),
        navigation: !!document.querySelector('nav'),
        button: document.querySelectorAll('button').length,
        divs: document.querySelectorAll('div').length
      };
    });
    
    console.log('\n🧩 Component Check:');
    Object.entries(componentCheck).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    // Try to see if react-admin is loaded
    const reactAdminCheck = await page.evaluate(() => {
      return {
        reactAdmin: typeof window.React !== 'undefined',
        raDataProvider: !!window.__RA_PROVIDER__,
        globalVars: Object.keys(window).filter(key => key.includes('RA') || key.includes('react')).slice(0, 5)
      };
    });
    
    console.log('\n⚛️ React-Admin Check:');
    console.log(`  React loaded: ${reactAdminCheck.reactAdmin}`);
    console.log(`  Data provider: ${reactAdminCheck.raDataProvider}`);
    console.log(`  Global vars: ${reactAdminCheck.globalVars.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Detailed debug error:', error);
  } finally {
    await browser.close();
  }
}

detailedDebug().catch(console.error);