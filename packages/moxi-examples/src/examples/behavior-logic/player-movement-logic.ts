import { Logic, ClientEvents, TextureFrameSequences } from 'moxi';
import * as PIXI from 'pixi.js';

// Define animation directions
export const DIRECTION = {
  DOWN: 'down',
  UP: 'up',
  LEFT: 'left',
  RIGHT: 'right'
} as const;

export type Direction = typeof DIRECTION[keyof typeof DIRECTION];

// Animation states
export const ANIMATION_STATE = {
  IDLE: 'idle',
  WALK: 'walk'
} as const;

export type AnimationState = typeof ANIMATION_STATE[keyof typeof ANIMATION_STATE];

// Default movement settings
export interface MovementOptions {
  speed: number;
  allowDiagonal?: boolean;
}

export const DEFAULT_MOVEMENT_OPTIONS: MovementOptions = {
  speed: 2,
  allowDiagonal: true
};

/**
 * Generic movement logic that can be applied to any sprite using directional animations
 */
export class PlayerMovementLogic extends Logic<PIXI.AnimatedSprite> {
  private clientEvents: ClientEvents;
  private direction: Direction = DIRECTION.DOWN;
  private animationState: AnimationState = ANIMATION_STATE.IDLE;
  private moving: boolean = false;
  private animationTimer: number = 0;
  private frameIndex: number = 0;
  private options: MovementOptions;
  private frameSequences: TextureFrameSequences;
  private currentSequenceName: string = '';
  private velocity: PIXI.Point = new PIXI.Point(0, 0);
  
  constructor(options: Partial<MovementOptions> = {}, frameSequences: TextureFrameSequences) {
    super();
    this.options = { ...DEFAULT_MOVEMENT_OPTIONS, ...options };
    this.frameSequences = frameSequences;
  }
  
  init(entity: PIXI.AnimatedSprite, renderer: PIXI.Renderer<HTMLCanvasElement>) {
    this.clientEvents = new ClientEvents();
    this.setAnimationState(ANIMATION_STATE.IDLE, this.direction);
    this.updateTexture(entity);
  }
  
  private getSequenceKey(state: AnimationState, direction: Direction): string {
    return `${state}${direction.charAt(0).toUpperCase() + direction.slice(1)}`;
  }
  
  private setAnimationState(state: AnimationState, direction: Direction) {
    this.animationState = state;
    this.direction = direction;
    this.currentSequenceName = this.getSequenceKey(state, direction);
    this.animationTimer = 0;
    this.frameIndex = 0;
  }
  
  private getDirectionFromVelocity(velocity: PIXI.Point): Direction {
    if (velocity.x === 0 && velocity.y === 0) {
      return this.direction;
    }
    
    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
      return velocity.x > 0 ? DIRECTION.RIGHT : DIRECTION.LEFT;
    } else {
      return velocity.y > 0 ? DIRECTION.DOWN : DIRECTION.UP;
    }
  }
  
  private normalizeVelocity(velocity: PIXI.Point, speed: number): PIXI.Point {
    if (velocity.x === 0 && velocity.y === 0) {
      return velocity;
    }
    
    const length = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
    
    if (length > 0) {
      velocity.x = (velocity.x / length) * speed;
      velocity.y = (velocity.y / length) * speed;
    }
    
    return velocity;
  }
  
  update(entity: PIXI.AnimatedSprite, deltaTime: number) {
    const { clientEvents, frameSequences, velocity } = this;
    const { speed } = this.options;
    
    // Reset velocity vector
    this.velocity.set(0, 0);
    
    // Calculate movement based on key presses
    if (clientEvents.isKeyDown('ArrowUp')) {
      velocity.y -= 1;
    }
    if (clientEvents.isKeyDown('ArrowDown')) {
      velocity.y += 1;
    }
    if (clientEvents.isKeyDown('ArrowLeft')) {
      velocity.x -= 1;
    }
    if (clientEvents.isKeyDown('ArrowRight')) {
      velocity.x += 1;
    }
    
    // Normalize velocity to maintain constant speed
    this.normalizeVelocity(velocity, speed);
    
    // Apply movement
    entity.x += velocity.x;
    entity.y += velocity.y;
    
    // Determine if we're moving
    const isMoving = velocity.x !== 0 || velocity.y !== 0;
    
    // Get dominant direction
    const newDirection = this.getDirectionFromVelocity(velocity);
    
    // Update animation state if movement state changed
    const newState = isMoving ? ANIMATION_STATE.WALK : ANIMATION_STATE.IDLE;
    if (newState !== this.animationState || newDirection !== this.direction) {
      this.setAnimationState(newState, newDirection);
      this.updateTexture(entity);
    }
    
    // Handle animation timing
    const sequence = frameSequences.getSequence(this.currentSequenceName);
    if (sequence && sequence.frames.length > 0) {
      this.animationTimer += deltaTime;
      const animSpeed = sequence.animationSpeed;
      
      if (this.animationTimer >= animSpeed) {
        this.animationTimer = 0;
        this.updateAnimation(entity);
      }
    }
    
    this.moving = isMoving;
  }
  
  getDirection(): Direction {
    return this.direction;
  }
  
  getAnimationState(): AnimationState {
    return this.animationState;
  }
  
  isMoving(): boolean {
    return this.moving;
  }
  
  getVelocity(): PIXI.Point {
    return this.velocity;
  }
  
  private updateAnimation(entity: PIXI.AnimatedSprite) {
    const sequence = this.frameSequences.getSequence(this.currentSequenceName);
    if (!sequence || sequence.frames.length === 0) return;
    
    this.frameIndex = (this.frameIndex + 1) % sequence.frames.length;
    this.updateTexture(entity);
  }
  
  private updateTexture(entity: PIXI.AnimatedSprite) {
    const sequence = this.frameSequences.getSequence(this.currentSequenceName);
    if (!sequence || sequence.frames.length === 0) return;
    
    const textureIndex = sequence.frames[this.frameIndex];
    const frame = this.frameSequences.getFrame(textureIndex);
    
    if (frame) {
      entity.texture = frame;
    }
  }
}

