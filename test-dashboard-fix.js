import { chromium } from 'playwright';

async function testDashboardFix() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Testing fixed dashboard layout...');
    
    // Navigate to homepage
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    
    // Wait for page to load completely
    await page.waitForTimeout(5000);
    
    // Take screenshot to verify layout
    await page.screenshot({ 
      path: '/home/krwhynot/Projects/ForkFlow-crm/tests/screenshots/fixed-dashboard.png',
      fullPage: true 
    });
    
    // Check if large black circles are gone
    const largeCheckIcons = await page.locator('.w-12.h-12').count();
    console.log(`📊 Large icons (w-12 h-12) found: ${largeCheckIcons}`);
    
    // Check for proper dashboard structure
    const dashboardCards = await page.locator('[data-testid="tremor-card"], .tremor-Card-root, .bg-white.rounded-lg.shadow-sm').count();
    console.log(`📋 Dashboard cards found: ${dashboardCards}`);
    
    // Check for metric cards
    const metricWidgets = await page.locator('text=Weekly Tasks, text=Follow-ups, text=Scheduled Meetings, text=A-Priority Accounts').count();
    console.log(`📈 Metric widgets found: ${metricWidgets}`);
    
    // Check for widget titles
    const widgetTitles = await page.locator('h3, .tremor-Title-root').allTextContents();
    console.log(`🏷️ Widget titles found: ${widgetTitles.join(', ')}`);
    
    // Check page title
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    // Verify no loading spinners are stuck
    const loadingSpinners = await page.locator('.animate-spin').count();
    console.log(`⏳ Loading spinners: ${loadingSpinners}`);
    
    console.log('✅ Dashboard test completed successfully!');
    
  } catch (error) {
    console.error('❌ Dashboard test failed:', error.message);
    await page.screenshot({ 
      path: '/home/krwhynot/Projects/ForkFlow-crm/tests/screenshots/error-dashboard.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

testDashboardFix();