import * as PIXI from 'pixi.js';
import { AsEntity } from '../../main/moxi-entity';
import type { PhysicsWorld } from './physics-world';
import { PhysicsBodyLogic } from './physics-body-logic';
import type { PhysicsBodyOptions, ShapeConfig } from './physics-types';
export declare function asPhysicsEntity<T extends PIXI.Container>(pixiObject: T, world: PhysicsWorld, options?: PhysicsBodyOptions): AsEntity<T>;
export declare function hasPhysics(entity: any): boolean;
export declare function getPhysicsBody(entity: any): PhysicsBodyLogic | undefined;
export declare function createShapeFromSprite(sprite: PIXI.Sprite, type?: 'rectangle' | 'circle' | 'auto'): ShapeConfig;
