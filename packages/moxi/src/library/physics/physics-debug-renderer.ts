import * as PIXI from 'pixi.js';
import * as planck from 'planck';
import { Logic } from '../../core/logic';
import type { PhysicsWorld } from './physics-world';
import type { PhysicsDebugOptions } from './physics-types';

/**
 * PhysicsDebugRenderer - Visualizes collision shapes, velocity vectors, and physics state
 *
 * @example
 * ```typescript
 * const debugRenderer = physicsWorld.enableDebugRenderer(scene);
 *
 * // Toggle with keyboard
 * document.addEventListener('keydown', (e) => {
 *   if (e.key === 'p') debugRenderer.toggle();
 * });
 * ```
 */
export class PhysicsDebugRenderer extends Logic<PIXI.Graphics> {
  name = 'PhysicsDebugRenderer';

  private world: PhysicsWorld;
  private graphics!: PIXI.Graphics;
  private options: Required<PhysicsDebugOptions>;
  private isVisible: boolean = true;

  constructor(world: PhysicsWorld, options: PhysicsDebugOptions = {}) {
    super();
    this.world = world;
    this.options = {
      showShapes: options.showShapes ?? true,
      showVelocities: options.showVelocities ?? false,
      showAABBs: options.showAABBs ?? false,
      showCenterOfMass: options.showCenterOfMass ?? false,
      showContactPoints: options.showContactPoints ?? false,
      showJoints: options.showJoints ?? false,
      colorStatic: options.colorStatic ?? 0x00FF00,
      colorDynamic: options.colorDynamic ?? 0xFF0000,
      colorKinematic: options.colorKinematic ?? 0x0000FF,
      colorSleeping: options.colorSleeping ?? 0xAAAAAA,
      colorSensor: options.colorSensor ?? 0xFFFF00,
      alpha: options.alpha ?? 0.5,
      lineWidth: options.lineWidth ?? 2
    };
  }

  init(entity: PIXI.Graphics, renderer?: PIXI.Renderer): void {
    this.graphics = entity;
  }

  update(entity: PIXI.Graphics, deltaTime?: number): void {
    if (!this.isVisible) {
      this.graphics.clear();
      return;
    }

    this.graphics.clear();

    if (this.options.showShapes) {
      // Iterate all bodies in physics world
      for (let body = this.world.world.getBodyList(); body; body = body.getNext()) {
        this.drawBody(body);
      }
    }

    if (this.options.showContactPoints) {
      this.drawContacts();
    }
  }

  private drawBody(body: planck.Body): void {
    const transform = body.getTransform();

    // Determine color based on body type and state
    let color: number;

    if (!body.isAwake() && body.isDynamic()) {
      color = this.options.colorSleeping;
    } else if (body.isStatic()) {
      color = this.options.colorStatic;
    } else if (body.isKinematic()) {
      color = this.options.colorKinematic;
    } else {
      color = this.options.colorDynamic;
    }

    // Draw each fixture
    for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
      const shape = fixture.getShape();

      // Use yellow semi-transparent for sensors
      const fixtureColor = fixture.isSensor() ? this.options.colorSensor : color;
      const alpha = fixture.isSensor() ? this.options.alpha * 0.5 : this.options.alpha;

      this.drawShape(shape, transform, fixtureColor, alpha);
    }

    // Draw velocity vector if enabled
    if (this.options.showVelocities && body.isDynamic()) {
      this.drawVelocity(body);
    }

    // Draw AABB if enabled
    if (this.options.showAABBs) {
      this.drawAABB(body);
    }

