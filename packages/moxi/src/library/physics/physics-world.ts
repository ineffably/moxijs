import * as PIXI from 'pixi.js';
import * as planck from 'planck';
import type { PhysicsWorldOptions, RaycastCallback, PhysicsDebugOptions } from './physics-types';
import { CollisionRegistry, CollisionManager } from './physics-collision';
import type { PhysicsBodyLogic } from './physics-body-logic';
import { PhysicsDebugRenderer } from './physics-debug-renderer';
import { asEntity } from '../../core/moxi-entity';
import { initGraphicsPhysicsTracking } from './physics-graphics-parser';

/**
 * PhysicsWorld manages the Planck.js physics simulation and provides
 * integration with MOXI's Scene/Engine.
 *
 * @example
 * ```typescript
 * const physicsWorld = new PhysicsWorld({
 *   gravity: { x: 0, y: 9.8 },
 *   pixelsPerMeter: 30
 * });
 *
 * // Integrate with engine
 * engine.addPhysicsWorld(physicsWorld);
 * ```
 */
export class PhysicsWorld {
  /** The Planck.js world instance */
  public world: planck.World;

  /** Pixels per meter conversion factor */
  public pixelsPerMeter: number = 30;

  /** Fixed timestep in seconds */
  public timestep: number = 1/60;

  /** Collision tag registry */
  public collisionRegistry: CollisionRegistry;

  /** Collision event manager */
  public collisionManager: CollisionManager;

  /** Velocity iterations for solver */
  private velocityIterations: number = 8;

  /** Position iterations for solver */
  private positionIterations: number = 3;

  /** Time accumulator for fixed timestep */
  private accumulator: number = 0;

  /** Registry of physics bodies */
  private bodies: Map<planck.Body, PhysicsBodyLogic> = new Map();

  /** Debug renderer reference */
  private debugRenderer?: PhysicsDebugRenderer;

  /** Debug graphics container */
  private debugGraphics?: PIXI.Graphics;

  constructor(options: PhysicsWorldOptions = {}) {
    // Initialize Graphics physics tracking (patches PIXI.Graphics methods)
    initGraphicsPhysicsTracking();

    const {
      gravity = { x: 0, y: 9.8 },
      pixelsPerMeter = 30,
      velocityIterations = 8,
      positionIterations = 3,
      enableSleeping = true,
      timestep = 1/60
    } = options;

    this.pixelsPerMeter = pixelsPerMeter;
    this.velocityIterations = velocityIterations;
    this.positionIterations = positionIterations;
    this.timestep = timestep;

    // Create Planck world
    this.world = planck.World({
      gravity: planck.Vec2(gravity.x, gravity.y)
    });

    // Configure sleeping
    this.world.setAllowSleeping(enableSleeping);

    // Initialize collision system
    this.collisionRegistry = new CollisionRegistry();
    this.collisionManager = new CollisionManager(this, this.collisionRegistry);
  }

  /**
   * Step the physics simulation (called by Engine update loop)
   * Uses fixed timestep for deterministic physics
   */
  step(deltaTime: number): void {
    this.accumulator += deltaTime;

    // Fixed timestep updates
    while (this.accumulator >= this.timestep) {
      this.world.step(this.timestep, this.velocityIterations, this.positionIterations);
      this.accumulator -= this.timestep;
    }

    // Note: Interpolation for rendering smoothness could be added here
    // const alpha = this.accumulator / this.timestep;
  }

  /**
   * Create a physics body
   */
  createBody(def: planck.BodyDef): planck.Body {
    return this.world.createBody(def);
  }

  /**
   * Destroy a physics body
   */
  destroyBody(body: planck.Body): void {
    this.bodies.delete(body);
    this.world.destroyBody(body);
  }

  /**
   * Register a physics body logic component
   */
  registerBody(body: planck.Body, logic: PhysicsBodyLogic): void {
    this.bodies.set(body, logic);
  }

  /**
   * Get physics body logic from Planck body
   */
  getBodyLogic(body: planck.Body): PhysicsBodyLogic | undefined {
    return this.bodies.get(body);
  }

