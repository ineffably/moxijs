import * as PIXI from 'pixi.js';
import * as planck from 'planck';
import { Logic } from '../../main/logic';
import type { PhysicsWorld } from './physics-world';
import type { PhysicsBodyOptions, BodyType, ShapeType } from './physics-types';
import { parseGraphicsShape } from './physics-graphics-parser';

/**
 * Logic component that syncs a PIXI entity with a Planck.js physics body.
 * Handles position/rotation sync, collision filtering, and force application.
 *
 * @example
 * ```ts
 * // Create physics body for a sprite
 * const sprite = asEntity(new PIXI.Sprite(texture));
 * const body = new PhysicsBodyLogic(physicsWorld, {
 *   type: 'dynamic',
 *   collisionTags: ['player'],
 *   collidesWith: ['terrain', 'enemy'],
 *   density: 1.0,
 *   friction: 0.3
 * });
 * sprite.moxiEntity.addLogic(body);
 *
 * // Apply forces in update loop
 * body.applyImpulse(new PIXI.Point(100, 0));
 * body.setVelocity(new PIXI.Point(0, -200));
 *
 * // Collision callbacks
 * body.onCollisionBegin = (other, contact) => console.log('hit!');
 * ```
 */
export class PhysicsBodyLogic extends Logic<PIXI.Container> {
  name = 'PhysicsBodyLogic';

  /** Planck.js body instance. */
  public body!: planck.Body;

  /** Parent physics world. */
  public world: PhysicsWorld;

  /** Body configuration. */
  public options: PhysicsBodyOptions;

  /** Called when collision begins. */
  public onCollisionBegin?: (other: PhysicsBodyLogic, contact: planck.Contact) => void;

  /** Called when collision ends. */
  public onCollisionEnd?: (other: PhysicsBodyLogic, contact: planck.Contact) => void;

  constructor(world: PhysicsWorld, options: PhysicsBodyOptions = {}) {
    super();
    this.world = world;
    this.options = {
      type: 'dynamic',
      syncMode: 'physics-driven',
      syncPosition: true,
      syncRotation: true,
      density: 1.0,
      friction: 0.3,
      restitution: 0.0,
      fixedRotation: false,
      isSensor: false,
      bullet: false,
      ...options
    };
  }

  /** @internal Creates physics body and registers with world. */
  init(entity: PIXI.Container, renderer?: PIXI.Renderer): void {
    // Create the physics body
    this.createPhysicsBody(entity);

    // Set user data to reference this logic component
    this.body.setUserData(this);

    // Register with physics world
    this.world.registerBody(this.body, this);
  }

  /** @internal Syncs physics ↔ sprite based on syncMode. */
  update(entity: PIXI.Container, deltaTime?: number): void {
    if (!this.body) return;

    // Sync based on mode
    switch (this.options.syncMode) {
      case 'physics-driven':
        this.syncFromPhysics(entity);
        break;
      case 'sprite-driven':
        this.syncToPhysics(entity);
        break;
      case 'manual':
        // User handles sync manually
        break;
    }
  }

  /** Removes body from physics world. */
  destroy(): void {
    if (this.body) {
      this.world.destroyBody(this.body);
    }
  }

  /** @internal Updates sprite position/rotation from physics. */
  private syncFromPhysics(entity: PIXI.Container): void {
    if (!this.body) return;

    const pos = this.body.getPosition();

    if (this.options.syncPosition) {
      entity.x = this.world.toPixels(pos.x);
      entity.y = this.world.toPixels(pos.y);
    }

    if (this.options.syncRotation) {
      entity.rotation = this.body.getAngle();
    }
  }

  /** Updates physics body from sprite position/rotation. */
  syncToPhysics(entity: PIXI.Container): void {
    if (!this.body) return;

    if (this.options.syncPosition) {
      const x = this.world.toPhysics(entity.x);
      const y = this.world.toPhysics(entity.y);
      this.body.setPosition(planck.Vec2(x, y));
    }

    if (this.options.syncRotation) {
      this.body.setAngle(entity.rotation);
    }
  }

  /** @internal */
  private createPhysicsBody(entity: PIXI.Container): void {
    // Determine body type
    let bodyType: planck.BodyType;
    switch (this.options.type) {
      case 'static':
        bodyType = 'static';
        break;
      case 'kinematic':
        bodyType = 'kinematic';
        break;
      case 'dynamic':
      default:
        bodyType = 'dynamic';
        break;
    }

    // Create body definition
    const bodyDef: planck.BodyDef = {
      type: bodyType,
      position: this.options.position
        ? this.world.toPhysicsPoint(this.options.position)
        : planck.Vec2(this.world.toPhysics(entity.x), this.world.toPhysics(entity.y)),
      angle: this.options.rotation ?? entity.rotation,
      linearVelocity: this.options.linearVelocity
        ? this.world.toPhysicsPoint(this.options.linearVelocity)
        : planck.Vec2(0, 0),
      angularVelocity: this.options.angularVelocity ?? 0,
      fixedRotation: this.options.fixedRotation ?? false,
      bullet: this.options.bullet ?? false
    };

    // Create the body
    this.body = this.world.createBody(bodyDef);

    // Create the shape and fixture
    this.createFixture(entity);

    // Set initial velocities if provided
    if (this.options.linearVelocity) {
      this.setVelocity(this.options.linearVelocity);
    }
    if (this.options.angularVelocity) {
      this.setAngularVelocity(this.options.angularVelocity);
    }
  }

