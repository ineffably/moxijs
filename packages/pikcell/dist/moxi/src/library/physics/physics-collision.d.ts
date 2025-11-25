import type { CollisionTag, CollisionEvent } from './physics-types';
import type { PhysicsWorld } from './physics-world';
/**
 * Collision category registry - converts tags to bit masks
 * Auto-registers tags as they're used (no configuration needed)
 *
 * Modern tag-based collision system (converted to bit masks internally for Planck.js)
 *
 * Instead of old-school bit masks, we use strings for better DX:
 * - collisionTags: ['player'] instead of bitmask 0x0002
 * - collidesWith: ['terrain', 'enemy'] instead of mask operations
 *
 * This is converted to bit masks under the hood for Planck.js efficiency.
 */
export declare class CollisionRegistry {
    private tagToBit;
    private bitToTag;
    private nextBit;
    constructor();
    /**
     * Register a collision tag (called automatically when needed)
     */
    register(tag: CollisionTag): void;
    /**
     * Get bit value for a tag (auto-registers if new)
     */
    getBit(tag: CollisionTag): number;
    /**
     * Get tag from bit value
     */
    getTag(bit: number): CollisionTag | undefined;
    /**
     * Convert array of tags to bit mask
     */
    tagsToBits(tags: CollisionTag[]): number;
    /**
     * Convert bit mask to array of tags
     */
    bitsToTags(bits: number): CollisionTag[];
}
/**
 * Collision manager - handles callbacks
 */
export declare class CollisionManager {
    private world;
    private registry;
    private callbacks;
    constructor(world: PhysicsWorld, registry: CollisionRegistry);
    private setupListeners;
    /**
     * Register collision callback between two tag categories
     *
     * @example
     * collisionManager.onCollision('player', 'enemy', (event) => {
     *   console.log('Player hit enemy!');
     * });
     */
    onCollision(tagA: CollisionTag, tagB: CollisionTag, callback: (event: CollisionEvent) => void): void;
    /**
     * Remove collision callback
     */
    offCollision(tagA: CollisionTag, tagB: CollisionTag, callback: (event: CollisionEvent) => void): void;
    private makeKey;
    private handleBeginContact;
    private handleEndContact;
    private triggerTagCallbacks;
}
