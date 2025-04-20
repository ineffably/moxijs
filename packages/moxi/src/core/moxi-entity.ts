import PIXI from 'pixi.js';
import { Behavior } from './bahavior';

/**
 * Interface defining the contract for the MoxiEntity class.
 * Specifies required methods and properties for entity management.
 * 
 * @internal
 * @template T - The type of entity being managed
 */
interface MoxiEntityClass<T> {
  behaviors: MoxiBehaviors<T>;
  update: (delta: number, entity: T) => void;
  init: (...args: any[]) => void;
  addBehavior: (behavior: Behavior<T>) => void;
  getBehavior: (name: string) => Behavior<T> | undefined;
}

/**
 * Type definition for objects that have been enhanced with MoxiEntity capabilities.
 * This is the primary interface developers will interact with when using the entity system.
 * 
 * @category Entities
 * @template T - The type of entity being managed (typically extends PIXI.Container)
 * 
 * @example
 * ```typescript
 * // Create a sprite and convert it to an AsEntity
 * const sprite = new PIXI.Sprite(texture);
 * const entitySprite = asEntity(sprite);
 * 
 * // Now it has a moxiEntity property
 * entitySprite.moxiEntity.addBehavior(new MovementBehavior());
 * ```
 */
export type AsEntity<T> = PIXI.Container & {
  moxiEntity: MoxiEntity<T>;
};

/**
 * Type definition for a collection of behaviors mapped by name.
 * Used to store and retrieve behaviors attached to entities.
 * 
 * @category Entities
 * @template T - The type of entity these behaviors can be applied to
 */
export type MoxiBehaviors<T> = Record<string, Behavior<T>>;

/**
 * The core entity management class that handles component-based behavior.
 * MoxiEntity connects entities with their behaviors and manages the behavior lifecycle.
 * 
 * This class implements the Entity-Component-System pattern, where:
 * - The entity is the object being controlled (like a PIXI.Sprite)
 * - Behaviors are the components that add functionality
 * - This class provides the system to manage those components
 * 
 * @category Entities
 * @template T - The type of entity being managed
 * 
 * @example
 * ```typescript
 * // Create a sprite and entity
 * const sprite = new PIXI.Sprite(texture);
 * const entity = new MoxiEntity(sprite);
 * 
 * // Add behaviors
 * entity.addBehavior(new MovementBehavior());
 * entity.addBehavior(new AnimationBehavior());
 * 
 * // Initialize all behaviors
 * entity.init(renderer);
 * 
 * // Update all behaviors (usually called within the game loop)
 * entity.update(deltaTime);
 * ```
 */
export class MoxiEntity<T> implements MoxiEntityClass<T> {
  /**
   * Collection of behaviors attached to this entity
   */
  behaviors: MoxiBehaviors<T> = {};
  
  /**
   * Reference to the actual entity being managed
   */
  entity: T;

  /**
   * Creates a new MoxiEntity
   * 
   * @param entity - The entity to manage
   * @param behaviors - Optional map of initial behaviors to attach
   */
  constructor(entity: T, behaviors: MoxiBehaviors<T> = {}) {
    this.behaviors = behaviors;
    this.entity = entity;
  }

  /**
   * Updates all active behaviors attached to this entity
   * Typically called each frame during the game loop
   * 
   * @param deltaTime - Time in seconds since the last update
   * 
   * @example
   * ```typescript
   * // In game loop
   * function gameLoop(deltaTime) {
   *   playerEntity.moxiEntity.update(deltaTime);
   * }
   * ```
   */
  update(deltaTime: number) { 
    for (const className in this.behaviors) {
      const behavior = this.behaviors[className];
      if(behavior.update && this.entity && behavior.active){
        behavior.update(this.entity, deltaTime); 
      }
    }
    // TODO: update children?
  }
  
  /**
   * Initializes all behaviors attached to this entity
   * Typically called once when the entity is first created or added to the scene
   * 
   * @param renderer - The PIXI renderer instance
   * @param args - Additional arguments to pass to each behavior's init method
   * 
   * @example
   * ```typescript
   * // When adding an entity to the scene
   * scene.addChild(entitySprite);
   * entitySprite.moxiEntity.init(renderer);
   * ```
   */
  init(renderer: PIXI.Renderer<HTMLCanvasElement>, ...args: any[]) {
    for (const className in this.behaviors) {
      const behavior = this.behaviors[className];
      if(behavior.init && this.entity){
        behavior.init(this.entity, renderer, ...args);
      }
    }
  } 

  /**
   * Adds a behavior to this entity
   * 
   * @param behavior - The behavior to add
   * 
   * @example
   * ```typescript
   * // Create and add a behavior
   * const movementBehavior = new MovementBehavior();
   * movementBehavior.speed = 5;
   * entitySprite.moxiEntity.addBehavior(movementBehavior);
   * ```
   */
  addBehavior(behavior: Behavior<T>) {
    this.behaviors[behavior.constructor.name] = behavior;
  }

  /**
   * Retrieves a behavior by name
   * Useful for accessing and configuring specific behaviors
   * 
   * @template B - The type of behavior to return
   * @param name - The name of the behavior to retrieve (usually the class name)
   * @returns The behavior instance, or undefined if not found
   * 
   * @example
   * ```typescript
   * // Get and configure a behavior
   * const movement = entitySprite.moxiEntity.getBehavior<MovementBehavior>('MovementBehavior');
   * if (movement) {
   *   movement.speed = 10;
   *   movement.direction = 'right';
   * }
   * ```
   */
  getBehavior<B extends Behavior<T>>(name: string): B | undefined {
    return this.behaviors[name] as B | undefined;
  }
}

/**
 * Helper function to convert a PIXI Container into an AsEntity
 * This is the primary way to create entities in Moxi
 * 
 * @category Entities
 * @template T - The type of container being converted
 * @param entity - The PIXI Container to convert
 * @param behaviors - Optional initial behaviors to attach
 * @returns The enhanced container as an AsEntity
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const sprite = new PIXI.Sprite(texture);
 * const entitySprite = asEntity(sprite);
 * scene.addChild(entitySprite);
 * 
 * // With initial behaviors
 * const player = asEntity(
 *   new PIXI.Sprite(playerTexture),
 *   {
 *     'PlayerMovement': new PlayerMovementBehavior(),
 *     'Health': new HealthBehavior(100)
 *   }
 * );
 * ```
 */
export function asEntity<T extends PIXI.Container>(entity: T, behaviors: MoxiBehaviors<T> = {}): AsEntity<T> {
  const target = entity;
  
  // pixi patch: it's throwing an error on interactive events if isInteractive() doesn't exist.
  target.isInteractive = () => false; 

  (target as unknown as AsEntity<T>).moxiEntity = new MoxiEntity<T>(target, behaviors);
  return entity as unknown as AsEntity<T>;
}

