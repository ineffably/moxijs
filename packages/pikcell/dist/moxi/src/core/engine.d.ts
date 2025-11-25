import PIXI from 'pixi.js';
import { Scene } from './scene';
import type { PhysicsWorld } from '../library/physics';
/**
 * The core game engine class that manages the game loop, scene rendering,
 * and update cycles. Coordinates with the PIXI.Ticker to drive the animation.
 *
 * @category Core
 * @example
 * ```typescript
 * // Create a new engine with a scene
 * const engine = new Engine(scene);
 *
 * // Start the game loop
 * engine.start();
 *
 * // Stop the game loop when needed
 * engine.stop();
 * ```
 */
export declare class Engine {
    /**
     * The PIXI Ticker instance that drives the game loop
     */
    ticker: PIXI.Ticker;
    /**
     * The current active scene/stage
     */
    root: Scene;
    /**
     * Optional physics world instance
     */
    physicsWorld?: PhysicsWorld;
    /**
     * Optional logging function for debugging
     */
    logger: (msg: string) => void;
    /**
     * How often to log messages (in milliseconds)
     */
    loggerFrequencyMs: number;
    /**
     * Timestamp for the next log message
     * @internal
     */
    nextLogTime: number;
    /**
     * Creates a new Engine instance
     *
     * @param stage - The initial scene to use, if any
     */
    constructor(stage?: Scene);
    /**
     * Starts the game loop
     *
     * @returns The Engine instance for chaining
     */
    start(): this;
    /**
     * Stops the game loop
     *
     * @returns The Engine instance for chaining
     */
    stop(): this;
    /**
     * Add physics world to engine
     *
     * @param physicsWorld - The physics world instance
     * @returns The Engine instance for chaining
     */
    addPhysicsWorld(physicsWorld: PhysicsWorld): this;
    /**
     * The main game loop function called by the ticker on each frame
     * Updates and renders the active scene
     *
     * @param tikerTime - Ticker information including delta time
     * @private
     */
    gameLoop: (tikerTime: PIXI.Ticker) => void;
    /**
     * Sets a new active scene
     *
     * @param stage - The new scene to use
     * @returns The Engine instance for chaining
     */
    loadStage(stage: Scene): this;
}
