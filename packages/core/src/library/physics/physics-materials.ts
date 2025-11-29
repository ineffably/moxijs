import type { PhysicsBodyOptions } from './physics-types';

/**
 * Predefined material presets for common physics behaviors
 *
 * @example
 * ```typescript
 * const ball = asPhysicsEntity(sprite, world, {
 *   type: 'dynamic',
 *   ...PhysicsMaterials.bouncy
 * });
 * ```
 */
export const PhysicsMaterials = {
  /**
   * Bouncy ball - high restitution, low friction
   */
  bouncy: {
    density: 0.5,
    friction: 0.1,
    restitution: 0.9
  },

  /**
   * Wooden box - medium density, medium friction
   */
  wood: {
    density: 0.7,
    friction: 0.4,
    restitution: 0.2
  },

  /**
   * Metal object - high density, low restitution
   */
  metal: {
    density: 1.5,
    friction: 0.3,
    restitution: 0.1
  },

  /**
   * Ice - very low friction, low restitution
   */
  ice: {
    density: 0.9,
    friction: 0.02,
    restitution: 0.05
  },

  /**
   * Rubber - high friction, high restitution
   */
  rubber: {
    density: 1.0,
    friction: 0.9,
    restitution: 0.7
  },

  /**
   * Character - no rotation, medium friction
   */
  character: {
    density: 1.0,
    friction: 0.5,
    restitution: 0.0,
    fixedRotation: true
  },

  /**
   * Static terrain - no density (immovable), high friction
   */
  terrain: {
    density: 0,
    friction: 0.6,
    restitution: 0.0
  }
} as const;

/**
 * Apply material preset to options
 */
export function applyMaterial(
  options: PhysicsBodyOptions,
  material: keyof typeof PhysicsMaterials
): PhysicsBodyOptions {
  return {
    ...options,
    ...PhysicsMaterials[material]
  };
}