    // Draw center of mass if enabled
    if (this.options.showCenterOfMass) {
      this.drawCenterOfMass(body);
    }
  }

  private drawShape(shape: planck.Shape, transform: planck.Transform, color: number, alpha: number): void {
    this.graphics.stroke({
      width: this.options.lineWidth,
      color: color,
      alpha: alpha
    });

    const shapeType = shape.getType();

    if (shapeType === 'circle') {
      const circle = shape as planck.CircleShape;
      const center = planck.Vec2.add(transform.p, planck.Rot.mulVec2(transform.q, circle.getCenter()));
      const radius = circle.getRadius();

      const pixelCenter = this.world.toPixelsPoint(center);
      const pixelRadius = this.world.toPixels(radius);

      this.graphics.circle(pixelCenter.x, pixelCenter.y, pixelRadius);
      this.graphics.stroke();

      // Draw radius line to show rotation
      const angle = transform.q.getAngle();
      const endX = pixelCenter.x + Math.cos(angle) * pixelRadius;
      const endY = pixelCenter.y + Math.sin(angle) * pixelRadius;
      this.graphics.moveTo(pixelCenter.x, pixelCenter.y);
      this.graphics.lineTo(endX, endY);
      this.graphics.stroke();
    } else if (shapeType === 'polygon') {
      const poly = shape as planck.PolygonShape;
      const vertices = poly.m_vertices;

      if (vertices && vertices.length > 0) {
        // Transform first vertex
        const firstVertex = planck.Vec2.add(transform.p, planck.Rot.mulVec2(transform.q, vertices[0]));
        const pixelFirst = this.world.toPixelsPoint(firstVertex);

        this.graphics.moveTo(pixelFirst.x, pixelFirst.y);

        // Transform and draw remaining vertices
        for (let i = 1; i < vertices.length; i++) {
          const vertex = planck.Vec2.add(transform.p, planck.Rot.mulVec2(transform.q, vertices[i]));
          const pixelVertex = this.world.toPixelsPoint(vertex);
          this.graphics.lineTo(pixelVertex.x, pixelVertex.y);
        }

        // Close the polygon
        this.graphics.lineTo(pixelFirst.x, pixelFirst.y);
        this.graphics.stroke();
      }
    } else if (shapeType === 'edge') {
      const edge = shape as planck.EdgeShape;
      const v1 = planck.Vec2.add(transform.p, planck.Rot.mulVec2(transform.q, edge.m_vertex1));
      const v2 = planck.Vec2.add(transform.p, planck.Rot.mulVec2(transform.q, edge.m_vertex2));

      const p1 = this.world.toPixelsPoint(v1);
      const p2 = this.world.toPixelsPoint(v2);

      this.graphics.moveTo(p1.x, p1.y);
      this.graphics.lineTo(p2.x, p2.y);
      this.graphics.stroke();
    } else if (shapeType === 'chain') {
      const chain = shape as planck.ChainShape;
      const vertices = chain.m_vertices;

      if (vertices && vertices.length > 0) {
        const firstVertex = planck.Vec2.add(transform.p, planck.Rot.mulVec2(transform.q, vertices[0]));
        const pixelFirst = this.world.toPixelsPoint(firstVertex);
        this.graphics.moveTo(pixelFirst.x, pixelFirst.y);

        for (let i = 1; i < vertices.length; i++) {
          const vertex = planck.Vec2.add(transform.p, planck.Rot.mulVec2(transform.q, vertices[i]));
          const pixelVertex = this.world.toPixelsPoint(vertex);
          this.graphics.lineTo(pixelVertex.x, pixelVertex.y);
        }

        this.graphics.stroke();
      }
    }
  }

  private drawVelocity(body: planck.Body): void {
    const position = body.getPosition();
    const velocity = body.getLinearVelocity();

    // Scale velocity for visibility
    const scale = 0.5;
    const endPoint = planck.Vec2.add(position, planck.Vec2.mul(velocity, scale));

    const pixelStart = this.world.toPixelsPoint(position);
    const pixelEnd = this.world.toPixelsPoint(endPoint);

    this.graphics.stroke({
      width: 2,
      color: 0x00FFFF,
      alpha: 0.8
    });

    this.graphics.moveTo(pixelStart.x, pixelStart.y);
    this.graphics.lineTo(pixelEnd.x, pixelEnd.y);
    this.graphics.stroke();

    // Draw arrow head
    const angle = Math.atan2(pixelEnd.y - pixelStart.y, pixelEnd.x - pixelStart.x);
    const arrowSize = 5;
    const angle1 = angle + Math.PI * 0.8;
    const angle2 = angle - Math.PI * 0.8;

    this.graphics.moveTo(pixelEnd.x, pixelEnd.y);
    this.graphics.lineTo(
      pixelEnd.x + Math.cos(angle1) * arrowSize,
      pixelEnd.y + Math.sin(angle1) * arrowSize
    );
    this.graphics.moveTo(pixelEnd.x, pixelEnd.y);
    this.graphics.lineTo(
      pixelEnd.x + Math.cos(angle2) * arrowSize,
      pixelEnd.y + Math.sin(angle2) * arrowSize
    );
    this.graphics.stroke();
  }

  private drawAABB(body: planck.Body): void {
    for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
      const aabb = fixture.getAABB(0);

      const lowerBound = this.world.toPixelsPoint(aabb.lowerBound);
      const upperBound = this.world.toPixelsPoint(aabb.upperBound);

      this.graphics.stroke({
        width: 1,
        color: 0xFF00FF,
        alpha: 0.3
      });

      this.graphics.rect(
        lowerBound.x,
        lowerBound.y,
        upperBound.x - lowerBound.x,
        upperBound.y - lowerBound.y
      );
      this.graphics.stroke();
    }
  }

  private drawCenterOfMass(body: planck.Body): void {
    const position = body.getWorldCenter();
    const pixelPos = this.world.toPixelsPoint(position);

    this.graphics.stroke({
      width: 1,
      color: 0xFFFFFF,
      alpha: 1
    });

    const size = 5;
    this.graphics.moveTo(pixelPos.x - size, pixelPos.y);
    this.graphics.lineTo(pixelPos.x + size, pixelPos.y);
    this.graphics.moveTo(pixelPos.x, pixelPos.y - size);
    this.graphics.lineTo(pixelPos.x, pixelPos.y + size);
    this.graphics.stroke();
  }

  private drawContacts(): void {
    // Iterate through all contacts in the world
    for (let contact = this.world.world.getContactList(); contact; contact = contact.getNext()) {
      if (!contact.isTouching()) continue;

      const manifold = contact.getManifold();
      if (!manifold) continue;

      const worldManifold = contact.getWorldManifold(null);
      if (!worldManifold) continue;

      for (let i = 0; i < manifold.pointCount; i++) {
        const point = worldManifold.points[i];
        if (!point) continue;
        const pixelPoint = this.world.toPixelsPoint(planck.Vec2(point.x, point.y));

        this.graphics.circle(pixelPoint.x, pixelPoint.y, 3);
        this.graphics.fill({ color: 0xFF0000, alpha: 0.8 });
      }
    }
  }

  /**
   * Set visibility of debug renderer
   */
  setVisible(visible: boolean): void {
    this.isVisible = visible;
    if (!visible) {
      this.graphics.clear();
    }
  }

  /**
   * Toggle debug renderer visibility
   */
  toggle(): void {
    this.setVisible(!this.isVisible);
  }

  /**
   * Check if debug renderer is visible
   */
  getVisible(): boolean {
    return this.isVisible;
  }
}
