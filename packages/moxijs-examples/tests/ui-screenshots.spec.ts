import { test, expect } from '@playwright/test';

/**
 * UI Examples Screenshot Tests
 *
 * These tests capture screenshots of the UI examples for visual validation.
 * Screenshots are saved to tests/screenshots/
 */

test.describe('UI Examples Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the examples page
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Wait for example buttons to be injected
    await page.waitForSelector('.example-btn', { timeout: 10000 });
  });

  test('Example 11 - UI Basics', async ({ page }) => {
    // Click the UI Basics example button
    await page.click('button.example-btn:has-text("11 - UI Basics")');

    // Wait for canvas to render
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/11-ui-basics.png',
      fullPage: false
    });

    // Verify canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('Example 12 - UI Components', async ({ page }) => {
    // Click the UI Components example button
    await page.click('button.example-btn:has-text("12 - UI Components")');

    // Wait for canvas to render
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/12-ui-components.png',
      fullPage: false
    });

    // Verify canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('Example 12 - UI Components - Button Interactions', async ({ page }) => {
    // Click the UI Components example button
    await page.click('button.example-btn:has-text("12 - UI Components")');

    // Wait for canvas to render
    await page.waitForTimeout(2000);

    // Get canvas element for clicking
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Click on a button (approximate position - adjust as needed)
    // This simulates hovering/clicking a button
    await canvas.click({ position: { x: 200, y: 300 } });

    await page.waitForTimeout(500);

    // Take screenshot with button interaction
    await page.screenshot({
      path: 'tests/screenshots/12-ui-components-interaction.png',
      fullPage: false
    });
  });

  test('Example 13 - Form Elements', async ({ page }) => {
    // Click the Form Elements example button
    await page.click('button.example-btn:has-text("13 - Form Elements")');

    // Wait for canvas to render
    await page.waitForTimeout(2000);

    // Take initial screenshot
    await page.screenshot({
      path: 'tests/screenshots/13-form-elements.png',
      fullPage: false
    });

    // Verify canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('Example 13 - Form Elements - With Dropdown Open', async ({ page }) => {
    // Click the Form Elements example button
    await page.click('button.example-btn:has-text("13 - Form Elements")');

    // Wait for canvas to render
    await page.waitForTimeout(2000);

    const canvas = page.locator('canvas');

    // Click on the Character Class dropdown (approximate position)
    // This should open the dropdown menu
    await canvas.click({ position: { x: 400, y: 350 } });

    await page.waitForTimeout(500);

    // Take screenshot with dropdown open
    await page.screenshot({
      path: 'tests/screenshots/13-form-elements-dropdown.png',
      fullPage: false
    });
  });

  test('Example 13 - Form Elements - With Text Input Focused', async ({ page }) => {
    // Click the Form Elements example button
    await page.click('button.example-btn:has-text("13 - Form Elements")');

    // Wait for canvas to render
    await page.waitForTimeout(2000);

    const canvas = page.locator('canvas');

    // Click on the username input (approximate position)
    await canvas.click({ position: { x: 400, y: 250 } });

    await page.waitForTimeout(500);

    // Take screenshot with input focused (should show cursor)
    await page.screenshot({
      path: 'tests/screenshots/13-form-elements-focused.png',
      fullPage: false
    });
  });

  test('Example 14 - UI Showcase - Initial Tab', async ({ page }) => {
    // Click the UI Showcase example button
    await page.click('button.example-btn:has-text("14 - UI Showcase")');

    // Wait for canvas to render
    await page.waitForTimeout(2000);

    // Take screenshot showing initial tab (UI Basics)
    await page.screenshot({
      path: 'tests/screenshots/14-ui-showcase-initial.png',
      fullPage: false
    });

    // Verify canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('Example 14 - UI Showcase - Tab Switching', async ({ page }) => {
    // Click the UI Showcase example button
    await page.click('button.example-btn:has-text("14 - UI Showcase")');

    // Wait for canvas to render
    await page.waitForTimeout(2000);

    const canvas = page.locator('canvas');

    // Click on "Components" tab (approximate position)
    // Tabs are positioned in the top area of the canvas
    await canvas.click({ position: { x: 250, y: 120 } });

    await page.waitForTimeout(500);

    // Take screenshot with Components tab active
    await page.screenshot({
      path: 'tests/screenshots/14-ui-showcase-components-tab.png',
      fullPage: false
    });

    // Click on "Form Elements" tab
    await canvas.click({ position: { x: 380, y: 120 } });

    await page.waitForTimeout(500);

    // Take screenshot with Form Elements tab active
    await page.screenshot({
      path: 'tests/screenshots/14-ui-showcase-forms-tab.png',
      fullPage: false
    });
  });
});

test.describe('UI Examples - Visual Regression Suite', () => {
  /**
   * Capture all three UI examples in sequence for easy comparison
   */
  test('Capture all UI examples', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.example-btn', { timeout: 10000 });

    const examples = [
      { title: '11 - UI Basics', name: '11-ui-basics' },
      { title: '12 - UI Components', name: '12-ui-components' },
      { title: '13 - Form Elements', name: '13-form-elements' },
      { title: '14 - UI Showcase', name: '14-ui-showcase' }
    ];

    for (const example of examples) {
      // Click example button
      await page.click(`button.example-btn:has-text("${example.title}")`);

      // Wait for rendering
      await page.waitForTimeout(2000);

      // Capture screenshot
      await page.screenshot({
        path: `tests/screenshots/suite-${example.name}.png`,
        fullPage: false
      });

      console.log(`✓ Captured ${example.name}`);
    }
  });
});
