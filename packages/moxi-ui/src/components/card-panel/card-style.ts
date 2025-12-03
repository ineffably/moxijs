/**
 * Card Style Interface
 *
 * Defines the contract for rendering card visuals.
 * Implementations can provide different aesthetics (flat, pixel-art, glass, etc.)
 * while sharing the same structural layout (title, body, footer).
 *
 * @category UI
 */

import * as PIXI from 'pixi.js';
import { EdgeInsets } from '../../core/edge-insets';

/**
 * Theme colors used by card styles.
 * Implementations should resolve these from their theme system.
 */
export interface CardThemeColors {
  /** Background color for the card body */
  background: number;
  /** Border color */
  border: number;
  /** Title bar background color */
  titleBar: number;
  /** Title text color */
  titleText: number;
  /** Footer background color (optional, defaults to titleBar) */
  footerBackground?: number;
  /** Accent color for selection/focus */
  accent?: number;
  /** Bevel/depth color (for 3D styles) */
  bevel?: number;
  /** Inner border color (for layered border styles) */
  innerBorder?: number;
}

/**
 * Configuration for a card section (title, body, or footer)
 */
export interface CardSectionDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Card Style Interface
 *
 * Implement this interface to create custom card visual styles.
 * The CardPanel component uses this to render backgrounds, borders,
 * title bars, and footers with consistent structure but different aesthetics.
 *
 * @example
 * ```typescript
 * class PixelCardStyle implements CardStyle {
 *   drawBackground(g, dims, colors) {
 *     // Draw triple-border pixel-art background
 *   }
 *   // ... other methods
 * }
 * ```
 */
export interface CardStyle {
  /**
   * Draw the card background (borders, shadows, main bg)
   * @param graphics - Graphics object to draw into
   * @param width - Total card width
   * @param height - Total card height
   * @param colors - Theme colors to use
   */
  drawBackground(
    graphics: PIXI.Graphics,
    width: number,
    height: number,
    colors: CardThemeColors
  ): void;

  /**
   * Draw the title bar section
   * @param graphics - Graphics object to draw into
   * @param dims - Position and dimensions for the title bar
   * @param colors - Theme colors to use
   */
  drawTitleBar(
    graphics: PIXI.Graphics,
    dims: CardSectionDimensions,
    colors: CardThemeColors
  ): void;

  /**
   * Draw the minimal drag strip (shown when draggable but no title)
   * @param graphics - Graphics object to draw into
   * @param dims - Position and dimensions for the drag strip
   * @param colors - Theme colors to use
   */
  drawDragStrip(
    graphics: PIXI.Graphics,
    dims: CardSectionDimensions,
    colors: CardThemeColors
  ): void;

  /**
   * Draw the footer section
   * @param graphics - Graphics object to draw into
   * @param dims - Position and dimensions for the footer
   * @param colors - Theme colors to use
   */
  drawFooter(
    graphics: PIXI.Graphics,
    dims: CardSectionDimensions,
    colors: CardThemeColors
  ): void;

  /**
   * Get the height of the title bar in pixels
   * @param hasTitle - Whether a title is set
   */
  getTitleBarHeight(hasTitle: boolean): number;

  /**
   * Get the height of the drag strip in pixels
   * (shown when draggable but no title)
   */
  getDragStripHeight(): number;

  /**
   * Get the default footer height in pixels
   */
  getFooterHeight(): number;

  /**
   * Get the border insets (how much space borders take from each side)
   * Used to calculate content area positioning
   */
  getBorderInsets(): EdgeInsets;

  /**
   * Get padding inside the content area
   */
  getContentPadding(): EdgeInsets;
}

/**
 * Base class providing common card style functionality.
 * Extend this for easier implementation of custom styles.
 */
export abstract class BaseCardStyle implements CardStyle {
  abstract drawBackground(
    graphics: PIXI.Graphics,
    width: number,
    height: number,
    colors: CardThemeColors
  ): void;

  abstract drawTitleBar(
    graphics: PIXI.Graphics,
    dims: CardSectionDimensions,
    colors: CardThemeColors
  ): void;

  abstract drawDragStrip(
    graphics: PIXI.Graphics,
    dims: CardSectionDimensions,
    colors: CardThemeColors
  ): void;

  abstract drawFooter(
    graphics: PIXI.Graphics,
    dims: CardSectionDimensions,
    colors: CardThemeColors
  ): void;

  abstract getTitleBarHeight(hasTitle: boolean): number;
  abstract getDragStripHeight(): number;
  abstract getFooterHeight(): number;
  abstract getBorderInsets(): EdgeInsets;
  abstract getContentPadding(): EdgeInsets;
}
