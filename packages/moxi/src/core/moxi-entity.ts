import PIXI from 'pixi.js';
import { Logic } from './logic';

/**
 * Interface defining the contract for the MoxiEntity class.
 * Specifies required methods and properties for entity management.
 * 
 * @internal
 * @template T - The type of entity being managed
 */
interface MoxiEntityClass<T> {
  logic: MoxiLogic<T>;
  update: (delta: number, entity: T) => void;
  init: (...args: any[]) => void;
  addLogic: (logic: Logic<T>) => void;
  getLogic: (name: string) => Logic<T> | undefined;
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
 * entitySprite.moxiEntity.addLogic(new MovementLogic());
 * ```
 */
export type AsEntity<T> = PIXI.Container & {
  moxiEntity: MoxiEntity<T>;
};

/**
 * Type definition for a collection of logic components mapped by name.
 * Used to store and retrieve logic attached to entities.
 * 
 * @category Entities
 * @template T - The type of entity these logic components can be applied to
 */
export type MoxiLogic<T> = Record<string, Logic<T>>;

/**
 * The core entity management class that handles component-based logic.
 * MoxiEntity connects entities with their logic components and manages the logic lifecycle.
 * 
 * This class implements the Entity-Component-System pattern, where:
 * - The entity is the object being controlled (like a PIXI.Sprite)
 * - Logic components add functionality
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
 * // Add logic
 * entity.addLogic(new MovementLogic());
 * entity.addLogic(new AnimationLogic());
 * 
 * // Initialize all logic
 * entity.init(renderer);
 * 
 * // Update all logic (usually called within the game loop)
 * entity.update(deltaTime);
 * ```
 */
export class MoxiEntity<T> implements MoxiEntityClass<T> {
  /**
   * Collection of logic components attached to this entity
   */
  logic: MoxiLogic<T> = {};
  
  /**
   * Reference to the actual entity being managed
   */
  entity: T;

  /**
   * Creates a new MoxiEntity
   * 
   * @param entity - The entity to manage
   * @param logic - Optional map of initial logic to attach
   */
  constructor(entity: T, logic: MoxiLogic<T> = {}) {
    this.logic = logic;
    this.entity = entity;
  }

  /**
   * Updates all active logic components attached to this entity
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
    for (const className in this.logic) {
      const logicComponent = this.logic[className];
      if(logicComponent.update && this.entity && logicComponent.active){
        logicComponent.update(this.entity, deltaTime); 
      }
    }
    // TODO: update children?
  }
  
  /**
   * Initializes all logic components attached to this entity
   * Typically called once when the entity is first created or added to the scene
   * 
   * @param renderer - The PIXI renderer instance
   * @param args - Additional arguments to pass to each logic component's init method
   * 
   * @example
   * ```typescript
   * // When adding an entity to the scene
   * scene.addChild(entitySprite);
   * entitySprite.moxiEntity.init(renderer);
   * ```
   */
  init(renderer: PIXI.Renderer<HTMLCanvasElement>, ...args: any[]) {
    for (const className in this.logic) {
      const logicComponent = this.logic[className];
      if(logicComponent.init && this.entity){
        logicComponent.init(this.entity, renderer, ...args);
      }
    }
  } 

  /**
   * Adds a logic component to this entity
   * 
   * @param logic - The logic component to add
   * 
   * @example
   * ```typescript
   * // Create and add logic
   * const movementLogic = new MovementLogic();
   * movementLogic.speed = 5;
   * entitySprite.moxiEntity.addLogic(movementLogic);
   * ```
   */
  addLogic(logic: Logic<T>) {
    // Use explicit name if set, otherwise fall back to constructor name
    const logicName = logic.name || logic.constructor.name;
    this.logic[logicName] = logic;
  }

  /**
   * Retrieves a logic component by name
   * Useful for accessing and configuring specific logic components
   * 
   * @template L - The type of logic to return
   * @param name - The name of the logic to retrieve (usually the class name)
   * @returns The logic instance, or undefined if not found
   * 
   * @example
   * ```typescript
   * // Get and configure logic
   * const movement = entitySprite.moxiEntity.getLogic<MovementLogic>('MovementLogic');
   * if (movement) {
   *   movement.speed = 10;
   *   movement.direction = 'right';
   * }
   * ```
   */
  getLogic<L extends Logic<T>>(name: string): L | undefined {
    return this.logic[name] as L | undefined;
  }
}

/**
 * Helper function to convert a PIXI Container into an AsEntity
 * This is the primary way to create entities in Moxi
 * 
 * @category Entities
 * @template T - The type of container being converted
 * @param entity - The PIXI Container to convert
 * @param logic - Optional initial logic to attach
 * @returns The enhanced container as an AsEntity
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const sprite = new PIXI.Sprite(texture);
 * const entitySprite = asEntity(sprite);
 * scene.addChild(entitySprite);
 * 
 * // With initial logic
 * const player = asEntity(
 *   new PIXI.Sprite(playerTexture),
 *   {
 *     'PlayerMovement': new PlayerMovementLogic(),
 *     'Health': new HealthLogic(100)
 *   }
 * );
 * ```
 */
export function asEntity<T extends PIXI.Container>(entity: T, logic: MoxiLogic<T> = {}): AsEntity<T> {
  const target = entity;
  
  // pixi patch: it's throwing an error on interactive events if isInteractive() doesn't exist.
  target.isInteractive = () => false; 

  (target as unknown as AsEntity<T>).moxiEntity = new MoxiEntity<T>(target, logic);
  return entity as unknown as AsEntity<T>;
}

