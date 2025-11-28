import { Logic } from 'moxi-kit';
import * as PIXI from 'pixi.js';

/**
 * Animation ranges for dino sprite sheets
 */
export const DINO_ANIMATIONS = {
  idle: { start: 0, end: 3, speed: 0.1 },      // 4 frames
  walk: { start: 4, end: 9, speed: 0.15 },     // 6 frames
  attack: { start: 10, end: 13, speed: 0.2 },  // 4 frames
  hurt: { start: 14, end: 17, speed: 0.15 },   // 4 frames
  sneak: { start: 18, end: 23, speed: 0.1 }    // 6 frames
};

export type DinoAnimation = keyof typeof DINO_ANIMATIONS;

/**
 * DinoAnimationLogic - Manages dino sprite animations
 *
 * This logic component handles switching between different animation
 * states for dino characters based on their movement and AI state.
 *
 * @example
 * ```typescript
 * const animLogic = new DinoAnimationLogic(dinoFrames);
 * dinoEntity.moxiEntity.addLogic(animLogic);
 *
 * // Later, change animation
 * animLogic.playAnimation('walk');
 * ```
 */
export class DinoAnimationLogic extends Logic<PIXI.AnimatedSprite> {
  name = 'DinoAnimationLogic';

  private allFrames: PIXI.Texture[];
  private currentAnimation: DinoAnimation = 'idle';
  private isMoving: boolean = false;
  private lastPosition: PIXI.Point = new PIXI.Point(0, 0);
  private animatedSprite: PIXI.AnimatedSprite | null = null;

  constructor(frames: PIXI.Texture[]) {
    super();
    this.allFrames = frames;
  }

  init(entity: PIXI.AnimatedSprite, renderer: PIXI.Renderer) {
    // Store reference to entity
    this.animatedSprite = entity;

    // Store initial position for movement detection
    this.lastPosition.set(entity.x, entity.y);

    // Set initial animation to idle
    this.playAnimation('idle');
  }

  update(entity: PIXI.AnimatedSprite, deltaTime: number) {
    // Detect if entity is moving by comparing positions
    const dx = entity.x - this.lastPosition.x;
    const dy = entity.y - this.lastPosition.y;
    const distanceMoved = Math.sqrt(dx * dx + dy * dy);

    this.isMoving = distanceMoved > 0.1; // Small threshold to avoid jitter

    // Update last position
    this.lastPosition.set(entity.x, entity.y);

    // Auto-switch between idle and walk based on movement
    // (Unless manually set to attack, hurt, or sneak)
    if (this.currentAnimation !== 'attack' &&
        this.currentAnimation !== 'hurt' &&
        this.currentAnimation !== 'sneak') {

      const desiredAnimation = this.isMoving ? 'walk' : 'idle';
      if (desiredAnimation !== this.currentAnimation) {
        this.playAnimation(desiredAnimation);
      }
    }
  }

  /**
   * Play a specific animation
   */
  playAnimation(animation: DinoAnimation) {
    if (!this.animatedSprite) return;
    if (this.currentAnimation === animation) return;

    this.currentAnimation = animation;
    const animDef = DINO_ANIMATIONS[animation];

    // Extract frames for this animation
    const animFrames = this.allFrames.slice(animDef.start, animDef.end + 1);

    // Update the animated sprite's textures
    this.animatedSprite.textures = animFrames;
    this.animatedSprite.animationSpeed = animDef.speed;
    this.animatedSprite.loop = true;
    this.animatedSprite.gotoAndPlay(0);
  }

  /**
   * Get current animation name
   */
  getCurrentAnimation(): DinoAnimation {
    return this.currentAnimation;
  }

  /**
   * Check if entity is currently moving
   */
  getIsMoving(): boolean {
    return this.isMoving;
  }

  /**
   * Force animation to a specific state (useful for attack, hurt, etc.)
   */
  forceAnimation(animation: DinoAnimation, duration?: number) {
    this.playAnimation(animation);

    // If duration specified, return to auto-animation after delay
    if (duration !== undefined) {
      setTimeout(() => {
        // Animation will auto-switch on next update based on movement
        this.currentAnimation = this.isMoving ? 'walk' : 'idle';
      }, duration);
    }
  }
}
