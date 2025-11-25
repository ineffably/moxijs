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
export declare const PhysicsMaterials: {
    /**
     * Bouncy ball - high restitution, low friction
     */
    readonly bouncy: {
        readonly density: 0.5;
        readonly friction: 0.1;
        readonly restitution: 0.9;
    };
    /**
     * Wooden box - medium density, medium friction
     */
    readonly wood: {
        readonly density: 0.7;
        readonly friction: 0.4;
        readonly restitution: 0.2;
    };
    /**
     * Metal object - high density, low restitution
     */
    readonly metal: {
        readonly density: 1.5;
        readonly friction: 0.3;
        readonly restitution: 0.1;
    };
    /**
     * Ice - very low friction, low restitution
     */
    readonly ice: {
        readonly density: 0.9;
        readonly friction: 0.02;
        readonly restitution: 0.05;
    };
    /**
     * Rubber - high friction, high restitution
     */
    readonly rubber: {
        readonly density: 1;
        readonly friction: 0.9;
        readonly restitution: 0.7;
    };
    /**
     * Character - no rotation, medium friction
     */
    readonly character: {
        readonly density: 1;
        readonly friction: 0.5;
        readonly restitution: 0;
        readonly fixedRotation: true;
    };
    /**
     * Static terrain - no density (immovable), high friction
     */
    readonly terrain: {
        readonly density: 0;
        readonly friction: 0.6;
        readonly restitution: 0;
    };
};
/**
 * Apply material preset to options
 */
export declare function applyMaterial(options: PhysicsBodyOptions, material: keyof typeof PhysicsMaterials): PhysicsBodyOptions;
