/**
 * Pixel-Perfect Grid System
 *
 * Provides a consistent grid-based layout system for pixel-perfect UIs,
 * commonly used in retro-style games and pixel art applications.
 *
 * @category UI
 *
 * @example
 * ```typescript
 * // Use the default grid
 * const width = px(10); // 10 grid units = 40 pixels at 4x scale
 *
 * // Create a custom grid
 * const customGrid = new PixelGrid({
 *   unit: 1,
 *   scale: 2,  // 2x scale instead of 4x
 *   border: 1,
 *   padding: 2,
 *   gap: 1
 * });
 * const width = customGrid.px(10); // 20 pixels at 2x scale
 * ```
 */
/**
 * Configuration for a pixel grid system
 */
export interface PixelGridConfig {
    /** Base pixel unit at 1x scale (default: 1) */
    unit?: number;
    /** Scale multiplier for all measurements (default: 4) */
    scale?: number;
    /** Border width in grid units (default: 1) */
    border?: number;
    /** Standard padding in grid units (default: 1) */
    padding?: number;
    /** Gap between elements in grid units (default: 1) */
    gap?: number;
    /** Margin/spacing in grid units (default: 5, e.g., 5 * 4 = 20px) */
    margin?: number;
    /** Font scale multiplier (default: 0.25, e.g., 64px * 0.25 = 16px) */
    fontScale?: number;
}
/**
 * Border configuration for multi-layer borders
 */
export interface BorderConfig {
    /** Outer border width in grid units (default: 1) */
    outer?: number;
    /** Middle border width in grid units (default: 1) */
    middle?: number;
    /** Inner border width in grid units (default: 1) */
    inner?: number;
    /** Total border width (calculated automatically) */
    total?: number;
}
/**
 * A pixel-perfect grid system for consistent UI measurements
 *
 * All measurements are in grid units that get scaled to actual pixels.
 * This ensures pixel-perfect alignment at any scale factor.
 */
export declare class PixelGrid {
    readonly unit: number;
    readonly scale: number;
    readonly border: number;
    readonly padding: number;
    readonly gap: number;
    readonly margin: number;
    readonly fontScale: number;
    constructor(config?: PixelGridConfig);
    /**
     * Convert grid units to actual pixels
     * @param units - Number of grid units
     * @returns Actual pixel value
     */
    px(units: number): number;
    /**
     * Convert pixels to grid units
     * @param pixels - Number of pixels
     * @returns Grid units (rounded)
     */
    units(pixels: number): number;
}
/**
 * Default pixel grid instance
 * - 1px base unit
 * - 4x scale (common for retro/pixel games)
 * - 1 unit borders, padding, and gaps
 *
 * TEMPORARY: Checks localStorage for 'temp-grid-scale' to override scale for testing
 */
export declare const DEFAULT_PIXEL_GRID: PixelGrid;
/**
 * Helper function to convert grid units to pixels using the default grid
 * @param units - Number of grid units
 * @returns Actual pixel value
 */
export declare const px: (units: number) => number;
/**
 * Helper function to convert pixels to grid units using the default grid
 * @param pixels - Number of pixels
 * @returns Grid units (rounded)
 */
export declare const units: (pixels: number) => number;
/**
 * Default grid constants for easy access
 */
export declare const GRID: {
    readonly unit: number;
    readonly scale: number;
    readonly border: number;
    readonly padding: number;
    readonly gap: number;
    readonly margin: number;
    readonly fontScale: number;
};
/**
 * Default border configuration (triple border: outer/middle/inner)
 */
export declare const BORDER: {
    readonly outer: 1;
    readonly middle: 1;
    readonly inner: 1;
    readonly total: 3;
};
/**
 * Create a custom border configuration
 * @param config - Border configuration
 * @returns Border configuration with calculated total
 */
export declare function createBorderConfig(config?: BorderConfig): Required<BorderConfig>;
