/**
 * Pixel Card Style
 *
 * A pixel-art card style with triple borders, bevels, and grid-aligned rendering.
 * Implements the CardStyle interface from @moxijs/core for use with CardPanel.
 *
 * Features:
 * - Triple-layer border (outer → middle → inner)
 * - Drop shadow
 * - Title bar with distinct color
 * - Grid-aligned dimensions using GRID constants
 * - Bevel-ready (colors can include bevel for depth effects)
 *
 * @category Styles
 */

import * as PIXI from 'pixi.js';
import {
  CardStyle,
  CardThemeColors,
  CardSectionDimensions,
  EdgeInsets
} from '@moxijs/core';
import { GRID, BORDER, px } from '@moxijs/core';
import { getTheme, getFontDisplaySize } from '../theming/theme';

/**
 * Extended theme colors for pixel-art style
 * Includes additional colors for layered borders
 */
export interface PixelCardThemeColors extends CardThemeColors {
  /** Middle border layer color (between outer and inner) */
  middleBorder?: number;
  /** Drop shadow color */
  shadow?: number;
  /** Shadow alpha (0-1) */
  shadowAlpha?: number;
}

/**
 * Configuration for PixelCardStyle
 */
export interface PixelCardStyleConfig {
  /** Use theme colors automatically (default: true) */
  useTheme?: boolean;
  /** Custom shadow offset in grid units (default: 1) */
  shadowOffset?: number;
  /** Show drop shadow (default: true) */
  showShadow?: boolean;
}

/**
 * Pixel-art card style with triple borders and grid alignment.
 *
 * This style matches the aesthetic of pikcell's existing PixelCard component,
 * allowing CardPanel to render with the same pixel-perfect look.
 *
 * @example
 * ```typescript
 * import { CardPanel } from '@moxijs/core';
 * import { PixelCardStyle } from './styles/pixel-card-style';
 *
 * const style = new PixelCardStyle();
 * const card = new CardPanel({
 *   style,
 *   title: { text: 'Sprite Editor' },
 *   bodyWidth: 64,  // In pixels (style handles grid conversion internally)
 *   bodyHeight: 64,
 *   draggable: true
 * });
 * ```
 */
export class PixelCardStyle implements CardStyle {
  private config: Required<PixelCardStyleConfig>;

  constructor(config: PixelCardStyleConfig = {}) {
    this.config = {
      useTheme: config.useTheme ?? true,
      shadowOffset: config.shadowOffset ?? 1,
      showShadow: config.showShadow ?? true
    };
  }

  /**
   * Get colors from pikcell theme or use provided colors
   */
  private resolveColors(colors: CardThemeColors): PixelCardThemeColors {
    if (this.config.useTheme) {
      const theme = getTheme();
      return {
        background: colors.background ?? theme.cardBackground,
        border: colors.border ?? theme.cardBorder,
        titleBar: colors.titleBar ?? theme.cardTitleBar,
        titleText: colors.titleText ?? theme.text,
        footerBackground: colors.footerBackground ?? theme.cardTitleBar,
        accent: colors.accent ?? theme.accent,
        bevel: colors.bevel ?? theme.bevelColor,
        innerBorder: colors.innerBorder ?? theme.cardBorder,
        middleBorder: theme.buttonBackground,
        shadow: theme.cardBorder,
        shadowAlpha: 0.3
      };
    }
    return colors as PixelCardThemeColors;
  }

  drawBackground(
    graphics: PIXI.Graphics,
    width: number,
    height: number,
    colors: CardThemeColors
  ): void {
    const resolved = this.resolveColors(colors);
    const shadowOffset = this.config.showShadow ? px(this.config.shadowOffset) : 0;

    graphics.clear();
    graphics.roundPixels = true;

    // Drop shadow
    if (this.config.showShadow) {
      graphics.rect(shadowOffset, shadowOffset, width, height);
      graphics.fill({ color: resolved.shadow ?? resolved.border, alpha: resolved.shadowAlpha ?? 0.3 });
    }

    // Layer 1: Outer border
    graphics.rect(0, 0, width, height);
    graphics.fill({ color: resolved.border });

    // Layer 2: Middle border (using buttonBackground/middleBorder for subtle contrast)
    graphics.rect(
      px(BORDER.outer),
      px(BORDER.outer),
      width - px(BORDER.outer * 2),
      height - px(BORDER.outer * 2)
    );
    graphics.fill({ color: resolved.middleBorder ?? resolved.border });

    // Layer 3: Inner border
    graphics.rect(
      px(BORDER.outer + BORDER.middle),
      px(BORDER.outer + BORDER.middle),
      width - px((BORDER.outer + BORDER.middle) * 2),
      height - px((BORDER.outer + BORDER.middle) * 2)
    );
    graphics.fill({ color: resolved.innerBorder ?? resolved.border });

    // Layer 4: Content background
    graphics.rect(
      px(BORDER.total),
      px(BORDER.total),
      width - px(BORDER.total * 2),
      height - px(BORDER.total * 2)
    );
    graphics.fill({ color: resolved.background });
  }

