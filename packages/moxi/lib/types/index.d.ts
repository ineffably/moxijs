import * as utils from './library/utils';
import { RenderManager } from './core/render-manager';
import { Scene } from './core/scene';
import { Engine } from './core/engine';
import { ClientEvents } from './library/client-events';
import { AssetLoader } from './core/asset-loader';
import { Behavior } from './core/bahavior';
import { defaultRenderOptions, prepMoxi } from './library/prepare';
import { loadFonts } from './library/font-loader';
import { asEntity, MoxiEntity } from './core/moxi-entity';
import { Camera, CameraBehavior } from './library/camera';
import { asTextureFrames } from './library/texture-frames';
import { SceneGraph } from './library/debug-pack';
import { TextureFrameSequences, SequenceInfo } from './library/texture-frame-sequences';
import { createResizeHandler, setupResponsiveCanvas, ResizeHandlerOptions } from './library/resize-handler';
import { StateMachine } from './behavior-library/state-machine';
import { StateBehavior } from './behavior-library/state-behavior';
export type { StateChangeEvent } from './behavior-library/state-machine';
export type { AsTextureFramesOptions } from './library/texture-frames';
export type Asset = {
    src: string;
    alias?: string;
};
export interface OnEvent {
    event: Event;
    eventType: string;
}
export interface ClientEventsArgs {
    initWheelOffset?: any;
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
    Behavior: typeof Behavior;
    Camera: typeof Camera;
    CameraBehavior: typeof CameraBehavior;
    ClientEvents: typeof ClientEvents;
    createResizeHandler: typeof createResizeHandler;
    defaultRenderOptions: Partial<import("pixi.js").AutoDetectOptions>;
    Engine: typeof Engine;
    loadFonts: () => Promise<unknown>;
    MoxiEntity: typeof MoxiEntity;
    prepMoxi: typeof prepMoxi;
    RenderManager: typeof RenderManager;
    Scene: typeof Scene;
    setupResponsiveCanvas: typeof setupResponsiveCanvas;
    TextureFrameSequences: typeof TextureFrameSequences;
    utils: typeof utils;
    StateMachine: typeof StateMachine;
    StateBehavior: typeof StateBehavior;
};
export default exportedObjects;
export { AssetLoader, asEntity, asTextureFrames, Behavior, Camera, CameraBehavior, ClientEvents, createResizeHandler, defaultRenderOptions, Engine, loadFonts, MoxiEntity, prepMoxi, RenderManager, Scene, SceneGraph, setupResponsiveCanvas, TextureFrameSequences, utils, StateMachine, StateBehavior };
