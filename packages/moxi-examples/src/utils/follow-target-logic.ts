import { Logic } from 'moxi';
import * as PIXI from 'pixi.js';

/**
 * Configuration options for FollowTargetLogic
 */
export interface FollowTargetOptions {
  /**
   * Movement speed in pixels per frame
   */
  speed: number;

  /**
   * Minimum distance to maintain from target
   * Entity will stop moving when within this distance
   * @default 0
   */
  stopDistance?: number;

  /**
   * Maximum distance to follow target
   * Entity will stop following if target exceeds this distance
   * Set to Infinity for unlimited range
   * @default Infinity
   */
  maxDistance?: number;

  /**
   * Smoothing factor for movement (0-1)
   * 0 = instant movement, 1 = no movement, 0.1 = smooth following
   * @default 0
   */
  smoothing?: number;

  /**
   * Whether to rotate entity to face the target
   * @default false
   */
  rotateToTarget?: boolean;

  /**
   * Rotation offset in radians
   * Used when sprite's default orientation isn't facing right (0 radians)
   * @default 0
   */
  rotationOffset?: number;
}

/**
 * FollowTargetLogic - Moves entity toward a target
 *
 * This component handles movement toward a target entity, useful for
 * chase behaviors, escort mechanics, and following AI.
 *
 * @example
 * ```typescript
 * const followLogic = new FollowTargetLogic({
 *   speed: 1.5,
 *   stopDistance: 50,
 *   smoothing: 0.1
 * });
 * followLogic.setTarget(playerEntity);
 * dinoEntity.moxiEntity.addLogic(followLogic);
 * ```
 */
export class FollowTargetLogic extends Logic<PIXI.Container> {
  name = 'FollowTargetLogic';

  private speed: number;
  private stopDistance: number;
  private maxDistance: number;
  private smoothing: number;
  private rotateToTarget: boolean;
  private rotationOffset: number;

  private target: PIXI.Container | null = null;
  private velocity: PIXI.Point = new PIXI.Point(0, 0);

  constructor(options: FollowTargetOptions) {
    super();
    this.speed = options.speed;
    this.stopDistance = options.stopDistance ?? 0;
    this.maxDistance = options.maxDistance ?? Infinity;
    this.smoothing = Math.max(0, Math.min(1, options.smoothing ?? 0));
    this.rotateToTarget = options.rotateToTarget ?? false;
    this.rotationOffset = options.rotationOffset ?? 0;
  }

  init(entity: PIXI.Container, renderer: PIXI.Renderer) {
    // Initialization if needed
  }

  update(entity: PIXI.Container, deltaTime: number) {
    if (!this.target) return;

    // Get positions
    const entityPos = entity.getGlobalPosition();
    const targetPos = this.target.getGlobalPosition();

    // Calculate direction vector
    const dx = targetPos.x - entityPos.x;
    const dy = targetPos.y - entityPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if we're outside max follow range
    if (distance > this.maxDistance) {
      this.velocity.set(0, 0);
      return;
    }

    // Check if we're within stop distance
    if (distance <= this.stopDistance) {
      this.velocity.set(0, 0);
      return;
    }

    // Normalize direction vector
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Calculate desired velocity
    const desiredVelocityX = dirX * this.speed * deltaTime;
    const desiredVelocityY = dirY * this.speed * deltaTime;

    // Apply smoothing if enabled
    if (this.smoothing > 0) {
      this.velocity.x += (desiredVelocityX - this.velocity.x) * (1 - this.smoothing);
      this.velocity.y += (desiredVelocityY - this.velocity.y) * (1 - this.smoothing);
    } else {
      this.velocity.set(desiredVelocityX, desiredVelocityY);
    }

    // Apply movement
    entity.x += this.velocity.x;
    entity.y += this.velocity.y;

    // Flip sprite based on horizontal movement direction
    if (dirX !== 0) {
      entity.scale.x = Math.abs(entity.scale.x) * (dirX > 0 ? 1 : -1);
    }

    // Handle rotation if enabled
    if (this.rotateToTarget && (dx !== 0 || dy !== 0)) {
      const targetAngle = Math.atan2(dy, dx);
      entity.rotation = targetAngle + this.rotationOffset;
    }
  }

  /**
   * Set the target entity to follow
   */
  setTarget(target: PIXI.Container | null) {
    this.target = target;

    // Reset velocity when changing targets
    if (!target) {
      this.velocity.set(0, 0);
    }
  }

  /**
   * Get the current target entity
   */
  getTarget(): PIXI.Container | null {
    return this.target;
  }

  /**
   * Check if currently following a target
   */
  hasTarget(): boolean {
    return this.target !== null;
  }

  /**
   * Get current velocity
   */
  getVelocity(): PIXI.Point {
    return new PIXI.Point(this.velocity.x, this.velocity.y);
  }

  /**
   * Check if entity is currently moving
   */
  isMoving(): boolean {
    return this.velocity.x !== 0 || this.velocity.y !== 0;
  }

  /**
   * Set movement speed
   */
  setSpeed(speed: number) {
    this.speed = speed;
  }

  /**
   * Get movement speed
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Set stop distance
   */
  setStopDistance(distance: number) {
    this.stopDistance = distance;
  }

  /**
   * Get stop distance
   */
  getStopDistance(): number {
    return this.stopDistance;
  }

  /**
   * Calculate distance to current target
   */
  getDistanceToTarget(entity: PIXI.Container): number {
    if (!this.target) return Infinity;

    const entityPos = entity.getGlobalPosition();
    const targetPos = this.target.getGlobalPosition();

    const dx = targetPos.x - entityPos.x;
    const dy = targetPos.y - entityPos.y;

    return Math.sqrt(dx * dx + dy * dy);
  }
}
