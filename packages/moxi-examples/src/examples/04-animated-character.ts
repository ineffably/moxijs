import { setupMoxi, asEntity, asTextureFrames, createTileGrid, getTextureRange } from 'moxi';
import * as PIXI from 'pixi.js';
import { ASSETS } from '../assets-config';

/**
 * Animated Character Example
 * Demonstrates sprite animation using PIXI.js spritesheet JSON
 * Shows all 8 animation types from the bunny spritesheet
 */

export async function initAnimatedCharacter() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  // Get the Moxi setup
  const { scene, engine, PIXIAssets, loadAssets, camera } = await setupMoxi({
    hostElement: root
  });

  scene.renderer.background.color = 0x88c070; // Gameboy-inspired green

  // Set up camera - zoom in to see pixel art better
  camera.desiredScale.set(3);

  // Load bunny character spritesheet with JSON definition and grass tiles
  await loadAssets([
    { src: ASSETS.GRASS_TILES, alias: 'grass_sheet' },
    { src: ASSETS.KENNEY_BLOCKS_FONT, alias: 'kenney_blocks' }
  ]);

  await PIXI.Assets.load({
    alias: 'bunny',
    src: ASSETS.SPROUTLANDS_CHARACTER_JSON,
    data: {
      scaleMode: PIXI.SCALE_MODES.NEAREST
    }
  });

  // Get the spritesheet and grass tiles
  const sheet = PIXIAssets.get<PIXI.Spritesheet>('bunny');
  const grassSheet = PIXIAssets.get<PIXI.TextureSource>('grass_sheet');

  // Set scale mode to nearest neighbor for pixel art
  grassSheet.source.scaleMode = 'nearest';

  // Create grass texture frames
  const grassFrames = asTextureFrames(PIXI, grassSheet, {
    frameWidth: 16,
    frameHeight: 16,
    columns: 11,
    rows: 7
  });

  // Get color variant grass tiles and stone paths
  const colorVariantTiles = getTextureRange(grassFrames, 55, 6);
  const stonePathTiles = getTextureRange(grassFrames, 66, 6);

  // Combine tile pools for randomization
  const tileVariations = [
    ...colorVariantTiles,
    ...stonePathTiles
  ];

  // Create a background container with the grass tiles
  const backgroundContainer = createTileGrid({
    width: 100,
    height: 60,
    cellWidth: 16,
    cellHeight: 16,
    centered: true
  }, tileVariations);

  // Convert background container to a Moxi entity and add to scene
  const backgroundEntity = asEntity(backgroundContainer);
  scene.addChild(backgroundEntity);

  // Animation names - these match the "animations" section in the JSON
  // Top row: all idle animations, Bottom row: all walk animations
  const animationNames = [
    'idle_down', 'idle_up', 'idle_left', 'idle_right',
    'walk_down', 'walk_up', 'walk_left', 'walk_right'
  ];
  const displayNames = [
    'Idle Down', 'Idle Up', 'Idle Left', 'Idle Right',
    'Walk Down', 'Walk Up', 'Walk Left', 'Walk Right'
  ];

  // Layout: 4 columns x 2 rows
  // Since camera is zoomed in 3x, we need to work in world coordinates (not screen pixels)
  const totalWidth = scene.renderer.width / camera.desiredScale.x;
  const totalHeight = scene.renderer.height / camera.desiredScale.y;
  const cols = 4;
  const rows = 2;
  const spacingX = totalWidth / (cols + 1); // Space between columns
  const spacingY = totalHeight / (rows + 1); // Space between rows

  // Create all 8 animated characters using the spritesheet animations
  animationNames.forEach((animName, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);

    const x = spacingX * (col + 1);
    const y = spacingY * (row + 1);

    // Create label background (light yellow rectangle with dark green border)
    const labelBg = new PIXI.Graphics();
    const labelText = new PIXI.BitmapText({
      text: displayNames[index],
      style: {
        fontFamily: 'Kenney Blocks',
        fontSize: 10, // Increased by 2 pixels
        fill: 0x3d6b1f // Lighter green color
      }
    });
    labelText.anchor.set(0.5);

    // Draw background rectangle based on text bounds
    const padding = 2;
    const bgWidth = labelText.width + padding * 2;
    const bgHeight = labelText.height + padding * 2;
    labelBg.rect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight);
    labelBg.fill({ color: 0xFFF4A3 }); // Light yellow
    labelBg.stroke({ color: 0x2d5016, width: 1 }); // Dark green border

    // Create container for background + text
    const labelContainer = new PIXI.Container();
    labelContainer.addChild(labelBg);
    labelContainer.addChild(labelText);
    labelContainer.x = x;
    labelContainer.y = y - 30; // Closer to character in world coordinates (80 / 3)
    scene.addChild(asEntity(labelContainer));

    // Create animated sprite from spritesheet animation
    const character = new PIXI.AnimatedSprite(sheet.animations[animName]);
    character.anchor.set(0.5);
    character.x = x;
    character.y = y;
    character.scale.set(1); // Camera handles the zoom
    character.animationSpeed = 0.05; // Slowed down by half (0.1 * 1/2)
    character.play();

    // Convert to Moxi entity and add to scene
    scene.addChild(asEntity(character));
  });

  // Initialize and start
  scene.init();
  engine.start();

  console.log('✅ Animated Character example loaded - showing all 8 bunny animations from spritesheet JSON');
}

