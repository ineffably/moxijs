import { setupMoxi, asEntity } from 'moxi';
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
  const { scene, engine, PIXIAssets } = await setupMoxi({
    hostElement: root
  });

  scene.renderer.background.color = 0x3a4466; // Dark blue background

  // Load bunny character spritesheet with JSON definition
  await PIXI.Assets.load({
    alias: 'bunny',
    src: ASSETS.SPROUTLANDS_CHARACTER_JSON,
    data: {
      scaleMode: PIXI.SCALE_MODES.NEAREST
    }
  });

  // Get the spritesheet
  const sheet = PIXIAssets.get<PIXI.Spritesheet>('bunny');

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
  const totalWidth = scene.renderer.width;
  const totalHeight = scene.renderer.height;
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

    // Create label
    const label = new PIXI.Text({
      text: displayNames[index],
      style: {
        fontFamily: 'Arial',
        fontSize: 20,
        fill: 0xffffff,
        align: 'center'
      }
    });
    label.anchor.set(0.5);
    label.x = x;
    label.y = y - 80; // Position above character
    scene.addChild(asEntity(label));

    // Create animated sprite from spritesheet animation
    const character = new PIXI.AnimatedSprite(sheet.animations[animName]);
    character.anchor.set(0.5);
    character.x = x;
    character.y = y;
    character.scale.set(3); // Scale up for visibility
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

