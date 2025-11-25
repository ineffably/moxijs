/**
 * Editor Configuration Type System
 *
 * Defines the structure for configuring the sprite editor through JSON files or
 * TypeScript objects. This enables data-driven configuration of layouts, tools,
 * sprite sheets, and other editor features.
 */
import { SpriteSheetType } from '../controllers/sprite-sheet-controller';
/**
 * Main editor configuration
 */
export interface EditorConfig {
    /** Configuration version for migration support */
    version: string;
    /** Card configuration registry */
    cards: CardConfigRegistry;
    /** Sprite sheet type configurations */
    spriteSheets: SpriteSheetConfigRegistry;
    /** Tool definitions and configurations */
    tools: ToolConfigRegistry;
    /** Layout preset definitions */
    layouts: LayoutConfigRegistry;
    /** Theme and appearance settings */
    theme?: ThemeConfig;
    /** Editor behavior settings */
    behavior?: BehaviorConfig;
}
/**
 * Card configuration registry
 */
export interface CardConfigRegistry {
    /** Default card dimensions and behavior */
    defaults: {
        titleBar: {
            fontScale: number;
            baseFontSize: number;
            paddingMultiplier: number;
        };
        border: {
            outer: number;
            middle: number;
            inner: number;
        };
        resize: {
            handleSize: number;
            cornerHandleSize: number;
        };
    };
    /** Specific card configurations */
    palette: CardConfig;
    tool: CardConfig;
    sprite: CardConfig;
    spriteSheet: CardConfig;
    commander: CardConfig;
    info: CardConfig;
    scale: CardConfig;
}
export interface CardConfig {
    /** Default width in grid units */
    defaultWidth: number;
    /** Default height in grid units */
    defaultHeight: number;
    /** Minimum width in grid units */
    minWidth?: number;
    /** Minimum height in grid units */
    minHeight?: number;
    /** Maximum width in grid units */
    maxWidth?: number;
    /** Maximum height in grid units */
    maxHeight?: number;
    /** Whether card is resizable */
    resizable?: boolean;
    /** Whether card is draggable */
    draggable?: boolean;
    /** Whether card clips content */
    clipContent?: boolean;
}
/**
 * Sprite sheet configuration registry
 */
export interface SpriteSheetConfigRegistry {
    /** Available sprite sheet types */
    types: Record<SpriteSheetType, SpriteSheetTypeConfig>;
    /** Default sprite sheet type */
    defaultType: SpriteSheetType;
}
export interface SpriteSheetTypeConfig {
    /** Display name */
    name: string;
    /** Description */
    description: string;
    /** Sheet width in pixels */
    width: number;
    /** Sheet height in pixels */
    height: number;
    /** Color palette (array of 0xRRGGBB colors) */
    palette: number[];
    /** Maximum number of sheets of this type per project */
    maxPerProject?: number;
    /** Default zoom settings */
    zoom?: {
        default: number;
        min: number;
        max: number;
        increment: number;
    };
    /** Grid settings */
    grid?: {
        enabled: boolean;
        size: number;
        color?: string;
        opacity?: number;
    };
}
/**
 * Tool configuration registry
 */
export interface ToolConfigRegistry {
    /** Available tools */
    tools: Record<string, ToolDefinition>;
    /** Default tool on startup */
    defaultTool: string;
    /** Tool categories for organization */
    categories?: ToolCategory[];
}
export interface ToolDefinition {
    /** Unique tool identifier */
    id: string;
    /** Display name */
    name: string;
    /** Tool description */
    description: string;
    /** Icon (SVG string or path to icon file) */
    icon: string;
    /** Cursor to display when tool is active */
    cursor: string;
    /** Keyboard shortcut */
    hotkey?: string;
    /** Tool category */
    category?: string;
    /** Tool options */
    options?: ToolOptions;
}
export interface ToolOptions {
    /** Tool-specific settings */
    [key: string]: any;
}
export interface ToolCategory {
    /** Category identifier */
    id: string;
    /** Display name */
    name: string;
    /** Tool IDs in this category */
    toolIds: string[];
}
/**
 * Layout configuration registry
 */
export interface LayoutConfigRegistry {
    /** Available layout presets */
    layouts: Record<string, LayoutDefinition>;
    /** Default layout */
    defaultLayout: string;
}
export interface LayoutDefinition {
    /** Unique layout identifier */
    id: string;
    /** Display name */
    name: string;
    /** Description */
    description?: string;
    /** Card placements */
    cards: Record<string, CardPlacement>;
}
export interface CardPlacement {
    /** Card identifier */
    cardId: string;
    /** Anchor point for positioning */
    anchor: AnchorPoint;
    /** Position offset */
    offset: OffsetSpec;
    /** Optional size override */
    size?: SizeSpec;
    /** Optional constraints */
    constraints?: Constraints;
}
export type AnchorPoint = 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
export type OffsetSpec = {
    x: number;
    y: number;
} | {
    xRef: string;
    yRef: string;
} | {
    xExpr: string;
    yExpr: string;
};
export interface SizeSpec {
    width?: number | string;
    height?: number | string;
}
export interface Constraints {
    /** Keep within viewport bounds */
    stayInViewport?: boolean;
    /** Maintain aspect ratio */
    aspectRatio?: number;
    /** Snap to grid */
    snapToGrid?: boolean;
}
/**
 * Theme configuration
 */
export interface ThemeConfig {
    /** Theme identifier */
    id: string;
    /** Theme name */
    name: string;
    /** Color values */
    colors?: {
        background?: number;
        surface?: number;
        border?: number;
        text?: number;
        accent?: number;
        [key: string]: number | undefined;
    };
    /** Font settings */
    fonts?: {
        family?: string;
        size?: number;
        scale?: number;
    };
}
/**
 * Behavior configuration
 */
export interface BehaviorConfig {
    /** Auto-save settings */
    autoSave?: {
        enabled: boolean;
        intervalMs: number;
    };
    /** Performance settings */
    performance?: {
        maxSpriteSheets: number;
        textureCacheSize: number;
    };
    /** Interaction settings */
    interaction?: {
        clickThreshold: number;
        dragDelay: number;
        doubleClickThreshold: number;
    };
    /** Debug settings */
    debug?: {
        enableLogging: boolean;
        showPerformanceMetrics: boolean;
        showCardBounds: boolean;
    };
}
/**
 * Default editor configuration
 */
export declare const DEFAULT_EDITOR_CONFIG: EditorConfig;
