import { Logic } from 'moxi';
import * as PIXI from 'pixi.js';

/**
 * Configuration options for WanderLogic
 */
export interface WanderOptions {
  /**
   * Movement speed in pixels per frame
   */
  speed: number;

  /**
   * How often to change wander direction (in milliseconds)
   * @default 2000
   */
  changeDirectionInterval?: number;

  /**
   * How long to pause between movements (in milliseconds)
   * @default 1000
   */
  pauseDuration?: number;

  /**
   * Probability of pausing when changing direction (0-1)
   * @default 0.3
   */
  pauseProbability?: number;

  /**
   * Maximum distance from spawn point
   * Entity will turn around if it wanders too far
   * Set to Infinity for unlimited wandering
   * @default Infinity
   */
  maxWanderDistance?: number;

  /**
   * Whether to rotate entity to face movement direction
   * @default false
   */
  rotateToDirection?: boolean;

  /**
   * Rotation offset in radians
   * @default 0
   */
  rotationOffset?: number;

  /**
   * Smoothing factor for direction changes (0-1)
   * 0 = instant turn, 1 = no turn, 0.2 = smooth turning
   * @default 0.1
   */
  turnSmoothing?: number;
}

/**
 * WanderLogic - Random wandering movement behavior
 *
 * This component makes entities wander around randomly, changing
 * direction periodically with optional pauses.
 *
 * @example
 * ```typescript
 * const wanderLogic = new WanderLogic({
 *   speed: 0.5,
 *   changeDirectionInterval: 3000,
 *   pauseProbability: 0.4,
 *   maxWanderDistance: 200
 * });
 * dinoEntity.moxiEntity.addLogic(wanderLogic);
 * ```
 */
export class WanderLogic extends Logic<PIXI.Container> {
  name = 'WanderLogic';

  private speed: number;
  private changeDirectionInterval: number;
  private pauseDuration: number;
  private pauseProbability: number;
  private maxWanderDistance: number;
  private rotateToDirection: boolean;
  private rotationOffset: number;
  private turnSmoothing: number;

  private spawnPoint: PIXI.Point = new PIXI.Point(0, 0);
  private currentDirection: PIXI.Point = new PIXI.Point(0, 0);
  private targetDirection: PIXI.Point = new PIXI.Point(0, 0);
  private timeSinceDirectionChange: number = 0;
  private isPaused: boolean = false;
  private pauseTimeRemaining: number = 0;

  constructor(options: WanderOptions) {
    super();
    this.speed = options.speed;
    this.changeDirectionInterval = options.changeDirectionInterval ?? 2000;
    this.pauseDuration = options.pauseDuration ?? 1000;
    this.pauseProbability = Math.max(0, Math.min(1, options.pauseProbability ?? 0.3));
    this.maxWanderDistance = options.maxWanderDistance ?? Infinity;
    this.rotateToDirection = options.rotateToDirection ?? false;
    this.rotationOffset = options.rotationOffset ?? 0;
    this.turnSmoothing = Math.max(0, Math.min(1, options.turnSmoothing ?? 0.1));
  }

  init(entity: PIXI.Container, renderer: PIXI.Renderer) {
    // Store spawn point
    this.spawnPoint.set(entity.x, entity.y);

    // Initialize with random direction
    this.chooseNewDirection(entity);
  }

