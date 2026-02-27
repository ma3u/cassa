// Quick Playwright script to test if the 3D graph renders visible content
import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader']
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // Capture console errors and messages
  const consoleMessages = [];
  const pageErrors = [];
  page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => pageErrors.push(err.message));

  // Navigate to the page  
  await page.goto('http://localhost:5001/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Check for JS errors
  console.log('Page errors:', JSON.stringify(pageErrors, null, 2));
  console.log('Console errors:', JSON.stringify(consoleMessages.filter(m => m.type === 'error'), null, 2));

  // Check page HTML structure
  const pageInfo = await page.evaluate(() => {
    const body = document.body;
    const allElements = body.querySelectorAll('*');
    const canvases = body.querySelectorAll('canvas');
    const svgs = body.querySelectorAll('svg');
    
    // Look for the graph component container
    const graphContainers = body.querySelectorAll('[class*="0a0e1a"]');
    const roundedXl = body.querySelectorAll('[class*="rounded-xl"]');
    const stickyTop = body.querySelectorAll('[class*="sticky"]');
    
    // Check ForceGraph3D output 
    const scene = body.querySelector('.scene-container');
    const forceGraph = body.querySelector('.force-graph-container');
    
    return {
      totalElements: allElements.length,
      canvasCount: canvases.length,
      svgCount: svgs.length,
      graphContainerCount: graphContainers.length,
      graphContainerHTML: graphContainers.length > 0 ? graphContainers[0].innerHTML.slice(0, 500) : 'NOT FOUND',
      roundedXlCount: roundedXl.length,
      stickyCount: stickyTop.length,
      stickyHTML: stickyTop.length > 0 
        ? Array.from(stickyTop).map(el => ({
            className: el.className.slice(0, 150),
            childCount: el.children.length,
            innerHTML: el.innerHTML.slice(0, 300)
          }))
        : [],
      sceneFound: !!scene,
      forceGraphFound: !!forceGraph,
    };
  });

  console.log('Page structure:', JSON.stringify(pageInfo, null, 2));

  // Now scroll to graph and check pixels
  const canvas = page.locator('canvas').first();
  if (await canvas.count() > 0) {
    await canvas.scrollIntoViewIfNeeded();
    await page.waitForTimeout(5000); // Let graph fully warm up

    // Take screenshot of the visible area
    await page.screenshot({ path: 'screenshot-graph-area.png', fullPage: false });

    // Take screenshot and analyze pixel data from the screenshot itself
    const screenshotBuffer = await page.screenshot({ fullPage: false });
    
    // Also check the graph specifically by clipping to the canvas area
    const canvasBounds = await canvas.boundingBox();
    console.log('Canvas bounding box:', canvasBounds);

    if (canvasBounds) {
      const graphShot = await page.screenshot({
        path: 'screenshot-graph-only.png',
        clip: {
          x: canvasBounds.x,
          y: canvasBounds.y,
          width: canvasBounds.width,
          height: canvasBounds.height
        }
      });

      // Analyze screenshot pixels using Node.js (PNG is RGBA)
      // Simple check: count bytes that aren't pure dark 
      let nonDark = 0;
      let total = 0;
      // PNG starts with header, we just check raw bytes as a rough proxy
      for (let i = 0; i < graphShot.length; i += 4) {
        total++;
        if (graphShot[i] > 30 || graphShot[i+1] > 30 || graphShot[i+2] > 30) {
          nonDark++;
        }
      }
      console.log(`Screenshot rough pixel check: ${nonDark} non-dark out of ${total} samples (${Math.round(nonDark/total*100)}%)`);
    }

    // Check if Three.js scene has objects by evaluating the scene child count
    const sceneDetails = await page.evaluate(() => {
      // Access the scene container div
      const sceneEl = document.querySelector('.scene-container');
      if (!sceneEl) return { error: 'No scene element' };

      // Look for the graph overlay elements that render on top
      const overlayTexts = document.querySelectorAll('.pointer-events-none');
      const overlayContent = Array.from(overlayTexts).map(el => el.textContent?.trim().slice(0, 80));

      return {
        sceneWidth: sceneEl.style.width,
        sceneHeight: sceneEl.style.height,
        overlayTexts: overlayContent.filter(Boolean),
      };
    });
    console.log('Scene details:', JSON.stringify(sceneDetails, null, 2));
  }

  await browser.close();
  console.log('Done!');
})();