  /**
   * Raycast from one point to another
   */
  raycast(from: PIXI.Point, to: PIXI.Point, callback: RaycastCallback): void {
    const p1 = this.toPhysicsPoint(from);
    const p2 = this.toPhysicsPoint(to);

    this.world.rayCast(p1, p2, (fixture, point, normal, fraction) => {
      const pixelPoint = this.toPixelsPoint(point);
      const pixelNormal = new PIXI.Point(normal.x, normal.y);
      return callback(fixture, pixelPoint, pixelNormal, fraction);
    });
  }

  /**
   * Query AABB (axis-aligned bounding box)
   */
  queryAABB(bounds: PIXI.Rectangle, callback: (body: planck.Body) => boolean): void {
    const lowerBound = this.toPhysicsPoint(new PIXI.Point(bounds.x, bounds.y));
    const upperBound = this.toPhysicsPoint(new PIXI.Point(bounds.x + bounds.width, bounds.y + bounds.height));

    this.world.queryAABB(planck.AABB(lowerBound, upperBound), (fixture) => {
      return callback(fixture.getBody());
    });
  }

  /**
   * Query point
   */
  queryPoint(point: PIXI.Point, callback: (fixture: planck.Fixture) => boolean): void {
    const physicsPoint = this.toPhysicsPoint(point);

    this.world.queryAABB(
      planck.AABB(
        planck.Vec2(physicsPoint.x - 0.001, physicsPoint.y - 0.001),
        planck.Vec2(physicsPoint.x + 0.001, physicsPoint.y + 0.001)
      ),
      (fixture) => {
        if (fixture.testPoint(physicsPoint)) {
          return callback(fixture);
        }
        return true;
      }
    );
  }

  /**
   * Convert pixels to meters
   */
  toPhysics(pixels: number): number {
    return pixels / this.pixelsPerMeter;
  }

  /**
   * Convert meters to pixels
   */
  toPixels(meters: number): number {
    return meters * this.pixelsPerMeter;
  }

  /**
   * Convert PIXI Point (pixels) to Planck Vec2 (meters)
   */
  toPhysicsPoint(point: PIXI.Point): planck.Vec2 {
    return planck.Vec2(this.toPhysics(point.x), this.toPhysics(point.y));
  }

  /**
   * Convert Planck Vec2 (meters) to PIXI Point (pixels)
   */
  toPixelsPoint(vec: planck.Vec2): PIXI.Point {
    return new PIXI.Point(this.toPixels(vec.x), this.toPixels(vec.y));
  }

  /**
   * Enable debug renderer
   */
  enableDebugRenderer(scene: any, options: PhysicsDebugOptions = {}): PhysicsDebugRenderer {
    // Clean up existing debug renderer if any
    if (this.debugRenderer) {
      this.disableDebugRenderer();
    }

    // Create debug graphics
    this.debugGraphics = new PIXI.Graphics();

    // Create debug renderer logic
    this.debugRenderer = new PhysicsDebugRenderer(this, options);

    // Make it an entity and add to scene
    const debugEntity = asEntity(this.debugGraphics);
    debugEntity.moxiEntity.addLogic(this.debugRenderer);

    // Set highest z-index so it renders on top of everything
    debugEntity.zIndex = 10000;

    // Enable sortable children on scene so zIndex works
    scene.sortableChildren = true;

    // Add to scene at highest z-index so it renders on top
    scene.addChild(debugEntity);

    console.log('Physics debug renderer enabled. Press "P" to toggle visibility.');

    return this.debugRenderer;
  }

  /**
   * Disable debug renderer
   */
  disableDebugRenderer(): void {
    if (this.debugRenderer && this.debugGraphics) {
      // Remove from scene
      if (this.debugGraphics.parent) {
        this.debugGraphics.parent.removeChild(this.debugGraphics);
      }

      // Clean up
      this.debugGraphics.destroy();
      this.debugGraphics = undefined;
      this.debugRenderer = undefined;
    }
  }

  /**
   * Get debug renderer if enabled
   */
  getDebugRenderer(): PhysicsDebugRenderer | undefined {
    return this.debugRenderer;
  }

  /**
   * Get all bodies in the world
   */
  getBodies(): planck.Body[] {
    const bodies: planck.Body[] = [];
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      bodies.push(body);
    }
    return bodies;
  }

  /**
   * Clean up and destroy the physics world
   */
  destroy(): void {
    // Destroy all bodies
    const bodies = this.getBodies();
    bodies.forEach(body => this.world.destroyBody(body));

    this.bodies.clear();
    this.debugRenderer = undefined;
  }
}
