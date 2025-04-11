import * as utils from './utils';
import PIXI, { Point } from 'pixi.js';
import { RenderManager } from './render-manager';
import { Scene } from './scene';
import { Engine } from './engine';
import { ClientEvents } from './client-events';
import { AssetLoader } from './asset-loader';
import { Behavior } from './bahavior';
import { defaultRenderOptions, prepMoxi } from './prepare';
import { loadFonts } from './font-loader';
import { asEntity, MoxiEntity } from './moxi-entity';
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
declare const exportedObjects: {
    loadFonts: () => Promise<unknown>;
    utils: typeof utils;
    PIXI: typeof PIXI;
    RenderManager: typeof RenderManager;
    asEntity: typeof asEntity;
    MoxiEntity: typeof MoxiEntity;
    Scene: typeof Scene;
    Engine: typeof Engine;
    ClientEvents: typeof ClientEvents;
    AssetLoader: typeof AssetLoader;
    Behavior: typeof Behavior;
    defaultRenderOptions: Partial<PIXI.AutoDetectOptions>;
    prepMoxi: typeof prepMoxi;
};
export default exportedObjects;
export { loadFonts, utils, PIXI, RenderManager, asEntity, Scene, Engine, ClientEvents, AssetLoader, Behavior, defaultRenderOptions, prepMoxi };
