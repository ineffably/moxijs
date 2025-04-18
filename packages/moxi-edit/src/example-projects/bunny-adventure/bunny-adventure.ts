import { prepMoxi, asEntity, Behavior, ClientEvents, asTextureFrames, CameraBehavior } from 'moxi';
import PIXI, { TextureSource } from 'pixi.js';

// Define animation directions based on sprite sheet layout
const DIRECTION = {
  DOWN: 0,  // First row
  UP: 1,    // Second row
  LEFT: 2,  // Third row
  RIGHT: 3, // Fourth row
} as const;

// Use type for type safety
type Direction = typeof DIRECTION[keyof typeof DIRECTION];

// Constants for player movement
const PLAYER_SPEED = 2;
const ANIMATION_SPEED = 0.15;

/**
 * Behavior that handles player movement using arrow keys
 */
class BunnyMovementBehavior extends Behavior<PIXI.AnimatedSprite> {
  // Properties
  private clientEvents: ClientEvents;
  private direction: Direction = DIRECTION.DOWN;
  private moving: boolean = false;
  private animationTimer: number = 0;
  private textures: PIXI.Texture[];
  
  /**
   * Initialize the behavior
   */
  init(entity: PIXI.AnimatedSprite, renderer: PIXI.Renderer<HTMLCanvasElement>, textures: PIXI.Texture[]) {
    this.textures = textures;
    this.clientEvents = new ClientEvents();
    
    // Set initial idle frame
    this.updateTexture(entity, 0);
  }
  
  /**
   * Update the player movement based on input
   */
  update(entity: PIXI.AnimatedSprite, deltaTime: number) {
    // Reset moving state
    let isMoving = false;
    
    // Handle movement based on arrow key input
    if (this.clientEvents.isKeyDown('ArrowUp')) {
      entity.y -= PLAYER_SPEED;
      this.direction = DIRECTION.UP;
      isMoving = true;
    } else if (this.clientEvents.isKeyDown('ArrowDown')) {
      entity.y += PLAYER_SPEED;
      this.direction = DIRECTION.DOWN;
      isMoving = true;
    }
    
    if (this.clientEvents.isKeyDown('ArrowLeft')) {
      entity.x -= PLAYER_SPEED;
      this.direction = DIRECTION.LEFT;
      isMoving = true;
    } else if (this.clientEvents.isKeyDown('ArrowRight')) {
      entity.x += PLAYER_SPEED;
      this.direction = DIRECTION.RIGHT;
      isMoving = true;
    }
    
    // Handle animation
    if (isMoving) {
      this.animationTimer += deltaTime;
      if (this.animationTimer >= ANIMATION_SPEED) {
        this.animationTimer = 0;
        this.updateAnimation(entity);
      }
    } else if (this.moving) {
      // Reset to idle frame when stopping
      this.updateTexture(entity, 0);
    }
    
    // Update moving state
    this.moving = isMoving;
  }
  
  /**
   * Update the player's texture for animation
   */
  private updateAnimation(entity: PIXI.AnimatedSprite) {
    // Get current frame or default to 0
    const currentFrame = entity.currentFrame || 0;
    
    // Cycle through the walking animation (frames 1-3)
    const nextFrame = (currentFrame % 3) + 1;
    
    this.updateTexture(entity, nextFrame);
  }
  
  /**
   * Set the texture based on direction and frame number
   */
  private updateTexture(entity: PIXI.AnimatedSprite, frameNumber: number) {
    // Calculate the index in the texture array based on direction and frame
    const index = this.direction * 4 + frameNumber;
    
    // Set the texture if it exists
    if (this.textures?.[index]) {
      entity.texture = this.textures[index];
      entity.currentFrame = frameNumber;
    }
  }
}

export const init = (async () => {
  const root = document.getElementById('app');
  const { scene, engine, loadAssets, camera, PIXIAssets } = await prepMoxi({ 
    hostElement: root,
    renderOptions: {
      width: 800,
      height: 600,
      backgroundColor: 0x88c070 // Gameboy-inspired green
    }
  });
  
  // Load character spritesheet
  const assetList = [
    { src: './assets/sproutlands/characters/basic-spritesheet.png', alias: 'character_sheet' },
  ];
  
  await loadAssets(assetList);
  
  // Set up camera
  camera.desiredScale.set(3);
  
  // Get the character sheet texture using the new utility function
  const baseTexture = PIXIAssets.get<TextureSource>('character_sheet');
  baseTexture.source.style.scaleMode = 'nearest';
  
  // Create texture frames from the character spritesheet
  const characterFrames = asTextureFrames(PIXI, baseTexture, { 
    frameWidth: 48, 
    frameHeight: 48, 
    columns: 4, 
    rows: 4 
  });
  
  // Create bunny player sprite
  const bunny = new PIXI.AnimatedSprite(characterFrames);
  bunny.anchor.set(0.5);
  
  
  // Convert to Moxi entity and add the movement behavior
  const bunnyEntity = asEntity<PIXI.AnimatedSprite>(bunny);
  bunnyEntity.moxiEntity.addBehavior(new BunnyMovementBehavior());
  
  
  // Add player to scene
  scene.addChild(bunnyEntity);
  
  // Make camera follow the player
  camera.moxiEntity.getBehavior<CameraBehavior>('CameraBehavior').target = bunny;
  
  // Initialize and start
  scene.init();
  engine.start();
});

// If we are loading this in moxi-edit, call the init function directly
if ((window as any).moxiedit) {
  init();
} 