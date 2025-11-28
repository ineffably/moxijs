import { Logic } from 'moxi-kit';
import * as PIXI from 'pixi.js';

/**
 * Configuration options for FleeFromTargetLogic
 */
export interface FleeFromTargetOptions {
  /**
   * Movement speed in pixels per frame
   */
  speed: number;

  /**
   * Minimum distance to flee from target
   * Entity will start fleeing when target is within this distance
   */
  fleeDistance: number;

  /**
   * Distance at which entity stops fleeing (considers itself safe)
   * @default fleeDistance * 2
   */
  safeDistance?: number;

  /**
   * Smoothing factor for movement (0-1)
   * 0 = instant movement, 1 = no movement, 0.1 = smooth fleeing
   * @default 0
   */
  smoothing?: number;

  /**
   * Whether to rotate entity to face away from target
   * @default false
   */
  rotateAwayFromTarget?: boolean;

  /**
   * Rotation offset in radians
   * Used when sprite's default orientation isn't facing right (0 radians)
   * @default 0
   */
  rotationOffset?: number;

  /**
   * Whether to add some randomness to flee direction (panic behavior)
   * Value between 0 (straight flee) and 1 (very panicked)
   * @default 0
   */
  panicFactor?: number;
}

/**
 * FleeFromTargetLogic - Moves entity away from a target
 *
 * This component handles fleeing behavior, useful for prey animals,
 * scared NPCs, or any entity that needs to avoid danger.
 *
 * @example
 * ```typescript
 * const fleeLogic = new FleeFromTargetLogic({
 *   speed: 2.0,
 *   fleeDistance: 150,
 *   safeDistance: 300,
 *   panicFactor: 0.2
 * });
 * fleeLogic.setTarget(dangerousEntity);
 * dinoEntity.moxiEntity.addLogic(fleeLogic);
 * ```
 */
export class FleeFromTargetLogic extends Logic<PIXI.Container> {
  name = 'FleeFromTargetLogic';

  private speed: number;
  private fleeDistance: number;
  private safeDistance: number;
  private smoothing: number;
  private rotateAwayFromTarget: boolean;
  private rotationOffset: number;
  private panicFactor: number;

  private target: PIXI.Container | null = null;
  private velocity: PIXI.Point = new PIXI.Point(0, 0);
  private panicOffset: number = 0;

  constructor(options: FleeFromTargetOptions) {
    super();
    this.speed = options.speed;
    this.fleeDistance = options.fleeDistance;
    this.safeDistance = options.safeDistance ?? options.fleeDistance * 2;
    this.smoothing = Math.max(0, Math.min(1, options.smoothing ?? 0));
    this.rotateAwayFromTarget = options.rotateAwayFromTarget ?? false;
    this.rotationOffset = options.rotationOffset ?? 0;
    this.panicFactor = Math.max(0, Math.min(1, options.panicFactor ?? 0));
  }

  init(entity: PIXI.Container, renderer: PIXI.Renderer) {
    // Initialization if needed
  }

  update(entity: PIXI.Container, deltaTime: number) {
    if (!this.target) return;

    // Get positions
    const entityPos = entity.getGlobalPosition();
    const targetPos = this.target.getGlobalPosition();

    // Calculate direction vector (from target to entity - opposite of follow)
    const dx = entityPos.x - targetPos.x;
    const dy = entityPos.y - targetPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if we're at safe distance
    if (distance >= this.safeDistance) {
      this.velocity.set(0, 0);
      return;
    }

    // Check if target is within flee distance
    if (distance > this.fleeDistance) {
      this.velocity.set(0, 0);
      return;
    }

    // Normalize direction vector (away from target)
    let dirX = dx / distance;
    let dirY = dy / distance;

    // Add panic factor (random deviation)
    if (this.panicFactor > 0) {
      // Update panic offset occasionally for smoother panic movement
      if (Math.random() < 0.1) {
        this.panicOffset = (Math.random() - 0.5) * Math.PI * this.panicFactor;
      }

      // Apply panic rotation to flee direction
      const cos = Math.cos(this.panicOffset);
      const sin = Math.sin(this.panicOffset);
      const rotatedX = dirX * cos - dirY * sin;
      const rotatedY = dirX * sin + dirY * cos;
      dirX = rotatedX;
      dirY = rotatedY;

      // Re-normalize after rotation
      const length = Math.sqrt(dirX * dirX + dirY * dirY);
      dirX /= length;
      dirY /= length;
    }

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
    if (this.rotateAwayFromTarget && (dirX !== 0 || dirY !== 0)) {
      const fleeAngle = Math.atan2(dirY, dirX);
      entity.rotation = fleeAngle + this.rotationOffset;
    }
  }

  /**
   * Set the target entity to flee from
   */
  setTarget(target: PIXI.Container | null) {
    this.target = target;

    // Reset velocity and panic when changing targets
    if (!target) {
      this.velocity.set(0, 0);
      this.panicOffset = 0;
    }
  }

  /**
   * Get the current target entity
   */
  getTarget(): PIXI.Container | null {
    return this.target;
  }

  /**
   * Check if currently fleeing from a target
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
   * Set flee distance
   */
  setFleeDistance(distance: number) {
    this.fleeDistance = distance;
  }

  /**
   * Get flee distance
   */
  getFleeDistance(): number {
    return this.fleeDistance;
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

  /**
   * Check if entity is in danger (target within flee distance)
   */
  isInDanger(entity: PIXI.Container): boolean {
    if (!this.target) return false;
    return this.getDistanceToTarget(entity) < this.fleeDistance;
  }

  /**
   * Check if entity is safe (beyond safe distance)
   */
  isSafe(entity: PIXI.Container): boolean {
    if (!this.target) return true;
    return this.getDistanceToTarget(entity) >= this.safeDistance;
  }
}
