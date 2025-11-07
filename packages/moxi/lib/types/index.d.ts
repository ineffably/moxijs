import * as utils from './library/utils';
import { RenderManager } from './core/render-manager';
import { Scene } from './core/scene';
import { Engine } from './core/engine';
import { EventEmitter } from './core/event-system';
import { ClientEvents } from './library/client-events';
import { AssetLoader } from './core/asset-loader';
import { Logic } from './core/logic';
import { defaultRenderOptions, setupMoxi } from './library/setup';
import { loadFonts } from './library/font-loader';
import { asEntity, MoxiEntity } from './core/moxi-entity';
import { Camera, CameraLogic } from './core/camera';
import { asTextureFrames } from './library/texture-frames';
import { TextureFrameSequences, SequenceInfo } from './library/texture-frame-sequences';
import { createResizeHandler, setupResponsiveCanvas, ResizeHandlerOptions } from './library/resize-handler';
import { StateMachine } from './library/state-machine';
import { StateLogic } from './library/state-logic';
export type { StateChangeEvent } from './library/state-machine';
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
    Logic: typeof Logic;
    Camera: typeof Camera;
    CameraLogic: typeof CameraLogic;
    ClientEvents: typeof ClientEvents;
    createResizeHandler: typeof createResizeHandler;
    defaultRenderOptions: Partial<import("pixi.js").AutoDetectOptions>;
    Engine: typeof Engine;
    EventEmitter: typeof EventEmitter;
    loadFonts: () => Promise<unknown>;
    MoxiEntity: typeof MoxiEntity;
    setupMoxi: typeof setupMoxi;
    RenderManager: typeof RenderManager;
    Scene: typeof Scene;
    setupResponsiveCanvas: typeof setupResponsiveCanvas;
    TextureFrameSequences: typeof TextureFrameSequences;
    utils: typeof utils;
    StateMachine: typeof StateMachine;
    StateLogic: typeof StateLogic;
};
export default exportedObjects;
export { AssetLoader, asEntity, asTextureFrames, Logic, Camera, CameraLogic, ClientEvents, createResizeHandler, defaultRenderOptions, Engine, EventEmitter, loadFonts, MoxiEntity, setupMoxi, RenderManager, Scene, setupResponsiveCanvas, TextureFrameSequences, utils, StateMachine, StateLogic };
