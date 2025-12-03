#!/usr/bin/env node
/**
 * Quick screenshot script for mini-gui testing
 * Usage: node scripts/screenshot.mjs [hash] [output]
 */

import { chromium } from 'playwright';

const hash = process.argv[2] || 'gui-basics';
const output = process.argv[3] || `screenshot-${Date.now()}.png`;

async function screenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`http://localhost:9000/#${hash}`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: output });

  console.log(`Screenshot saved: ${output}`);
  await browser.close();
}

screenshot().catch(console.error);
