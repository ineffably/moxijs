import * as PIXI from 'pixi.js';
import * as planck from 'planck';
import { Logic } from '../../core/logic';
import type { PhysicsWorld } from './physics-world';
import type { PhysicsBodyOptions } from './physics-types';
/**
 * PhysicsBodyLogic - Logic component that synchronizes a PIXI entity with a Planck.js physics body
 *
 * @example
 * ```typescript
 * const sprite = new PIXI.Sprite(texture);
 * const entity = asEntity(sprite);
 *
 * const physicsBody = new PhysicsBodyLogic(physicsWorld, {
 *   type: 'dynamic',
 *   shape: 'circle',
 *   radius: 25,
 *   density: 1.0
 * });
 *
 * entity.moxiEntity.addLogic(physicsBody);
 * ```
 */
export declare class PhysicsBodyLogic extends Logic<PIXI.Container> {
    name: string;
    /** The Planck.js physics body */
    body: planck.Body;
    /** Reference to the physics world */
    world: PhysicsWorld;
    /** Physics body options */
    options: PhysicsBodyOptions;
    /** Collision begin callback */
    onCollisionBegin?: (other: PhysicsBodyLogic, contact: planck.Contact) => void;
    /** Collision end callback */
    onCollisionEnd?: (other: PhysicsBodyLogic, contact: planck.Contact) => void;
    constructor(world: PhysicsWorld, options?: PhysicsBodyOptions);
    /**
     * Initialize the physics body
     */
    init(entity: PIXI.Container, renderer?: PIXI.Renderer): void;
    /**
     * Update synchronization between physics and sprite
     */
    update(entity: PIXI.Container, deltaTime?: number): void;
    /**
     * Clean up physics body
     */
    destroy(): void;
    /**
     * Sync sprite from physics body
     */
    private syncFromPhysics;
    /**
     * Sync physics body from sprite
     */
    syncToPhysics(entity: PIXI.Container): void;
    /**
     * Create the Planck.js physics body
     */
    private createPhysicsBody;
    /**
     * Create fixture with shape
     */
    private createFixture;
    /**
     * Create Planck shape from Graphics geometry or legacy options
     */
    private createShape;
    /**
     * Create shape from explicit type
     */
    private createShapeFromType;
    /**
     * Auto-detect shape from sprite bounds
     */
    private autoDetectShape;
    /**
     * Apply force at a point
     */
    applyForce(force: PIXI.Point, point?: PIXI.Point): void;
    /**
     * Apply impulse at a point
     */
    applyImpulse(impulse: PIXI.Point, point?: PIXI.Point): void;
    /**
     * Apply torque
     */
    applyTorque(torque: number): void;
    /**
     * Set linear velocity
     */
    setVelocity(velocity: PIXI.Point): void;
    /**
     * Set angular velocity
     */
    setAngularVelocity(omega: number): void;
    /**
     * Get linear velocity
     */
    getVelocity(): PIXI.Point;
    /**
     * Get angular velocity
     */
    getAngularVelocity(): number;
    /**
     * Get mass
     */
    getMass(): number;
    /**
     * Check if body is awake
     */
    isAwake(): boolean;
    /**
     * Check if body is sleeping
     */
    isSleeping(): boolean;
    /**
     * Set awake state
     */
    setAwake(awake: boolean): void;
}
