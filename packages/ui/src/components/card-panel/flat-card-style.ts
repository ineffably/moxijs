/**
 * Flat Card Style
 *
 * A clean, modern card style with subtle borders and rounded corners.
 * This is the default style for core's CardPanel component.
 *
 * @category UI
 */

import * as PIXI from 'pixi.js';
import { EdgeInsets } from '../../core/edge-insets';
import {
  BaseCardStyle,
  CardThemeColors,
  CardSectionDimensions
} from './card-style';

/**
 * Configuration options for FlatCardStyle
 */
export interface FlatCardStyleConfig {
  /** Border radius for rounded corners (default: 4) */
  borderRadius?: number;
  /** Border width (default: 1) */
  borderWidth?: number;
  /** Title bar height when title is present (default: 32) */
  titleBarHeight?: number;
  /** Drag strip height when no title (default: 8) */
  dragStripHeight?: number;
  /** Footer height (default: 32) */
  footerHeight?: number;
  /** Content padding (default: 8 all sides) */
  contentPadding?: number;
  /** Show drop shadow (default: true) */
  showShadow?: boolean;
  /** Shadow offset (default: 2) */
  shadowOffset?: number;
  /** Shadow alpha (default: 0.15) */
  shadowAlpha?: number;
}

/**
 * A clean, modern card style with subtle borders and rounded corners.
 *
 * @example
 * ```typescript
 * const style = new FlatCardStyle({
 *   borderRadius: 8,
 *   showShadow: true
 * });
 *
 * const card = new CardPanel({
 *   style,
 *   title: { text: 'My Card' },
 *   body: { width: 300, height: 200 }
 * });
 * ```
 */
export class FlatCardStyle extends BaseCardStyle {
  private config: Required<FlatCardStyleConfig>;

  constructor(config: FlatCardStyleConfig = {}) {
    super();
    this.config = {
      borderRadius: config.borderRadius ?? 4,
      borderWidth: config.borderWidth ?? 1,
      titleBarHeight: config.titleBarHeight ?? 32,
      dragStripHeight: config.dragStripHeight ?? 8,
      footerHeight: config.footerHeight ?? 32,
      contentPadding: config.contentPadding ?? 8,
      showShadow: config.showShadow ?? true,
      shadowOffset: config.shadowOffset ?? 2,
      shadowAlpha: config.shadowAlpha ?? 0.15
    };
  }

  drawBackground(
    graphics: PIXI.Graphics,
    width: number,
    height: number,
    colors: CardThemeColors
  ): void {
    const { borderRadius, borderWidth, showShadow, shadowOffset, shadowAlpha } = this.config;

    graphics.clear();

    // Drop shadow
    if (showShadow) {
      graphics.roundRect(
        shadowOffset,
        shadowOffset,
        width,
        height,
        borderRadius
      );
      graphics.fill({ color: 0x000000, alpha: shadowAlpha });
    }

    // Border
    graphics.roundRect(0, 0, width, height, borderRadius);
    graphics.fill({ color: colors.border });

    // Background
    graphics.roundRect(
      borderWidth,
      borderWidth,
      width - borderWidth * 2,
      height - borderWidth * 2,
      Math.max(0, borderRadius - borderWidth)
    );
    graphics.fill({ color: colors.background });
  }

  drawTitleBar(
    graphics: PIXI.Graphics,
    dims: CardSectionDimensions,
    colors: CardThemeColors
  ): void {
    const { borderRadius, borderWidth } = this.config;

    // Title bar background (with top rounded corners)
    graphics.moveTo(dims.x + borderRadius, dims.y);
    graphics.lineTo(dims.x + dims.width - borderRadius, dims.y);
    graphics.arcTo(
      dims.x + dims.width,
      dims.y,
      dims.x + dims.width,
      dims.y + borderRadius,
      Math.max(0, borderRadius - borderWidth)
    );
    graphics.lineTo(dims.x + dims.width, dims.y + dims.height);
    graphics.lineTo(dims.x, dims.y + dims.height);
    graphics.lineTo(dims.x, dims.y + borderRadius);
    graphics.arcTo(
      dims.x,
      dims.y,
      dims.x + borderRadius,
      dims.y,
      Math.max(0, borderRadius - borderWidth)
    );
    graphics.closePath();
    graphics.fill({ color: colors.titleBar });

    // Bottom separator line
    graphics.moveTo(dims.x, dims.y + dims.height);
    graphics.lineTo(dims.x + dims.width, dims.y + dims.height);
    graphics.stroke({ color: colors.border, width: 1 });
  }

