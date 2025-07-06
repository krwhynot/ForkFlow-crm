import { chromium } from 'playwright';

async function debugHomepage() {
  console.log('🔍 Debugging ForkFlow CRM Homepage Loading...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => {
    console.log(`[BROWSER] ${msg.type()}: ${msg.text()}`);
  });

  // Listen for errors
  page.on('pageerror', error => {
    console.log(`[ERROR] ${error.message}`);
  });

  try {
    console.log('📍 Navigating to homepage...');
    await page.goto('http://localhost:5173/');
    
    // Wait a bit and check what's loaded
    await page.waitForTimeout(5000);
    
    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Check if there are any visible elements
    const bodyText = await page.locator('body').textContent();
    console.log(`Body text length: ${bodyText?.length || 0} characters`);
    
    // Check if loading or error elements are present
    const loadingSpinner = await page.locator('[class*="loading"], [class*="spinner"], .animate-spin').count();
    console.log(`Loading spinners found: ${loadingSpinner}`);
    
    // Check for error messages
    const errorMessages = await page.locator('[class*="error"], .error').count();
    console.log(`Error messages: ${errorMessages}`);
    
    // Check for authentication elements
    const loginElements = await page.locator('input[type="email"], input[type="password"], [class*="login"]').count();
    console.log(`Login elements: ${loginElements}`);
    
    // Check the URL after load
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'tests/screenshots/debug-homepage.png', 
      fullPage: true 
    });
    
    // Check network requests
    console.log('\n📍 Checking network activity...');
    
    // Wait for any pending network requests
    await page.waitForLoadState('networkidle');
    
    // Get HTML content to see what's actually loaded
    const htmlContent = await page.content();
    const hasReactApp = htmlContent.includes('react') || htmlContent.includes('vite');
    console.log(`React/Vite detected: ${hasReactApp}`);
    
    const hasMainContent = htmlContent.includes('dashboard') || htmlContent.includes('metric');
    console.log(`Dashboard content detected: ${hasMainContent}`);

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await browser.close();
  }
}

debugHomepage().catch(console.error);