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
export class PixelGrid {
  public readonly unit: number;
  public readonly scale: number;
  public readonly border: number;
  public readonly padding: number;
  public readonly gap: number;
  public readonly margin: number;
  public readonly fontScale: number;

  constructor(config: PixelGridConfig = {}) {
    this.unit = config.unit ?? 1;
    this.scale = config.scale ?? 4;
    this.border = config.border ?? 1;
    this.padding = config.padding ?? 1;
    this.gap = config.gap ?? 1;
    this.margin = config.margin ?? 5; // 5 units * 4 scale = 20px default
    // Font scale is proportional to GRID scale (0.25 at 4x scale)
    // At 4x: 64px * 0.25 = 16px, At 3x: 64px * 0.1875 = 12px, etc.
    this.fontScale = config.fontScale ?? (this.scale / 16);
  }

  /**
   * Convert grid units to actual pixels
   * @param units - Number of grid units
   * @returns Actual pixel value
   */
  px(units: number): number {
    return units * this.unit * this.scale;
  }

  /**
   * Convert pixels to grid units
   * @param pixels - Number of pixels
   * @returns Grid units (rounded)
   */
  units(pixels: number): number {
    return Math.round(pixels / (this.unit * this.scale));
  }
}

/**
 * Default pixel grid instance
 * - 1px base unit
 * - 4x scale (common for retro/pixel games)
 * - 1 unit borders, padding, and gaps
 *
 * TEMPORARY: Checks localStorage for 'temp-grid-scale' to override scale for testing
 */
export const DEFAULT_PIXEL_GRID = (() => {
  // TEMPORARY: Check for scale override in localStorage
  const tempScale = typeof localStorage !== 'undefined'
    ? localStorage.getItem('temp-grid-scale')
    : null;

  if (tempScale) {
    const scale = parseInt(tempScale, 10);
    if (!isNaN(scale) && scale >= 1 && scale <= 4) {
      return new PixelGrid({ scale });
    }
  }

  return new PixelGrid();
})();

/**
 * Helper function to convert grid units to pixels using the default grid
 * @param units - Number of grid units
 * @returns Actual pixel value
 */
export const px = (units: number): number => DEFAULT_PIXEL_GRID.px(units);

/**
 * Helper function to convert pixels to grid units using the default grid
 * @param pixels - Number of pixels
 * @returns Grid units (rounded)
 */
export const units = (pixels: number): number => DEFAULT_PIXEL_GRID.units(pixels);

/**
 * Default grid constants for easy access
 */
export const GRID = {
  unit: DEFAULT_PIXEL_GRID.unit,
  scale: DEFAULT_PIXEL_GRID.scale,
  border: DEFAULT_PIXEL_GRID.border,
  padding: DEFAULT_PIXEL_GRID.padding,
  gap: DEFAULT_PIXEL_GRID.gap,
  margin: DEFAULT_PIXEL_GRID.margin,
  fontScale: DEFAULT_PIXEL_GRID.fontScale
} as const;

/**
 * Default border configuration (triple border: outer/middle/inner)
 */
export const BORDER = {
  outer: 1,   // Outer border (1 grid unit)
  middle: 1,  // Middle border (1 grid unit)
  inner: 1,   // Inner border (1 grid unit)
  total: 3    // Total border width (3 grid units)
} as const;

/**
 * Create a custom border configuration
 * @param config - Border configuration
 * @returns Border configuration with calculated total
 */
export function createBorderConfig(config: BorderConfig = {}): Required<BorderConfig> {
  const outer = config.outer ?? 1;
  const middle = config.middle ?? 1;
  const inner = config.inner ?? 1;
  const total = outer + middle + inner;

  return {
    outer,
    middle,
    inner,
    total
  };
}
