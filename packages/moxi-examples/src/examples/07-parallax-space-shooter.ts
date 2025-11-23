import {
  setupMoxi,
  asEntity,
  CameraLogic,
  ParallaxBackground,
  TilingParallaxLayer,
  Logic,
  asSprite
} from 'moxi';
import * as PIXI from 'pixi.js';
import { ASSETS } from '../assets-config';
import { ClientEvents } from 'moxi';

/**
 * Parallax Space Shooter Example
 * Demonstrates parallax scrolling with multiple layers at different speeds
 * Features:
 * - Nebula background layer (slow scroll - 0.3x)
 * - Stars foreground layer (medium scroll - 0.6x)
 * - Player ship with keyboard controls
 * - Camera following the player
 * - Mouse wheel zoom in/out to test parallax with camera scale
 */

/**
 * HUD display logic for debugging camera and ship positions
 */
class HudDisplayLogic extends Logic<PIXI.Container> {
  name = 'HudDisplayLogic';
  private shipText: PIXI.Text;
  private cameraText: PIXI.Text;
  private zoomText: PIXI.Text;
  private ship: PIXI.Sprite;
  private camera: any;

  constructor(ship: PIXI.Sprite, camera: any) {
    super();
    this.ship = ship;
    this.camera = camera;
  }

  init(entity: PIXI.Container, renderer: PIXI.Renderer) {
    const textStyle = new PIXI.TextStyle({
      fontFamily: 'monospace',
      fontSize: 14,
      fill: 0xFFFFFF,
      stroke: { color: 0x000000, width: 2 }
    });

    this.shipText = new PIXI.Text({ text: '', style: textStyle });
    this.shipText.position.set(10, 10);

    this.cameraText = new PIXI.Text({ text: '', style: textStyle });
    this.cameraText.position.set(10, 30);

    this.zoomText = new PIXI.Text({ text: '', style: textStyle });
    this.zoomText.position.set(10, 50);

    entity.addChild(this.shipText);
    entity.addChild(this.cameraText);
    entity.addChild(this.zoomText);
  }

  update(entity: PIXI.Container, deltaTime: number) {
    // Position HUD in screen space by countering scene transforms
    // HUD is in the scene, so we need to position it relative to camera
    const scene = entity.parent;
    if (scene) {
      // Counter the scene's position and scale to stay in screen space
      entity.position.x = -scene.position.x / scene.scale.x;
      entity.position.y = -scene.position.y / scene.scale.y;
      entity.scale.x = 1 / scene.scale.x;
      entity.scale.y = 1 / scene.scale.y;
    }

    // Update text with current values
    this.shipText.text = `Ship: (${this.ship.x.toFixed(1)}, ${this.ship.y.toFixed(1)})`;
    this.cameraText.text = `Camera: (${this.camera.position.x.toFixed(1)}, ${this.camera.position.y.toFixed(1)})`;
    this.zoomText.text = `Zoom: ${this.camera.scale.x.toFixed(2)}x`;
  }
}

/**
 * Camera zoom logic using mouse wheel
 */
class CameraZoomLogic extends Logic<any> {
  name = 'CameraZoomLogic';
  private clientEvents: ClientEvents;
  private minZoom: number = 0.5;
  private maxZoom: number = 3;
  private zoomSpeed: number = 0.1;

  init(entity: any, renderer: PIXI.Renderer) {
    this.clientEvents = new ClientEvents();
  }

  update(entity: any, deltaTime: number) {
    // Get wheel delta from ClientEvents
    const wheelDelta = this.clientEvents.wheelOffsets.y;

    if (wheelDelta !== 0) {
      // Zoom in (wheel up) or out (wheel down)
      const zoomDelta = -wheelDelta * this.zoomSpeed * 0.01;
      const newZoom = entity.desiredScale.x + zoomDelta;

      // Clamp zoom to min/max range
      const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, newZoom));

      entity.desiredScale.set(clampedZoom);

      // Reset wheel offsets after processing
      this.clientEvents.wheelOffsets.y = 0;
    }
  }
}

/**
 * Simple ship movement logic for top-down space shooter
 */
class ShipMovementLogic extends Logic<PIXI.Sprite> {
  name = 'ShipMovementLogic';
  private clientEvents: ClientEvents;
  private speed: number = 5; // Increased for more responsive feel

  init(entity: PIXI.Sprite, renderer: PIXI.Renderer) {
    this.clientEvents = new ClientEvents();

    // Center the ship
    entity.anchor.set(0.5);
    entity.x = 0;
    entity.y = 0;

    console.log('🚀 Ship initialized - Use arrow keys to fly!');
  }

