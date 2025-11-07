/**
 * Example 01: Basic Sprite
 * The simplest example - displays a single sprite
 * Ported from: example-projects/_project-template/template-example.ts
 */
import { setupMoxi, asEntity } from 'moxi';
import { Sprite } from 'pixi.js';
import { ASSETS } from '../assets-config';

export async function initBasicSprite() {
  const root = document.getElementById('app');
  if (!root) throw new Error('App element not found');

  const { scene, engine, loadAssets, PIXIAssets } = await setupMoxi({ hostElement: root });
  scene.renderer.background.color = 'green';

  const assetList = [
    { src: ASSETS.ROBOT_IDLE, alias: 'character' }
  ];
  
  await loadAssets(assetList);

  // Get the asset using the getAsset utility function
  const texture = PIXIAssets.get('character');
  const characterSprite = new Sprite({ texture });
  characterSprite.eventMode = 'none';
  
  const character = asEntity<Sprite>(characterSprite);
  
  scene.addChild(character);
  scene.init();
  engine.start();

  console.log('✅ Basic Sprite example loaded');
}

