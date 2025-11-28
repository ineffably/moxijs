import * as PIXI from 'pixi.js';
import * as planck from 'planck';
import type { CollisionTag, CollisionEvent } from './physics-types';
import type { PhysicsWorld } from './physics-world';

/**
 * Tag-to-bitmask converter for collision filtering.
 * Auto-registers tags on first use. Max 16 unique tags.
 *
 * @example
 * ```ts
 * // Tags are auto-registered, no config needed
 * const bits = registry.tagsToBits(['player', 'enemy']);
 * ```
 */
export class CollisionRegistry {
  private tagToBit: Map<CollisionTag, number> = new Map();
  private bitToTag: Map<number, CollisionTag> = new Map();
  private nextBit: number = 1;

  constructor() {
    // Pre-register 'default' tag
    this.register('default');
  }

  /** Register tag manually. Called automatically by getBit(). */
  register(tag: CollisionTag): void {
    if (this.tagToBit.has(tag)) return;

    if (this.nextBit > 0x8000) {
      throw new Error('Maximum collision tags reached (16 tags)');
    }

    this.tagToBit.set(tag, this.nextBit);
    this.bitToTag.set(this.nextBit, tag);
    this.nextBit <<= 1;
  }

  /** Get bitmask for tag. Auto-registers new tags. */
  getBit(tag: CollisionTag): number {
    if (!this.tagToBit.has(tag)) {
      this.register(tag);
    }
    return this.tagToBit.get(tag)!;
  }

  /** Reverse lookup: bit → tag. */
  getTag(bit: number): CollisionTag | undefined {
    return this.bitToTag.get(bit);
  }

  /** Convert ['player', 'enemy'] → combined bitmask. */
  tagsToBits(tags: CollisionTag[]): number {
    if (!tags || tags.length === 0) {
      return this.getBit('default');
    }
    return tags.reduce((bits, tag) => bits | this.getBit(tag), 0);
  }

  /** Convert bitmask → tag array. */
  bitsToTags(bits: number): CollisionTag[] {
    const tags: CollisionTag[] = [];
    for (const [bit, tag] of this.bitToTag) {
      if (bits & bit) {
        tags.push(tag);
      }
    }
    return tags;
  }
}

/** @internal Physics body user data structure. */
interface PhysicsBodyUserData {
  options: {
    collisionTags?: CollisionTag[];
  };
  onCollisionBegin?: (other: PhysicsBodyUserData, contact: planck.Contact) => void;
  onCollisionEnd?: (other: PhysicsBodyUserData, contact: planck.Contact) => void;
}

/** @internal Type guard for body user data. */
function isPhysicsBodyUserData(obj: unknown): obj is PhysicsBodyUserData {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    'options' in obj &&
    typeof (obj as any).options === 'object'
  );
}

/**
 * Manages tag-based collision callbacks between physics bodies.
 * Register callbacks for specific tag pairs to handle collisions.
 *
 * @example
 * ```ts
 * // Register collision handler
 * physicsWorld.collisionManager.onCollision('player', 'enemy', (event) => {
 *   console.log('Player hit enemy!');
 *   const playerBody = event.bodyA;
 *   const enemyBody = event.bodyB;
 * });
 *
 * // Multiple tag combinations
 * physicsWorld.collisionManager.onCollision('projectile', 'enemy', (e) => {
 *   e.bodyB.destroy(); // Destroy enemy
 * });
 *
 * // Remove callback
 * physicsWorld.collisionManager.offCollision('player', 'enemy', handler);
 * ```
 */
export class CollisionManager {
  private world: PhysicsWorld;
  private registry: CollisionRegistry;
  private callbacks: Map<string, Set<(event: CollisionEvent) => void>> = new Map();

  constructor(world: PhysicsWorld, registry: CollisionRegistry) {
    this.world = world;
    this.registry = registry;
    this.setupListeners();
  }

  private setupListeners(): void {
    this.world.world.on('begin-contact', (contact: planck.Contact) => {
      this.handleBeginContact(contact);
    });

    this.world.world.on('end-contact', (contact: planck.Contact) => {
      this.handleEndContact(contact);
    });
  }

  /** Register callback for collisions between two tags. */
  onCollision(
    tagA: CollisionTag,
    tagB: CollisionTag,
    callback: (event: CollisionEvent) => void
  ): void {
    const key = this.makeKey(tagA, tagB);
    if (!this.callbacks.has(key)) {
      this.callbacks.set(key, new Set());
    }
    this.callbacks.get(key)!.add(callback);
  }

  /** Remove collision callback. */
  offCollision(
    tagA: CollisionTag,
    tagB: CollisionTag,
    callback: (event: CollisionEvent) => void
  ): void {
    const key = this.makeKey(tagA, tagB);
    this.callbacks.get(key)?.delete(callback);
  }

  private makeKey(tagA: CollisionTag, tagB: CollisionTag): string {
    // Sort tags to ensure consistent key regardless of order
    return tagA < tagB ? `${tagA}:${tagB}` : `${tagB}:${tagA}`;
  }

  // Trigger callbacks
  private handleBeginContact(contact: planck.Contact): void {
    const bodyA = contact.getFixtureA().getBody().getUserData();
    const bodyB = contact.getFixtureB().getBody().getUserData();

    if (!isPhysicsBodyUserData(bodyA) || !isPhysicsBodyUserData(bodyB)) return;

    // Call entity-level callbacks
    bodyA.onCollisionBegin?.(bodyB, contact);
    bodyB.onCollisionBegin?.(bodyA, contact);

    // Call global tag-based callbacks
    this.triggerTagCallbacks(bodyA, bodyB, contact);
  }

  private handleEndContact(contact: planck.Contact): void {
    const bodyA = contact.getFixtureA().getBody().getUserData();
    const bodyB = contact.getFixtureB().getBody().getUserData();

    if (!isPhysicsBodyUserData(bodyA) || !isPhysicsBodyUserData(bodyB)) return;

    bodyA.onCollisionEnd?.(bodyB, contact);
    bodyB.onCollisionEnd?.(bodyA, contact);
  }

  private triggerTagCallbacks(
    bodyA: PhysicsBodyUserData,
    bodyB: PhysicsBodyUserData,
    contact: planck.Contact
  ): void {
    // Get tags from both bodies
    const tagsA = bodyA.options.collisionTags || [];
    const tagsB = bodyB.options.collisionTags || [];

    // Check all tag combinations
    for (const tagA of tagsA) {
      for (const tagB of tagsB) {
        const key = this.makeKey(tagA, tagB);
        const callbacks = this.callbacks.get(key);

        if (callbacks) {
          const event: CollisionEvent = {
            bodyA,
            bodyB,
            contact,
            normal: new PIXI.Point(0, 0), // TODO: Extract from contact
            impulse: 0 // TODO: Extract from contact
          };

          callbacks.forEach(cb => cb(event));
        }
      }
    }
  }
}
