#!/usr/bin/env node

/**
 * Playwright screenshot script for UI showcase
 *
 * Usage:
 *   node scripts/screenshot-ui-showcase.mjs
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const URL = 'http://localhost:9000/#ui-showcase/buttons';
const OUTPUT_PATH = join(__dirname, '../screenshots/ui-showcase-buttons.png');

async function captureScreenshot() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 900 }
  });
  const page = await context.newPage();

  try {
    console.log(`Navigating to ${URL}...`);
    await page.goto(URL, { waitUntil: 'networkidle' });

    // Wait a bit for rendering to complete
    console.log('Waiting for rendering...');
    await page.waitForTimeout(2000);

    console.log(`Taking screenshot: ${OUTPUT_PATH}`);
    await page.screenshot({
      path: OUTPUT_PATH,
      fullPage: false
    });

    console.log('✓ Screenshot saved successfully!');
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureScreenshot();
