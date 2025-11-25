import * as PIXI from 'pixi.js';
import { AsEntity } from '../../core/moxi-entity';
import type { PhysicsWorld } from './physics-world';
import { PhysicsBodyLogic } from './physics-body-logic';
import type { PhysicsBodyOptions, ShapeConfig } from './physics-types';
/**
 * Helper function to create a physics-enabled entity
 *
 * @example
 * ```typescript
 * const sprite = new PIXI.Sprite(texture);
 * const physicsEntity = asPhysicsEntity(sprite, physicsWorld, {
 *   type: 'dynamic',
 *   shape: 'circle',
 *   radius: 25
 * });
 * ```
 */
export declare function asPhysicsEntity<T extends PIXI.Container>(pixiObject: T, world: PhysicsWorld, options?: PhysicsBodyOptions): AsEntity<T>;
/**
 * Check if entity has physics body
 */
export declare function hasPhysics(entity: any): boolean;
/**
 * Get physics body logic from entity
 */
export declare function getPhysicsBody(entity: any): PhysicsBodyLogic | undefined;
/**
 * Shape creation from sprite bounds
 */
export declare function createShapeFromSprite(sprite: PIXI.Sprite, type?: 'rectangle' | 'circle' | 'auto'): ShapeConfig;
