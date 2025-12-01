/**
 * Controller configuration constants
 *
 * All controller-specific values are centralized here.
 * Includes zoom, pan, grid, and interaction settings.
 */

// ============================================================================
// Sprite Sheet Controller
// ============================================================================

export const SPRITE_SHEET_CONTROLLER_CONFIG = {
  /** Default cell size in pixels */
  cellSize: 8,
  /** Grid line spacing in pixels (typically same as cellSize) */
  gridSize: 8,
  /** Grid line color opacity (0-1) */
  gridOpacity: 0.3,
  /** Grid line color (gray) */
  gridColor: 0x808080,

  // Zoom settings
  /** Minimum zoom scale */
  minScale: 1,
  /** Maximum zoom scale */
  maxScale: 16,
  /** Zoom increment per wheel step */
  zoomDelta: 0.5,
  /** Initial scale as percentage of viewport height */
  initialScaleViewportRatio: 0.5,

  // Interaction settings
  /** Pixels of movement before it's considered a drag vs click */
  clickThreshold: 5,

  // Cell highlight colors
  /** Selected cell highlight color (yellow) */
  selectedCellColor: 0xffec27,
  /** Selected cell stroke width */
  selectedCellStrokeWidth: 2,
  /** Hovered cell highlight color (white) */
  hoveredCellColor: 0xffffff,
  /** Hovered cell stroke width */
  hoveredCellStrokeWidth: 1,
  /** Hovered cell alpha */
  hoveredCellAlpha: 0.5
};

// ============================================================================
// Sprite Controller
// ============================================================================

export const SPRITE_CONTROLLER_CONFIG = {
  /** Sprite cell size in pixels (8x8 sprites) */
  cellSize: 8,
  /** Default zoom scale for editing */
  defaultScale: 8,
  /** Minimum zoom scale */
  minScale: 1,
  /** Maximum zoom scale */
  maxScale: 64
};

// ============================================================================
// Aggregate export for convenience
// ============================================================================

export const CONTROLLER_CONFIGS = {
  spriteSheet: SPRITE_SHEET_CONTROLLER_CONFIG,
  sprite: SPRITE_CONTROLLER_CONFIG
} as const;
