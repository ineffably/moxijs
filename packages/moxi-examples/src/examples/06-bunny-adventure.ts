import { setupMoxi, asEntity, CameraLogic, asTextureFrames, TextureFrameSequences, SequenceInfo, createTileGrid, getTextureRange } from 'moxi';
import * as PIXI from 'pixi.js';
import { ASSETS } from '../assets-config';
import { PlayerMovementLogic } from './behavior-logic/player-movement-logic';

/**
 * Bunny Adventure Example
 * Demonstrates player movement with keyboard controls, camera following,
 * directional animations, and a tile-based world
 */

export async function initBunnyAdventure() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  const { scene, engine, loadAssets, camera, PIXIAssets } = await setupMoxi({
    hostElement: root,
    showLoadingScene: true
  });

  scene.renderer.background.color = 0x88c070; // Gameboy-inspired green

  // Load character and grass tile spritesheets
  await loadAssets([
    { src: ASSETS.GRASS_TILES, alias: 'grass_sheet' },
    { src: ASSETS.SPROUTLANDS_CHARACTER, alias: 'character_sheet' }
  ]);

  // Set up camera
  camera.desiredScale.set(3);

  // Get textures
  const baseTexture = PIXIAssets.get<PIXI.TextureSource>('character_sheet');
  const grassSheet = PIXIAssets.get<PIXI.TextureSource>('grass_sheet');

  // Set scale mode to nearest neighbor for pixel art
  baseTexture.source.scaleMode = 'nearest';
  grassSheet.source.scaleMode = 'nearest';

  // Create texture frames from the character spritesheet
  const characterFrames = asTextureFrames(PIXI, baseTexture, {
    frameWidth: 48,
    frameHeight: 48,
    columns: 4,
    rows: 4
  });

  const grassFrames = asTextureFrames(PIXI, grassSheet, {
    frameWidth: 16,
    frameHeight: 16,
    columns: 11,
    rows: 7
  });

  const walkAnimationSpeed = 12;
  const idleAnimationSpeed = walkAnimationSpeed + 10;

  const frameSequences: Record<string, SequenceInfo> = {
    idleDown: { frames: [0, 1], animationSpeed: idleAnimationSpeed },
    walkDown: { frames: [2, 3], animationSpeed: walkAnimationSpeed },

    idleUp: { frames: [4, 5], animationSpeed: idleAnimationSpeed },
    walkUp: { frames: [6, 7], animationSpeed: walkAnimationSpeed },

    idleLeft: { frames: [8, 9], animationSpeed: idleAnimationSpeed },
    walkLeft: { frames: [10, 11], animationSpeed: walkAnimationSpeed },

    idleRight: { frames: [12, 13], animationSpeed: idleAnimationSpeed },
    walkRight: { frames: [14, 15], animationSpeed: walkAnimationSpeed }
  };

  // Get color variant grass tiles and stone paths from rows 5-6, columns 0-5
  // Row 5, cols 0-5: indices 55-60 (grass1-3, stonepath1-2, yellow flowers)
  // Row 6, cols 0-5: indices 66-71 (grass4-6, stonepath3-4, yel flowers2)
  const colorVariantTiles = getTextureRange(grassFrames, 55, 6);
  const stonePathTiles = getTextureRange(grassFrames, 66, 6);
  
  // Combine tile pools for randomization
  const tileVariations = [
    ...colorVariantTiles,
    ...stonePathTiles
  ];

  const textureFrameSequences = new TextureFrameSequences(characterFrames, frameSequences);

  // Create a background container with the grass tiles
  const backgroundContainer = createTileGrid({
    width: 64,
    height: 64,
    cellWidth: 16,
    cellHeight: 16,
    centered: true
  }, tileVariations);

  // Convert background container to a Moxi entity and add to scene
  const backgroundEntity = asEntity(backgroundContainer);
  scene.addChild(backgroundEntity);

  // Create bunny player sprite
  const bunny = new PIXI.AnimatedSprite(characterFrames);
  bunny.anchor.set(0.5);

  // Convert to Moxi entity
  const bunnyEntity = asEntity<PIXI.AnimatedSprite>(bunny);

  // Create and initialize the movement logic with custom options
  const movementLogic = new PlayerMovementLogic({
    speed: 1.5,
  }, textureFrameSequences);

  // Initialize the logic with the sprite
  movementLogic.init(bunny, scene.renderer);

  // Add the logic to the entity
  bunnyEntity.moxiEntity.addLogic(movementLogic);

  // Add player to scene
  scene.addChild(bunnyEntity);

  // Make camera follow the player
  const cameraLogic = camera.moxiEntity.getLogic<CameraLogic>('CameraLogic');
  cameraLogic.target = bunny;

  // Initialize and start
  scene.init();
  engine.start();

  console.log('✅ Bunny Adventure example loaded - Use arrow keys to move!');
}

