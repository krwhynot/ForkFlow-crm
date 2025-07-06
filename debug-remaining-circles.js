import { chromium } from 'playwright';

async function debugRemainingCircles() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Debugging remaining large shapes...');
    
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Look for all large elements that might be causing the issue
    const largeSVGs = await page.locator('svg.w-12, svg.h-12').count();
    console.log(`🖼️ Large SVGs: ${largeSVGs}`);
    
    const largeIcons = await page.locator('[class*="w-12"], [class*="h-12"]').count();
    console.log(`🔲 All large elements (w-12/h-12): ${largeIcons}`);
    
    // Check for chart containers
    const chartContainers = await page.locator('[class*="chart"], [class*="Chart"]').count();
    console.log(`📊 Chart containers: ${chartContainers}`);
    
    // Look for any Nivo chart elements
    const nivoCharts = await page.locator('[class*="nivo"]').count();
    console.log(`📈 Nivo chart elements: ${nivoCharts}`);
    
    // Check for canvas elements (charts often use canvas)
    const canvasElements = await page.locator('canvas').count();
    console.log(`🎨 Canvas elements: ${canvasElements}`);
    
    // Get the HTML of areas that might have large shapes
    const widgetContents = await page.locator('.tremor-Card-root, [data-testid="tremor-card"]').allTextContents();
    console.log(`📝 Widget contents: ${widgetContents.slice(0, 5).join(' | ')}`);
    
    // Check for specific error messages or loading states
    const errorTexts = await page.locator('text=No data, text=Loading, text=Error').count();
    console.log(`⚠️ Error/loading states: ${errorTexts}`);
    
    // Take a focused screenshot of just the problematic area
    await page.screenshot({ 
      path: '/home/krwhynot/Projects/ForkFlow-crm/tests/screenshots/debug-circles.png',
      fullPage: true 
    });
    
    console.log('✅ Debug completed!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

debugRemainingCircles();