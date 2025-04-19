import * as utils from './utils';
import PIXI from 'pixi.js';
import { RenderManager } from './render-manager';
import { Scene } from './scene';
import { Engine } from './engine';
import { ClientEvents } from './client-events';
import { AssetLoader } from './asset-loader';
import { Behavior } from './bahavior';
import { defaultRenderOptions, prepMoxi } from './prepare';
import { loadFonts } from './font-loader';
import { asEntity, MoxiEntity } from './moxi-entity';
import { Camera, CameraBehavior } from './camera';
import { asTextureFrames, AsTextureFramesOptions } from './texture-frames';
export type Asset = {
    src: string;
    alias?: string;
};
export interface OnEvent {
    event: Event;
    eventType: string;
}
export interface ClientEventsArgs {
    initWheelOffset?: PIXI.Point;
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
export { AsTextureFramesOptions };
declare const exportedObjects: {
    AssetLoader: typeof AssetLoader;
    asEntity: typeof asEntity;
    asTextureFrames: typeof asTextureFrames;
    Behavior: typeof Behavior;
    Camera: typeof Camera;
    CameraBehavior: typeof CameraBehavior;
    ClientEvents: typeof ClientEvents;
    defaultRenderOptions: Partial<PIXI.AutoDetectOptions>;
    Engine: typeof Engine;
    loadFonts: () => Promise<unknown>;
    MoxiEntity: typeof MoxiEntity;
    PIXI: typeof PIXI;
    prepMoxi: typeof prepMoxi;
    RenderManager: typeof RenderManager;
    Scene: typeof Scene;
    utils: typeof utils;
};
export default exportedObjects;
export { AssetLoader, asEntity, asTextureFrames, Behavior, Camera, CameraBehavior, ClientEvents, defaultRenderOptions, Engine, loadFonts, MoxiEntity, PIXI, prepMoxi, RenderManager, Scene, utils };
