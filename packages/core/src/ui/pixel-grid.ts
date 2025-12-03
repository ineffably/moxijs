/**
 * Pixel-perfect grid system for consistent UI measurements.
 * All measurements are in grid units that scale to actual pixels.
 *
 * @example
 * ```ts
 * // Use global helpers (default 4x scale)
 * const width = px(10);      // 10 units = 40px
 * const gridUnits = units(40); // 40px = 10 units
 *
 * // Access grid constants
 * const padding = px(GRID.padding);  // Default padding in pixels
 * const gap = px(GRID.gap);          // Default gap in pixels
 *
 * // Create custom grid with different scale
 * const grid2x = new PixelGrid({ scale: 2 });
 * const width2x = grid2x.px(10);  // 10 units = 20px at 2x
 * ```
 */

/** PixelGrid configuration. */
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

/** Multi-layer border configuration. */
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

/** Grid system converting units to pixels at consistent scale. */
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

  /** Convert grid units → pixels. */
  px(units: number): number {
    return units * this.unit * this.scale;
  }

  /** Convert pixels → grid units (rounded). */
  units(pixels: number): number {
    return Math.round(pixels / (this.unit * this.scale));
  }
}

/** Default grid: 4x scale, 1px base unit. */
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

/** Convert grid units → pixels (default grid). */
export const px = (units: number): number => DEFAULT_PIXEL_GRID.px(units);

/** Convert pixels → grid units (default grid). */
export const units = (pixels: number): number => DEFAULT_PIXEL_GRID.units(pixels);

/** Default grid constants. */
export const GRID = {
  unit: DEFAULT_PIXEL_GRID.unit,
  scale: DEFAULT_PIXEL_GRID.scale,
  border: DEFAULT_PIXEL_GRID.border,
  padding: DEFAULT_PIXEL_GRID.padding,
  gap: DEFAULT_PIXEL_GRID.gap,
  margin: DEFAULT_PIXEL_GRID.margin,
  fontScale: DEFAULT_PIXEL_GRID.fontScale
} as const;

/** Default triple border (outer/middle/inner). */
export const BORDER = {
  outer: 1,   // Outer border (1 grid unit)
  middle: 1,  // Middle border (1 grid unit)
  inner: 1,   // Inner border (1 grid unit)
  total: 3    // Total border width (3 grid units)
} as const;

/** Create custom border config with calculated total. */
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

