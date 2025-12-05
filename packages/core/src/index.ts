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
import { asBitmapText, asSprite, asText, asTextDPR, asGraphics, asContainer, asMSDFText, PixiProps, TextDPROptions } from './library/as-pixi';
import { TextureFrameSequences, SequenceInfo } from './library/texture-frame-sequences';
import { createResizeHandler, setupResponsiveCanvas, ResizeHandlerOptions } from './library/resize-handler';
import { StateMachine } from './library/state-machine';
import { StateLogic } from './library/state-logic';
import { createTileGrid, getTextureRange } from './library/grid-generator';
import { svgToTexture } from './library/svg-utils/svg-to-texture';
import { ParallaxBackground, ParallaxBackgroundLogic } from './library/parallax-background';
import { ParallaxLayer, TilingParallaxLayer } from './library/parallax-layer';
import { LoadingScene, FallingSquaresAnimation } from './library/loading-scene';
import { ActionManager, OnAction } from './library/action-manager';
import { PixelGrid, px, units, GRID, BORDER, createBorderConfig } from './library/pixel-grid';
import {
  PhysicsWorld,
  PhysicsBodyLogic,
  PhysicsDebugRenderer,
  CollisionRegistry,
  CollisionManager,
  asPhysicsEntity,
  hasPhysics,
  getPhysicsBody,
  createShapeFromSprite,
  PhysicsMaterials,
  applyMaterial
} from './library/physics';

// Type exports
export type { StateChangeEvent } from './library/state-machine';
export type { AsEntity, MoxiLogic } from './main/moxi-entity';
export type { StateLogicRecords } from './library/state-machine';
export type { MoxiEntityClass } from './main/moxi-entity';
export type { MoxiEvents } from './main/event-system';
export type { AsTextureFramesOptions } from './library/texture-frames';
export type { GridOptions, CellPosition } from './library/grid-generator';
export type { ParallaxBackgroundOptions } from './library/parallax-background';
export type { ParallaxLayerOptions, TilingParallaxLayerOptions } from './library/parallax-layer';
export type { LoadingSceneOptions, LoadingAnimation, LoadingAnimationContext, FallingSquaresOptions } from './library/loading-scene';
export type { OnAction } from './library/action-manager';
export type {
  BodyType,
  SyncMode,
  ShapeType,
  CollisionTag,
  ShapeConfig,
  PhysicsWorldOptions,
  PhysicsBodyOptions,
  PhysicsDebugOptions,
  CollisionEvent,
  RaycastCallback
} from './library/physics';
export type { SVGToTextureOptions } from './library/svg-utils/svg-to-texture';
export type { PixelGridConfig, BorderConfig } from './library/pixel-grid';
export type { SpriteOptions, TextOptions, TextDPROptions, BitmapTextOptions, PixiProps, MSDFTextOptions } from './library/as-pixi';
export type { SetupMoxiArgs, PixelPerfectOptions } from './library/setup';
export type { AssetLoaderEvents } from './main/asset-loader';

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

// Re-export types
export { 
  SequenceInfo, 
  ResizeHandlerOptions
};

const exportedObjects = {
  AssetLoader,
  asEntity,
  asTextureFrames,
  asBitmapText,
  asSprite,
  asText,
  asTextDPR,
  asGraphics,
  asContainer,
  asMSDFText,
  Logic,
  Camera,
  CameraLogic,
  ClientEvents,
  createResizeHandler,
  createTileGrid,
  defaultRenderOptions,
  Engine,
  EventEmitter,
  getTextureRange,
  loadFonts,
  MoxiEntity,
  ParallaxBackground,
  ParallaxBackgroundLogic,
  ParallaxLayer,
  LoadingScene,
  FallingSquaresAnimation,
  setupMoxi,
  RenderManager,
  Scene,
  setupResponsiveCanvas,
  TextureFrameSequences,
  TilingParallaxLayer,
  utils,
  StateMachine,
  StateLogic,
  PhysicsWorld,
  PhysicsBodyLogic,
  PhysicsDebugRenderer,
  CollisionRegistry,
  CollisionManager,
  asPhysicsEntity,
  hasPhysics,
  getPhysicsBody,
  createShapeFromSprite,
  PhysicsMaterials,
  applyMaterial,
  svgToTexture,
  ActionManager,
  PixelGrid,
  px,
  units,
  GRID,
  BORDER,
  createBorderConfig
};

export default exportedObjects;

export {
  AssetLoader,
  asEntity,
  asTextureFrames,
  asBitmapText,
  asSprite,
  asText,
  asTextDPR,
  asGraphics,
  asContainer,
  asMSDFText,
  Logic,
  Camera,
  CameraLogic,
  ClientEvents,
  createResizeHandler,
  createTileGrid,
  defaultRenderOptions,
  Engine,
  EventEmitter,
  getTextureRange,
  loadFonts,
  MoxiEntity,
  ParallaxBackground,
  ParallaxBackgroundLogic,
  ParallaxLayer,
  LoadingScene,
  FallingSquaresAnimation,
  setupMoxi,
  RenderManager,
  Scene,
  setupResponsiveCanvas,
  TextureFrameSequences,
  TilingParallaxLayer,
  utils,
  StateMachine,
  StateLogic,
  PhysicsWorld,
  PhysicsBodyLogic,
  PhysicsDebugRenderer,
  CollisionRegistry,
  CollisionManager,
  asPhysicsEntity,
  hasPhysics,
  getPhysicsBody,
  createShapeFromSprite,
  PhysicsMaterials,
  applyMaterial,
  svgToTexture,
  ActionManager,
  PixelGrid,
  px,
  units,
  GRID,
  BORDER,
  createBorderConfig
};
