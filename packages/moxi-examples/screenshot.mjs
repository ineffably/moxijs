import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:9000');
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/moxi-screenshot.png', fullPage: true });
await browser.close();
console.log('Screenshot saved to /tmp/moxi-screenshot.png');
