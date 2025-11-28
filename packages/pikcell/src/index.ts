/**
 * PIKCELL - Pixel-Perfect Sprite Editor
 * Built on Moxi and PIXI.js
 */
import { setupMoxi, setupResponsiveCanvas } from 'moxijs';
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
      backgroundColor: getTheme().backgroundRoot,
    }
  });

  // Load pixel fonts
  await Assets.load([ASSETS.PIXEL_OPERATOR8_FONT, ASSETS.KENNEY_BLOCKS_FONT]);

  // Install bitmap font at 64px for high quality, will scale down to 16px
  PIXI.BitmapFont.install({
    name: 'PixelOperator8Bitmap',
    style: {
      fontFamily: 'PixelOperator8',
      fontSize: 64,
      fill: 0xffffff,
    }
  });

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
