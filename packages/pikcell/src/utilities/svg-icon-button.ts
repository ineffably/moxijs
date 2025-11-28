/**
 * Helper to create buttons with SVG icons
 */
import * as PIXI from 'pixi.js';
import { createPixelButton, PixelButtonOptions, PixelButtonResult } from '../components/pixel-button';
import { svgToTexture, px } from 'moxi-kit';

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

// Example SVG icons
export const SVG_ICONS = {
  // Zoom cursor icon
  ZOOM_CURSOR: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M18 2h-2v2h-2v2h-2v2h-2v2H8v2H6v2H4v2H2v6h6v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2V8h2V6h-2V4h-2V2zm0 8h-2v2h-2v2h-2v2h-2v2H8v-2H6v-2h2v-2h2v-2h2V8h2V6h2v2h2v2zM6 16H4v4h4v-2H6v-2z" fill="currentColor"/>
  </svg>`,

  // Pan/Hand tool icon
  PAN: `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M13 0h-2v2H9v2H7v2h2V4h2v7H4V9h2V7H4v2H2v2H0v2h2v2h2v2h2v-2H4v-2h7v7H9v-2H7v2h2v2h2v2h2v-2h2v-2h2v-2h-2v2h-2v-7h7v2h-2v2h2v-2h2v-2h2v-2h-2V9h-2V7h-2v2h2v2h-7V4h2v2h2V4h-2V2h-2V0z" fill="currentColor"/>
  </svg>`,
};
