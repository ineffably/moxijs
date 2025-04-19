import { Behavior, ClientEvents } from 'moxi';
import PIXI from 'pixi.js';
import { TextureFrameSequences } from './texture-frame-sequences';

// Define animation directions
export const DIRECTION = {
  DOWN: 'down',
  UP: 'up',
  LEFT: 'left',
  RIGHT: 'right'
} as const;

// Use type for type safety
export type Direction = typeof DIRECTION[keyof typeof DIRECTION];

// Animation states
export const ANIMATION_STATE = {
  IDLE: 'idle',
  WALK: 'walk'
} as const;

export type AnimationState = typeof ANIMATION_STATE[keyof typeof ANIMATION_STATE];

// Default movement settings
export interface MovementOptions {
  /** Movement speed in pixels per frame */
  speed: number;
  /** Whether diagonal movement is allowed */
  allowDiagonal?: boolean;
}

// Default options
export const DEFAULT_MOVEMENT_OPTIONS: MovementOptions = {
  speed: 2,
  allowDiagonal: false
};

/**
 * Generic movement behavior that can be applied to any sprite using directional animations
 */
export class MovementBehavior extends Behavior<PIXI.AnimatedSprite> {
  // Properties
  private clientEvents: ClientEvents;
  private direction: Direction = DIRECTION.DOWN;
  private state: AnimationState = ANIMATION_STATE.IDLE;
  private moving: boolean = false;
  private animationTimer: number = 0;
  private frameIndex: number = 0;
  private options: MovementOptions;
  private frameSequences: TextureFrameSequences;
  private currentSequenceName: string = '';
  private velocity: PIXI.Point = new PIXI.Point(0, 0);
  
  /**
   * Create a new movement behavior
   * @param options - Movement configuration options
   * @param frameSequences - Animation frame sequences
   */
  constructor(options: Partial<MovementOptions> = {}, frameSequences: TextureFrameSequences) {
    super();
    this.options = { ...DEFAULT_MOVEMENT_OPTIONS, ...options };
    this.frameSequences = frameSequences;
  }
  
  /**
   * Initialize the behavior
   * @param entity - The sprite entity to control
   * @param renderer - The PIXI renderer
   */
  init(entity: PIXI.AnimatedSprite, renderer: PIXI.Renderer<HTMLCanvasElement>) {
    this.clientEvents = new ClientEvents();
    
    // Set initial idle frame
    this.setAnimationState(ANIMATION_STATE.IDLE, this.direction);
    this.updateTexture(entity);
  }
  
  /**
   * Get a sequence key (e.g., "idleDown", "walkLeft")
   */
  private getSequenceKey(state: AnimationState, direction: Direction): string {
    return `${state}${direction.charAt(0).toUpperCase() + direction.slice(1)}`;
  }
  
  /**
   * Set the current animation state and direction
   */
  private setAnimationState(state: AnimationState, direction: Direction) {
    this.state = state;
    this.direction = direction;
    
    // Get the sequence key
    this.currentSequenceName = this.getSequenceKey(state, direction);
    
    // Reset animation timer and frame index
    this.animationTimer = 0;
    this.frameIndex = 0;
  }
  
  /**
   * Get the dominant direction from a velocity vector
   */
  private getDirectionFromVelocity(velocity: PIXI.Point): Direction {
    // If we're not moving, keep current direction
    if (velocity.x === 0 && velocity.y === 0) {
      return this.direction;
    }
    
    // Determine dominant direction based on vector components
    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
      // Horizontal movement is dominant
      return velocity.x > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
    } else {
      // Vertical movement is dominant
      return velocity.y > 0 ? DIRECTION.DOWN : DIRECTION.UP;
    }
  }
  
  /**
   * Normalize a vector to maintain consistent speed in all directions
   */
  private normalizeVelocity(velocity: PIXI.Point, speed: number): PIXI.Point {
    // If no movement, return zero vector
    if (velocity.x === 0 && velocity.y === 0) {
      return velocity;
    }
    
    // Calculate the length of the vector
    const length = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    // Normalize the vector and scale by speed
    if (length > 0) {
      velocity.x = (velocity.x / length) * speed;
      velocity.y = (velocity.y / length) * speed;
    }
    
    return velocity;
  }
  
  /**
   * Update entity movement based on input
   * @param entity - The entity to update
   * @param deltaTime - Time elapsed since last update
   */
  update(entity: PIXI.AnimatedSprite, deltaTime: number) {
    const { speed } = this.options;
    
    // Reset velocity vector
    this.velocity.set(0, 0);
    
    // Calculate movement based on key presses
    if (this.clientEvents.isKeyDown('ArrowUp')) {
      this.velocity.y -= 1;
    }
    if (this.clientEvents.isKeyDown('ArrowDown')) {
      this.velocity.y += 1;
    }
    if (this.clientEvents.isKeyDown('ArrowLeft')) {
      this.velocity.x -= 1;
    }
    if (this.clientEvents.isKeyDown('ArrowRight')) {
      this.velocity.x += 1;
    }
    
    // Normalize velocity to maintain constant speed in all directions
    this.normalizeVelocity(this.velocity, speed);
    
    // Apply movement
    entity.x += this.velocity.x;
    entity.y += this.velocity.y;
    
    // Determine if we're moving
    const isMoving = this.velocity.x !== 0 || this.velocity.y !== 0;
    
    // Get dominant direction
    const newDirection = this.getDirectionFromVelocity(this.velocity);
    
    // Update animation state if movement state changed
    const newState = isMoving ? ANIMATION_STATE.WALK : ANIMATION_STATE.IDLE;
    if (newState !== this.state || newDirection !== this.direction) {
      this.setAnimationState(newState, newDirection);
      this.updateTexture(entity);
    }
    
    // Handle animation timing
    const sequence = this.frameSequences.getSequence(this.currentSequenceName);
    if (sequence && sequence.frames.length > 0) {
      this.animationTimer += deltaTime;
      const animSpeed = sequence.speed;
      
      if (this.animationTimer >= animSpeed) {
        this.animationTimer = 0;
        this.updateAnimation(entity);
      }
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
   * Get the current animation state
   */
  getAnimationState(): AnimationState {
    return this.state;
  }
  
  /**
   * Check if the entity is currently moving
   */
  isMoving(): boolean {
    return this.moving;
  }
  
  /**
   * Get the current velocity
   */
  getVelocity(): PIXI.Point {
    return this.velocity;
  }
  
  /**
   * Update the entity's texture for animation
   */
  private updateAnimation(entity: PIXI.AnimatedSprite) {
    const sequence = this.frameSequences.getSequence(this.currentSequenceName);
    if (!sequence || sequence.frames.length === 0) return;
    
    // Move to the next frame in the current sequence
    this.frameIndex = (this.frameIndex + 1) % sequence.frames.length;
    this.updateTexture(entity);
  }
  
  /**
   * Set the texture based on the current frame in the sequence
   */
  private updateTexture(entity: PIXI.AnimatedSprite) {
    const sequence = this.frameSequences.getSequence(this.currentSequenceName);
    if (!sequence || sequence.frames.length === 0) return;
    
    // Get the texture index from the current sequence
    const textureIndex = sequence.frames[this.frameIndex];
    const frame = this.frameSequences.getFrame(textureIndex);
    
    // Set the texture if it exists
    if (frame) {
      entity.texture = frame;
    }
  }
} 