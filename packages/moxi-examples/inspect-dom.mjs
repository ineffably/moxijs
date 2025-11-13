import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:9000');
await page.waitForTimeout(2000);

// Check if tabs exist
const tabs = await page.locator('.tabs').count();
console.log('Tabs found:', tabs);

// Check the #app structure
const appHTML = await page.locator('#app').innerHTML();
console.log('\n#app innerHTML:');
console.log(appHTML.substring(0, 500));

// Check canvas-container
const canvasContainer = await page.locator('#canvas-container').count();
console.log('\n#canvas-container elements:', canvasContainer);

// Take screenshot
await page.screenshot({ path: '/tmp/moxi-screenshot.png', fullPage: true });

await browser.close();
