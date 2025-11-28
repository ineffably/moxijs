import * as PIXI from 'pixi.js';
import * as planck from 'planck';
import type { PhysicsWorld } from './physics-world';
export interface ParsedShape {
    type: 'circle' | 'rectangle' | 'polygon';
    shape: planck.Shape;
}
export interface PhysicsShapeMetadata {
    type: 'circle' | 'rectangle' | 'polygon';
    radius?: number;
    width?: number;
    height?: number;
    vertices?: number[];
}
export declare function setGraphicsPhysicsShape(graphics: PIXI.Graphics, metadata: PhysicsShapeMetadata): void;
export declare function initGraphicsPhysicsTracking(): void;
export declare function parseGraphicsShape(graphics: PIXI.Graphics, world: PhysicsWorld): ParsedShape;
