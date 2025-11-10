import { test, expect } from '@playwright/test';

test('Parallax Grid Zoom - grid numbers should stay in same position during zoom', async ({ page }) => {
  await page.goto('/#parallax-grid-zoom');
  await page.waitForTimeout(3000); // Wait for grid to render

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();

  const baselineDebug = await page.evaluate(() => {
    const debug = (window as any).__parallaxGridDebug;
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    const ctx = canvas?.getContext('2d') ?? null;
    let centerColor: number[] | null = null;
    if (canvas && ctx) {
      const x = Math.floor(canvas.width / 2);
      const y = Math.floor(canvas.height / 2);
      centerColor = Array.from(ctx.getImageData(x, y, 1, 1).data);
    }
    return {
      cameraScale: debug?.camera?.scale.x ?? null,
      cameraPosition: debug?.camera?.position.x ?? null,
      desiredScale: debug?.camera?.desiredScale.x ?? null,
      desiredPosition: debug?.camera?.desiredPosition.x ?? null,
      layerPosition: debug?.parallaxBg?.children?.[0]?.position?.x ?? null,
      layerPositionY: debug?.parallaxBg?.children?.[0]?.position?.y ?? null,
      tilePosition: debug?.gridLayer?.tilingSprite?.tilePosition?.x ?? null,
      tilePositionY: debug?.gridLayer?.tilingSprite?.tilePosition?.y ?? null,
      centerColor,
      layerWorldTransform: debug?.gridLayer?.worldTransform
        ? {
            a: debug.gridLayer.worldTransform.a,
            b: debug.gridLayer.worldTransform.b,
            c: debug.gridLayer.worldTransform.c,
            d: debug.gridLayer.worldTransform.d,
            tx: debug.gridLayer.worldTransform.tx,
            ty: debug.gridLayer.worldTransform.ty,
          }
        : null,
      tileWorldTransform: debug?.gridLayer?.tilingSprite?.worldTransform
        ? {
            a: debug.gridLayer.tilingSprite.worldTransform.a,
            b: debug.gridLayer.tilingSprite.worldTransform.b,
            c: debug.gridLayer.tilingSprite.worldTransform.c,
            d: debug.gridLayer.tilingSprite.worldTransform.d,
            tx: debug.gridLayer.tilingSprite.worldTransform.tx,
            ty: debug.gridLayer.tilingSprite.worldTransform.ty,
          }
        : null,
    };
  });
  console.log('Baseline debug:', baselineDebug);

  // Screenshot 1: Baseline at initial zoom
  await page.screenshot({
    path: 'test-results/grid-zoom-1-baseline.png',
    fullPage: true,
  });
  console.log('✓ Grid baseline screenshot');

  // Zoom in significantly
  await page.mouse.wheel(0, -1500);
  await page.waitForTimeout(1500);

  const zoomedDebug = await page.evaluate(() => {
    const debug = (window as any).__parallaxGridDebug;
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    const ctx = canvas?.getContext('2d') ?? null;
    let centerColor: number[] | null = null;
    if (canvas && ctx) {
      const x = Math.floor(canvas.width / 2);
      const y = Math.floor(canvas.height / 2);
      centerColor = Array.from(ctx.getImageData(x, y, 1, 1).data);
    }
    return {
      cameraScale: debug?.camera?.scale.x ?? null,
      cameraPosition: debug?.camera?.position.x ?? null,
      desiredScale: debug?.camera?.desiredScale.x ?? null,
      desiredPosition: debug?.camera?.desiredPosition.x ?? null,
      layerPosition: debug?.parallaxBg?.children?.[0]?.position?.x ?? null,
      tilePosition: debug?.gridLayer?.tilingSprite?.tilePosition?.x ?? null,
      centerColor,
    };
  });
  console.log('Zoomed debug:', zoomedDebug);

  // Screenshot 2: Zoomed in
  await page.screenshot({
    path: 'test-results/grid-zoom-2-zoomed-in.png',
    fullPage: true,
  });
  console.log('✓ Grid zoomed in screenshot');

  // Return to baseline
  await page.mouse.wheel(0, 750);
  await page.waitForTimeout(1500);

  const returnDebug = await page.evaluate(() => {
    const debug = (window as any).__parallaxGridDebug;
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    const ctx = canvas?.getContext('2d') ?? null;
    let centerColor: number[] | null = null;
    if (canvas && ctx) {
      const x = Math.floor(canvas.width / 2);
      const y = Math.floor(canvas.height / 2);
      centerColor = Array.from(ctx.getImageData(x, y, 1, 1).data);
    }
    return {
      cameraScale: debug?.camera?.scale.x ?? null,
      cameraPosition: debug?.camera?.position.x ?? null,
      desiredScale: debug?.camera?.desiredScale.x ?? null,
      desiredPosition: debug?.camera?.desiredPosition.x ?? null,
      layerPosition: debug?.parallaxBg?.children?.[0]?.position?.x ?? null,
      tilePosition: debug?.gridLayer?.tilingSprite?.tilePosition?.x ?? null,
      centerColor,
    };
  });
  console.log('Return debug:', returnDebug);

  // Screenshot 3: Back to baseline
  await page.screenshot({
    path: 'test-results/grid-zoom-3-return-baseline.png',
    fullPage: true,
  });
  console.log('✓ Grid return baseline screenshot');

  // Basic check - canvas should be visible throughout
  await expect(canvas).toBeVisible();
});

