/**
 * PIKCELL - Pixel-Perfect Sprite Editor
 * Built on Moxi and PIXI.js
 */
import { setupMoxi, setupResponsiveCanvas } from '@moxijs/core';
import * as PIXI from 'pixi.js';
import { Assets } from 'pixi.js';
import { SpriteEditor } from './sprite-editor';
import { getTheme } from './theming/theme';

// Asset paths
const ASSETS = {
  PIXEL_OPERATOR8_FONT: {
    alias: 'PixelOperator8',
    src: './assets/fonts/pixel_operator/PixelOperator8.ttf'
  },
  KENNEY_BLOCKS_FONT: {
    alias: 'Kenney Blocks',
    src: './assets/fonts/kenney-blocks.ttf'
  }
};

/**
 * Initialize and run the PIKCELL sprite editor
 */
export async function initPikcell(hostElement?: HTMLElement) {
  const root = hostElement || document.getElementById('app');
  if (!root) throw new Error('Host element not found');

  // Setup with pixel-perfect rendering
  const { scene, engine, renderer } = await setupMoxi({
    hostElement: root,
    showLoadingScene: false,
    pixelPerfect: true,
    renderOptions: {
      width: 1280,
      height: 720,
      backgroundColor: getTheme().workspace,
    }
  });

  // Load pixel fonts
  await Assets.load([ASSETS.PIXEL_OPERATOR8_FONT, ASSETS.KENNEY_BLOCKS_FONT]);

  // ===========================================
  // HIGH-DPI FONT EXPERIMENT
  // Toggle this to test higher resolution fonts
  // ===========================================
  const USE_HIGH_DPI_FONT = true; // <-- Toggle this to compare
  const HIGH_DPI_FONT_SIZE = 256; // 4x the original 64px
  
  // Install bitmap font - either high-DPI or standard
  PIXI.BitmapFont.install({
    name: 'PixelOperator8Bitmap',
    style: {
      fontFamily: 'PixelOperator8',
      fontSize: USE_HIGH_DPI_FONT ? HIGH_DPI_FONT_SIZE : 64,
      fill: 0xffffff,
    },
    chars: PIXI.BitmapFontManager.ALPHANUMERIC.concat('.,!?\'"-:;()[]{}@#$%^&*+=<>/\\|~`_'),
    resolution: 1,
    padding: USE_HIGH_DPI_FONT ? 8 : 2,
    textureStyle: { scaleMode: 'nearest' }
  });
  
  // Log which mode we're using
  console.log(`🔤 Font mode: ${USE_HIGH_DPI_FONT ? 'HIGH-DPI (' + HIGH_DPI_FONT_SIZE + 'px)' : 'Standard (64px)'}`);
  
  // Export the font configuration for use in components
  const actualFontSize = USE_HIGH_DPI_FONT ? HIGH_DPI_FONT_SIZE : 64;
  
  // Font scale: how much to scale the font to get 16px display
  // If high-DPI, we need to scale down more (256px → 16px = 0.0625 vs 64px → 16px = 0.25)
  (globalThis as Record<string, unknown>).__PIKCELL_FONT_SCALE__ = 16 / actualFontSize;
  
  // Font size: the actual size the font was installed at
  (globalThis as Record<string, unknown>).__PIKCELL_FONT_SIZE__ = actualFontSize;

  // Install Kenney Blocks bitmap font for branding
  PIXI.BitmapFont.install({
    name: 'KennyBlocksBitmap',
    style: {
      fontFamily: 'Kenney Blocks',
      fontSize: 64,
      fill: 0xffffff,
    }
  });

  // Create the sprite editor
  const spriteEditor = new SpriteEditor({
    renderer,
    scene,
    maxSpriteSheets: 2
  });

  // Initialize the editor (creates all UI)
  await spriteEditor.initialize();

  // Setup responsive canvas - maintains 16:9 aspect ratio centered
  setupResponsiveCanvas({
    rootElement: root,
    width: 1280,
    height: 720,
    pixelArtMode: true
  });

  // Start the engine
  scene.init();
  engine.start();

  console.log('PIKCELL loaded');

  return { spriteEditor, scene, engine, renderer };
}

// Note: Auto-init removed. Call initPikcell() explicitly when using as standalone.
// For library use, import { SpriteEditor, getTheme } from 'pikcell';

// Export everything for library use
export { SpriteEditor } from './sprite-editor';
export { getTheme, setTheme, getAllThemes } from './theming/theme';
export * from './editor-exports';