  drawDragStrip(
    graphics: PIXI.Graphics,
    dims: CardSectionDimensions,
    colors: CardThemeColors
  ): void {
    const { borderRadius, borderWidth } = this.config;

    // Drag strip background (with top rounded corners, smaller height)
    graphics.moveTo(dims.x + borderRadius, dims.y);
    graphics.lineTo(dims.x + dims.width - borderRadius, dims.y);
    graphics.arcTo(
      dims.x + dims.width,
      dims.y,
      dims.x + dims.width,
      dims.y + borderRadius,
      Math.max(0, borderRadius - borderWidth)
    );
    graphics.lineTo(dims.x + dims.width, dims.y + dims.height);
    graphics.lineTo(dims.x, dims.y + dims.height);
    graphics.lineTo(dims.x, dims.y + borderRadius);
    graphics.arcTo(
      dims.x,
      dims.y,
      dims.x + borderRadius,
      dims.y,
      Math.max(0, borderRadius - borderWidth)
    );
    graphics.closePath();
    graphics.fill({ color: colors.titleBar });

    // Draw grip dots in center (visual hint that it's draggable)
    const dotRadius = 1.5;
    const dotSpacing = 6;
    const numDots = 3;
    const totalWidth = (numDots - 1) * dotSpacing;
    const startX = dims.x + (dims.width - totalWidth) / 2;
    const centerY = dims.y + dims.height / 2;

    for (let i = 0; i < numDots; i++) {
      graphics.circle(startX + i * dotSpacing, centerY, dotRadius);
    }
    graphics.fill({ color: colors.border, alpha: 0.5 });
  }

  drawFooter(
    graphics: PIXI.Graphics,
    dims: CardSectionDimensions,
    colors: CardThemeColors
  ): void {
    const { borderRadius, borderWidth } = this.config;
    const footerBg = colors.footerBackground ?? colors.titleBar;

    // Top separator line
    graphics.moveTo(dims.x, dims.y);
    graphics.lineTo(dims.x + dims.width, dims.y);
    graphics.stroke({ color: colors.border, width: 1 });

    // Footer background (with bottom rounded corners)
    graphics.moveTo(dims.x, dims.y);
    graphics.lineTo(dims.x + dims.width, dims.y);
    graphics.lineTo(dims.x + dims.width, dims.y + dims.height - borderRadius);
    graphics.arcTo(
      dims.x + dims.width,
      dims.y + dims.height,
      dims.x + dims.width - borderRadius,
      dims.y + dims.height,
      Math.max(0, borderRadius - borderWidth)
    );
    graphics.lineTo(dims.x + borderRadius, dims.y + dims.height);
    graphics.arcTo(
      dims.x,
      dims.y + dims.height,
      dims.x,
      dims.y + dims.height - borderRadius,
      Math.max(0, borderRadius - borderWidth)
    );
    graphics.lineTo(dims.x, dims.y);
    graphics.closePath();
    graphics.fill({ color: footerBg });
  }

  getTitleBarHeight(hasTitle: boolean): number {
    return hasTitle ? this.config.titleBarHeight : 0;
  }

  getDragStripHeight(): number {
    return this.config.dragStripHeight;
  }

  getFooterHeight(): number {
    return this.config.footerHeight;
  }

  getBorderInsets(): EdgeInsets {
    const { borderWidth } = this.config;
    return EdgeInsets.all(borderWidth);
  }

  getContentPadding(): EdgeInsets {
    const { contentPadding } = this.config;
    return EdgeInsets.all(contentPadding);
  }
}
