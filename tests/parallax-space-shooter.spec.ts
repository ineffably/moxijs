import { test, expect } from '@playwright/test';

test.describe('Parallax Space Shooter Example', () => {
  test('should load and display parallax layers', async ({ page }) => {
    // Listen for console messages and errors
    const consoleMessages: string[] = [];
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      if (msg.type() === 'error') {
        consoleErrors.push(text);
      }
    });

    // Navigate to the parallax example
    await page.goto('/#parallax-space-shooter');

    // Wait for the example to load
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({
      path: '.playwright-mcp/parallax-initial.png',
      fullPage: true
    });

    // Check that the success messages appeared in console
    expect(consoleMessages.some(msg => msg.includes('Space assets loaded'))).toBeTruthy();
    expect(consoleMessages.some(msg => msg.includes('Parallax Space Shooter loaded'))).toBeTruthy();

    // Verify no JavaScript errors occurred
    expect(consoleErrors.length).toBe(0);

    // Get the canvas element
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Simulate keyboard movement (hold right arrow for a bit)
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(1000);
    await page.keyboard.up('ArrowRight');

    // Take screenshot after movement
    await page.screenshot({
      path: '.playwright-mcp/parallax-after-movement.png',
      fullPage: true
    });

    // Move in different direction
    await page.keyboard.down('ArrowUp');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowUp');

    await page.keyboard.down('ArrowLeft');
    await page.waitForTimeout(500);
    await page.keyboard.up('ArrowLeft');

    // Take final screenshot
    await page.screenshot({
      path: '.playwright-mcp/parallax-diagonal-movement.png',
      fullPage: true
    });

    // Log all console messages for debugging
    console.log('Console messages:', consoleMessages);

    // Check for specific parallax-related logs
    expect(consoleMessages.some(msg =>
      msg.includes('Nebula layer: 0.3x') ||
      msg.includes('Stars layer: 0.6x')
    )).toBeTruthy();
  });

  test('should handle continuous movement', async ({ page }) => {
    await page.goto('/#parallax-space-shooter');
    await page.waitForTimeout(2000);

    // Test continuous movement in a circle pattern
    const movements = [
      { key: 'ArrowRight', duration: 300 },
      { key: 'ArrowDown', duration: 300 },
      { key: 'ArrowLeft', duration: 300 },
      { key: 'ArrowUp', duration: 300 },
    ];

    for (const movement of movements) {
      await page.keyboard.down(movement.key);
      await page.waitForTimeout(movement.duration);
      await page.keyboard.up(movement.key);
    }

    // Take screenshot after circular movement
    await page.screenshot({
      path: '.playwright-mcp/parallax-circular-movement.png',
      fullPage: true
    });

    // Ensure canvas is still rendering
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should handle WASD controls', async ({ page }) => {
    await page.goto('/#parallax-space-shooter');
    await page.waitForTimeout(2000);

    // Test WASD controls
    await page.keyboard.down('w');
    await page.waitForTimeout(500);
    await page.keyboard.up('w');

    await page.screenshot({
      path: '.playwright-mcp/parallax-wasd-movement.png',
      fullPage: true
    });

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should handle mouse wheel zoom', async ({ page }) => {
    await page.goto('/#parallax-space-shooter');
    await page.waitForTimeout(2000);

    // Zoom out first (most likely to show coverage issues)
    await page.mouse.wheel(0, 1000); // Wheel down = zoom out
    await page.waitForTimeout(500);

    await page.screenshot({
      path: '.playwright-mcp/parallax-zoom-out.png',
      fullPage: true
    });

    // Take screenshot at default zoom (1.5x)
    await page.mouse.wheel(0, -500); // Zoom back to middle
    await page.waitForTimeout(500);

    await page.screenshot({
      path: '.playwright-mcp/parallax-zoom-default.png',
      fullPage: true
    });

    // Zoom in with mouse wheel
    await page.mouse.wheel(0, -500); // Wheel up = zoom in
    await page.waitForTimeout(500);

    await page.screenshot({
      path: '.playwright-mcp/parallax-zoom-in.png',
      fullPage: true
    });

    // Move ship while zoomed out to see parallax effect at different zoom level
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(300);
    await page.keyboard.up('ArrowRight');

    await page.screenshot({
      path: '.playwright-mcp/parallax-zoom-out-with-movement.png',
      fullPage: true
    });

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });
});
