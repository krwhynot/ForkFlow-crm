import { chromium } from 'playwright';

async function deepDebugCharts() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('🔍 Deep debugging chart elements...');
    
    // Enable console logging
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);
    
    // Check for Tremor chart elements specifically
    const tremorElements = await page.locator('[class*="tremor"]').count();
    console.log(`🎛️ Tremor elements: ${tremorElements}`);
    
    // Look for DonutChart specifically
    const donutCharts = await page.locator('[class*="donut"], [class*="Donut"]').count();
    console.log(`🍩 Donut chart elements: ${donutCharts}`);
    
    // Check for SVG paths (which charts use)
    const svgPaths = await page.locator('svg path').count();
    console.log(`📈 SVG paths: ${svgPaths}`);
    
    // Look for any elements with stroke or fill colors
    const coloredElements = await page.locator('[stroke], [fill]').count();
    console.log(`🎨 Colored SVG elements: ${coloredElements}`);
    
    // Check the HTML around chart areas
    const chartHTML = await page.locator('.tremor-Card-root').nth(1).innerHTML();
    console.log('📝 Second card HTML:', chartHTML.substring(0, 200));
    
    // Check for any data- attributes that might indicate chart libraries
    const dataAttributes = await page.locator('[data-*]').count();
    console.log(`📊 Elements with data attributes: ${dataAttributes}`);
    
    // Specifically look for the opportunities chart
    const oppChart = await page.locator('text=Opportunities by Stage').isVisible();
    console.log(`🎯 Opportunities chart visible: ${oppChart}`);
    
    if (oppChart) {
      const oppContainer = page.locator('text=Opportunities by Stage').locator('..');
      const oppHTML = await oppContainer.innerHTML();
      console.log('🎯 Opportunities chart HTML:', oppHTML.substring(0, 300));
    }
    
    console.log('✅ Deep debug completed!');
    
  } catch (error) {
    console.error('❌ Deep debug failed:', error.message);
  } finally {
    await browser.close();
  }
}

deepDebugCharts();