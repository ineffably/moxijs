import * as utils from './library/utils';
import PIXI from 'pixi.js';
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
import { asTextureFrames, AsTextureFramesOptions } from './library/texture-frames';
import { SceneGraph } from './library/debug-pack';

export type Asset = { src: string, alias?: string };

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
  wheelDelta?: { yValue: 0 | number, xValue: 0 | number, xLast: number, yLast: number }
}

// Re-export types
export { AsTextureFramesOptions };

const exportedObjects = {
  AssetLoader,
  asEntity,
  asTextureFrames,
  Behavior,
  Camera,
  CameraBehavior,
  ClientEvents,
  defaultRenderOptions,
  Engine,
  loadFonts,
  MoxiEntity,
  PIXI,
  prepMoxi,
  RenderManager,
  Scene,
  utils
};

export default exportedObjects;

export {
  AssetLoader,
  asEntity, 
  asTextureFrames,
  Behavior,
  Camera,
  CameraBehavior,
  ClientEvents,
  defaultRenderOptions,
  Engine,
  loadFonts,
  MoxiEntity,
  PIXI,
  prepMoxi,
  RenderManager,
  Scene,
  SceneGraph,
  utils
};

