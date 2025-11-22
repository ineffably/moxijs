/**
 * Example 17: Sprite Editor
 * Edit and manipulate sprites
 */
import { setupMoxi } from 'moxi';
import { Assets, BitmapFont, BitmapText } from 'pixi.js';
import { ASSETS } from '../assets-config';

export async function initSpriteEditor() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  const { scene, engine, renderer } = await setupMoxi({ hostElement: root });
  
  renderer.background.color = 0x1a1a2e;

  // Load PixelOperator fonts
  await Assets.load([
    ASSETS.PIXEL_OPERATOR_FONT,
    ASSETS.PIXEL_OPERATOR_BOLD_FONT
  ]);

  // Install bitmap fonts
  BitmapFont.install({
    name: 'PixelOperator',
    style: {
      fontFamily: 'PixelOperator',
      fontSize: 16,
      fill: 0xffffff
    }
  });

  BitmapFont.install({
    name: 'PixelOperatorBold',
    style: {
      fontFamily: 'PixelOperator-Bold',
      fontSize: 16,
      fill: 0xffffff
    }
  });

  // Example usage of the fonts
  const pixelOperatorRegular = new BitmapText({
    text: 'PixelOperator Regular',
    style: {
      fontFamily: 'PixelOperator',
      fontSize: 16
    }
  });
  pixelOperatorRegular.x = 20;
  pixelOperatorRegular.y = 20;
  scene.addChild(pixelOperatorRegular);

  const pixelOperatorBold = new BitmapText({
    text: 'PixelOperator Bold',
    style: {
      fontFamily: 'PixelOperatorBold',
      fontSize: 16
    }
  });
  pixelOperatorBold.x = 20;
  pixelOperatorBold.y = 50;
  scene.addChild(pixelOperatorBold);

  scene.init();
  engine.start();

  console.log('✅ Sprite Editor loaded');
}

