import { PIXI } from '.';

/**
 * Base abstract class for all behaviors in the Moxi engine.
 * Behaviors are components that can be attached to entities to add functionality.
 * 
 * @category Behaviors
 * @template T - The type of entity this behavior can be attached to
 * 
 * @example
 * ```typescript
 * class MyBehavior extends Behavior<Sprite> {
 *   update(entity: Sprite, deltaTime: number) {
 *     entity.rotation += deltaTime;
 *   }
 * }
 * ```
 */
export abstract class Behavior<T> {
  /**
   * Whether this behavior is currently active and should be updated
   * @default true
   */
  active: boolean = true;
  
  /**
   * Initializes the behavior with the entity it's attached to
   * @param entity - The entity this behavior is attached to
   * @param renderer - The PIXI renderer instance
   * @param args - Additional initialization arguments
   */
  init(entity?: T, renderer?: PIXI.Renderer<HTMLCanvasElement>, ...args: any[]) {
    // Implement in subclass
  }

  /**
   * Updates the behavior's state
   * @param entity - The entity this behavior is attached to
   * @param deltaTime - Time elapsed since last update in seconds
   */
  update(entity?: T, deltaTime?: number) {
    // Implement in subclass
  }
}

/**
 * A behavior that can be instantiated multiple times with different configurations
 * 
 * @category Behaviors
 * @template T - The type of entity this behavior can be attached to
 * 
 * @example
 * ```typescript
 * class MyInstancedBehavior extends InstancedBehavior<Sprite> {
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
export class InstancedBehavior<T> extends Behavior<T> {}
