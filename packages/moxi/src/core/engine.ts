import PIXI from 'pixi.js';
import { Scene } from './scene';
import type { PhysicsWorld } from '../library/physics';

/**
 * Game loop manager. Drives scene updates and rendering via PIXI.Ticker.
 *
 * @example
 * ```ts
 * const engine = new Engine(scene);
 * engine.start();  // Begin game loop
 * engine.stop();   // Pause game loop
 * ```
 */
export class Engine {
  /** PIXI.Ticker driving the game loop. */
  ticker: PIXI.Ticker;

  /** Active scene being updated/rendered. */
  root: Scene;

  /** Physics world (if enabled via setupMoxi). */
  physicsWorld?: PhysicsWorld;

  /** @internal */
  logger: (msg: string) => void;
  /** @internal */
  loggerFrequencyMs: number;
  /** @internal */
  nextLogTime: number;

  constructor(stage: Scene = null) {
    this.root = stage;

    const ticker = PIXI.Ticker.shared;
    ticker.autoStart = false;
    ticker.add(this.gameLoop);
    this.ticker = ticker;

    this.loggerFrequencyMs = 500;
    this.nextLogTime = 0;
    this.logger = (msg) => null;
  }

  /** Start the game loop. */
  start() {
    this.ticker.start();
    return this;
  }

  /** Stop/pause the game loop. */
  stop() {
    this.ticker.stop();
    return this;
  }

  /** Attach physics world. Called automatically by setupMoxi if physics enabled. */
  addPhysicsWorld(physicsWorld: PhysicsWorld) {
    this.physicsWorld = physicsWorld;
    return this;
  }

  /** @internal Main loop: physics step -> scene update -> render. */
  gameLoop = (tikerTime: PIXI.Ticker) => {
    if (this.root) {
      const { deltaTime, deltaMS } = tikerTime;

      if (this.physicsWorld) {
        const deltaSeconds = deltaMS / 1000;
        this.physicsWorld.step(deltaSeconds);
      }

      this.root.update(deltaTime);
      this.root.draw(deltaTime);
    }
  };

  /** Switch to a different scene. */
  loadStage(stage: Scene) {
    this.root = stage;
    return this;
  }
}
