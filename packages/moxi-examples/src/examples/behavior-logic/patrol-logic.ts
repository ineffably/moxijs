import { Logic } from 'moxi-kit';
import * as PIXI from 'pixi.js';

/**
 * Configuration options for PatrolLogic
 */
export interface PatrolOptions {
  /**
   * Movement speed in pixels per frame
   */
  speed: number;

  /**
   * Array of waypoint positions to patrol between
   */
  waypoints: PIXI.Point[];

  /**
   * Whether to loop back to start or reverse direction at end
   * @default 'loop' - go from last waypoint back to first
   * 'reverse' - go back and forth (ping-pong)
   */
  patrolMode?: 'loop' | 'reverse';

  /**
   * How close entity needs to be to waypoint to consider it reached
   * @default 5
   */
  waypointReachedDistance?: number;

  /**
   * How long to pause at each waypoint (in milliseconds)
   * @default 0
   */
  pauseAtWaypoint?: number;

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
   * Smoothing factor for movement (0-1)
   * @default 0
   */
  smoothing?: number;
}

/**
 * PatrolLogic - Waypoint-based patrol movement
 *
 * This component makes entities follow a set path of waypoints,
 * either looping or reversing direction.
 *
 * @example
 * ```typescript
 * const patrolLogic = new PatrolLogic({
 *   speed: 1.0,
 *   waypoints: [
 *     new PIXI.Point(-100, -100),
 *     new PIXI.Point(100, -100),
 *     new PIXI.Point(100, 100),
 *     new PIXI.Point(-100, 100)
 *   ],
 *   patrolMode: 'loop',
 *   pauseAtWaypoint: 500
 * });
 * dinoEntity.moxiEntity.addLogic(patrolLogic);
 * ```
 */
export class PatrolLogic extends Logic<PIXI.Container> {
  name = 'PatrolLogic';

  private speed: number;
  private waypoints: PIXI.Point[];
  private patrolMode: 'loop' | 'reverse';
  private waypointReachedDistance: number;
  private pauseAtWaypoint: number;
  private rotateToDirection: boolean;
  private rotationOffset: number;
  private smoothing: number;

  private currentWaypointIndex: number = 0;
  private direction: number = 1; // 1 for forward, -1 for reverse
  private velocity: PIXI.Point = new PIXI.Point(0, 0);
  private isPaused: boolean = false;
  private pauseTimeRemaining: number = 0;

  constructor(options: PatrolOptions) {
    super();
    this.speed = options.speed;
    this.waypoints = options.waypoints || [];
    this.patrolMode = options.patrolMode ?? 'loop';
    this.waypointReachedDistance = options.waypointReachedDistance ?? 5;
    this.pauseAtWaypoint = options.pauseAtWaypoint ?? 0;
    this.rotateToDirection = options.rotateToDirection ?? false;
    this.rotationOffset = options.rotationOffset ?? 0;
    this.smoothing = Math.max(0, Math.min(1, options.smoothing ?? 0));

    if (this.waypoints.length === 0) {
      console.warn('PatrolLogic: No waypoints provided');
    }
  }

  init(entity: PIXI.Container, renderer: PIXI.Renderer) {
    // If there are waypoints, position entity at first waypoint
    if (this.waypoints.length > 0) {
      entity.position.copyFrom(this.waypoints[0]);
    }
  }

  update(entity: PIXI.Container, deltaTime: number) {
    // Can't patrol without waypoints
    if (this.waypoints.length === 0) return;

    // Handle pause state
    if (this.isPaused) {
      this.pauseTimeRemaining -= deltaTime;
      if (this.pauseTimeRemaining <= 0) {
        this.isPaused = false;
      }
      return;
    }

    // Get current waypoint
    const targetWaypoint = this.waypoints[this.currentWaypointIndex];

    // Calculate direction to waypoint
    const dx = targetWaypoint.x - entity.x;
    const dy = targetWaypoint.y - entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if we've reached the waypoint
    if (distance <= this.waypointReachedDistance) {
      this.reachWaypoint();
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

    // Handle rotation if enabled
    if (this.rotateToDirection && (dirX !== 0 || dirY !== 0)) {
      const angle = Math.atan2(dirY, dirX);
      entity.rotation = angle + this.rotationOffset;
    }
  }

  /**
   * Handle reaching a waypoint
   */
  private reachWaypoint() {
    // Pause if configured
    if (this.pauseAtWaypoint > 0) {
      this.isPaused = true;
      this.pauseTimeRemaining = this.pauseAtWaypoint;
    }

    // Move to next waypoint
    this.advanceToNextWaypoint();
  }

  /**
   * Advance to the next waypoint based on patrol mode
   */
  private advanceToNextWaypoint() {
    if (this.patrolMode === 'loop') {
      this.currentWaypointIndex = (this.currentWaypointIndex + 1) % this.waypoints.length;
    } else if (this.patrolMode === 'reverse') {
      this.currentWaypointIndex += this.direction;

      // Check if we need to reverse direction
      if (this.currentWaypointIndex >= this.waypoints.length) {
        this.currentWaypointIndex = this.waypoints.length - 2;
        this.direction = -1;
      } else if (this.currentWaypointIndex < 0) {
        this.currentWaypointIndex = 1;
        this.direction = 1;
      }
    }
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
    return !this.isPaused && (this.velocity.x !== 0 || this.velocity.y !== 0);
  }

  /**
   * Check if entity is paused
   */
  isPausing(): boolean {
    return this.isPaused;
  }

  /**
   * Get current waypoint index
   */
  getCurrentWaypointIndex(): number {
    return this.currentWaypointIndex;
  }

  /**
   * Get current target waypoint
   */
  getCurrentWaypoint(): PIXI.Point | null {
    if (this.currentWaypointIndex >= 0 && this.currentWaypointIndex < this.waypoints.length) {
      return this.waypoints[this.currentWaypointIndex];
    }
    return null;
  }

  /**
   * Get all waypoints
   */
  getWaypoints(): PIXI.Point[] {
    return [...this.waypoints];
  }

  /**
   * Set new waypoints
   */
  setWaypoints(waypoints: PIXI.Point[]) {
    this.waypoints = waypoints;
    this.currentWaypointIndex = 0;
    this.direction = 1;
  }

  /**
   * Add a waypoint to the patrol route
   */
  addWaypoint(waypoint: PIXI.Point) {
    this.waypoints.push(waypoint);
  }

  /**
   * Jump to a specific waypoint index
   */
  setCurrentWaypoint(index: number) {
    if (index >= 0 && index < this.waypoints.length) {
      this.currentWaypointIndex = index;
    }
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
   * Pause patrol
   */
  pause() {
    this.isPaused = true;
    this.velocity.set(0, 0);
  }

  /**
   * Resume patrol
   */
  resume() {
    this.isPaused = false;
    this.pauseTimeRemaining = 0;
  }

  /**
   * Get distance to current waypoint
   */
  getDistanceToWaypoint(entity: PIXI.Container): number {
    const waypoint = this.getCurrentWaypoint();
    if (!waypoint) return Infinity;

    const dx = waypoint.x - entity.x;
    const dy = waypoint.y - entity.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
