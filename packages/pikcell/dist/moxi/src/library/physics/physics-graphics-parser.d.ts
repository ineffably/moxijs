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
/**
 * Store shape metadata on Graphics object
 */
export declare function setGraphicsPhysicsShape(graphics: PIXI.Graphics, metadata: PhysicsShapeMetadata): void;
/**
 * Extend PIXI Graphics to automatically track shape data for physics
 * This patches Graphics methods to store metadata for physics collision shapes
 */
export declare function initGraphicsPhysicsTracking(): void;
/**
 * Parse PIXI Graphics geometry to extract collision shape for physics
 *
 * Uses metadata stored by helper functions or falls back to bounds-based rectangle
 */
export declare function parseGraphicsShape(graphics: PIXI.Graphics, world: PhysicsWorld): ParsedShape;
