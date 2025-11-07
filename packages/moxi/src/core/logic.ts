import PIXI from 'pixi.js';

/**
 * Base abstract class for all logic in the Moxi engine.
 * Logic components can be attached to entities to add functionality.
 * 
 * @category Logic
 * @template T - The type of entity this logic can be attached to
 * 
 * @example
 * ```typescript
 * class MyLogic extends Logic<Sprite> {
 *   update(entity: Sprite, deltaTime: number) {
 *     entity.rotation += deltaTime;
 *   }
 * }
 * ```
 */
export abstract class Logic<T> {
  /**
   * Whether this logic is currently active and should be updated
   * @default true
   */
  active: boolean = true;
  
  /**
   * Initializes the logic with the entity it's attached to
   * @param entity - The entity this logic is attached to
   * @param renderer - The PIXI renderer instance
   * @param args - Additional initialization arguments
   */
  init(entity?: T, renderer?: PIXI.Renderer<HTMLCanvasElement>, ...args: any[]) {
    // Implement in subclass
  }

  /**
   * Updates the logic's state
   * @param entity - The entity this logic is attached to
   * @param deltaTime - Time elapsed since last update in seconds
   */
  update(entity?: T, deltaTime?: number) {
    // Implement in subclass
  }
}

/**
 * Logic that can be instantiated multiple times with different configurations
 * 
 * @category Logic
 * @template T - The type of entity this logic can be attached to
 * 
 * @example
 * ```typescript
 * class MyInstancedLogic extends InstancedLogic<Sprite> {
 *   constructor(public speed: number) {
 *     super();
 *   }
 *   
 *   update(entity: Sprite, deltaTime: number) {
 *     entity.rotation += this.speed * deltaTime;
 *   }
 * }
 * ```
 */
export class InstancedLogic<T> extends Logic<T> {}

