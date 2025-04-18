import { Behavior, ClientEvents } from 'moxi';
import PIXI from 'pixi.js';

// Define animation directions based on sprite sheet layout
export const DIRECTION = {
  DOWN: 0,  // First row
  UP: 1,    // Second row
  LEFT: 2,  // Third row
  RIGHT: 3, // Fourth row
} as const;

// Use type for type safety
export type Direction = typeof DIRECTION[keyof typeof DIRECTION];

// Default movement settings
export interface MovementOptions {
  /** Movement speed in pixels per frame */
  speed: number;
  /** Animation speed (time between frame changes) */
  animationSpeed: number;
  /** Number of animation frames per direction */
  framesPerDirection: number;
  /** Whether diagonal movement is allowed */
  allowDiagonal?: boolean;
}

// Default options
export const DEFAULT_MOVEMENT_OPTIONS: MovementOptions = {
  speed: 2,
  animationSpeed: 0.15,
  framesPerDirection: 4,
  allowDiagonal: false
};

/**
 * Generic movement behavior that can be applied to any sprite using directional animations
 */
export class MovementBehavior extends Behavior<PIXI.AnimatedSprite> {
  // Properties
  private clientEvents: ClientEvents;
  private direction: Direction = DIRECTION.DOWN;
  private moving: boolean = false;
  private animationTimer: number = 0;
  private textures: PIXI.Texture[];
  private options: MovementOptions;
  
  /**
   * Create a new movement behavior
   * @param options - Movement configuration options
   */
  constructor(options: Partial<MovementOptions> = {}) {
    super();
    this.options = { ...DEFAULT_MOVEMENT_OPTIONS, ...options };
  }
  
  /**
   * Initialize the behavior
   * @param entity - The sprite entity to control
   * @param renderer - The PIXI renderer
   * @param textures - Array of textures for animation frames
   */
  init(entity: PIXI.AnimatedSprite, renderer: PIXI.Renderer<HTMLCanvasElement>, textures: PIXI.Texture[]) {
    this.textures = textures;
    this.clientEvents = new ClientEvents();
    
    // Set initial idle frame
    this.updateTexture(entity, 0);
  }
  
  /**
   * Update entity movement based on input
   * @param entity - The entity to update
   * @param deltaTime - Time elapsed since last update
   */
  update(entity: PIXI.AnimatedSprite, deltaTime: number) {
    // Reset moving state
    let isMoving = false;
    const { speed } = this.options;
    
    // Track movement in both axes for diagonal movement handling
    let movingX = false;
    let movingY = false;
    
    // Handle vertical movement
    if (this.clientEvents.isKeyDown('ArrowUp')) {
      entity.y -= speed;
      this.direction = DIRECTION.UP;
      isMoving = true;
      movingY = true;
    } else if (this.clientEvents.isKeyDown('ArrowDown')) {
      entity.y += speed;
      this.direction = DIRECTION.DOWN;
      isMoving = true;
      movingY = true;
    }
    
    // Handle horizontal movement
    if (this.clientEvents.isKeyDown('ArrowLeft')) {
      entity.x -= speed;
      if (!movingY || this.options.allowDiagonal) {
        this.direction = DIRECTION.LEFT;
      }
      isMoving = true;
      movingX = true;
    } else if (this.clientEvents.isKeyDown('ArrowRight')) {
      entity.x += speed;
      if (!movingY || this.options.allowDiagonal) {
        this.direction = DIRECTION.RIGHT;
      }
      isMoving = true;
      movingX = true;
    }
    
    // Handle animation
    if (isMoving) {
      this.animationTimer += deltaTime;
      if (this.animationTimer >= this.options.animationSpeed) {
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
   * Get the current direction of movement
   */
  getDirection(): Direction {
    return this.direction;
  }
  
  /**
   * Check if the entity is currently moving
   */
  isMoving(): boolean {
    return this.moving;
  }
  
  /**
   * Update the entity's texture for animation
   */
  private updateAnimation(entity: PIXI.AnimatedSprite) {
    // Get current frame or default to 0
    const currentFrame = entity.currentFrame || 0;
    
    // Cycle through the walking animation frames
    const nextFrame = (currentFrame % (this.options.framesPerDirection - 1)) + 1;
    
    this.updateTexture(entity, nextFrame);
  }
  
  /**
   * Set the texture based on direction and frame number
   */
  private updateTexture(entity: PIXI.AnimatedSprite, frameNumber: number) {
    // Calculate the index in the texture array based on direction and frame
    const index = this.direction * this.options.framesPerDirection + frameNumber;
    
    // Set the texture if it exists
    if (this.textures?.[index]) {
      entity.texture = this.textures[index];
      entity.currentFrame = frameNumber;
    }
  }
} 