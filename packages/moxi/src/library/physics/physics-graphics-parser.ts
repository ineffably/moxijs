import * as PIXI from 'pixi.js';
import * as planck from 'planck';
import type { PhysicsWorld } from './physics-world';

export interface ParsedShape {
  type: 'circle' | 'rectangle' | 'polygon';
  shape: planck.Shape;
}

/**
 * Shape metadata stored on Graphics for physics parsing
 */
export interface PhysicsShapeMetadata {
  type: 'circle' | 'rectangle' | 'polygon';
  radius?: number;
  width?: number;
  height?: number;
  vertices?: number[];
}

const PHYSICS_SHAPE_KEY = '__physicsShape__';

/**
 * Store shape metadata on Graphics object
 */
export function setGraphicsPhysicsShape(graphics: PIXI.Graphics, metadata: PhysicsShapeMetadata): void {
  (graphics as any)[PHYSICS_SHAPE_KEY] = metadata;
}

/**
 * Extend PIXI Graphics to automatically track shape data for physics
 * This patches Graphics methods to store metadata for physics collision shapes
 */
export function initGraphicsPhysicsTracking(): void {
  // Save original methods
  const originalRect = PIXI.Graphics.prototype.rect;
  const originalCircle = PIXI.Graphics.prototype.circle;
  const originalPoly = PIXI.Graphics.prototype.poly;

  // Patch rect() to store metadata
  PIXI.Graphics.prototype.rect = function (x: number, y: number, w: number, h: number) {
    setGraphicsPhysicsShape(this, {
      type: 'rectangle',
      width: w,
      height: h
    });
    return originalRect.call(this, x, y, w, h);
  };

  // Patch circle() to store metadata
  PIXI.Graphics.prototype.circle = function (x: number, y: number, radius: number) {
    setGraphicsPhysicsShape(this, {
      type: 'circle',
      radius: radius
    });
    return originalCircle.call(this, x, y, radius);
  };

  // Patch poly() to store metadata
  PIXI.Graphics.prototype.poly = function (points: PIXI.PointData[] | number[]) {
    const flatPoints = Array.isArray(points[0]) ? points.flat() : points;
    setGraphicsPhysicsShape(this, {
      type: 'polygon',
      vertices: flatPoints as number[]
    });
    return originalPoly.call(this, points as any);
  };
}

/**
 * Parse PIXI Graphics geometry to extract collision shape for physics
 *
 * Uses metadata stored by helper functions or falls back to bounds-based rectangle
 */
export function parseGraphicsShape(graphics: PIXI.Graphics, world: PhysicsWorld): ParsedShape {
  // Check if shape metadata was stored
  const metadata = (graphics as any)[PHYSICS_SHAPE_KEY] as PhysicsShapeMetadata | undefined;

  if (metadata) {
    // Use stored metadata
    switch (metadata.type) {
      case 'circle':
        if (!metadata.radius) {
          throw new Error('Circle metadata missing radius');
        }
        return {
          type: 'circle',
          shape: planck.Circle(world.toPhysics(metadata.radius))
        };

      case 'rectangle':
        if (!metadata.width || !metadata.height) {
          throw new Error('Rectangle metadata missing width/height');
        }
        return {
          type: 'rectangle',
          shape: planck.Box(
            world.toPhysics(metadata.width / 2),
            world.toPhysics(metadata.height / 2)
          )
        };

      case 'polygon':
        if (!metadata.vertices || metadata.vertices.length < 6) {
          throw new Error('Polygon metadata missing vertices (need at least 3 points = 6 values)');
        }
        const vertices: planck.Vec2[] = [];
        for (let i = 0; i < metadata.vertices.length; i += 2) {
          vertices.push(
            planck.Vec2(
              world.toPhysics(metadata.vertices[i]),
              world.toPhysics(metadata.vertices[i + 1])
            )
          );
        }
        return {
          type: 'polygon',
          shape: planck.Polygon(vertices)
        };
    }
  }

  // Fallback: Use bounding box as rectangle
  const bounds = graphics.getLocalBounds();

  if (bounds.width === 0 || bounds.height === 0) {
    throw new Error(
      'Graphics has no dimensions. Either draw shapes using rect(), circle(), or poly(), ' +
      'or provide an explicit collisionShape option.'
    );
  }

  return {
    type: 'rectangle',
    shape: planck.Box(
      world.toPhysics(bounds.width / 2),
      world.toPhysics(bounds.height / 2)
    )
  };
}
