/**
 * Example: Bitmap Font Generator - High-DPI Supersampling
 *
 * Demonstrates the supersampling technique used in PIKCELL for pixel-perfect fonts.
 * 
 * THE PROBLEM:
 * Canvas 2D always applies anti-aliasing to text. This makes pixel fonts look blurry.
 * 
 * THE SOLUTION (Supersampling):
 * 1. Install font at HIGH resolution (256px) - more pixels = less visible AA
 * 2. Scale DOWN when displaying (e.g., scale: 0.0625 = 16px display)
 * 3. The anti-aliasing becomes sub-pixel and virtually invisible
 * 
 * This is the same technique PIKCELL uses for crisp UI text.
 */
import { setupMoxi } from '@moxijs/core';
import * as PIXI from 'pixi.js';
import { Assets, BitmapFont, BitmapText, Text, Graphics, Container, FederatedPointerEvent } from 'pixi.js';
import { ASSETS } from '../../assets-config';

// ========================================
// FONT CONFIGURATION
// ========================================
const FONT_CONFIG = {
  asset: ASSETS.PIXEL_OPERATOR8_FONT,
  family: 'PixelOperator8',
  name: 'PixelFont',
  displayName: 'PixelOperator8',
};

// Character set for font generation
const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 !@#$%^&*()-=_+[]{}|;:\'",.<>?/\\`~';

// ========================================
// SUPERSAMPLING CONFIGURATIONS
// ========================================
const STANDARD_SIZE = 64;    // Standard resolution
const HIGH_DPI_SIZE = 256;   // High resolution (4x) - PIKCELL default