  /** @internal */
  private createFixture(entity: PIXI.Container): void {
    const shape = this.createShape(entity);

    // Setup collision filtering
    const categoryBits = this.options.collisionTags
      ? this.world.collisionRegistry.tagsToBits(this.options.collisionTags)
      : this.world.collisionRegistry.getBit('default');

    const maskBits = this.options.collidesWith
      ? this.world.collisionRegistry.tagsToBits(this.options.collidesWith)
      : 0xFFFF; // Collide with everything by default

    const groupIndex = this.options.collisionGroup ?? 0;

    // Create fixture
    this.body.createFixture({
      shape: shape,
      density: this.options.density ?? 1.0,
      friction: this.options.friction ?? 0.3,
      restitution: this.options.restitution ?? 0.0,
      isSensor: this.options.isSensor ?? false,
      filterCategoryBits: categoryBits,
      filterMaskBits: maskBits,
      filterGroupIndex: groupIndex
    });
  }

  /** @internal Extracts shape from Graphics, collisionShape, or legacy options. */
  private createShape(entity: PIXI.Container): planck.Shape {
    // Priority 1: Explicit collision shape provided
    if (this.options.collisionShape) {
      const parsed = parseGraphicsShape(this.options.collisionShape, this.world);
      return parsed.shape;
    }

    // Priority 2: Entity itself is Graphics → extract from it
    if (entity instanceof PIXI.Graphics) {
      const parsed = parseGraphicsShape(entity, this.world);
      return parsed.shape;
    }

    // Priority 3: Legacy shape properties (backward compatibility)
    if (this.options.shape) {
      return this.createShapeFromType(this.options.shape);
    }

    // No collision shape defined - error for non-Graphics entities
    throw new Error(
      'Collision shape required for non-Graphics entities. ' +
      'Either provide a Graphics entity, or specify options.collisionShape, ' +
      'or use legacy options.shape with dimensions.'
    );
  }

  /** @internal */
  private createShapeFromType(shapeType: ShapeType): planck.Shape {
    switch (shapeType) {
      case 'circle':
        const radius = this.options.radius ?? 25;
        return planck.Circle(this.world.toPhysics(radius));

      case 'rectangle':
        const width = this.options.width ?? 50;
        const height = this.options.height ?? 50;
        return planck.Box(
          this.world.toPhysics(width / 2),
          this.world.toPhysics(height / 2)
        );

      case 'polygon':
        if (!this.options.vertices || this.options.vertices.length < 3) {
          throw new Error('Polygon shape requires at least 3 vertices');
        }
        const vertices = this.options.vertices.map(v =>
          planck.Vec2(this.world.toPhysics(v.x), this.world.toPhysics(v.y))
        );
        return planck.Polygon(vertices);

      default:
        throw new Error(`Unknown shape type: ${shapeType}`);
    }
  }

  /** @internal Fallback: creates box from entity bounds. */
  private autoDetectShape(entity: PIXI.Container): planck.Shape {
    // For sprites, use texture bounds
    const bounds = entity.getLocalBounds();

    // Default to rectangle
    return planck.Box(
      this.world.toPhysics(bounds.width / 2),
      this.world.toPhysics(bounds.height / 2)
    );
  }

  /**
   * Apply continuous force at a point. Force is in pixels/sec².
   * @param force - Force vector in pixels
   * @param point - Application point (defaults to center of mass)
   */
  applyForce(force: PIXI.Point, point?: PIXI.Point): void {
    const forceVec = this.world.toPhysicsPoint(force);
    const pointVec = point
      ? this.world.toPhysicsPoint(point)
      : this.body.getWorldCenter();
    this.body.applyForce(forceVec, pointVec);
  }

  /**
   * Apply instant impulse at a point. Good for jumps, explosions.
   * @param impulse - Impulse vector in pixels
   * @param point - Application point (defaults to center of mass)
   */
  applyImpulse(impulse: PIXI.Point, point?: PIXI.Point): void {
    const impulseVec = this.world.toPhysicsPoint(impulse);
    const pointVec = point
      ? this.world.toPhysicsPoint(point)
      : this.body.getWorldCenter();
    this.body.applyLinearImpulse(impulseVec, pointVec);
  }

  /** Apply rotational torque. */
  applyTorque(torque: number): void {
    this.body.applyTorque(torque);
  }

  /**
   * Set linear velocity directly.
   * @param velocity - Velocity in pixels/sec
   */
  setVelocity(velocity: PIXI.Point): void {
    const velocityVec = this.world.toPhysicsPoint(velocity);
    this.body.setLinearVelocity(velocityVec);
  }

  /** Set rotation speed (radians/sec). */
  setAngularVelocity(omega: number): void {
    this.body.setAngularVelocity(omega);
  }

  /** Get current velocity (pixels/sec). */
  getVelocity(): PIXI.Point {
    const vel = this.body.getLinearVelocity();
    return this.world.toPixelsPoint(vel);
  }

  /** Get rotation speed (radians/sec). */
  getAngularVelocity(): number {
    return this.body.getAngularVelocity();
  }

  /** Get body mass (kg in physics units). */
  getMass(): number {
    return this.body.getMass();
  }

  /** True if body is active (not sleeping). */
  isAwake(): boolean {
    return this.body.isAwake();
  }

  /** True if body is sleeping (inactive). */
  isSleeping(): boolean {
    return !this.body.isAwake();
  }

  /** Wake up or put body to sleep. */
  setAwake(awake: boolean): void {
    this.body.setAwake(awake);
  }
}
