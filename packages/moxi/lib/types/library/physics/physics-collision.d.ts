import type { CollisionTag, CollisionEvent } from './physics-types';
import type { PhysicsWorld } from './physics-world';
export declare class CollisionRegistry {
    private tagToBit;
    private bitToTag;
    private nextBit;
    constructor();
    register(tag: CollisionTag): void;
    getBit(tag: CollisionTag): number;
    getTag(bit: number): CollisionTag | undefined;
    tagsToBits(tags: CollisionTag[]): number;
    bitsToTags(bits: number): CollisionTag[];
}
export declare class CollisionManager {
    private world;
    private registry;
    private callbacks;
    constructor(world: PhysicsWorld, registry: CollisionRegistry);
    private setupListeners;
    onCollision(tagA: CollisionTag, tagB: CollisionTag, callback: (event: CollisionEvent) => void): void;
    offCollision(tagA: CollisionTag, tagB: CollisionTag, callback: (event: CollisionEvent) => void): void;
    private makeKey;
    private handleBeginContact;
    private handleEndContact;
    private triggerTagCallbacks;
}
