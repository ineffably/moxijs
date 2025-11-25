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
export declare const SPRITE_CONSTANTS: {
    /** Standard sprite cell size in pixels (8x8) */
    readonly CELL_SIZE: 8;
    /** Default editor scale for individual sprite editing */
    readonly DEFAULT_SPRITE_SCALE: 8;
    /** Minimum sprite scale */
    readonly MIN_SPRITE_SCALE: 1;
    /** Maximum sprite scale */
    readonly MAX_SPRITE_SCALE: 64;
};
/**
 * Sprite sheet controller constants
 */
export declare const SPRITE_SHEET_CONSTANTS: {
    /** Click threshold in pixels - below this distance is a click, above is a drag */
    readonly CLICK_THRESHOLD_PX: 5;
    /** Default viewport scale ratio (sheet height / viewport height) */
    readonly DEFAULT_VIEWPORT_RATIO: 0.5;
    /** Zoom increment per mouse wheel notch */
    readonly ZOOM_INCREMENT: 0.5;
    /** Minimum sprite sheet scale */
    readonly MIN_SCALE: 1;
    /** Maximum sprite sheet scale */
    readonly MAX_SCALE: 16;
    /** Grid line opacity (0-1) */
    readonly GRID_OPACITY: 0.3;
    /** Grid line color (CSS color string) */
    readonly GRID_COLOR: "rgba(128, 128, 128, 0.3)";
    /** Grid line width in pixels */
    readonly GRID_LINE_WIDTH: 1;
};
/**
 * Card UI constants
 */
export declare const CARD_CONSTANTS: {
    /** Title bar font scale multiplier */
    readonly TITLE_FONT_SCALE_MULTIPLIER: 64;
    /** Title bar padding multiplier */
    readonly TITLE_PADDING_MULTIPLIER: 2;
    /** Resize handle size in pixels */
    readonly RESIZE_HANDLE_SIZE: 16;
    /** Corner resize handle size in pixels */
    readonly CORNER_RESIZE_HANDLE_SIZE: 16;
    /** Minimum drag distance to distinguish from click */
    readonly MIN_DRAG_DISTANCE: 5;
};
/**
 * Default card dimensions (in grid units)
 */
export declare const DEFAULT_CARD_SIZES: {
    /** Default palette card dimensions */
    readonly PALETTE: {
        readonly WIDTH: 50;
        readonly HEIGHT: 50;
    };
    /** Default tool card dimensions */
    readonly TOOL: {
        readonly WIDTH: 50;
        readonly HEIGHT: 50;
    };
    /** Default sprite sheet minimap dimensions */
    readonly SPRITESHEET_MINIMAP: {
        readonly WIDTH: 50;
        readonly HEIGHT: 50;
        readonly SCALE: 5;
    };
    /** Default sprite card dimensions */
    readonly SPRITE: {
        readonly WIDTH: 70;
        readonly HEIGHT: 70;
    };
    /** Default commander bar dimensions */
    readonly COMMANDER_BAR: {
        readonly BASE_HEIGHT: 12;
        readonly BUTTON_SPACING: 24;
    };
    /** Default info bar dimensions */
    readonly INFO_BAR: {
        readonly HEIGHT: 10;
    };
    /** Default scale card dimensions */
    readonly SCALE: {
        readonly WIDTH: 20;
        readonly HEIGHT: 10;
    };
};
/**
 * Layout constants
 */
export declare const LAYOUT_CONSTANTS: {
    /** Gap between cards in pixels */
    readonly CARD_GAP: 8;
    /** Padding from viewport edges */
    readonly VIEWPORT_PADDING: 0;
    /** Z-index for focused cards (to bring to front) */
    readonly FOCUSED_CARD_Z_INDEX: 1000;
};
/**
 * Animation and interaction constants
 */
export declare const INTERACTION_CONSTANTS: {
    /** Double-click time threshold in milliseconds */
    readonly DOUBLE_CLICK_THRESHOLD_MS: 300;
    /** Long press duration in milliseconds */
    readonly LONG_PRESS_DURATION_MS: 500;
    /** Drag start delay in milliseconds */
    readonly DRAG_START_DELAY_MS: 100;
};
/**
 * File operation constants
 */
export declare const FILE_CONSTANTS: {
    /** Project file extension */
    readonly PROJECT_FILE_EXTENSION: ".moxiproject";
    /** PNG export file extension */
    readonly PNG_EXPORT_EXTENSION: ".png";
    /** Default project file name */
    readonly DEFAULT_PROJECT_NAME: "untitled-project";
    /** UI state storage key */
    readonly UI_STATE_STORAGE_KEY: "spriteEditorUIState";
    /** Project state storage key */
    readonly PROJECT_STATE_STORAGE_KEY: "spriteEditorProjectState";
    /** Layout state storage key */
    readonly LAYOUT_STATE_STORAGE_KEY: "spriteEditorLayoutState";
};
/**
 * Color constants
 */
export declare const COLOR_CONSTANTS: {
    /** Cell selection highlight color */
    readonly CELL_SELECTION_COLOR: 16772135;
    /** Cell selection highlight width */
    readonly CELL_SELECTION_WIDTH: 2;
    /** Cell hover highlight color */
    readonly CELL_HOVER_COLOR: 16777215;
    /** Cell hover highlight width */
    readonly CELL_HOVER_WIDTH: 1;
    /** Cell hover highlight alpha */
    readonly CELL_HOVER_ALPHA: 0.5;
};
/**
 * Performance constants
 */
export declare const PERFORMANCE_CONSTANTS: {
    /** Maximum number of sprite sheets per project */
    readonly MAX_SPRITE_SHEETS_PER_PROJECT: 10;
    /** Texture cache size limit */
    readonly TEXTURE_CACHE_SIZE: 100;
    /** Debounce delay for auto-save in milliseconds */
    readonly AUTO_SAVE_DEBOUNCE_MS: 1000;
};
/**
 * Debug constants
 */
export declare const DEBUG_CONSTANTS: {
    /** Enable verbose logging */
    readonly ENABLE_VERBOSE_LOGGING: false;
    /** Show performance metrics */
    readonly SHOW_PERFORMANCE_METRICS: false;
    /** Show bounding boxes for cards */
    readonly SHOW_CARD_BOUNDS: false;
};
/**
 * Tool constants
 */
export declare const TOOL_CONSTANTS: {
    /** Default tool on editor start */
    readonly DEFAULT_TOOL: "pencil";
    /** Tool cursor types */
    readonly TOOL_CURSORS: {
        readonly pencil: "crosshair";
        readonly eraser: "crosshair";
        readonly fill: "crosshair";
        readonly eyedropper: "crosshair";
        readonly select: "default";
    };
};
