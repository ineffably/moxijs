import * as PIXI from 'pixi.js';
import * as planck from 'planck';
import type { PhysicsWorldOptions, RaycastCallback, PhysicsDebugOptions } from './physics-types';
import { CollisionRegistry, CollisionManager } from './physics-collision';
import type { PhysicsBodyLogic } from './physics-body-logic';
import { PhysicsDebugRenderer } from './physics-debug-renderer';
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
export declare class PhysicsWorld {
    /** The Planck.js world instance */
    world: planck.World;
    /** Pixels per meter conversion factor */
    pixelsPerMeter: number;
    /** Fixed timestep in seconds */
    timestep: number;
    /** Collision tag registry */
    collisionRegistry: CollisionRegistry;
    /** Collision event manager */
    collisionManager: CollisionManager;
    /** Velocity iterations for solver */
    private velocityIterations;
    /** Position iterations for solver */
    private positionIterations;
    /** Time accumulator for fixed timestep */
    private accumulator;
    /** Registry of physics bodies */
    private bodies;
    /** Debug renderer reference */
    private debugRenderer?;
    /** Debug graphics container */
    private debugGraphics?;
    constructor(options?: PhysicsWorldOptions);
    /**
     * Step the physics simulation (called by Engine update loop)
     * Uses fixed timestep for deterministic physics
     */
    step(deltaTime: number): void;
    /**
     * Create a physics body
     */
    createBody(def: planck.BodyDef): planck.Body;
    /**
     * Destroy a physics body
     */
    destroyBody(body: planck.Body): void;
    /**
     * Register a physics body logic component
     */
    registerBody(body: planck.Body, logic: PhysicsBodyLogic): void;
    /**
     * Get physics body logic from Planck body
     */
    getBodyLogic(body: planck.Body): PhysicsBodyLogic | undefined;
    /**
     * Raycast from one point to another
     */
    raycast(from: PIXI.Point, to: PIXI.Point, callback: RaycastCallback): void;
    /**
     * Query AABB (axis-aligned bounding box)
     */
    queryAABB(bounds: PIXI.Rectangle, callback: (body: planck.Body) => boolean): void;
    /**
     * Query point
     */
    queryPoint(point: PIXI.Point, callback: (fixture: planck.Fixture) => boolean): void;
    /**
     * Convert pixels to meters
     */
    toPhysics(pixels: number): number;
    /**
     * Convert meters to pixels
     */
    toPixels(meters: number): number;
    /**
     * Convert PIXI Point (pixels) to Planck Vec2 (meters)
     */
    toPhysicsPoint(point: PIXI.Point): planck.Vec2;
    /**
     * Convert Planck Vec2 (meters) to PIXI Point (pixels)
     */
    toPixelsPoint(vec: planck.Vec2): PIXI.Point;
    /**
     * Enable debug renderer
     */
    enableDebugRenderer(scene: PIXI.Container, options?: PhysicsDebugOptions): PhysicsDebugRenderer;
    /**
     * Disable debug renderer
     */
    disableDebugRenderer(): void;
    /**
     * Get debug renderer if enabled
     */
    getDebugRenderer(): PhysicsDebugRenderer | undefined;
    /**
     * Get all bodies in the world
     */
    getBodies(): planck.Body[];
    /**
     * Clean up and destroy the physics world
     */
    destroy(): void;
}
