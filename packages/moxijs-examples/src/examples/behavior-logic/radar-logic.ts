import { Logic } from 'moxijs';
import * as PIXI from 'pixi.js';

/**
 * Configuration options for RadarLogic
 */
export interface RadarOptions {
  /**
   * Detection radius in pixels
   */
  radius: number;

  /**
   * How often to check for entities (in milliseconds)
   * @default 100
   */
  updateInterval?: number;

  /**
   * Filter function to determine which entities to detect
   * Return true to include the entity in detection
   */
  filter?: (entity: PIXI.Container) => boolean;

  /**
   * Whether to visualize the detection radius (debug mode)
   * @default false
   */
  debugDraw?: boolean;
}

/**
 * RadarLogic - Detects entities within a radius
 *
 * This component scans the scene for entities within a specified radius
 * and tracks them for AI behaviors like follow, flee, or aggro.
 *
 * @example
 * ```typescript
 * const radar = new RadarLogic({
 *   radius: 200,
 *   filter: (entity) => entity.name === 'player'
 * });
 * dinoEntity.moxiEntity.addLogic(radar);
 *
 * // Later in update loop:
 * const nearbyEntities = radar.getDetectedEntities();
 * const closestEntity = radar.getClosestEntity();
 * ```
 */
export class RadarLogic extends Logic<PIXI.Container> {
  name = 'RadarLogic';

  private radius: number;
  private updateInterval: number;
  private filter?: (entity: PIXI.Container) => boolean;
  private debugDraw: boolean;

  private detectedEntities: PIXI.Container[] = [];
  private timeSinceLastUpdate: number = 0;
  private debugGraphics?: PIXI.Graphics;

  constructor(options: RadarOptions) {
    super();
    this.radius = options.radius;
    this.updateInterval = options.updateInterval ?? 100;
    this.filter = options.filter;
    this.debugDraw = options.debugDraw ?? false;
  }

  init(entity: PIXI.Container, renderer: PIXI.Renderer) {
    if (this.debugDraw) {
      this.debugGraphics = new PIXI.Graphics();
      entity.addChild(this.debugGraphics);
    }
  }

  update(entity: PIXI.Container, deltaTime: number) {
    // Update at specified interval to reduce computational overhead
    this.timeSinceLastUpdate += deltaTime;

    if (this.timeSinceLastUpdate >= this.updateInterval) {
      this.timeSinceLastUpdate = 0;
      this.scanForEntities(entity);
    }

    // Update debug visualization if enabled
    if (this.debugDraw && this.debugGraphics) {
      this.drawDebugRadius();
    }
  }

  /**
   * Scan the scene for entities within radius
   */
  private scanForEntities(entity: PIXI.Container) {
    this.detectedEntities = [];

    // Get the scene (usually entity.parent or entity.parent.parent)
    const scene = this.getScene(entity);
    if (!scene) return;

    // Get entity's world position
    const entityWorldPos = entity.getGlobalPosition();

    // Recursively check all children in the scene
    this.checkContainer(scene, entityWorldPos, entity);
  }

  /**
   * Recursively check container and its children for entities within radius
   */
  private checkContainer(
    container: PIXI.Container,
    radarWorldPos: PIXI.Point,
    radarEntity: PIXI.Container
  ) {
    for (const child of container.children) {
      // Skip self
      if (child === radarEntity) continue;

      // Check if this child is a container (could have position)
      if (child instanceof PIXI.Container) {
        const childWorldPos = child.getGlobalPosition();
        const distance = this.getDistance(radarWorldPos, childWorldPos);

        // Check if within radius
        if (distance <= this.radius) {
          // Apply filter if provided
          if (!this.filter || this.filter(child)) {
            this.detectedEntities.push(child);
          }
        }

        // Recursively check children
        if (child.children.length > 0) {
          this.checkContainer(child, radarWorldPos, radarEntity);
        }
      }
    }
  }

  /**
   * Get the scene container
   */
  private getScene(entity: PIXI.Container): PIXI.Container | null {
    let current = entity.parent;

    // Walk up the hierarchy until we find the scene (no parent or parent is stage)
    while (current && current.parent) {
      current = current.parent;
    }

    return current;
  }

  /**
   * Calculate distance between two points
   */
  private getDistance(p1: PIXI.Point, p2: PIXI.Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Draw debug visualization of the detection radius
   */
  private drawDebugRadius() {
    if (!this.debugGraphics) return;

    this.debugGraphics.clear();

    // Draw detection radius circle
    this.debugGraphics.circle(0, 0, this.radius);
    this.debugGraphics.stroke({ width: 2, color: 0x00ff00, alpha: 0.5 });

    // Draw lines to detected entities
    for (const detected of this.detectedEntities) {
      const localPos = this.debugGraphics.parent.toLocal(detected.getGlobalPosition());
      this.debugGraphics.moveTo(0, 0);
      this.debugGraphics.lineTo(localPos.x, localPos.y);
      this.debugGraphics.stroke({ width: 1, color: 0xffff00, alpha: 0.3 });
    }
  }

  /**
   * Get all currently detected entities
   */
  getDetectedEntities(): PIXI.Container[] {
    return [...this.detectedEntities];
  }

  /**
   * Get the closest detected entity
   */
  getClosestEntity(entity?: PIXI.Container): PIXI.Container | null {
    if (this.detectedEntities.length === 0) return null;

    // If no entity provided, use the entity this logic is attached to
    if (!entity) {
      // We'll need to store the entity from init
      return this.detectedEntities[0];
    }

    const entityWorldPos = entity.getGlobalPosition();
    let closest: PIXI.Container | null = null;
    let closestDistance = Infinity;

    for (const detected of this.detectedEntities) {
      const detectedWorldPos = detected.getGlobalPosition();
      const distance = this.getDistance(entityWorldPos, detectedWorldPos);

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = detected;
      }
    }

    return closest;
  }

  /**
   * Check if any entities are currently detected
   */
  hasDetections(): boolean {
    return this.detectedEntities.length > 0;
  }

  /**
   * Get the number of detected entities
   */
  getDetectionCount(): number {
    return this.detectedEntities.length;
  }

  /**
   * Set a new detection radius
   */
  setRadius(radius: number) {
    this.radius = radius;
  }

  /**
   * Get current detection radius
   */
  getRadius(): number {
    return this.radius;
  }
}
