import * as PIXI from 'pixi.js';
import * as planck from 'planck';
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
export class CollisionRegistry {
  private tagToBit: Map<CollisionTag, number> = new Map();
  private bitToTag: Map<number, CollisionTag> = new Map();
  private nextBit: number = 1;

  constructor() {
    // Pre-register 'default' tag
    this.register('default');
  }

  /**
   * Register a collision tag (called automatically when needed)
   */
  register(tag: CollisionTag): void {
    if (this.tagToBit.has(tag)) return;

    if (this.nextBit > 0x8000) {
      throw new Error('Maximum collision tags reached (16 tags)');
    }

    this.tagToBit.set(tag, this.nextBit);
    this.bitToTag.set(this.nextBit, tag);
    this.nextBit <<= 1;
  }

  /**
   * Get bit value for a tag (auto-registers if new)
   */
  getBit(tag: CollisionTag): number {
    if (!this.tagToBit.has(tag)) {
      this.register(tag);
    }
    return this.tagToBit.get(tag)!;
  }

  /**
   * Get tag from bit value
   */
  getTag(bit: number): CollisionTag | undefined {
    return this.bitToTag.get(bit);
  }

  /**
   * Convert array of tags to bit mask
   */
  tagsToBits(tags: CollisionTag[]): number {
    if (!tags || tags.length === 0) {
      return this.getBit('default');
    }
    return tags.reduce((bits, tag) => bits | this.getBit(tag), 0);
  }

  /**
   * Convert bit mask to array of tags
   */
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

/**
 * Collision manager - handles callbacks
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

  /**
   * Register collision callback between two tag categories
   *
   * @example
   * collisionManager.onCollision('player', 'enemy', (event) => {
   *   console.log('Player hit enemy!');
   * });
   */
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

  /**
   * Remove collision callback
   */
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
    const bodyA = contact.getFixtureA().getBody().getUserData() as any;
    const bodyB = contact.getFixtureB().getBody().getUserData() as any;

    if (!bodyA || !bodyB) return;

    // Call entity-level callbacks
    bodyA.onCollisionBegin?.(bodyB, contact);
    bodyB.onCollisionBegin?.(bodyA, contact);

    // Call global tag-based callbacks
    this.triggerTagCallbacks(bodyA, bodyB, contact);
  }

  private handleEndContact(contact: planck.Contact): void {
    const bodyA = contact.getFixtureA().getBody().getUserData() as any;
    const bodyB = contact.getFixtureB().getBody().getUserData() as any;

    if (!bodyA || !bodyB) return;

    bodyA.onCollisionEnd?.(bodyB, contact);
    bodyB.onCollisionEnd?.(bodyA, contact);
  }

  private triggerTagCallbacks(
    bodyA: any,
    bodyB: any,
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
