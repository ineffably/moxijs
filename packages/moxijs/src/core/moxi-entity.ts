import PIXI from 'pixi.js';
import { Logic } from './logic';

/** @internal */
interface MoxiEntityClass<T> {
  logic: MoxiLogic<T>;
  update: (delta: number, entity: T) => void;
  init: (...args: any[]) => void;
  addLogic: (logic: Logic<T>) => void;
  getLogic: (name: string) => Logic<T> | undefined;
}

/** PIXI.Container with attached MoxiEntity for logic management. */
export type AsEntity<T> = PIXI.Container & {
  moxiEntity: MoxiEntity<T>;
};

/** Map of logic components by name. */
export type MoxiLogic<T> = Record<string, Logic<T>>;

/**
 * Manages logic components attached to a PIXI object.
 * Usually accessed via `entity.moxiEntity` after calling `asEntity()`.
 *
 * @example
 * ```ts
 * const sprite = asEntity(new PIXI.Sprite(texture));
 * sprite.moxiEntity.addLogic(new MyLogic());
 * sprite.moxiEntity.getLogic<MyLogic>('MyLogic').speed = 10;
 * ```
 */
export class MoxiEntity<T> implements MoxiEntityClass<T> {
  /** Attached logic components keyed by name. */
  logic: MoxiLogic<T> = {};

  /** The PIXI object this entity wraps. */
  entity: T;

  /**
   * @param entity - The PIXI object to wrap
   * @param logic - Optional initial logic components
   */
  constructor(entity: T, logic: MoxiLogic<T> = {}) {
    this.logic = logic;
    this.entity = entity;
  }

  /**
   * Calls update() on all active logic components.
   * Called automatically by Scene each frame.
   * @param deltaTime - Time since last frame in frames (1 = 1/60s at 60fps)
   */
  update(deltaTime: number) {
    if (!this.entity) return;

    for (const className in this.logic) {
      const logicComponent = this.logic[className];
      if (logicComponent && logicComponent.active && logicComponent.update) {
        logicComponent.update(this.entity, deltaTime);
      }
    }
  }

  /**
   * Calls init() on all logic components.
   * Called automatically when scene.init() is invoked.
   * @param renderer - The PIXI renderer
   * @param args - Additional arguments passed through to logic.init()
   */
  init(renderer: PIXI.Renderer<HTMLCanvasElement>, ...args: any[]) {
    if (!this.entity) return;

    for (const className in this.logic) {
      const logicComponent = this.logic[className];
      if (logicComponent && logicComponent.init) {
        logicComponent.init(this.entity, renderer, ...args);
      }
    }
  }

  /**
   * Attach a logic component to this entity.
   * @param logic - The logic component to attach. Uses logic.name or class name as key.
   */
  addLogic(logic: Logic<T>) {
    const logicName = logic.name || logic.constructor.name;
    this.logic[logicName] = logic;
  }

  /**
   * Get a logic component by name.
   * @param name - The name of the logic component (class name or custom name)
   * @returns The logic component, or undefined if not found
   */
  getLogic<L extends Logic<T>>(name: string): L | undefined {
    return this.logic[name] as L | undefined;
  }
}

/**
 * Convert a PIXI.Container to an entity with logic support.
 * This is the main way to add Moxi functionality to PIXI objects.
 *
 * @param entity - Any PIXI.Container (Sprite, Graphics, Container, etc.)
 * @param logic - Optional initial logic components to attach
 * @returns The same entity with moxiEntity property attached
 *
 * @example
 * ```ts
 * const player = asEntity(new PIXI.Sprite(texture));
 * player.moxiEntity.addLogic(new PlayerController());
 * scene.addChild(player);
 *
 * // With initial logic
 * const enemy = asEntity(new PIXI.Sprite(texture), {
 *   'EnemyAI': new EnemyAI()
 * });
 * ```
 */
export function asEntity<T extends PIXI.Container>(entity: T, logic: MoxiLogic<T> = {}): AsEntity<T> {
  const target = entity;
  
  // pixi patch: it's throwing an error on interactive events if isInteractive() doesn't exist.
  target.isInteractive = () => false; 

  (target as unknown as AsEntity<T>).moxiEntity = new MoxiEntity<T>(target, logic);
  return entity as unknown as AsEntity<T>;
}

