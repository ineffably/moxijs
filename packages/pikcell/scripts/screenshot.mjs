#!/usr/bin/env node
/**
 * Quick screenshot utility for pikcell
 *
 * Usage:
 *   node scripts/screenshot.mjs                    # Basic screenshot
 *   node scripts/screenshot.mjs --clear            # Clear localStorage first
 *   node scripts/screenshot.mjs --new              # Create new PICO-8 project
 *   node scripts/screenshot.mjs --name myshot      # Custom filename
 *   node scripts/screenshot.mjs --port 9001        # Custom port
 */
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const flags = {
  clear: args.includes('--clear'),
  newProject: args.includes('--new'),
  name: args.find((_, i, arr) => arr[i - 1] === '--name') || `pikcell-${Date.now()}`,
  port: args.find((_, i, arr) => arr[i - 1] === '--port') || '9001',
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1535, height: 971 } });

  const url = `http://localhost:${flags.port}/`;
  console.log(`Navigating to ${url}...`);
  await page.goto(url);

  // Wait for initial load
  await page.waitForTimeout(1000);

  if (flags.clear) {
    console.log('Clearing localStorage...');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(1500);
  }

  if (flags.newProject) {
    console.log('Creating new PICO-8 project...');
    // Click "New" button (approximately x=55, y=115)
    await page.mouse.click(55, 115);
    await page.waitForTimeout(500);
    // Click "PICO-8" button in dialog (approximately x=680, y=540)
    await page.mouse.click(680, 540);
    await page.waitForTimeout(1000);
  }

  const filename = `/tmp/${flags.name}.png`;
  console.log(`Taking screenshot: ${filename}`);
  await page.screenshot({ path: filename });

  await browser.close();
  console.log(`Done! Screenshot saved to: ${filename}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