export async function initBitmapFontGenerator() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('Canvas container not found');

  const canvasWidth = 1280;
  const canvasHeight = 720;

  const { scene, engine, renderer } = await setupMoxi({
    hostElement: root,
    showLoadingScene: true,
    pixelPerfect: true,
    renderOptions: {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: 0x1a1a1a,
      antialias: false,
      roundPixels: true,
    }
  });

  const canvas = renderer.canvas as HTMLCanvasElement;
  canvas.style.imageRendering = 'pixelated';

  // Track all bitmap texts for toggling roundPixels
  const allBitmapTexts: BitmapText[] = [];

  // ========================================
  // Background Gradient
  // ========================================
  const bgGradient = new Graphics();
  bgGradient.rect(0, 0, canvasWidth, canvasHeight);
  bgGradient.fill({
    color: 0xffffff,
    alpha: 1,
    texture: (() => {
      const gradCanvas = document.createElement('canvas');
      gradCanvas.width = 1;
      gradCanvas.height = canvasHeight;
      const ctx = gradCanvas.getContext('2d')!;
      const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      gradient.addColorStop(0, '#3a3a3a');
      gradient.addColorStop(1, '#1a1a1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1, canvasHeight);
      return PIXI.Texture.from(gradCanvas);
    })()
  });
  scene.addChild(bgGradient);

  // Load font with alias so PIXI knows the fontFamily name
  await Assets.load({
    alias: FONT_CONFIG.family,
    src: FONT_CONFIG.asset
  });

  // ========================================
  // Install fonts at different resolutions
  // ========================================

  // STANDARD: 64px base
  BitmapFont.install({
    name: `${FONT_CONFIG.name}-Standard`,
    style: {
      fontFamily: FONT_CONFIG.family,
      fontSize: STANDARD_SIZE,
      fill: 0xffffff,
    },
    chars: CHAR_SET,
    resolution: 1,
    padding: 4,
    textureStyle: { scaleMode: 'nearest' }
  });

  // HIGH-DPI: 256px base (PIKCELL approach)
  BitmapFont.install({
    name: `${FONT_CONFIG.name}-HighDPI`,
    style: {
      fontFamily: FONT_CONFIG.family,
      fontSize: HIGH_DPI_SIZE,
      fill: 0xffffff,
    },
    chars: CHAR_SET,
    resolution: 1,
    padding: 8,
    textureStyle: { scaleMode: 'nearest' }
  });

  // ========================================
  // Movable/Pannable Content Container
  // ========================================
  
  const contentContainer = new Container();
  scene.addChild(contentContainer);
  
  // Pan state - use LEFT click drag
  let isPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let containerStartX = 0;
  let containerStartY = 0;

  // Make the content container draggable
  contentContainer.eventMode = 'static';
  contentContainer.hitArea = new PIXI.Rectangle(-2000, -2000, 6000, 6000);
  contentContainer.cursor = 'grab';

  contentContainer.on('pointerdown', (e: FederatedPointerEvent) => {
    if (e.button === 0) { // Left click
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
      const dx = e.globalX - panStartX;
      const dy = e.globalY - panStartY;
      contentContainer.x = containerStartX + dx;
      contentContainer.y = containerStartY + dy;
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

  // Wheel to pan
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.shiftKey) {
      contentContainer.x -= e.deltaY * 0.8;
    } else {
      contentContainer.y -= e.deltaY * 0.8;
    }
  });

  // ========================================
  // UI Layout - Two Columns (wider spacing)
  // ========================================

  const contentPadding = 30;
  let y = contentPadding;
  const col1 = 50;     // Standard (64px)
  const col2 = 750;    // High-DPI (256px) - wider gap

  // Title
  const title = new Text({
    text: 'Experimenting with High-DPI Supersampling',
    style: { fontSize: 22, fill: 0x00ff88, fontWeight: 'bold' }
  });
  title.position.set(col1, y);
  contentContainer.addChild(title);

  const subtitle = new Text({
    text: `Font: ${FONT_CONFIG.displayName} | Click and drag to pan, scroll to move`,
    style: { fontSize: 12, fill: 0xffff00 }
  });
  subtitle.position.set(col1, y + 28);
  contentContainer.addChild(subtitle);

  // ========================================
  // Pixel-Perfect Toggle (Fixed position)
  // ========================================

  let pixelPerfectEnabled = true;

  const checkboxContainer = new Container();
  checkboxContainer.position.set(canvasWidth - 280, 20);
  scene.addChild(checkboxContainer);

  const checkboxBg = new Graphics();
  checkboxBg.roundRect(0, 0, 260, 50, 6);
  checkboxBg.fill(0x2a2a3a);
  checkboxBg.stroke({ color: 0x444455, width: 2 });
  checkboxContainer.addChild(checkboxBg);

  const checkboxUnchecked = new Graphics();
  checkboxUnchecked.roundRect(15, 12, 26, 26, 4);
  checkboxUnchecked.fill(0x1a1a2e);
  checkboxUnchecked.stroke({ color: 0x666688, width: 2 });
  checkboxUnchecked.visible = false;
  checkboxContainer.addChild(checkboxUnchecked);

  const checkboxCheckedBox = new Graphics();
  checkboxCheckedBox.roundRect(15, 12, 26, 26, 4);
  checkboxCheckedBox.fill(0x00aa66);
  checkboxCheckedBox.stroke({ color: 0x00ff88, width: 2 });
  checkboxCheckedBox.visible = true;
  checkboxContainer.addChild(checkboxCheckedBox);

  const checkmark = new Graphics();
  checkmark.moveTo(20, 24);
  checkmark.lineTo(26, 30);
  checkmark.lineTo(36, 18);
  checkmark.stroke({ color: 0xffffff, width: 3 });
  checkmark.visible = true;
  checkboxContainer.addChild(checkmark);

  const updateCheckbox = (checked: boolean) => {
    checkboxCheckedBox.visible = checked;
    checkmark.visible = checked;
    checkboxUnchecked.visible = !checked;
  };

  const checkboxLabel = new Text({
    text: 'Pixel-Perfect Mode',
    style: { fontSize: 14, fill: 0xffffff, fontWeight: 'bold' }
  });
  checkboxLabel.position.set(50, 12);
  checkboxContainer.addChild(checkboxLabel);

  const checkboxHint = new Text({
    text: 'roundPixels + pixelated',
    style: { fontSize: 10, fill: 0x888899 }
  });
  checkboxHint.position.set(50, 30);
  checkboxContainer.addChild(checkboxHint);

  checkboxContainer.eventMode = 'static';
  checkboxContainer.cursor = 'pointer';
  checkboxContainer.on('pointerdown', (e: FederatedPointerEvent) => {
    e.stopPropagation();
    pixelPerfectEnabled = !pixelPerfectEnabled;
    updateCheckbox(pixelPerfectEnabled);
    
    canvas.style.imageRendering = pixelPerfectEnabled ? 'pixelated' : 'auto';
    
    for (const bt of allBitmapTexts) {
      bt.roundPixels = pixelPerfectEnabled;
    }

    checkboxHint.text = pixelPerfectEnabled 
      ? 'roundPixels + pixelated' 
      : 'smooth rendering (blurry)';
    checkboxHint.style.fill = pixelPerfectEnabled ? 0x888899 : 0xff8866;

    console.log(`Pixel-Perfect Mode: ${pixelPerfectEnabled ? 'ON' : 'OFF'}`);
  });

  y += 70;

  // Column Headers
  const header1 = new Text({
    text: 'Standard (64px base)',
    style: { fontSize: 18, fill: 0xff6666, fontWeight: 'bold' }
  });
  header1.position.set(col1, y);
  contentContainer.addChild(header1);

  const header2 = new Text({
    text: 'High-DPI (256px base) ✓',
    style: { fontSize: 18, fill: 0x66ff66, fontWeight: 'bold' }
  });
  header2.position.set(col2, y);
  contentContainer.addChild(header2);

  y += 40;

  // ========================================
  // Font Samples - Multiple sizes with mixed case
  // ========================================

  const displaySizes = [8, 16, 32, 64];
  const testTexts = [
    'Hello World!',
    'The Quick Brown Fox',
    'ABCDEFghijklmn',
    '0123456789',
  ];

  for (const displaySize of displaySizes) {
    // Section divider
    const divider = new Graphics();
    divider.rect(col1, y - 5, 1350, 1);
    divider.fill(0x333344);
    contentContainer.addChild(divider);

    // Size label
    const sizeLabel = new Text({
      text: `${displaySize}px`,
      style: { fontSize: 12, fill: 0x666677 }
    });
    sizeLabel.position.set(col1 - 10, y + 2);
    sizeLabel.anchor.set(1, 0);
    contentContainer.addChild(sizeLabel);

    const standardScale = displaySize / STANDARD_SIZE;
    const highDpiScale = displaySize / HIGH_DPI_SIZE;

    let rowY = y;
    for (const testText of testTexts) {
      // Standard column (64px)
      const standardText = new BitmapText({
        text: testText,
        style: { fontFamily: `${FONT_CONFIG.name}-Standard`, fontSize: STANDARD_SIZE }
      });
      standardText.scale.set(standardScale);
      standardText.roundPixels = true;
      standardText.position.set(col1, rowY);
      standardText.tint = 0xffffff;
      contentContainer.addChild(standardText);
      allBitmapTexts.push(standardText);

      // High-DPI column (256px)
      const highDpiText = new BitmapText({
        text: testText,
        style: { fontFamily: `${FONT_CONFIG.name}-HighDPI`, fontSize: HIGH_DPI_SIZE }
      });
      highDpiText.scale.set(highDpiScale);
      highDpiText.roundPixels = true;
      highDpiText.position.set(col2, rowY);
      highDpiText.tint = 0xffffff;
      contentContainer.addChild(highDpiText);
      allBitmapTexts.push(highDpiText);

      rowY += displaySize + 8;
    }

    y = rowY + 20;
  }

  // ========================================
  // Black on White Section
  // ========================================

  y += 20;

  const blackOnWhiteLabel = new Text({
    text: 'Black on White Background (32px)',
    style: { fontSize: 14, fill: 0xffffff }
  });
  blackOnWhiteLabel.position.set(col1, y);
  contentContainer.addChild(blackOnWhiteLabel);
  y += 25;

  // White background panels (wider)
  const whiteBg1 = new Graphics();
  whiteBg1.roundRect(col1 - 10, y - 5, 650, 50, 4);
  whiteBg1.fill(0xf0f0f0);
  contentContainer.addChild(whiteBg1);

  const whiteBg2 = new Graphics();
  whiteBg2.roundRect(col2 - 10, y - 5, 650, 50, 4);
  whiteBg2.fill(0xf0f0f0);
  contentContainer.addChild(whiteBg2);

  // Black text samples
  const blackText1 = new BitmapText({
    text: 'Hello World! ABCabc 123',
    style: { fontFamily: `${FONT_CONFIG.name}-Standard`, fontSize: STANDARD_SIZE }
  });
  blackText1.scale.set(32 / STANDARD_SIZE);
  blackText1.roundPixels = true;
  blackText1.position.set(col1, y + 5);
  blackText1.tint = 0x000000;
  contentContainer.addChild(blackText1);
  allBitmapTexts.push(blackText1);

  const blackText2 = new BitmapText({
    text: 'Hello World! ABCabc 123',
    style: { fontFamily: `${FONT_CONFIG.name}-HighDPI`, fontSize: HIGH_DPI_SIZE }
  });
  blackText2.scale.set(32 / HIGH_DPI_SIZE);
  blackText2.roundPixels = true;
  blackText2.position.set(col2, y + 5);
  blackText2.tint = 0x000000;
  contentContainer.addChild(blackText2);
  allBitmapTexts.push(blackText2);

  y += 70;

  // ========================================
  // Zoomed Character Comparison
  // ========================================

  const zoomLabel = new Text({
    text: 'Zoomed Comparison (64px display)',
    style: { fontSize: 14, fill: 0xffffff }
  });
  zoomLabel.position.set(col1, y);
  contentContainer.addChild(zoomLabel);
  y += 25;

  const zoomChars = 'AaBbCc';
  
  const zoomStandard = new BitmapText({
    text: zoomChars,
    style: { fontFamily: `${FONT_CONFIG.name}-Standard`, fontSize: STANDARD_SIZE }
  });
  zoomStandard.scale.set(64 / STANDARD_SIZE);
  zoomStandard.roundPixels = true;
  zoomStandard.position.set(col1, y);
  zoomStandard.tint = 0xffffff;
  contentContainer.addChild(zoomStandard);
  allBitmapTexts.push(zoomStandard);

  const zoomHighDpi = new BitmapText({
    text: zoomChars,
    style: { fontFamily: `${FONT_CONFIG.name}-HighDPI`, fontSize: HIGH_DPI_SIZE }
  });
  zoomHighDpi.scale.set(64 / HIGH_DPI_SIZE);
  zoomHighDpi.roundPixels = true;
  zoomHighDpi.position.set(col2, y);
  zoomHighDpi.tint = 0xffffff;
  contentContainer.addChild(zoomHighDpi);
  allBitmapTexts.push(zoomHighDpi);

  // Notes under zoomed
  const note1 = new Text({ text: '(fuzzy edges)', style: { fontSize: 10, fill: 0xff6666 } });
  note1.position.set(col1, y + 70);
  contentContainer.addChild(note1);

  const note2 = new Text({ text: '(crisp pixel edges!)', style: { fontSize: 10, fill: 0x66ff66 } });
  note2.position.set(col2, y + 70);
  contentContainer.addChild(note2);

  y += 100;

  // ========================================
  // Live Counter Demo
  // ========================================

  const counterLabel = new Text({
    text: 'Live Counter (High-DPI @ 16px):',
    style: { fontSize: 12, fill: 0x00ff88 }
  });
  counterLabel.position.set(col1, y);
  contentContainer.addChild(counterLabel);

  const counter = new BitmapText({
    text: '00000000',
    style: { fontFamily: `${FONT_CONFIG.name}-HighDPI`, fontSize: HIGH_DPI_SIZE }
  });
  counter.scale.set(16 / HIGH_DPI_SIZE);
  counter.roundPixels = true;
  counter.position.set(col1 + 200, y - 2);
  counter.tint = 0xffff00;
  contentContainer.addChild(counter);
  allBitmapTexts.push(counter);

  let count = 0;
  engine.ticker.add(() => {
    count += 7;
    counter.text = count.toString().padStart(8, '0');
  });

  y += 40;

  // ========================================
  // Key Insights
  // ========================================

  const insightsBox = new Graphics();
  insightsBox.roundRect(col1 - 10, y - 10, 1350, 100, 6);
  insightsBox.fill(0x1a1a2e);
  contentContainer.addChild(insightsBox);

  const insights = new Text({
    text: [
      'Key Insights:',
      '• 64px = standard resolution, 256px = 4× more pixels (PIKCELL default)',
      '• Higher base resolution = anti-aliasing becomes sub-pixel and virtually invisible',
      '• Trade-off: Higher resolution = larger texture atlas = more memory usage',
      '• Click and drag to pan around the content, scroll to move vertically',
    ].join('\n'),
    style: { fontSize: 11, fill: 0x99aacc, lineHeight: 18 }
  });
  insights.position.set(col1, y);
  contentContainer.addChild(insights);

  // ========================================
  // Pan Hint (Fixed position)
  // ========================================

  const panHint = new Text({
    text: '🖱️ Click + drag to pan | Scroll to move',
    style: { fontSize: 10, fill: 0x666688 }
  });
  panHint.position.set(20, canvasHeight - 25);
  scene.addChild(panHint);

  // Initialize and start
  scene.init();
  engine.start();

  console.log('✅ Bitmap Font Generator (High-DPI) loaded');
  console.log(`📝 Total BitmapText elements: ${allBitmapTexts.length}`);

  return () => {
    engine.stop();
    scene.destroy({ children: true });
  };
}
