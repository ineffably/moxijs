import { test } from '@playwright/test';

/**
 * Wait for pikcell to be initialized on the page
 */
async function waitForPikcell(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => {
    return window.pikcell?.spriteEditor !== undefined;
  }, { timeout: 10000 });
}

test('new PICO-8 project', async ({ page }) => {
  // Clear any saved state to simulate fresh session
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await waitForPikcell(page);

  // Screenshot 1: Fresh session
  await page.screenshot({ path: 'tests/screenshots/01-fresh-session.png' });

  // Click "New" button
  await page.evaluate(() => window.pikcell!.spriteEditor.clickNew());
  await page.waitForTimeout(300);

  // Screenshot 2: New project dialog
  await page.screenshot({ path: 'tests/screenshots/02-new-project-dialog.png' });

  // Click "PICO-8" button
  await page.evaluate(() => window.pikcell!.spriteEditor.clickPico8());
  await page.waitForTimeout(500);

  // Screenshot 3: PICO-8 project created
  await page.screenshot({ path: 'tests/screenshots/03-pico8-project-created.png' });
});
