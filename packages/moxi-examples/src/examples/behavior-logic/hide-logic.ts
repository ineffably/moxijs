import { Logic } from 'moxi-kit';
import * as PIXI from 'pixi.js';

/**
 * Configuration options for HideLogic
 */
export interface HideOptions {
  /**
   * Movement speed when moving to hiding spot
   */
  speed: number;

  /**
   * Distance at which entity starts looking for hiding spot
   */
  threatDistance: number;

  /**
   * Distance at which entity feels safe and can come out
   */
  safeDistance: number;

  /**
   * Array of hiding spot positions
   */
  hidingSpots: PIXI.Point[];

  /**
   * Target to hide from (usually the player)
   */
  target: PIXI.Container | null;

  /**
   * How close to hiding spot before considered "hidden"
   * @default 10
   */
  hideReachedDistance?: number;

  /**
   * Smoothing factor for movement (0-1)
   * @default 0.1
   */
  smoothing?: number;
}

/**
 * HideLogic - Makes entity hide behind nearby objects when threatened
 *
 * This component makes entities seek cover when a threat gets too close,
 * moving to the nearest hiding spot and staying there until safe.
 *
 * @example
 * ```typescript
 * const hideLogic = new HideLogic({
 *   speed: 1.5,
 *   threatDistance: 150,
 *   safeDistance: 200,
 *   hidingSpots: treesAndBushes,
 *   target: playerEntity
 * });
 * dinoEntity.moxiEntity.addLogic(hideLogic);
 * ```
 */
export class HideLogic extends Logic<PIXI.Container> {
  name = 'HideLogic';

  private speed: number;
  private threatDistance: number;
  private safeDistance: number;
  private hidingSpots: PIXI.Point[];
  private target: PIXI.Container | null;
  private hideReachedDistance: number;
  private smoothing: number;

  private currentHidingSpot: PIXI.Point | null = null;
  private velocity: PIXI.Point = new PIXI.Point(0, 0);
  private isHidden: boolean = false;
  private isMovingToHide: boolean = false;

  constructor(options: HideOptions) {
    super();
    this.speed = options.speed;
    this.threatDistance = options.threatDistance;
    this.safeDistance = options.safeDistance;
    this.hidingSpots = options.hidingSpots || [];
    this.target = options.target;
    this.hideReachedDistance = options.hideReachedDistance ?? 10;
    this.smoothing = Math.max(0, Math.min(1, options.smoothing ?? 0.1));
  }

  update(entity: PIXI.Container, deltaTime: number) {
    if (!this.target || this.hidingSpots.length === 0) return;

    const distanceToThreat = this.getDistance(
      entity.getGlobalPosition(),
      this.target.getGlobalPosition()
    );

    // Determine if we should hide
    if (distanceToThreat <= this.threatDistance && !this.isHidden && !this.isMovingToHide) {
      // Find nearest hiding spot
      this.currentHidingSpot = this.findNearestHidingSpot(entity);
      this.isMovingToHide = true;
      this.isHidden = false;
    }

    // Check if we're safe to come out
    if (this.isHidden && distanceToThreat > this.safeDistance) {
      this.isHidden = false;
      this.isMovingToHide = false;
      this.currentHidingSpot = null;
      this.velocity.set(0, 0);
      return;
    }

    // Move to hiding spot
    if (this.isMovingToHide && this.currentHidingSpot) {
      const dx = this.currentHidingSpot.x - entity.x;
      const dy = this.currentHidingSpot.y - entity.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Check if we've reached the hiding spot
      if (distance <= this.hideReachedDistance) {
        this.isHidden = true;
        this.isMovingToHide = false;
        this.velocity.set(0, 0);
        return;
      }

      // Normalize direction
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
    }
  }

  /**
   * Find the nearest hiding spot to the entity
   */
  private findNearestHidingSpot(entity: PIXI.Container): PIXI.Point | null {
    if (this.hidingSpots.length === 0) return null;

    let nearestSpot = this.hidingSpots[0];
    let nearestDistance = this.getDistance(entity.getGlobalPosition(), nearestSpot);

    for (let i = 1; i < this.hidingSpots.length; i++) {
      const spot = this.hidingSpots[i];
      const distance = this.getDistance(entity.getGlobalPosition(), spot);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestSpot = spot;
      }
    }

    return nearestSpot;
  }

  /**
   * Calculate distance between two points
   */
  private getDistance(p1: PIXI.Point, p2: PIXI.Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Check if entity is currently hidden
   */
  isCurrentlyHidden(): boolean {
    return this.isHidden;
  }

  /**
   * Check if entity is moving to hide
   */
  isSeekingHide(): boolean {
    return this.isMovingToHide;
  }

  /**
   * Get current hiding spot
   */
  getCurrentHidingSpot(): PIXI.Point | null {
    return this.currentHidingSpot;
  }

  /**
   * Set target to hide from
   */
  setTarget(target: PIXI.Container | null) {
    this.target = target;
  }

  /**
   * Get current target
   */
  getTarget(): PIXI.Container | null {
    return this.target;
  }

  /**
   * Set hiding spots
   */
  setHidingSpots(spots: PIXI.Point[]) {
    this.hidingSpots = spots;
  }

  /**
   * Get movement velocity
   */
  getVelocity(): PIXI.Point {
    return new PIXI.Point(this.velocity.x, this.velocity.y);
  }

  /**
   * Force entity to come out of hiding
   */
  forceUnhide() {
    this.isHidden = false;
    this.isMovingToHide = false;
    this.currentHidingSpot = null;
    this.velocity.set(0, 0);
  }
}