  update(entity: PIXI.Container, deltaTime: number) {
    // Handle pause state
    if (this.isPaused) {
      this.pauseTimeRemaining -= deltaTime;
      if (this.pauseTimeRemaining <= 0) {
        this.isPaused = false;
        this.chooseNewDirection(entity);
      }
      return;
    }

    // Check if it's time to change direction
    this.timeSinceDirectionChange += deltaTime;
    if (this.timeSinceDirectionChange >= this.changeDirectionInterval) {
      this.timeSinceDirectionChange = 0;

      // Randomly decide to pause
      if (Math.random() < this.pauseProbability) {
        this.isPaused = true;
        this.pauseTimeRemaining = this.pauseDuration;
        this.currentDirection.set(0, 0);
        return;
      } else {
        this.chooseNewDirection(entity);
      }
    }

    // Smoothly interpolate current direction toward target direction
    if (this.turnSmoothing > 0) {
      const smoothFactor = 1 - this.turnSmoothing;
      this.currentDirection.x += (this.targetDirection.x - this.currentDirection.x) * smoothFactor;
      this.currentDirection.y += (this.targetDirection.y - this.currentDirection.y) * smoothFactor;
    } else {
      this.currentDirection.copyFrom(this.targetDirection);
    }

    // Apply movement
    entity.x += this.currentDirection.x * this.speed * deltaTime;
    entity.y += this.currentDirection.y * this.speed * deltaTime;

    // Flip sprite based on horizontal movement direction
    if (this.currentDirection.x !== 0) {
      entity.scale.x = Math.abs(entity.scale.x) * (this.currentDirection.x > 0 ? 1 : -1);
    }

    // Check if entity has wandered too far from spawn point
    if (this.maxWanderDistance !== Infinity) {
      const dx = entity.x - this.spawnPoint.x;
      const dy = entity.y - this.spawnPoint.y;
      const distanceFromSpawn = Math.sqrt(dx * dx + dy * dy);

      if (distanceFromSpawn > this.maxWanderDistance) {
        // Turn toward spawn point
        const dirToSpawnX = -dx / distanceFromSpawn;
        const dirToSpawnY = -dy / distanceFromSpawn;
        this.targetDirection.set(dirToSpawnX, dirToSpawnY);
        this.timeSinceDirectionChange = 0; // Reset timer
      }
    }

    // Handle rotation if enabled
    if (this.rotateToDirection && (this.currentDirection.x !== 0 || this.currentDirection.y !== 0)) {
      const angle = Math.atan2(this.currentDirection.y, this.currentDirection.x);
      entity.rotation = angle + this.rotationOffset;
    }
  }

  /**
   * Choose a new random direction to wander
   */
  private chooseNewDirection(entity: PIXI.Container) {
    // Generate random angle
    const angle = Math.random() * Math.PI * 2;

    // Convert to direction vector (already normalized)
    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);

    this.targetDirection.set(dirX, dirY);
  }

  /**
   * Get current movement velocity
   */
  getVelocity(): PIXI.Point {
    return new PIXI.Point(
      this.currentDirection.x * this.speed,
      this.currentDirection.y * this.speed
    );
  }

  /**
   * Check if entity is currently moving
   */
  isMoving(): boolean {
    return !this.isPaused && (this.currentDirection.x !== 0 || this.currentDirection.y !== 0);
  }

  /**
   * Check if entity is currently paused
   */
  isPausing(): boolean {
    return this.isPaused;
  }

  /**
   * Force entity to choose a new direction immediately
   */
  changeDirection(entity: PIXI.Container) {
    this.chooseNewDirection(entity);
    this.timeSinceDirectionChange = 0;
  }

  /**
   * Force entity to pause immediately
   */
  pause() {
    this.isPaused = true;
    this.pauseTimeRemaining = this.pauseDuration;
    this.currentDirection.set(0, 0);
  }

  /**
   * Resume wandering if paused
   */
  resume(entity: PIXI.Container) {
    if (this.isPaused) {
      this.isPaused = false;
      this.pauseTimeRemaining = 0;
      this.chooseNewDirection(entity);
    }
  }

  /**
   * Set new spawn point (center point for wandering)
   */
  setSpawnPoint(x: number, y: number) {
    this.spawnPoint.set(x, y);
  }

  /**
   * Get spawn point
   */
  getSpawnPoint(): PIXI.Point {
    return new PIXI.Point(this.spawnPoint.x, this.spawnPoint.y);
  }

  /**
   * Get distance from spawn point
   */
  getDistanceFromSpawn(entity: PIXI.Container): number {
    const dx = entity.x - this.spawnPoint.x;
    const dy = entity.y - this.spawnPoint.y;
    return Math.sqrt(dx * dx + dy * dy);
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
}
