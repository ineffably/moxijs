/**
 * Physics module - Planck.js integration for MOXI
 *
 * @packageDocumentation
 */

// Core classes
export { PhysicsWorld } from './physics-world';
export { PhysicsBodyLogic } from './physics-body-logic';
export { CollisionRegistry, CollisionManager } from './physics-collision';
export { PhysicsDebugRenderer } from './physics-debug-renderer';

// Utilities
export {
  asPhysicsEntity,
  hasPhysics,
  getPhysicsBody,
  createShapeFromSprite
} from './physics-utils';

// Materials
export { PhysicsMaterials, applyMaterial } from './physics-materials';

// Types
export type {
  BodyType,
  SyncMode,
  ShapeType,
  CollisionTag,
  ShapeConfig,
  PhysicsWorldOptions,
  PhysicsBodyOptions,
  PhysicsDebugOptions,
  CollisionEvent,
  RaycastCallback
} from './physics-types';
