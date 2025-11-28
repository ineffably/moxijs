/**
 * Example 17: Sprite Editor - Scaled Pixel Perfect UI
 * Uses the PIKCELL sprite editor package from the monorepo
 */
import { setupMoxi } from 'moxi-kit';
import * as PIXI from 'pixi.js';
import { Assets } from 'pixi.js';
import { ASSETS } from '../assets-config';
import { SpriteEditor, getTheme } from 'pikcell';

/**
 * Initialize and run the sprite editor
 */
export async function initSpriteEditor() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

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

  // Install Kenney Blocks bitmap font for ALPHA! stamp
  PIXI.BitmapFont.install({
    name: 'KennyBlocksBitmap',
    style: {
      fontFamily: 'Kenney Blocks',
      fontSize: 64,
      fill: 0xffffff,
    }
  });

  // Create the sprite editor using PIKCELL
  const spriteEditor = new SpriteEditor({
    renderer,
    scene,
    maxSpriteSheets: 2
  });

  // Initialize the editor (creates all UI)
  await spriteEditor.initialize();

  // Start the engine
  scene.init();
  engine.start();

  console.log('PIKCELL Sprite Editor loaded');
}
