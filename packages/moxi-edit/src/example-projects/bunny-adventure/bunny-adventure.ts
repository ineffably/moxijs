import { prepMoxi, asEntity, CameraBehavior, asTextureFrames } from 'moxi';
import PIXI from 'pixi.js';
import { PlayerMovementBehavior } from './player-movement-behavior';
import { createTileGrid, getTextureRange } from './grid-generator';
import { TextureFrameSequences } from './texture-frame-sequences';
import { SequenceInfo } from './texture-frame-sequences';


export const init = (async () => {
  const root = document.getElementById('app');

  // Configure the renderer with centered, scale-to-fit behavior
  const renderOptions = {
    width: 1280,
    height: 720,
    backgroundColor: 0x88c070, // Gameboy-inspired green
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: false
  };

  // Get the Moxi setup with our custom renderer options
  const { scene, engine, loadAssets, camera, PIXIAssets } = await prepMoxi({
    hostElement: root,
    renderOptions
  });

  // Set up responsive scaling and centering of the game
  const resizeHandler = () => {
    // Get the parent dimensions
    const parentWidth = root.clientWidth;
    const parentHeight = root.clientHeight;

    // Maintain aspect ratio
    const ratio = Math.min(
      parentWidth / renderOptions.width,
      parentHeight / renderOptions.height
    );

    // Apply the styles to the root element
    root.style.display = 'flex';
    root.style.justifyContent = 'center';
    root.style.alignItems = 'center';
    root.style.overflow = 'hidden';

    // Update the canvas element
    if (root.firstElementChild) {
      const canvas = root.firstElementChild as HTMLCanvasElement;
      canvas.style.width = `${Math.round(renderOptions.width * ratio)}px`;
      canvas.style.height = `${Math.round(renderOptions.height * ratio)}px`;
      canvas.style.display = 'block';
      canvas.style.imageRendering = 'pixelated';
    }
  };

  // Set up initial size and add resize listener
  resizeHandler();
  window.addEventListener('resize', resizeHandler);

  // Load character spritesheet
  const assetList = [
    { src: './assets/sproutlands/tiles/Grass_tiles_v2_simple.png', alias: 'simple_grass_sheet' },
    { src: './assets/sproutlands/characters/basic-spritesheet.png', alias: 'character_sheet' },
  ];

  await loadAssets(assetList);

  // Set up camera
  camera.desiredScale.set(3);

  // Get the character sheet texture using the new utility function
  const baseTexture = PIXIAssets.get<PIXI.TextureSource>('character_sheet');
  const grassSheet = PIXIAssets.get<PIXI.TextureSource>('simple_grass_sheet');

  // Set the scale mode to nearest neighbor for better quality
  baseTexture.source.style.scaleMode = 'nearest';
  grassSheet.source.style.scaleMode = 'nearest';

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
    columns: 6,
    rows: 5
  });

  const animationSpeed = 12;

  const frameSequences: Record<string, SequenceInfo> = {
    idleDown: { frames: [0, 1], animationSpeed: animationSpeed },
    walkDown: { frames: [2, 3], animationSpeed: animationSpeed },

    idleUp: { frames: [4, 6], animationSpeed: animationSpeed },
    walkUp: { frames: [6, 7], animationSpeed: animationSpeed },

    idleLeft: { frames: [8, 9], animationSpeed: animationSpeed },
    walkLeft: { frames: [10, 11], animationSpeed: animationSpeed },

    idleRight: { frames: [12, 13], animationSpeed: animationSpeed },
    walkRight: { frames: [14, 15], animationSpeed: animationSpeed }
  };

  // Get the last 12 frames of grassFrames for variety
  const tileVariations = getTextureRange(grassFrames, grassFrames.length - 12, 12);

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

  // Convert to Moxi entity and add the movement behavior
  const bunnyEntity = asEntity<PIXI.AnimatedSprite>(bunny);

  // Create and initialize the movement behavior with custom options
  const movementBehavior = new PlayerMovementBehavior({
    speed: 2.5,
  }, textureFrameSequences);

  // Initialize the behavior with the sprite and textures
  movementBehavior.init(bunny, scene.renderer);

  // Add the behavior to the entity
  bunnyEntity.moxiEntity.addBehavior(movementBehavior);

  // Add player to scene
  scene.addChild(bunnyEntity);

  // Make camera follow the player
  // TODO: getBehavior needs to be more convenient
  const cameraBehavior = camera.moxiEntity.getBehavior<CameraBehavior>('CameraBehavior');
  console.log('cameraBehavior', cameraBehavior);
  cameraBehavior.target = bunny;

  // Initialize and start
  scene.init();
  engine.start();
});

// If we are loading this in moxi-edit, call the init function directly
if ((window as any).moxiedit) {
  init();
} 