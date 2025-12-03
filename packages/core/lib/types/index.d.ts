import * as utils from './library/utils';
import { RenderManager } from './main/render-manager';
import { Scene } from './main/scene';
import { Engine } from './main/engine';
import { EventEmitter } from './main/event-system';
import { ClientEvents } from './library/client-events';
import { AssetLoader } from './main/asset-loader';
import { Point } from 'pixi.js';
import { Logic } from './main/logic';
import { defaultRenderOptions, setupMoxi } from './library/setup';
import { loadFonts } from './library/font-loader';
import { asEntity, MoxiEntity } from './main/moxi-entity';
import { Camera, CameraLogic } from './main/camera';
import { asTextureFrames } from './library/texture-frames';
import { asBitmapText, asSprite, asText, asTextDPR, asGraphics, asContainer, PixiProps } from './library/as-pixi';
import { TextureFrameSequences, SequenceInfo } from './library/texture-frame-sequences';
import { createResizeHandler, setupResponsiveCanvas, ResizeHandlerOptions } from './library/resize-handler';
import { StateMachine } from './library/state-machine';
import { StateLogic } from './library/state-logic';
import { createTileGrid, getTextureRange } from './library/grid-generator';
import { svgToTexture } from './library/svg-utils/svg-to-texture';
import { ParallaxBackground, ParallaxBackgroundLogic } from './library/parallax-background';
import { ParallaxLayer, TilingParallaxLayer } from './library/parallax-layer';
import { LoadingScene, FallingSquaresAnimation } from './library/loading-scene';
import { ActionManager } from './library/action-manager';
import { PhysicsWorld, PhysicsBodyLogic, PhysicsDebugRenderer, CollisionRegistry, CollisionManager, asPhysicsEntity, hasPhysics, getPhysicsBody, createShapeFromSprite, PhysicsMaterials, applyMaterial } from './library/physics';
export type { StateChangeEvent } from './library/state-machine';
export type { AsEntity, MoxiLogic } from './main/moxi-entity';
export type { AsTextureFramesOptions } from './library/texture-frames';
export type { GridOptions, CellPosition } from './library/grid-generator';
export type { ParallaxBackgroundOptions } from './library/parallax-background';
export type { ParallaxLayerOptions, TilingParallaxLayerOptions } from './library/parallax-layer';
export type { LoadingSceneOptions, LoadingAnimation, LoadingAnimationContext, FallingSquaresOptions } from './library/loading-scene';
export type { OnAction } from './library/action-manager';
export type { BodyType, SyncMode, ShapeType, CollisionTag, ShapeConfig, PhysicsWorldOptions, PhysicsBodyOptions, PhysicsDebugOptions, CollisionEvent, RaycastCallback } from './library/physics';
export type { SVGToTextureOptions } from './library/svg-utils/svg-to-texture';
export type Asset = {
    src: string;
    alias?: string;
};
export interface OnEvent {
    event: Event;
    eventType: string;
}
export interface ClientEventsArgs {
    initWheelOffset?: Point;
    onAnyEvent?: (ev: OnEvent) => void;
}
export type ClientEventsType = {
    keyDownEvent?: KeyboardEvent;
    keyUpEvent?: KeyboardEvent;
    keydown?: Record<string, KeyboardEvent>;
    mouseDownEvent?: MouseEvent;
    mouseUpEvent?: MouseEvent;
    lastMouseDown?: MouseEvent;
    lastMouseUp?: MouseEvent;
    wheelEvent?: WheelEvent;
    wheelDelta?: {
        yValue: 0 | number;
        xValue: 0 | number;
        xLast: number;
        yLast: number;
    };
};
export { SequenceInfo, ResizeHandlerOptions };
declare const exportedObjects: {
    AssetLoader: typeof AssetLoader;
    asEntity: typeof asEntity;
    asTextureFrames: typeof asTextureFrames;
    asBitmapText: typeof asBitmapText;
    asSprite: typeof asSprite;
    asText: typeof asText;
    asTextDPR: typeof asTextDPR;
    asGraphics: typeof asGraphics;
    asContainer: typeof asContainer;
    Logic: typeof Logic;
    Camera: typeof Camera;
    CameraLogic: typeof CameraLogic;
    ClientEvents: typeof ClientEvents;
    createResizeHandler: typeof createResizeHandler;
    createTileGrid: typeof createTileGrid;
    defaultRenderOptions: Partial<import("pixi.js").AutoDetectOptions>;
    Engine: typeof Engine;
    EventEmitter: typeof EventEmitter;
    getTextureRange: typeof getTextureRange;
    loadFonts: () => Promise<unknown>;
    MoxiEntity: typeof MoxiEntity;
    ParallaxBackground: typeof ParallaxBackground;
    ParallaxBackgroundLogic: typeof ParallaxBackgroundLogic;
    ParallaxLayer: typeof ParallaxLayer;
    LoadingScene: typeof LoadingScene;
    FallingSquaresAnimation: typeof FallingSquaresAnimation;
    setupMoxi: typeof setupMoxi;
    RenderManager: typeof RenderManager;
    Scene: typeof Scene;
    setupResponsiveCanvas: typeof setupResponsiveCanvas;
    TextureFrameSequences: typeof TextureFrameSequences;
    TilingParallaxLayer: typeof TilingParallaxLayer;
    utils: typeof utils;
    StateMachine: typeof StateMachine;
    StateLogic: typeof StateLogic;
    PhysicsWorld: typeof PhysicsWorld;
    PhysicsBodyLogic: typeof PhysicsBodyLogic;
    PhysicsDebugRenderer: typeof PhysicsDebugRenderer;
    CollisionRegistry: typeof CollisionRegistry;
    CollisionManager: typeof CollisionManager;
    asPhysicsEntity: typeof asPhysicsEntity;
    hasPhysics: typeof hasPhysics;
    getPhysicsBody: typeof getPhysicsBody;
    createShapeFromSprite: typeof createShapeFromSprite;
    PhysicsMaterials: {
        readonly bouncy: {
            readonly density: 0.5;
            readonly friction: 0.1;
            readonly restitution: 0.9;
        };
        readonly wood: {
            readonly density: 0.7;
            readonly friction: 0.4;
            readonly restitution: 0.2;
        };
        readonly metal: {
            readonly density: 1.5;
            readonly friction: 0.3;
            readonly restitution: 0.1;
        };
        readonly ice: {
            readonly density: 0.9;
            readonly friction: 0.02;
            readonly restitution: 0.05;
        };
        readonly rubber: {
            readonly density: 1;
            readonly friction: 0.9;
            readonly restitution: 0.7;
        };
        readonly character: {
            readonly density: 1;
            readonly friction: 0.5;
            readonly restitution: 0;
            readonly fixedRotation: true;
        };
        readonly terrain: {
            readonly density: 0;
            readonly friction: 0.6;
            readonly restitution: 0;
        };
    };
    applyMaterial: typeof applyMaterial;
    svgToTexture: typeof svgToTexture;
    ActionManager: typeof ActionManager;
};
export default exportedObjects;
export { AssetLoader, asEntity, asTextureFrames, asBitmapText, asSprite, asText, asTextDPR, asGraphics, asContainer, PixiProps, Logic, Camera, CameraLogic, ClientEvents, createResizeHandler, createTileGrid, defaultRenderOptions, Engine, EventEmitter, getTextureRange, loadFonts, MoxiEntity, ParallaxBackground, ParallaxBackgroundLogic, ParallaxLayer, LoadingScene, FallingSquaresAnimation, setupMoxi, RenderManager, Scene, setupResponsiveCanvas, TextureFrameSequences, TilingParallaxLayer, utils, StateMachine, StateLogic, PhysicsWorld, PhysicsBodyLogic, PhysicsDebugRenderer, CollisionRegistry, CollisionManager, asPhysicsEntity, hasPhysics, getPhysicsBody, createShapeFromSprite, PhysicsMaterials, applyMaterial, svgToTexture, ActionManager };
