import * as PIXI from 'pixi.js';
import type * as planck from 'planck';
export type BodyType = 'static' | 'dynamic' | 'kinematic';
export type SyncMode = 'physics-driven' | 'sprite-driven' | 'manual';
export type ShapeType = 'rectangle' | 'circle' | 'polygon';
export type CollisionTag = 'default' | 'player' | 'enemy' | 'projectile' | 'terrain' | 'sensor' | 'powerup' | (string & {});
export interface ShapeConfig {
    shape: ShapeType;
    width?: number;
    height?: number;
    radius?: number;
    vertices?: PIXI.Point[];
}
export interface PhysicsWorldOptions {
    gravity?: {
        x: number;
        y: number;
    };
    pixelsPerMeter?: number;
    velocityIterations?: number;
    positionIterations?: number;
    enableSleeping?: boolean;
    timestep?: number;
}
export interface PhysicsBodyOptions {
    type?: BodyType;
    position?: PIXI.Point;
    rotation?: number;
    linearVelocity?: PIXI.Point;
    angularVelocity?: number;
    collisionShape?: PIXI.Graphics;
    shape?: ShapeType;
    width?: number;
    height?: number;
    radius?: number;
    vertices?: PIXI.Point[];
    density?: number;
    friction?: number;
    restitution?: number;
    fixedRotation?: boolean;
    isSensor?: boolean;
    bullet?: boolean;
    syncMode?: SyncMode;
    syncPosition?: boolean;
    syncRotation?: boolean;
    collisionTags?: CollisionTag[];
    collidesWith?: CollisionTag[];
    collisionGroup?: number;
    userData?: any;
}
export interface PhysicsDebugOptions {
    showShapes?: boolean;
    showVelocities?: boolean;
    showAABBs?: boolean;
    showCenterOfMass?: boolean;
    showContactPoints?: boolean;
    showJoints?: boolean;
    colorStatic?: number;
    colorDynamic?: number;
    colorKinematic?: number;
    colorSleeping?: number;
    colorSensor?: number;
    alpha?: number;
    lineWidth?: number;
}
export interface CollisionEvent {
    bodyA: any;
    bodyB: any;
    contact: planck.Contact;
    normal: PIXI.Point;
    impulse: number;
}
export type RaycastCallback = (fixture: planck.Fixture, point: PIXI.Point, normal: PIXI.Point, fraction: number) => number;
