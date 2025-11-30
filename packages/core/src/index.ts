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
import { asBitmapText, asSprite, asText, asGraphics, asContainer, PixiProps } from './library/as-pixi';
import { TextureFrameSequences, SequenceInfo } from './library/texture-frame-sequences';
import { createResizeHandler, setupResponsiveCanvas, ResizeHandlerOptions } from './library/resize-handler';
import { EdgeInsets } from './ui/core/edge-insets';
import { UIComponent } from './ui/core/ui-component';
import { UIFocusManager } from './ui/core/ui-focus-manager';
import { FlexContainer, FlexDirection, FlexJustify, FlexAlign } from './ui/layout/flex-container';
import { UIBox } from './ui/components/ui-box';
import { UILabel } from './ui/components/ui-label';
import { UIPanel } from './ui/components/ui-panel';
import { UIButton, ButtonState } from './ui/components/ui-button';
import { UISelect, SelectOption } from './ui/components/ui-select';
import { UITextInput } from './ui/components/ui-text-input';
import { UITextArea } from './ui/components/ui-textarea';
import { UIScrollContainer } from './ui/components/ui-scroll-container';
import { UITabs, TabItem } from './ui/components/ui-tabs';
import { UILayer } from './ui/UILayer';
import { UIScaleMode } from './ui/UIScaleMode';
import { StateMachine } from './library/state-machine';
import { StateLogic } from './library/state-logic';
import { createTileGrid, getTextureRange } from './library/grid-generator';
import { svgToTexture } from './library/svg-utils/svg-to-texture';
import { PixelGrid, px, units, GRID, BORDER, createBorderConfig } from './ui/pixel-grid';
import { ParallaxBackground, ParallaxBackgroundLogic } from './library/parallax-background';
import { ParallaxLayer, TilingParallaxLayer } from './library/parallax-layer';
import { LoadingScene, FallingSquaresAnimation } from './library/loading-scene';
import { ActionManager, OnAction } from './library/action-manager';
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

export type { StateChangeEvent } from './library/state-machine';
export type { AsEntity, MoxiLogic } from './main/moxi-entity';
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
export type { BoxModel, ComputedLayout, MeasuredSize, SizeConstraint } from './ui/core/box-model';
export type { FlexContainerProps } from './ui/layout/flex-container';
export type { UIBoxProps } from './ui/components/ui-box';
export type { UILabelProps, TextAlign } from './ui/components/ui-label';
export type { UIPanelProps, NineSliceConfig } from './ui/components/ui-panel';
export type { UIButtonProps, SpriteBackgroundConfig } from './ui/components/ui-button';
export type { UISelectProps, SelectOption } from './ui/components/ui-select';
export type { UITextInputProps } from './ui/components/ui-text-input';
export type { UITabsProps, TabItem } from './ui/components/ui-tabs';
export type { UILayerOptions } from './ui/UILayer';
export type { PixelGridConfig, BorderConfig } from './ui/pixel-grid';
export type { SVGToTextureOptions } from './library/svg-utils/svg-to-texture';

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
  asGraphics,
  asContainer,
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
  EdgeInsets,
  UIComponent,
  UIFocusManager,
  FlexContainer,
  FlexDirection,
  FlexJustify,
  FlexAlign,
  UIBox,
  UILabel,
  UIPanel,
  UIButton,
  ButtonState,
  UISelect,
  UITextInput,
  UITextArea,
  UIScrollContainer,
  UITabs,
  UILayer,
  UIScaleMode,
  svgToTexture,
  PixelGrid,
  px,
  units,
  GRID,
  BORDER,
  createBorderConfig,
  ActionManager
};

export default exportedObjects;

export {
  AssetLoader,
  asEntity,
  asTextureFrames,
  asBitmapText,
  asSprite,
  asText,
  asGraphics,
  asContainer,
  PixiProps,
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
  EdgeInsets,
  UIComponent,
  UIFocusManager,
  FlexContainer,
  FlexDirection,
  FlexJustify,
  FlexAlign,
  UIBox,
  UILabel,
  UIPanel,
  UIButton,
  ButtonState,
  UISelect,
  UITextInput,
  UITextArea,
  UIScrollContainer,
  UITabs,
  UILayer,
  UIScaleMode,
  svgToTexture,
  PixelGrid,
  px,
  units,
  GRID,
  BORDER,
  createBorderConfig,
  ActionManager
};