  drawTitleBar(
    graphics: PIXI.Graphics,
    dims: CardSectionDimensions,
    colors: CardThemeColors
  ): void {
    const resolved = this.resolveColors(colors);

    graphics.roundPixels = true;
    graphics.rect(dims.x, dims.y, dims.width, dims.height);
    graphics.fill({ color: resolved.titleBar });
  }

  drawDragStrip(
    graphics: PIXI.Graphics,
    dims: CardSectionDimensions,
    colors: CardThemeColors
  ): void {
    const resolved = this.resolveColors(colors);

    graphics.roundPixels = true;

    // Background
    graphics.rect(dims.x, dims.y, dims.width, dims.height);
    graphics.fill({ color: resolved.titleBar });

    // Draw pixel-art grip pattern (small squares instead of dots)
    const dotSize = px(1);
    const dotSpacing = px(2);
    const numDots = 5;
    const totalWidth = (numDots - 1) * dotSpacing + dotSize;
    const startX = dims.x + (dims.width - totalWidth) / 2;
    const centerY = dims.y + (dims.height - dotSize) / 2;

    for (let i = 0; i < numDots; i++) {
      graphics.rect(
        Math.floor(startX + i * dotSpacing),
        Math.floor(centerY),
        dotSize,
        dotSize
      );
    }
    graphics.fill({ color: resolved.border, alpha: 0.5 });
  }

  drawFooter(
    graphics: PIXI.Graphics,
    dims: CardSectionDimensions,
    colors: CardThemeColors
  ): void {
    const resolved = this.resolveColors(colors);

    graphics.roundPixels = true;

    // Separator line at top
    graphics.rect(dims.x, dims.y, dims.width, px(1));
    graphics.fill({ color: resolved.border });

    // Footer background
    graphics.rect(dims.x, dims.y + px(1), dims.width, dims.height - px(1));
    graphics.fill({ color: resolved.footerBackground ?? resolved.titleBar });
  }

  getTitleBarHeight(hasTitle: boolean): number {
    if (!hasTitle) return 0;

    // Calculate based on font display size + padding (matches pixel-card.ts)
    const fontHeight = getFontDisplaySize();
    const verticalPadding = px(GRID.padding * 2);
    return Math.ceil(fontHeight + verticalPadding);
  }

  getDragStripHeight(): number {
    // Minimal strip height - enough to grab but unobtrusive
    return px(GRID.padding * 2);
  }

  getFooterHeight(): number {
    // Same as title bar for consistency
    const fontHeight = getFontDisplaySize();
    const verticalPadding = px(GRID.padding * 2);
    return Math.ceil(fontHeight + verticalPadding);
  }

  getBorderInsets(): EdgeInsets {
    // Triple border: outer + middle + inner
    const total = px(BORDER.total);
    return new EdgeInsets(total, total, total, total);
  }

  getContentPadding(): EdgeInsets {
    const padding = px(GRID.padding);
    return new EdgeInsets(padding, padding, padding, padding);
  }
}

/**
 * Create default pixel card colors from pikcell theme
 */
export function createPixelCardColors(): PixelCardThemeColors {
  const theme = getTheme();
  return {
    background: theme.cardBackground,
    border: theme.cardBorder,
    titleBar: theme.cardTitleBar,
    titleText: theme.text,
    footerBackground: theme.cardTitleBar,
    accent: theme.accent,
    bevel: theme.bevelColor,
    innerBorder: theme.cardBorder,
    middleBorder: theme.buttonBackground,
    shadow: theme.cardBorder,
    shadowAlpha: 0.3
  };
}
