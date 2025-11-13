import { setupMoxi, asEntity, CameraLogic, asTextureFrames, TextureFrameSequences, SequenceInfo, createTileGrid, getTextureRange, Logic } from 'moxi';
import * as PIXI from 'pixi.js';
import { ASSETS } from '../assets-config';
import { PlayerMovementLogic } from '../behavior-logic/player-movement-logic';
import { DinoAIStateMachine } from '../utils/dino-ai-state-machine';
import { DinoAnimationLogic } from '../behavior-logic/dino-animation-logic';
import { HideLogic } from '../behavior-logic/hide-logic';

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
    hostElement: root
  });

  scene.renderer.background.color = 0x88c070; // Gameboy-inspired green

  // Load character, dino, grass tiles, and object spritesheets
  await loadAssets([
    { src: ASSETS.GRASS_TILES, alias: 'grass_sheet' },
    { src: ASSETS.GRASS_BIOME_THINGS, alias: 'grass_biome_things' },
    { src: ASSETS.SPROUTLANDS_CHARACTER, alias: 'character_sheet' },
    { src: ASSETS.DINO_DOUX, alias: 'dino_doux' },
    { src: ASSETS.DINO_MORT, alias: 'dino_mort' },
    { src: ASSETS.DINO_TARD, alias: 'dino_tard' },
    { src: ASSETS.DINO_VITA, alias: 'dino_vita' }
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

  // Create dino animation frames (24x24 pixels, 24 frames in a row)
  const dinoDouxFrames = asTextureFrames(PIXI, dinoDouxTexture, {
    frameWidth: 24,
    frameHeight: 24,
    columns: 24,
    rows: 1
  });

  const dinoMortFrames = asTextureFrames(PIXI, dinoMortTexture, {
    frameWidth: 24,
    frameHeight: 24,
    columns: 24,
    rows: 1
  });

  const dinoTardFrames = asTextureFrames(PIXI, dinoTardTexture, {
    frameWidth: 24,
    frameHeight: 24,
    columns: 24,
    rows: 1
  });

  const dinoVitaFrames = asTextureFrames(PIXI, dinoVitaTexture, {
    frameWidth: 24,
    frameHeight: 24,
    columns: 24,
    rows: 1
  });

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

  // Create Dino 1: Doux (Follow behavior - chases player)
  const dinoDoux = new PIXI.AnimatedSprite(dinoDouxFrames);
  dinoDoux.anchor.set(0.5);
  dinoDoux.position.set(-120, -80);
  const dinoDouxEntity = asEntity<PIXI.AnimatedSprite>(dinoDoux);

  // Add animation logic
  const douxAnimLogic = new DinoAnimationLogic(dinoDouxFrames);
  douxAnimLogic.init(dinoDoux, scene.renderer);
  dinoDouxEntity.moxiEntity.addLogic(douxAnimLogic);

  // Add Chase AI - Doux will chase the player when detected
  const douxAI = DinoAIStateMachine.createChaseAI({
    speed: 1.2,
    detectionRadius: 200,
    chaseRange: 200,
    attackRange: 30,
    targetFilter: (e) => e.name === 'player'
  }, douxAnimLogic);
  dinoDouxEntity.moxiEntity.addLogic(douxAI);

  // Add state label above Doux's head
  const douxLabel = new PIXI.Text({
    text: 'Wander',
    style: {
      fontSize: 10,
      fill: 0xffffff,
      stroke: { color: 0x000000, width: 2 },
      padding: 4  // Prevent stroke from being cut off
    },
    resolution: 3  // Match camera scale for crisp text
  });
  douxLabel.anchor.set(0.5);
  douxLabel.position.set(0, -20);
  dinoDoux.addChild(douxLabel);

  scene.addChild(dinoDouxEntity);

  // Create Dino 2: Mort (Hide behavior - sneaks to nearest tree/bush when player approaches)
  const dinoMort = new PIXI.AnimatedSprite(dinoMortFrames);
  dinoMort.anchor.set(0.5);
  dinoMort.position.set(120, -80);
  const dinoMortEntity = asEntity<PIXI.AnimatedSprite>(dinoMort);

  // Add animation logic
  const mortAnimLogic = new DinoAnimationLogic(dinoMortFrames);
  mortAnimLogic.init(dinoMort, scene.renderer);
  dinoMortEntity.moxiEntity.addLogic(mortAnimLogic);

  // Add Hide logic - Mort will sneak to nearest tree/bush when player gets close
  const mortHideLogic = new HideLogic({
    speed: 1.2,
    threatDistance: 150,
    safeDistance: 200,
    hidingSpots: hidingSpots,
    target: bunny,
    hideReachedDistance: 15
  });
  mortHideLogic.init(dinoMort, scene.renderer);
  dinoMortEntity.moxiEntity.addLogic(mortHideLogic);

  // Add state label above Mort's head
  const mortLabel = new PIXI.Text({
    text: 'Idle',
    style: {
      fontSize: 10,
      fill: 0xffffff,
      stroke: { color: 0x000000, width: 2 },
      padding: 4  // Prevent stroke from being cut off
    },
    resolution: 3  // Match camera scale for crisp text
  });
  mortLabel.anchor.set(0.5);
  mortLabel.position.set(0, -20);
  dinoMort.addChild(mortLabel);

  // Create a custom logic to control animation based on hide state
  const mortHideAnimController = new (class extends Logic<PIXI.AnimatedSprite> {
    name = 'MortHideAnimController';

    update(entity: PIXI.AnimatedSprite, deltaTime: number) {
      // Update label based on hide state
      if (mortHideLogic.isCurrentlyHidden()) {
        mortLabel.text = 'Hidden';
      } else if (mortHideLogic.isSeekingHide()) {
        mortLabel.text = 'Sneaking';
      } else {
        mortLabel.text = 'Idle';
      }

      // Counter-flip label so it always faces forward
      mortLabel.scale.x = Math.abs(mortLabel.scale.x) * Math.sign(dinoMort.scale.x);

      // Play sneak animation when seeking hide or hidden
      if (mortHideLogic.isSeekingHide() || mortHideLogic.isCurrentlyHidden()) {
        if (mortAnimLogic.getCurrentAnimation() !== 'sneak') {
          mortAnimLogic.playAnimation('sneak');
        }
      }
      // Otherwise let the normal animation logic handle it
    }
  })();
  mortHideAnimController.init(dinoMort, scene.renderer);
  dinoMortEntity.moxiEntity.addLogic(mortHideAnimController);

  scene.addChild(dinoMortEntity);

  // Create Dino 3: Tard (Patrol behavior - walks pattern, chases if close)
  const dinoTard = new PIXI.AnimatedSprite(dinoTardFrames);
  dinoTard.anchor.set(0.5);
  dinoTard.position.set(-120, 80);
  const dinoTardEntity = asEntity<PIXI.AnimatedSprite>(dinoTard);

  // Add animation logic
  const tardAnimLogic = new DinoAnimationLogic(dinoTardFrames);
  tardAnimLogic.init(dinoTard, scene.renderer);
  dinoTardEntity.moxiEntity.addLogic(tardAnimLogic);

  // Add Patrol AI - Tard patrols waypoints and chases if player gets close
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
  }, tardAnimLogic);
  dinoTardEntity.moxiEntity.addLogic(tardAI);

  // Add state label above Tard's head
  const tardLabel = new PIXI.Text({
    text: 'Patrol',
    style: {
      fontSize: 10,
      fill: 0xffffff,
      stroke: { color: 0x000000, width: 2 },
      padding: 4  // Prevent stroke from being cut off
    },
    resolution: 3  // Match camera scale for crisp text
  });
  tardLabel.anchor.set(0.5);
  tardLabel.position.set(0, -20);
  dinoTard.addChild(tardLabel);

  scene.addChild(dinoTardEntity);

  // Create Dino 4: Vita (Wander behavior - random movement, attacks if close)
  const dinoVita = new PIXI.AnimatedSprite(dinoVitaFrames);
  dinoVita.anchor.set(0.5);
  dinoVita.position.set(120, 80);
  const dinoVitaEntity = asEntity<PIXI.AnimatedSprite>(dinoVita);

  // Add animation logic
  const vitaAnimLogic = new DinoAnimationLogic(dinoVitaFrames);
  vitaAnimLogic.init(dinoVita, scene.renderer);
  dinoVitaEntity.moxiEntity.addLogic(vitaAnimLogic);

  // Add Wander/Attack AI - Vita wanders randomly and attacks if player gets very close
  const vitaAI = DinoAIStateMachine.createWanderAttackAI({
    speed: 0.8,
    detectionRadius: 80,
    chaseRange: 80,
    attackRange: 40,
    targetFilter: (e) => e.name === 'player'
  }, vitaAnimLogic);
  dinoVitaEntity.moxiEntity.addLogic(vitaAI);

  // Add state label above Vita's head
  const vitaLabel = new PIXI.Text({
    text: 'Wander',
    style: {
      fontSize: 10,
      fill: 0xffffff,
      stroke: { color: 0x000000, width: 2 },
      padding: 4  // Prevent stroke from being cut off
    },
    resolution: 3  // Match camera scale for crisp text
  });
  vitaLabel.anchor.set(0.5);
  vitaLabel.position.set(0, -20);
  dinoVita.addChild(vitaLabel);

  scene.addChild(dinoVitaEntity);

  // Add logic to update labels for Doux, Tard, and Vita based on their AI states
  const labelUpdater = new (class extends Logic<PIXI.Container> {
    name = 'LabelUpdater';

    update(entity: PIXI.Container, deltaTime: number) {
      // Update Doux label
      const douxState = douxAI.getCurrentState();
      if (douxState) {
        douxLabel.text = douxState;
      }
      // Counter-flip label so it always faces forward
      douxLabel.scale.x = Math.abs(douxLabel.scale.x) * Math.sign(dinoDoux.scale.x);

      // Update Tard label
      const tardState = tardAI.getCurrentState();
      if (tardState) {
        tardLabel.text = tardState;
      }
      // Counter-flip label so it always faces forward
      tardLabel.scale.x = Math.abs(tardLabel.scale.x) * Math.sign(dinoTard.scale.x);

      // Update Vita label
      const vitaState = vitaAI.getCurrentState();
      if (vitaState) {
        vitaLabel.text = vitaState;
      }
      // Counter-flip label so it always faces forward
      vitaLabel.scale.x = Math.abs(vitaLabel.scale.x) * Math.sign(dinoVita.scale.x);
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

  // Create HUD background panel
  const hudBg = new PIXI.Graphics();
  hudBg.beginFill(0x000000, 0.7);
  hudBg.drawRoundedRect(0, 0, 320, 50, 5);
  hudBg.endFill();
  hud.addChild(hudBg);

  // Create dino info panels in the HUD
  const dinoInfos = [
    { name: 'Doux', behavior: 'Chase', color: 0xff6b35, x: 10 },
    { name: 'Mort', behavior: 'Hide', color: 0x9b59b6, x: 90 },
    { name: 'Tard', behavior: 'Patrol', color: 0x3498db, x: 170 },
    { name: 'Vita', behavior: 'Wander', color: 0x2ecc71, x: 250 }
  ];

  dinoInfos.forEach(info => {
    // Color indicator
    const indicator = new PIXI.Graphics();
    indicator.beginFill(info.color);
    indicator.drawCircle(0, 0, 6);
    indicator.endFill();
    indicator.position.set(info.x + 8, 15);
    hud.addChild(indicator);

    // Dino name
    const nameText = new PIXI.Text({
      text: info.name,
      style: {
        fontSize: 11,
        fill: 0xffffff,
        fontWeight: 'bold'
      },
      resolution: 2  // Higher resolution for HUD text
    });
    nameText.position.set(info.x + 18, 8);
    hud.addChild(nameText);

    // Behavior label
    const behaviorText = new PIXI.Text({
      text: info.behavior,
      style: {
        fontSize: 9,
        fill: 0xcccccc
      },
      resolution: 2  // Higher resolution for HUD text
    });
    behaviorText.position.set(info.x + 18, 24);
    hud.addChild(behaviorText);
  });

  // Add HUD to the UI layer (stays fixed on screen)
  uiLayer.addChild(hud);

  // Modify the scene's draw method to render the stage instead
  const originalDraw = scene.draw.bind(scene);
  scene.draw = function(deltaTime: number) {
    scene.renderer.render(stage);
  };

  // Initialize and start
  scene.init();
  engine.start();

  console.log('✅ Dino AI Behaviors example loaded - Watch the dinos interact!');
}
