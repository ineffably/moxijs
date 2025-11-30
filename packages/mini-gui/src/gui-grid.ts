/**
 * GUI Grid Configuration
 *
 * 2x scale PixelGrid for crisp pixel-art style mini-gui.
 * All measurements in this package use grid units that convert to pixels at 2x scale.
 *
 * @example
 * ```ts
 * import { px, GUI_CONST } from './gui-grid';
 *
 * const width = px(60);     // 60 units = 120px
 * const padding = px(2);    // 2 units = 4px
 * const rowHeight = px(GUI_CONST.rowHeight); // 16px
 * ```
 */

import { PixelGrid } from '@moxijs/core';

/** 2x scale grid for GUI */
export const GUI_GRID = new PixelGrid({ scale: 2 });

/** Convert grid units to pixels (2x scale) */
export const px = (units: number): number => GUI_GRID.px(units);

/** Convert pixels to grid units (2x scale) */
export const units = (pixels: number): number => GUI_GRID.units(pixels);

/** GUI dimension constants (in grid units) */
export const GUI_CONST = {
  /** Default GUI width: 100 units = 200px */
  width: 100,
  /** Row height for controls: 12 units = 24px */
  rowHeight: 12,
  /** Standard padding: 3 units = 6px */
  padding: 3,
  /** Border width: 1 unit = 2px */
  border: 1,
  /** Header/title height: 12 units = 24px */
  headerHeight: 12,
  /** Gap between controls: 1 unit = 2px */
  gap: 1,
  /** Label width ratio (0-1) */
  labelRatio: 0.4,
  /** Default font family */
  fontFamily: 'PixelOperator8, ui-monospace',
  /** Default font size in grid units (8 units = 16px at 2x) */
  fontSize: 8,
} as const;

/** GUI color theme (dark) */
export const GUI_COLORS = {
  /** GUI background */
  background: 0x1a1a2e,
  /** Header background */
  header: 0x16213e,
  /** Border color */
  border: 0x0f3460,
  /** Primary text */
  text: 0xffffff,
  /** Muted/label text */
  textMuted: 0x888888,
  /** Accent color (active/hover) */
  accent: 0x00d4ff,
  /** Slider track */
  sliderTrack: 0x0f3460,
  /** Slider fill */
  sliderFill: 0x00d4ff,
  /** Input background */
  input: 0x252525,
  /** Input border */
  inputBorder: 0x3a3a3a,
  /** Hover state */
  hover: 0x2a2a4e,
  /** Folder header */
  folder: 0x12122e,
} as const;
