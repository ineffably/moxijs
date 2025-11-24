/**
 * Sprite Editor Constants
 *
 * Centralized configuration for all magic numbers and constants used throughout
 * the sprite editor. This promotes maintainability and makes it easy to tune
 * editor behavior from a single location.
 */

/**
 * Sprite dimensions and cell sizes
 */
export const SPRITE_CONSTANTS = {
  /** Standard sprite cell size in pixels (8x8) */
  CELL_SIZE: 8,

  /** Default editor scale for individual sprite editing */
  DEFAULT_SPRITE_SCALE: 8,

  /** Minimum sprite scale */
  MIN_SPRITE_SCALE: 1,

  /** Maximum sprite scale */
  MAX_SPRITE_SCALE: 64,
} as const;

/**
 * Sprite sheet controller constants
 */
export const SPRITE_SHEET_CONSTANTS = {
  /** Click threshold in pixels - below this distance is a click, above is a drag */
  CLICK_THRESHOLD_PX: 5,

  /** Default viewport scale ratio (sheet height / viewport height) */
  DEFAULT_VIEWPORT_RATIO: 0.5,

  /** Zoom increment per mouse wheel notch */
  ZOOM_INCREMENT: 0.5,

  /** Minimum sprite sheet scale */
  MIN_SCALE: 1,

  /** Maximum sprite sheet scale */
  MAX_SCALE: 16,

  /** Grid line opacity (0-1) */
  GRID_OPACITY: 0.3,

  /** Grid line color (CSS color string) */
  GRID_COLOR: 'rgba(128, 128, 128, 0.3)',

  /** Grid line width in pixels */
  GRID_LINE_WIDTH: 1,
} as const;

/**
 * Card UI constants
 */
export const CARD_CONSTANTS = {
  /** Title bar font scale multiplier */
  TITLE_FONT_SCALE_MULTIPLIER: 64,

  /** Title bar padding multiplier */
  TITLE_PADDING_MULTIPLIER: 2,

  /** Resize handle size in pixels */
  RESIZE_HANDLE_SIZE: 16,

  /** Corner resize handle size in pixels */
  CORNER_RESIZE_HANDLE_SIZE: 16,

  /** Minimum drag distance to distinguish from click */
  MIN_DRAG_DISTANCE: 5,
} as const;

/**
 * Default card dimensions (in grid units)
 */
export const DEFAULT_CARD_SIZES = {
  /** Default palette card dimensions */
  PALETTE: {
    WIDTH: 50,
    HEIGHT: 50,
  },

  /** Default tool card dimensions */
  TOOL: {
    WIDTH: 50,
    HEIGHT: 50,
  },

  /** Default sprite sheet minimap dimensions */
  SPRITESHEET_MINIMAP: {
    WIDTH: 50,
    HEIGHT: 50,
    SCALE: 5,
  },

  /** Default sprite card dimensions */
  SPRITE: {
    WIDTH: 70,
    HEIGHT: 70,
  },

  /** Default commander bar dimensions */
  COMMANDER_BAR: {
    BASE_HEIGHT: 12,
    BUTTON_SPACING: 24,
  },

  /** Default info bar dimensions */
  INFO_BAR: {
    HEIGHT: 10,
  },

  /** Default scale card dimensions */
  SCALE: {
    WIDTH: 20,
    HEIGHT: 10,
  },
} as const;

/**
 * Layout constants
 */
export const LAYOUT_CONSTANTS = {
  /** Gap between cards in pixels */
  CARD_GAP: 8,

  /** Padding from viewport edges */
  VIEWPORT_PADDING: 0,

  /** Z-index for focused cards (to bring to front) */
  FOCUSED_CARD_Z_INDEX: 1000,
} as const;

/**
 * Animation and interaction constants
 */
export const INTERACTION_CONSTANTS = {
  /** Double-click time threshold in milliseconds */
  DOUBLE_CLICK_THRESHOLD_MS: 300,

  /** Long press duration in milliseconds */
  LONG_PRESS_DURATION_MS: 500,

  /** Drag start delay in milliseconds */
  DRAG_START_DELAY_MS: 100,
} as const;

/**
 * File operation constants
 */
export const FILE_CONSTANTS = {
  /** Project file extension */
  PROJECT_FILE_EXTENSION: '.moxiproject',

  /** PNG export file extension */
  PNG_EXPORT_EXTENSION: '.png',

  /** Default project file name */
  DEFAULT_PROJECT_NAME: 'untitled-project',

  /** UI state storage key */
  UI_STATE_STORAGE_KEY: 'spriteEditorUIState',

  /** Project state storage key */
  PROJECT_STATE_STORAGE_KEY: 'spriteEditorProjectState',

  /** Layout state storage key */
  LAYOUT_STATE_STORAGE_KEY: 'spriteEditorLayoutState',
} as const;

/**
 * Color constants
 */
export const COLOR_CONSTANTS = {
  /** Cell selection highlight color */
  CELL_SELECTION_COLOR: 0xffec27,

  /** Cell selection highlight width */
  CELL_SELECTION_WIDTH: 2,

  /** Cell hover highlight color */
  CELL_HOVER_COLOR: 0xffffff,

  /** Cell hover highlight width */
  CELL_HOVER_WIDTH: 1,

  /** Cell hover highlight alpha */
  CELL_HOVER_ALPHA: 0.5,
} as const;

/**
 * Performance constants
 */
export const PERFORMANCE_CONSTANTS = {
  /** Maximum number of sprite sheets per project */
  MAX_SPRITE_SHEETS_PER_PROJECT: 10,

  /** Texture cache size limit */
  TEXTURE_CACHE_SIZE: 100,

  /** Debounce delay for auto-save in milliseconds */
  AUTO_SAVE_DEBOUNCE_MS: 1000,
} as const;

/**
 * Debug constants
 */
export const DEBUG_CONSTANTS = {
  /** Enable verbose logging */
  ENABLE_VERBOSE_LOGGING: false,

  /** Show performance metrics */
  SHOW_PERFORMANCE_METRICS: false,

  /** Show bounding boxes for cards */
  SHOW_CARD_BOUNDS: false,
} as const;

/**
 * Tool constants
 */
export const TOOL_CONSTANTS = {
  /** Default tool on editor start */
  DEFAULT_TOOL: 'pencil',

  /** Tool cursor types */
  TOOL_CURSORS: {
    pencil: 'crosshair',
    eraser: 'crosshair',
    fill: 'crosshair',
    eyedropper: 'crosshair',
    select: 'default',
  },
} as const;
