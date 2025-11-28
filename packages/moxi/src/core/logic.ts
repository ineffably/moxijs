import PIXI from 'pixi.js';

/**
 * Base class for entity behavior. Extend to add custom logic.
 *
 * @example
 * ```ts
 * class MoveRight extends Logic<PIXI.Sprite> {
 *   speed = 100;
 *   update(entity, dt) { entity.x += this.speed * dt; }
 * }
 *
 * sprite.moxiEntity.addLogic(new MoveRight());
 * ```
 */
export abstract class Logic<T> {
  /** Identifier for getLogic(). Defaults to class name. */
  name?: string;

  /** Set false to skip update() calls. */
  active: boolean = true;

  /**
   * Called once when scene.init() is invoked. Override for setup.
   * @param entity - The PIXI object this logic is attached to
   * @param renderer - The PIXI renderer
   * @param args - Additional arguments passed to scene.init()
   */
  init(entity?: T, renderer?: PIXI.Renderer<HTMLCanvasElement>, ...args: any[]) {}

  /**
   * Called every frame while active. Override for behavior.
   * @param entity - The PIXI object this logic is attached to
   * @param deltaTime - Time since last frame in frames (1 = 1/60s at 60fps)
   */
  update(entity?: T, deltaTime?: number) {}
}

/**
 * Same as Logic but semantically indicates multiple instances expected.
 *
 * @example
 * ```ts
 * class Orbit extends InstancedLogic<PIXI.Sprite> {
 *   constructor(public radius: number, public speed: number) { super(); }
 *   update(entity, dt) { /* orbit logic *\/ }
 * }
 *
 * sprite1.moxiEntity.addLogic(new Orbit(50, 1));
 * sprite2.moxiEntity.addLogic(new Orbit(100, 0.5));
 * ```
 */
export class InstancedLogic<T> extends Logic<T> {}

