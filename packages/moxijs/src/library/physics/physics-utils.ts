import * as PIXI from 'pixi.js';
import { asEntity, AsEntity } from '../../core/moxi-entity';
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
export function asPhysicsEntity<T extends PIXI.Container>(
  pixiObject: T,
  world: PhysicsWorld,
  options: PhysicsBodyOptions = {}
): AsEntity<T> {
  const entity = asEntity(pixiObject);
  const physicsLogic = new PhysicsBodyLogic(world, options);
  entity.moxiEntity.addLogic(physicsLogic);
  return entity as AsEntity<T>;
}

/**
 * Check if entity has physics body
 */
export function hasPhysics(entity: any): boolean {
  if (!entity.moxiEntity) return false;
  return entity.moxiEntity.getLogic('PhysicsBodyLogic') !== undefined;
}

/**
 * Get physics body logic from entity
 */
export function getPhysicsBody(entity: any): PhysicsBodyLogic | undefined {
  if (!entity.moxiEntity) return undefined;
  return entity.moxiEntity.getLogic('PhysicsBodyLogic') as PhysicsBodyLogic | undefined;
}

/**
 * Shape creation from sprite bounds
 */
export function createShapeFromSprite(
  sprite: PIXI.Sprite,
  type: 'rectangle' | 'circle' | 'auto' = 'auto'
): ShapeConfig {
  const bounds = sprite.getLocalBounds();

  if (type === 'auto') {
    // Check if roughly square -> circle, else rectangle
    const ratio = bounds.width / bounds.height;
    type = (ratio > 0.8 && ratio < 1.2) ? 'circle' : 'rectangle';
  }

  if (type === 'circle') {
    return {
      shape: 'circle',
      radius: Math.max(bounds.width, bounds.height) / 2
    };
  } else {
    return {
      shape: 'rectangle',
      width: bounds.width,
      height: bounds.height
    };
  }
}
