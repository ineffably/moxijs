import * as utils from './utils';
import PIXI, { Point } from 'pixi.js';

import { RenderManager } from './render-manager';
import { Entity } from './entity';
import { Scene } from './scene';
import { Engine } from './engine';
import { ClientEvents } from './client-events';
import { AssetLoader } from './asset-loader';
import { Behavior } from './bahavior';
import { defaultRenderOptions, prepMoxi } from './prepare';
import { loadFonts } from './font-loader';
export type Asset = { src: string, alias?: string };

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
  wheelDelta?: { yValue: 0 | number, xValue: 0 | number, xLast: number, yLast: number }
}

const exportedObjects = {
  loadFonts,
  utils,
  PIXI,
  RenderManager,
  Entity,
  Scene,
  Engine,
  ClientEvents,
  AssetLoader,
  Behavior,
  defaultRenderOptions,
  prepMoxi
};

export default exportedObjects;

export {
  loadFonts,
  utils,
  PIXI,
  RenderManager,
  Entity,
  Scene,
  Engine,
  ClientEvents,
  AssetLoader,
  Behavior,
  defaultRenderOptions,
  prepMoxi
};

