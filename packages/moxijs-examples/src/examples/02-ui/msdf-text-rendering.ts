/**
 * Example: MSDF Text Rendering
 *
 * Demonstrates SDF (Signed Distance Field) text rendering for crisp text at any scale.
 * This is the same technique used by Unity's TextMesh Pro.
 *
 * Compare:
 * - A: Canvas Text (standard): Gets blurry when scaled up
 * - B: MSDF Text: Stays crisp at any zoom level
 *
 * Controls:
 * - Drag to pan
 * - Scroll to zoom
 *
 * MSDF fonts are generated using msdf-bmfont-xml tool:
 *   node scripts/generate-msdf-font.mjs assets/fonts/pixel_operator/PixelOperator8.ttf PixelOperator8-MSDF
 */
import { setupMoxi, asMSDFText } from '@moxijs/core';
import * as PIXI from 'pixi.js';
import { Assets, Text, Graphics, Container, FederatedPointerEvent, BitmapFont, BitmapText } from 'pixi.js';
import { ASSETS } from '../../assets-config';

// Configuration
const MSDF_FONT_FNT = ASSETS.PIXEL_OPERATOR8_MSDF_FNT;
const STANDARD_FONT = ASSETS.PIXEL_OPERATOR8_FONT;

export async function initMsdfTextRendering() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('Canvas container not found');

  const canvasWidth = 1280;
  const canvasHeight = 720;

  const { scene, engine, renderer } = await setupMoxi({
    hostElement: root,
    showLoadingScene: true,
    pixelPerfect: false,
    renderOptions: {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: 0x1a1a2e,
      antialias: true,
    }
  });

  const canvas = renderer.canvas as HTMLCanvasElement;

  // ========================================
  // Load Fonts
  // ========================================
  await Assets.load({
    alias: 'PixelOperator8',
    src: STANDARD_FONT,
    data: { family: 'PixelOperator8' }
  });

  // Load MSDF font - PixiJS automatically recognizes .fnt files and loads the PNG texture
  const msdfFont = await Assets.load({
    alias: 'PixelOperator8-MSDF',
    src: MSDF_FONT_FNT
  });
  
  // Verify the font loaded correctly with texture
  if (!msdfFont?.pageTextures || msdfFont.pageTextures.length === 0) {
    console.error('❌ MSDF font failed to load texture!');
  } else {
    console.log('✅ MSDF font loaded with texture:', msdfFont.pageTextures);
    
    // Ensure texture is uploaded to GPU before rendering
    for (const pageTexture of msdfFont.pageTextures) {
      if (pageTexture?.source) {
        await pageTexture.source.load();
        console.log('✅ MSDF texture uploaded to GPU');
      }
    }
  }

  // Install BitmapFont with 256px supersampling (for pixel-perfect rendering)
  BitmapFont.install({
    name: 'PixelOperator8-Bitmap',
    style: {
      fontFamily: 'PixelOperator8',
      fontSize: 256,
      fill: 0xffffff,
    },
    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 !.,?',
    resolution: 1,
    padding: 8,
    textureStyle: { scaleMode: 'nearest' }
  });

  // ========================================
  // Background (fixed)
  // ========================================
  const bg = new Graphics();
  bg.rect(0, 0, canvasWidth, canvasHeight);
  bg.fill(0x1a1a2e);
  scene.addChild(bg);

  // ========================================
  // Pannable/Zoomable Content Container
  // ========================================
  const contentContainer = new Container();
  contentContainer.position.set(canvasWidth / 2, canvasHeight / 2 - 50);
  scene.addChild(contentContainer);

  // Pan state
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let containerStartX = 0;
  let containerStartY = 0;

  contentContainer.eventMode = 'static';
  contentContainer.hitArea = new PIXI.Rectangle(-2000, -2000, 4000, 4000);
  contentContainer.cursor = 'grab';

  contentContainer.on('pointerdown', (e: FederatedPointerEvent) => {
    if (e.button === 0) {
      isPanning = true;
      panStartX = e.globalX;
      panStartY = e.globalY;
      containerStartX = contentContainer.x;
      containerStartY = contentContainer.y;
      contentContainer.cursor = 'grabbing';
    }
  });

  contentContainer.on('globalpointermove', (e: FederatedPointerEvent) => {
    if (isPanning) {
      contentContainer.x = containerStartX + (e.globalX - panStartX);
      contentContainer.y = containerStartY + (e.globalY - panStartY);
    }
  });

  contentContainer.on('pointerup', () => {
    isPanning = false;
    contentContainer.cursor = 'grab';
  });

  contentContainer.on('pointerupoutside', () => {
    isPanning = false;
    contentContainer.cursor = 'grab';
  });

  // Zoom with scroll wheel
  let currentZoom = 1;
  const minZoom = 0.25;
  const maxZoom = 8;

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.98 : 1.02;
    currentZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom * zoomFactor));
    contentContainer.scale.set(currentZoom);
    zoomLabel.text = `Zoom: ${currentZoom.toFixed(2)}x | Drag to pan, scroll to zoom`;
  });

  // ========================================
  // Comparison Layout: A (Canvas) vs B (MSDF)
  // ========================================
  const sizes = [
    { label: 'Small (16px)', fontSize: 16 },
    { label: 'Medium (32px)', fontSize: 32 },
    { label: 'Large (48px)', fontSize: 48 },
  ];

  const colA = -200; // Canvas Text column
  const colB = 200;  // MSDF column

  // Column headers
  const headerA = new Text({
    text: 'A: Canvas Text',
    style: { fontSize: 14, fill: 0xff6666, fontWeight: 'bold' }
  });
  headerA.anchor.set(0.5, 0);
  headerA.position.set(colA, -180);
  contentContainer.addChild(headerA);

  const headerB = new Text({
    text: 'B: MSDF Text',
    style: { fontSize: 14, fill: 0x66ff66, fontWeight: 'bold' }
  });
  headerB.anchor.set(0.5, 0);
  headerB.position.set(colB, -180);
  contentContainer.addChild(headerB);

  let yOffset = -140;

  for (const { label, fontSize } of sizes) {
    // Size label (centered)
    const sizeLabel = new Text({
      text: label,
      style: { fontSize: 11, fill: 0x888888 }
    });
    sizeLabel.anchor.set(0.5, 0);
    sizeLabel.position.set(0, yOffset);
    contentContainer.addChild(sizeLabel);

    // A: Canvas Text
    const canvasText = new Text({
      text: 'Hello World!',
      style: {
        fontFamily: 'PixelOperator8',
        fontSize,
        fill: 0xffffff
      }
    });
    canvasText.anchor.set(0.5);
    canvasText.position.set(colA, yOffset + 25 + fontSize / 2);
    contentContainer.addChild(canvasText);

    // B: MSDF Text
    const msdfText = asMSDFText({
      text: 'Hello World!',
      style: { fontFamily: 'PixelOperator8', fontSize }
    }, { anchor: 0.5, x: colB, y: yOffset + 25 + fontSize / 2 });
    contentContainer.addChild(msdfText);

    yOffset += fontSize + 50;
  }

  // ========================================
  // Fixed UI (doesn't zoom/pan)
  // ========================================

  // Title
  const title = new Text({
    text: 'MSDF Text Rendering Comparison',
    style: { fontSize: 20, fill: 0xffffff, fontWeight: 'bold' }
  });
  title.position.set(20, 15);
  scene.addChild(title);

  // Zoom label
  const zoomLabel = new Text({
    text: 'Zoom: 1.00x | Drag to pan, scroll to zoom',
    style: { fontSize: 12, fill: 0xaaaaaa }
  });
  zoomLabel.position.set(20, 42);
  scene.addChild(zoomLabel);

  // Live counter
  const counterLabel = new Text({
    text: 'MSDF Counter:',
    style: { fontSize: 11, fill: 0xaaaaaa }
  });
  counterLabel.position.set(20, canvasHeight - 50);
  scene.addChild(counterLabel);

  const counterText = asMSDFText({
    text: '00000000',
    style: { fontFamily: 'PixelOperator8', fontSize: 24 }
  }, { x: 20, y: canvasHeight - 30 });
  scene.addChild(counterText);

  let count = 0;
  engine.ticker.add(() => {
    count += 7;
    counterText.text = count.toString().padStart(8, '0');
  });

  // Notes
  const notes = new Text({
    text: 'A: Gets blurry when zoomed  |  B: Stays crisp at any zoom (but smooths pixel edges)',
    style: { fontSize: 11, fill: 0x888888 }
  });
  notes.anchor.set(1, 0);
  notes.position.set(canvasWidth - 20, canvasHeight - 25);
  scene.addChild(notes);

  // ========================================
  // Initialize and Start
  // ========================================
  scene.init();
  engine.start();

  console.log('✅ MSDF Text Rendering example loaded');
  console.log('💡 Drag to pan, scroll to zoom');

  return () => {
    engine.stop();
    scene.destroy({ children: true });
  };
}