  update(entity: PIXI.Sprite, deltaTime: number) {
    const velocity = new PIXI.Point(0, 0);

    // Read keyboard input
    if (this.clientEvents.isKeyDown('ArrowUp') || this.clientEvents.isKeyDown('w')) {
      velocity.y -= 1;
    }
    if (this.clientEvents.isKeyDown('ArrowDown') || this.clientEvents.isKeyDown('s')) {
      velocity.y += 1;
    }
    if (this.clientEvents.isKeyDown('ArrowLeft') || this.clientEvents.isKeyDown('a')) {
      velocity.x -= 1;
    }
    if (this.clientEvents.isKeyDown('ArrowRight') || this.clientEvents.isKeyDown('d')) {
      velocity.x += 1;
    }

    // Normalize diagonal movement
    if (velocity.x !== 0 && velocity.y !== 0) {
      const length = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      velocity.x /= length;
      velocity.y /= length;
    }

    // Apply movement
    entity.x += velocity.x * this.speed * deltaTime;
    entity.y += velocity.y * this.speed * deltaTime;

    // Rotate ship to face movement direction
    if (velocity.x !== 0 || velocity.y !== 0) {
      const angle = Math.atan2(velocity.y, velocity.x);
      // Ship sprite faces right by default, so add PI/2 to point up
      entity.rotation = angle + Math.PI / 2;
    }
  }
}

export async function initParallaxSpaceShooter() {
  const root = document.getElementById('canvas-container');
  if (!root) throw new Error('App element not found');

  const { scene, engine, loadAssets, camera, PIXIAssets } = await setupMoxi({
    hostElement: root,
    showLoadingScene: true
  });

  // Set space background color
  scene.renderer.background.color = 0xFF69B4; // Hot pink (DEBUG)

  // Load space assets
  await loadAssets([
    { src: ASSETS.SPACE_NEBULA_BLUE, alias: 'nebula' },
    { src: ASSETS.SPACE_STARS_SMALL_2, alias: 'stars' },
    { src: ASSETS.SPACE_SHOOTER_JSON, alias: 'space_shooter' }
  ]);

  console.log('✅ Space assets loaded');

  // Create parallax background container
  const parallaxBg = new ParallaxBackground({
    camera: camera
  });

  // Layer 1: Nebula (slowest - appears farthest away)
  const nebulaTexture = PIXIAssets.get('nebula');
  const nebulaLayer = new TilingParallaxLayer({
    texture: nebulaTexture,
    scrollScale: new PIXI.Point(0.3, 0.3) // Moves at 30% of camera speed
    // width/height auto-detected from renderer
  });
  parallaxBg.addLayer(nebulaLayer);

  // Layer 2: Stars (medium speed - closer than nebula)
  const starsTexture = PIXIAssets.get('stars');
  const starsLayer = new TilingParallaxLayer({
    texture: starsTexture,
    scrollScale: new PIXI.Point(0.6, 0.6) // Moves at 60% of camera speed
    // width/height auto-detected from renderer
  });
  // Scale stars down by 50% for smaller, more numerous appearance
  starsLayer.tilingSprite.tileScale.set(0.5, 0.5);
  parallaxBg.addLayer(starsLayer);

  // Add parallax background to scene
  scene.addChild(parallaxBg);

  // Create player ship
  // PIXI.Assets.get with spritesheet returns the spritesheet, access textures via .textures
  const spaceShooterSheet = PIXIAssets.get('space_shooter');
  const playerTexture = spaceShooterSheet.textures['playerShip1_blue.png'];

  const playerShip = asSprite(
    { texture: playerTexture },
    { scale: 0.5 }
  );

  // Convert to Moxi entity
  const shipEntity = asEntity<PIXI.Sprite>(playerShip);

  // Add ship movement logic
  const movementLogic = new ShipMovementLogic();
  shipEntity.moxiEntity.addLogic(movementLogic);

  // Add ship to scene
  scene.addChild(shipEntity);

  // Set up camera to follow the player
  camera.desiredScale.set(1.5); // Slight zoom
  const cameraLogic = camera.moxiEntity.getLogic<CameraLogic>('CameraLogic');
  cameraLogic.target = playerShip;
  cameraLogic.speed = 0.05; // Smooth camera following

  // Add zoom control with mouse wheel
  camera.moxiEntity.addLogic(new CameraZoomLogic());

  // Create HUD container (in screen space, not affected by camera)
  const hudContainer = new PIXI.Container();
  const hudEntity = asEntity(hudContainer);
  hudEntity.moxiEntity.addLogic(new HudDisplayLogic(playerShip, camera));

  // Add HUD directly to renderer/stage, not to scene
  // We need to render it separately after the scene
  // For now, add it to scene but we'll position it in screen space
  scene.addChild(hudEntity);

  // Initialize and start
  scene.init();
  engine.start();

  console.log('✅ Parallax Space Shooter loaded!');
  console.log('   🎮 Controls: Arrow keys or WASD to move');
  console.log('   🖱️  Mouse wheel: Zoom in/out (0.5x - 3x)');
  console.log('   🌌 Watch the parallax effect as you move!');
  console.log('   📊 Nebula layer: 0.3x speed (far)');
  console.log('   ⭐ Stars layer: 0.6x speed (closer)');
}
