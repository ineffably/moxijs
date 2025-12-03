/**
 * Helper to create buttons with SVG icons
 */
import * as PIXI from 'pixi.js';
import { createPixelButton, PixelButtonOptions, PixelButtonResult } from '../components/pixel-button';
import { px } from '@moxijs/ui';
import { svgToTexture } from '@moxijs/core';

// Re-export icons from consolidated config for backward compatibility
export { TOOL_ICONS, SPT_ICONS, ACTION_ICONS } from '../config/icons';

export interface SVGIconButtonOptions extends Omit<PixelButtonOptions, 'icon'> {
  svgString: string;
  iconColor?: number;
}

/**
 * Creates a pixel button with an SVG icon
 * The icon will be rendered at the proper size accounting for the button dimensions
 * Returns the PixelButtonResult for consistent API
 */
export async function createSVGIconButton(options: SVGIconButtonOptions): Promise<PixelButtonResult> {
  const { svgString, iconColor = 0x000000, size, width, height, ...buttonOptions } = options;

  // Determine button dimensions
  const buttonWidth = width ?? size ?? 10;
  const buttonHeight = height ?? size ?? 10;

  // Icon should fill most of the button (leaving some padding)
  // Button dimensions are in grid units, convert to pixels and account for padding
  const padding = px(3); // 3 grid units of padding on each side (was 2, +1 for +4px total)
  const iconWidthPx = px(buttonWidth) - padding * 2;
  const iconHeightPx = px(buttonHeight) - padding * 2;

  // Create texture from SVG
  const texture = await svgToTexture({
    svgString,
    width: iconWidthPx,
    height: iconHeightPx,
    color: iconColor
  });

  // Create sprite from texture
  const iconSprite = new PIXI.Sprite(texture);
  // Don't set anchor or position - let pixel-button handle it

  // Create button with icon
  return createPixelButton({
    ...buttonOptions,
    size,
    width,
    height,
    icon: iconSprite
  });
}
