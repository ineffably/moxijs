import * as PIXI from 'pixi.js';
import type * as planck from 'planck';

/**
 * Physics body type
 */
export type BodyType = 'static' | 'dynamic' | 'kinematic';

/**
 * Synchronization mode between physics body and sprite
 */
export type SyncMode = 'physics-driven' | 'sprite-driven' | 'manual';

/**
 * Shape type for physics bodies
 */
export type ShapeType = 'rectangle' | 'circle' | 'polygon';

/**
 * Collision tag type - provides autocomplete for common tags but accepts any string
 *
 * The `string & {}` pattern gives TypeScript autocomplete for the literal types
 * while still accepting any custom string value. No generics or configuration needed!
 *
 * @example
 * // Autocomplete suggests common tags
 * collisionTags: ['player', 'enemy']
 *
 * @example
 * // But you can use any custom string
 * collisionTags: ['my-boss-enemy', 'vehicle']
 */
export type CollisionTag =
  | 'default'
  | 'player'
  | 'enemy'
  | 'projectile'
  | 'terrain'
  | 'sensor'
  | 'powerup'
  | (string & {}); // Magic: autocomplete + flexibility

/**
 * Shape configuration for physics bodies
 */
export interface ShapeConfig {
  shape: ShapeType;
  width?: number;
  height?: number;
  radius?: number;
  vertices?: PIXI.Point[];
}

/**
 * Physics world options
 */
export interface PhysicsWorldOptions {
  /** Gravity vector (default: { x: 0, y: 9.8 }) */
  gravity?: { x: number; y: number };
  /** Pixels per meter conversion (default: 30) */
  pixelsPerMeter?: number;
  /** Velocity iterations for solver (default: 8) */
  velocityIterations?: number;
  /** Position iterations for solver (default: 3) */
  positionIterations?: number;
  /** Enable body sleeping (default: true) */
  enableSleeping?: boolean;
  /** Fixed timestep in seconds (default: 1/60) */
  timestep?: number;
}

/**
 * Physics body options
 */
export interface PhysicsBodyOptions {
  // Body properties
  /** Body type (default: 'dynamic') */
  type?: BodyType;
  /** Initial position in pixels */
  position?: PIXI.Point;
  /** Initial rotation in radians */
  rotation?: number;
  /** Initial linear velocity */
  linearVelocity?: PIXI.Point;
  /** Initial angular velocity */
  angularVelocity?: number;

  // Collision shape (extracted from Graphics geometry)
  /**
   * Graphics object defining the collision shape.
   * - For Graphics entities: Auto-extracted from entity if not provided
   * - For Sprite entities: Must be provided
   */
  collisionShape?: PIXI.Graphics;

  // Legacy shape properties (deprecated - use collisionShape instead)
  /** @deprecated Use collisionShape instead */
  shape?: ShapeType;
  /** @deprecated Use collisionShape instead */
  width?: number;
  /** @deprecated Use collisionShape instead */
  height?: number;
  /** @deprecated Use collisionShape instead */
  radius?: number;
  /** @deprecated Use collisionShape instead */
  vertices?: PIXI.Point[];

  // Material properties
  /** Density (default: 1.0) */
  density?: number;
  /** Friction (default: 0.3) */
  friction?: number;
  /** Restitution/bounciness (default: 0.0) */
  restitution?: number;

  // Behavior
  /** Prevent rotation (default: false) */
  fixedRotation?: boolean;
  /** Is sensor (trigger volume, no collision response) */
  isSensor?: boolean;
  /** Enable continuous collision detection */
  bullet?: boolean;

  // Sync behavior
  /** Synchronization mode (default: 'physics-driven') */
  syncMode?: SyncMode;
  /** Sync position from physics to sprite (default: true) */
  syncPosition?: boolean;
  /** Sync rotation from physics to sprite (default: true) */
  syncRotation?: boolean;

  // Collision filtering (modern tag-based API)
  /** Tags this body has (e.g., ['player', 'character']) */
  collisionTags?: CollisionTag[];
  /** Tags this body collides with (e.g., ['terrain', 'enemy']) */
  collidesWith?: CollisionTag[];
  /** Collision group (negative = never collide within group) */
  collisionGroup?: number;

  // User data
  /** Custom data attached to body */
  userData?: any;
}

/**
 * Physics debug renderer options
 */
export interface PhysicsDebugOptions {
  /** Show collision shapes (default: true) */
  showShapes?: boolean;
  /** Show velocity vectors (default: false) */
  showVelocities?: boolean;
  /** Show AABBs (default: false) */
  showAABBs?: boolean;
  /** Show center of mass (default: false) */
  showCenterOfMass?: boolean;
  /** Show contact points (default: false) */
  showContactPoints?: boolean;
  /** Show joints (default: false) */
  showJoints?: boolean;

  // Colors
  /** Color for static bodies (default: 0x00FF00) */
  colorStatic?: number;
  /** Color for dynamic bodies (default: 0xFF0000) */
  colorDynamic?: number;
  /** Color for kinematic bodies (default: 0x0000FF) */
  colorKinematic?: number;
  /** Color for sleeping bodies (default: 0xAAAAAA) */
  colorSleeping?: number;
  /** Color for sensor bodies (default: 0xFFFF00) */
  colorSensor?: number;

  /** Alpha/opacity (default: 0.5) */
  alpha?: number;
  /** Line width (default: 2) */
  lineWidth?: number;
}

/**
 * Collision event
 */
export interface CollisionEvent {
  bodyA: any; // PhysicsBodyLogic (avoiding circular reference)
  bodyB: any; // PhysicsBodyLogic
  contact: planck.Contact;
  normal: PIXI.Point;
  impulse: number;
}

/**
 * Raycast callback
 */
export type RaycastCallback = (
  fixture: planck.Fixture,
  point: PIXI.Point,
  normal: PIXI.Point,
  fraction: number
) => number;
