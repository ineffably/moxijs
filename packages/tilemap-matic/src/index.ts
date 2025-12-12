/**
 * TileMapMatic - Sprite Sheet & Tilemap Management Tool
 * Built on MoxiJS and PIXI.js
 */

// Main initialization function
export { initTileMapMatic, TileMapMaticOptions } from './tilemap-matic';

// Core data types and utilities
export {
  GridSettings,
  TileRegion,
  AnimationSequence,
  FrameData,
  SpriteSheetJSON,
  LoadedSpriteSheet,
  NamedCell,
  calculateGrid,
  guessCellSize,
  generateFrames,
  generateFramesWithRegions,
  framesToJSON,
  downloadJSON,
  generateRegionId,
  generateAnimationId,
  getCellRegion,
  areCellsAdjacent,
  createRegionFromCells
} from './sprite-sheet-data';

// Project management
export {
  SpriteSheetProjectManager,
  SpriteSheetEntry,
  SpriteSheetProject,
  ProjectBundle,
  AddSheetInput,
  OperationResult
} from './sprite-sheet-project';

// Grid visualization
export {
  GridVisualizationOptions,
  createGridOverlay,
  createCellNumbers,
  createCellHighlight,
  pixelToCell,
  cellToIndex
} from './sprite-sheet-grid';

// UI Components
export {
  SpriteSheetConfigPanel,
  SpriteSheetConfigPanelProps,
  ConfigPanelCallbacks
} from './sprite-sheet-config-panel';

export {
  SpriteCarousel,
  CarouselItem,
  CarouselConfig,
  CarouselOrientation
} from './sprite-carousel';

export {
  CanvasPanZoom,
  PanZoomOptions
} from './canvas-pan-zoom';

export {
  ContainerWrapper,
  ContainerWrapperProps
} from './container-wrapper';

export {
  JSONViewer,
  JSONViewerProps
} from './json-viewer';

export {
  AnimationRegionLibraryPanel,
  AnimationRegionLibraryPanelProps,
  LibraryPanelCallbacks
} from './animation-region-library-panel';
