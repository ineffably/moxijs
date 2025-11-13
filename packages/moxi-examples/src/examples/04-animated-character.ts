import { setupMoxi, asEntity, CameraLogic, asTextureFrames } from 'moxi';
import * as PIXI from 'pixi.js';
import { ASSETS } from '../assets-config';

/**
 * Animated Character Example
 * Demonstrates sprite animation using texture frames and camera following
 */

export async function initAnimatedCharacter() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  // Get the Moxi setup
  const { scene, engine, loadAssets, camera, PIXIAssets } = await setupMoxi({
    hostElement: root
  });

  scene.renderer.background.color = 0x3a4466; // Dark blue background

  // Load character spritesheet
  await loadAssets([
    { src: ASSETS.SPROUTLANDS_CHARACTER, alias: 'character_sheet' }
  ]);

  // Get the character sheet texture
  const baseTexture = PIXIAssets.get<PIXI.TextureSource>('character_sheet');

  // Set the scale mode to nearest neighbor for better quality
  baseTexture.source.scaleMode = 'nearest';

  // Create texture frames from the character spritesheet
  const characterFrames = asTextureFrames(PIXI, baseTexture, {
    frameWidth: 48,
    frameHeight: 48,
    columns: 4,
    rows: 4
  });

  // Create character sprite
  const character = new PIXI.AnimatedSprite(characterFrames);
  character.anchor.set(0.5);
  character.x = scene.renderer.width / 2;
  character.y = scene.renderer.height / 2;
  character.scale.set(4); // Scale up for visibility
  
  // Set up the idle animation (first two frames)
  character.textures = [characterFrames[0], characterFrames[1]];
  character.animationSpeed = 0.05;
  character.play();

  // Convert to Moxi entity
  const characterEntity = asEntity<PIXI.AnimatedSprite>(character);

  // Add character to scene
  scene.addChild(characterEntity);

  // Initialize and start
  scene.init();
  engine.start();

  console.log('✅ Animated Character example loaded');
}

