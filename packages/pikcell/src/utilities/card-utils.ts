/**
 * Card Utility Functions
 * Shared utilities for card-related calculations
 * 
 * ⚠️ CRITICAL: This codebase uses GRID UNITS, not raw pixels!
 * - Always use px(gridUnits) to convert grid units to pixels
 * - NEVER use hardcoded pixel values like 24, 16, etc. for UI measurements
 * - Grid units scale with GRID.scale (configurable: 1x, 2x, 3x, or 4x - default 4x)
 * - The scale is configured at the outer layer (PixelGrid), not hardcoded
 * - px(1) = 4px (at 4x) = 3px (at 3x) = 2px (at 2x) = 1px (at 1x)
 * 
 * @see ../README.md for grid system documentation
 */
import { GRID, BORDER, px } from 'moxi-kit';
import { CARD_CONSTANTS } from '../config/constants';

/**
 * Calculate title bar height dynamically based on GRID.fontScale
 * 
 * ⚠️ Returns height in PIXELS (converted from grid units)
 * This function properly calculates the title bar height using grid-based measurements.
 * 
 * @returns Height in pixels (not grid units!)
 */
export function calculateTitleBarHeight(): number {
  const fontHeight = CARD_CONSTANTS.TITLE_FONT_SCALE_MULTIPLIER * GRID.fontScale;
  const verticalPadding = px(GRID.padding * CARD_CONSTANTS.TITLE_PADDING_MULTIPLIER);
  return Math.ceil(fontHeight + verticalPadding);
}

/**
 * Calculate commander bar total height (content + borders + title bar)
 * 
 * ⚠️ Returns height in PIXELS (converted from grid units)
 * Uses grid units (12 for content height) converted to pixels via px()
 * 
 * @returns Total commander bar height in pixels
 */
export function calculateCommanderBarHeight(): number {
  return px(12) + px(BORDER.total * 2) + calculateTitleBarHeight(); // 12 grid units content + borders + title bar
}

