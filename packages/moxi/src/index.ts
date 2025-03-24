import * as utils from './utils';
import PIXI from 'pixi.js';

import { RenderManager } from './render-manager';
import { Entity, SpriteEntity } from './entities';
import { Scene } from './scene';
import { Engine } from './engine';
import { ClientEvents } from './client-events';
import { AssetLoader } from './asset-loader';

import type { Point } from 'pixi.js';

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

const defaultExport = {
  utils,
  PIXI,
  RenderManager,
  Entity,
  SpriteEntity,
  Scene,
  Engine,
  ClientEvents,
  AssetLoader,
};

export { 
  utils,
  PIXI,
  RenderManager,
  Entity,
  SpriteEntity,
  Scene,
  Engine,
  ClientEvents,
  AssetLoader,
};

export default defaultExport;

