import { setupMoxi, asEntity, CameraLogic, asTextureFrames, TextureFrameSequences, SequenceInfo, createTileGrid, getTextureRange, Logic } from '@moxijs/core';
import * as PIXI from 'pixi.js';
import { BitmapFont } from 'pixi.js';
import { ASSETS } from '../assets-config';
import { PlayerMovementLogic } from './behavior-logic/player-movement-logic';
import { DinoAIStateMachine } from '../utils/dino-ai-state-machine';
import { DinoAnimationLogic } from './behavior-logic/dino-animation-logic';
import { HideLogic } from './behavior-logic/hide-logic';

// ============================================================================
// Helper Types & Interfaces
// ============================================================================

interface DinoConfig {
  name: string;
  frames: PIXI.Texture[];
  position: { x: number; y: number };
  initialLabel: string;
}

/** Label type with setText helper for outlined text */
type OutlinedLabel = PIXI.Container & { setText: (text: string) => void };

interface DinoInstance {
  sprite: PIXI.AnimatedSprite;
  entity: ReturnType<typeof asEntity<PIXI.AnimatedSprite>>;
  animLogic: DinoAnimationLogic;
  label: OutlinedLabel;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates dino animation frames from a texture source
 */
function createDinoFrames(texture: PIXI.TextureSource): PIXI.Texture[] {
  return asTextureFrames(PIXI, texture, {
    frameWidth: 24,
    frameHeight: 24,
    columns: 24,
    rows: 1
  });
}

/**
 * Creates a BitmapText state label for a dino with pixel-perfect outline
 * Uses shadow copies technique for clean pixel-art outlines
 */
function createStateLabel(initialText: string): PIXI.Container & { setText: (text: string) => void } {
  const container = new PIXI.Container() as PIXI.Container & { setText: (text: string) => void };
  container.position.set(0, -20);

  const labelScale = 0.15;

  // Create outline by rendering text offset in 8 directions
  const outlineOffsets = [
    { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
    { x: -1, y: 0 },                    { x: 1, y: 0 },
    { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 }
  ];

  const outlineTexts: PIXI.BitmapText[] = [];
  outlineOffsets.forEach(offset => {
    const shadow = new PIXI.BitmapText({
      text: initialText,
      style: {
        fontFamily: 'PixelOperator8Bitmap',
        fontSize: 64,
        fill: 0x000000
      }
    });
    shadow.scale.set(labelScale);
    shadow.anchor.set(0.5);
    shadow.position.set(offset.x, offset.y);
    container.addChild(shadow);
    outlineTexts.push(shadow);
  });

  // Main text on top
  const mainText = new PIXI.BitmapText({
    text: initialText,
    style: {
      fontFamily: 'PixelOperator8Bitmap',
      fontSize: 64,
      fill: 0xffffff
    }
  });
  mainText.scale.set(labelScale);
  mainText.anchor.set(0.5);
  container.addChild(mainText);

  // Helper to update all text layers at once
  container.setText = (text: string) => {
    mainText.text = text;
    outlineTexts.forEach(t => t.text = text);
  };

  return container;
}

/**
 * Creates a dino entity with sprite, animation logic, and label
 */
function createDino(
  config: DinoConfig,
  scene: PIXI.Container,
  renderer: PIXI.Renderer
): DinoInstance {
  const sprite = new PIXI.AnimatedSprite(config.frames);
  sprite.anchor.set(0.5);
  sprite.position.set(config.position.x, config.position.y);

  const entity = asEntity<PIXI.AnimatedSprite>(sprite);

  const animLogic = new DinoAnimationLogic(config.frames);
  animLogic.init(sprite, renderer);
  entity.moxiEntity.addLogic(animLogic);

  const label = createStateLabel(config.initialLabel);
  sprite.addChild(label);

  return { sprite, entity, animLogic, label };
}

/**
 * Updates a label's text and ensures it faces forward regardless of sprite flip
 */
function updateLabel(label: OutlinedLabel, text: string, spriteScaleX: number): void {
  label.setText(text);
  label.scale.x = Math.abs(label.scale.x) * Math.sign(spriteScaleX);
}

/**
 * Dino AI Behaviors Example
 * Demonstrates AI behaviors using FSM and Logic components:
 * - Bunny player with keyboard controls
 * - Trees and bushes scattered across the map
 * - 4 dinos with different AI behaviors:
 *   1. Doux - Follow behavior (chases player)
 *   2. Mort - Hide behavior (sneaks to nearest tree/bush when player approaches)
 *   3. Tard - Patrol behavior (walks pattern, chases if close)
 *   4. Vita - Wander behavior (random movement, attacks if close)
 */

export async function initDinoAIBehaviors() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  const { scene, engine, loadAssets, camera, PIXIAssets } = await setupMoxi({
    hostElement: root,
    showLoadingScene: true
  });

  scene.renderer.background.color = 0x88c070; // Gameboy-inspired green

  // Load character, dino, grass tiles, object spritesheets, and fonts
  await loadAssets([
    { src: ASSETS.GRASS_TILES, alias: 'grass_sheet' },
    { src: ASSETS.GRASS_BIOME_THINGS, alias: 'grass_biome_things' },
    { src: ASSETS.SPROUTLANDS_CHARACTER, alias: 'character_sheet' },
    { src: ASSETS.DINO_DOUX, alias: 'dino_doux' },
    { src: ASSETS.DINO_MORT, alias: 'dino_mort' },
    { src: ASSETS.DINO_TARD, alias: 'dino_tard' },
    { src: ASSETS.DINO_VITA, alias: 'dino_vita' },
    { src: ASSETS.PIXEL_OPERATOR8_FONT, alias: 'pixel_operator8_font' }
  ]);

  // Set up camera
  camera.desiredScale.set(3);

  // Get textures
  const characterTexture = PIXIAssets.get<PIXI.TextureSource>('character_sheet');
  const grassSheet = PIXIAssets.get<PIXI.TextureSource>('grass_sheet');
  const grassBiomeThings = PIXIAssets.get<PIXI.TextureSource>('grass_biome_things');

  // Get dino textures
  const dinoDouxTexture = PIXIAssets.get<PIXI.TextureSource>('dino_doux');
  const dinoMortTexture = PIXIAssets.get<PIXI.TextureSource>('dino_mort');
  const dinoTardTexture = PIXIAssets.get<PIXI.TextureSource>('dino_tard');
  const dinoVitaTexture = PIXIAssets.get<PIXI.TextureSource>('dino_vita');

  // Set scale mode to nearest neighbor for pixel art
  characterTexture.source.scaleMode = 'nearest';
  grassSheet.source.scaleMode = 'nearest';
  grassBiomeThings.source.scaleMode = 'nearest';
  dinoDouxTexture.source.scaleMode = 'nearest';
  dinoMortTexture.source.scaleMode = 'nearest';
  dinoTardTexture.source.scaleMode = 'nearest';
  dinoVitaTexture.source.scaleMode = 'nearest';

  // Install BitmapFont for pixel-perfect text rendering
  BitmapFont.install({
    name: 'PixelOperator8Bitmap',
    style: {
      fontFamily: 'PixelOperator8',
      fontSize: 64,
      fill: 0xffffff
    }
  });

  // Create dino animation frames using helper function
  const dinoDouxFrames = createDinoFrames(dinoDouxTexture);
  const dinoMortFrames = createDinoFrames(dinoMortTexture);
  const dinoTardFrames = createDinoFrames(dinoTardTexture);
  const dinoVitaFrames = createDinoFrames(dinoVitaTexture);

  // Create character animation frames
  const characterFrames = asTextureFrames(PIXI, characterTexture, {
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

  // Extract grass biome things (trees, bushes, etc.) - 9 columns x 5 rows
  const biomeThingsFrames = asTextureFrames(PIXI, grassBiomeThings, {
    frameWidth: 16,
    frameHeight: 16,
    columns: 9,
    rows: 5
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

  // Get grass tile variations
  const colorVariantTiles = getTextureRange(grassFrames, 55, 6);
  const stonePathTiles = getTextureRange(grassFrames, 66, 6);

  const tileVariations = [
    ...colorVariantTiles,
    ...stonePathTiles
  ];

  const textureFrameSequences = new TextureFrameSequences(characterFrames, frameSequences);

  // Create background with grass tiles
  const backgroundContainer = createTileGrid({
    width: 64,
    height: 64,
    cellWidth: 16,
    cellHeight: 16,
    centered: true
  }, tileVariations);

  const backgroundEntity = asEntity(backgroundContainer);
  scene.addChild(backgroundEntity);

  // Add random trees and bushes across the map
  const hidingSpots: PIXI.Point[] = [];
  const numPlants = 13; // Number of trees/bushes to place
  const mapSize = 400; // Keep plants within this range from center

  // Tree tiles from grass biome things (2x2 structure, 9 columns)
  // Medium tree: [0,1], [0,2], [1,1], [1,2]
  const treeTopLeft = biomeThingsFrames[0 * 9 + 1];     // [0, 1]
  const treeTopRight = biomeThingsFrames[0 * 9 + 2];    // [0, 2]
  const treeBottomLeft = biomeThingsFrames[1 * 9 + 1];  // [1, 1]
  const treeBottomRight = biomeThingsFrames[1 * 9 + 2]; // [1, 2]

  // Bush tiles from grass biome things (single tile, 9 columns)
  // [3,0] = berry bush full, [3,1] = generic bush
  const berryBush = biomeThingsFrames[3 * 9 + 0];       // [3, 0]
  const genericBush = biomeThingsFrames[3 * 9 + 1];     // [3, 1]

  const tileSize = 16; // Each tile is 16x16 pixels

  for (let i = 0; i < numPlants; i++) {
    // Random position within map bounds
    const x = (Math.random() - 0.5) * mapSize;
    const y = (Math.random() - 0.5) * mapSize;

    // Randomly choose between tree (60%) and bush (40%)
    const plantContainer = new PIXI.Container();
    plantContainer.position.set(x, y);
    plantContainer.name = 'hiding_spot';

    if (Math.random() < 0.6) {
      // Create a 2x2 tree
      const topLeft = new PIXI.Sprite(treeTopLeft);
      topLeft.position.set(-tileSize / 2, -tileSize);
      plantContainer.addChild(topLeft);

      const topRight = new PIXI.Sprite(treeTopRight);
      topRight.position.set(tileSize / 2, -tileSize);
      plantContainer.addChild(topRight);

      const bottomLeft = new PIXI.Sprite(treeBottomLeft);
      bottomLeft.position.set(-tileSize / 2, 0);
      plantContainer.addChild(bottomLeft);

      const bottomRight = new PIXI.Sprite(treeBottomRight);
      bottomRight.position.set(tileSize / 2, 0);
      plantContainer.addChild(bottomRight);
    } else {
      // Create a single-tile bush (randomly choose berry or generic)
      const bushTexture = Math.random() < 0.5 ? berryBush : genericBush;
      const bush = new PIXI.Sprite(bushTexture);
      bush.anchor.set(0.5, 1); // Anchor at bottom center
      plantContainer.addChild(bush);
    }

    scene.addChild(plantContainer);
    hidingSpots.push(new PIXI.Point(x, y));
  }

  // Create bunny player sprite
  const bunny = new PIXI.AnimatedSprite(characterFrames);
  bunny.anchor.set(0.5);
  bunny.name = 'player'; // Name for radar detection

  const bunnyEntity = asEntity<PIXI.AnimatedSprite>(bunny);

  // Add player movement logic
  const movementLogic = new PlayerMovementLogic({
    speed: 1.0,
  }, textureFrameSequences);

  movementLogic.init(bunny, scene.renderer);
  bunnyEntity.moxiEntity.addLogic(movementLogic);

  scene.addChild(bunnyEntity);

  // Make camera follow the player
  const cameraLogic = camera.moxiEntity.getLogic<CameraLogic>('CameraLogic');
  cameraLogic.target = bunny;

  // ============================================================================
  // Create Dinos using helper function
  // ============================================================================

  // Dino 1: Doux (Chase behavior - chases player)
  const doux = createDino({
    name: 'Doux',
    frames: dinoDouxFrames,
    position: { x: -120, y: -80 },
    initialLabel: 'Wander'
  }, scene, scene.renderer);

  const douxAI = DinoAIStateMachine.createChaseAI({
    speed: 1.2,
    detectionRadius: 200,
    chaseRange: 200,
    attackRange: 30,
    targetFilter: (e) => e.name === 'player'
  }, doux.animLogic);
  doux.entity.moxiEntity.addLogic(douxAI);
  scene.addChild(doux.entity);

  // Dino 2: Mort (Hide behavior - sneaks to hiding spots)
  const mort = createDino({
    name: 'Mort',
    frames: dinoMortFrames,
    position: { x: 120, y: -80 },
    initialLabel: 'Idle'
  }, scene, scene.renderer);

  const mortHideLogic = new HideLogic({
    speed: 1.2,
    threatDistance: 150,
    safeDistance: 200,
    hidingSpots: hidingSpots,
    target: bunny,
    hideReachedDistance: 15
  });
  mortHideLogic.init(mort.sprite, scene.renderer);
  mort.entity.moxiEntity.addLogic(mortHideLogic);
  scene.addChild(mort.entity);

  // Dino 3: Tard (Patrol behavior - walks pattern, chases if close)
  const tard = createDino({
    name: 'Tard',
    frames: dinoTardFrames,
    position: { x: -120, y: 80 },
    initialLabel: 'Patrol'
  }, scene, scene.renderer);

  const tardAI = DinoAIStateMachine.createPatrolAI({
    speed: 1.0,
    detectionRadius: 120,
    chaseRange: 100,
    attackRange: 30,
    patrolWaypoints: [
      new PIXI.Point(-120, 80),
      new PIXI.Point(-60, 80),
      new PIXI.Point(-60, 120),
      new PIXI.Point(-120, 120)
    ],
    targetFilter: (e) => e.name === 'player'
  }, tard.animLogic);
  tard.entity.moxiEntity.addLogic(tardAI);
  scene.addChild(tard.entity);

  // Dino 4: Vita (Wander behavior - random movement, attacks if close)
  const vita = createDino({
    name: 'Vita',
    frames: dinoVitaFrames,
    position: { x: 120, y: 80 },
    initialLabel: 'Wander'
  }, scene, scene.renderer);

  const vitaAI = DinoAIStateMachine.createWanderAttackAI({
    speed: 0.8,
    detectionRadius: 80,
    chaseRange: 80,
    attackRange: 40,
    targetFilter: (e) => e.name === 'player'
  }, vita.animLogic);
  vita.entity.moxiEntity.addLogic(vitaAI);
  scene.addChild(vita.entity);

  // ============================================================================
  // Consolidated Label Updater - handles all dino labels in one place
  // ============================================================================

  const labelUpdater = new (class extends Logic<PIXI.Container> {
    name = 'DinoLabelUpdater';

    update(entity: PIXI.Container, deltaTime: number) {
      // Update Doux (uses AI state machine)
      const douxState = douxAI.getCurrentState();
      if (douxState) {
        updateLabel(doux.label, douxState, doux.sprite.scale.x);
      }

      // Update Mort (uses HideLogic - different state source)
      let mortState = 'Idle';
      if (mortHideLogic.isCurrentlyHidden()) {
        mortState = 'Hidden';
      } else if (mortHideLogic.isSeekingHide()) {
        mortState = 'Sneaking';
        // Play sneak animation when seeking hide
        if (mort.animLogic.getCurrentAnimation() !== 'sneak') {
          mort.animLogic.playAnimation('sneak');
        }
      }
      updateLabel(mort.label, mortState, mort.sprite.scale.x);

      // Update Tard (uses AI state machine)
      const tardState = tardAI.getCurrentState();
      if (tardState) {
        updateLabel(tard.label, tardState, tard.sprite.scale.x);
      }

      // Update Vita (uses AI state machine)
      const vitaState = vitaAI.getCurrentState();
      if (vitaState) {
        updateLabel(vita.label, vitaState, vita.sprite.scale.x);
      }
    }
  })();
  labelUpdater.init(bunnyEntity, scene.renderer);
  bunnyEntity.moxiEntity.addLogic(labelUpdater);

  // Create a stage container to hold both the scene and UI layer
  const stage = new PIXI.Container();
  stage.addChild(scene);

  // Create UI layer for screen-space elements (rendered on top, not affected by camera)
  const uiLayer = new PIXI.Container();
  uiLayer.name = 'uiLayer';
  stage.addChild(uiLayer);

  // Create HUD at the top of the screen (in screen space, not world space)
  const hud = new PIXI.Container();
  hud.name = 'hud';
  hud.position.set(10, 10); // Fixed position in screen space

  // HUD sizing (2x scale)
  const hudItemWidth = 130;
  const hudPadding = 16;
  const hudWidth = hudPadding * 2 + hudItemWidth * 4;
  const hudHeight = 80;

  // Create HUD background panel
  const hudBg = new PIXI.Graphics();
  hudBg.beginFill(0x000000, 0.7);
  hudBg.drawRoundedRect(0, 0, hudWidth, hudHeight, 8);
  hudBg.endFill();
  hud.addChild(hudBg);

  // Dino info data (data-driven approach)
  const dinoInfos = [
    { name: 'Doux', behavior: 'Chase', color: 0xff6b35 },
    { name: 'Mort', behavior: 'Hide', color: 0x9b59b6 },
    { name: 'Tard', behavior: 'Patrol', color: 0x3498db },
    { name: 'Vita', behavior: 'Wander', color: 0x2ecc71 }
  ];

  dinoInfos.forEach((info, index) => {
    const xOffset = hudPadding + index * hudItemWidth;

    // Color indicator
    const indicator = new PIXI.Graphics();
    indicator.beginFill(info.color);
    indicator.drawCircle(0, 0, 8);
    indicator.endFill();
    indicator.position.set(xOffset + 8, 24);
    hud.addChild(indicator);

    // Dino name (BitmapText)
    const nameText = new PIXI.BitmapText({
      text: info.name,
      style: {
        fontFamily: 'PixelOperator8Bitmap',
        fontSize: 64,
        fill: 0xffffff
      }
    });
    nameText.scale.set(0.25);
    nameText.position.set(xOffset + 22, 12);
    hud.addChild(nameText);

    // Behavior label (BitmapText)
    const behaviorText = new PIXI.BitmapText({
      text: info.behavior,
      style: {
        fontFamily: 'PixelOperator8Bitmap',
        fontSize: 64,
        fill: 0xaaaaaa
      }
    });
    behaviorText.scale.set(0.20);
    behaviorText.position.set(xOffset + 22, 42);
    hud.addChild(behaviorText);
  });

  // Add HUD to the UI layer (stays fixed on screen)
  uiLayer.addChild(hud);

  // Modify the scene's draw method to render the stage instead
  scene.draw = function(deltaTime: number) {
    scene.renderer.render(stage);
  };

  // Initialize and start
  scene.init();
  engine.start();

  console.log('✅ Dino AI Behaviors example loaded - Watch the dinos interact!');
}
