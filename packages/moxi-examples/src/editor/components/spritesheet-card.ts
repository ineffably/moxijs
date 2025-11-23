/**
 * Sprite sheet card component for displaying and editing sprite sheets
 */
import * as PIXI from 'pixi.js';
import { PixelCard, GRID, px } from './pixel-card';
import { SpriteSheetController, SpriteSheetConfig, SpriteSheetType } from '../controllers/sprite-sheet-controller';

export { SpriteSheetType, SpriteSheetConfig };

// Sprite sheet configurations
export const SPRITESHEET_CONFIGS: Record<SpriteSheetType, SpriteSheetConfig> = {
  'PICO-8': {
    type: 'PICO-8',
    width: 128,
    height: 128,
    palette: [
      0x000000, 0x1d2b53, 0x7e2553, 0x008751,
      0xab5236, 0x5f574f, 0xc2c3c7, 0xfff1e8,
      0xff004d, 0xffa300, 0xffec27, 0x00e436,
      0x29adff, 0x83769c, 0xff77a8, 0xffccaa
    ]
  },
  'TIC-80': {
    type: 'TIC-80',
    width: 256,
    height: 256,
    palette: [
      0x140c1c, 0x442434, 0x30346d, 0x4e4a4e,
      0x854c30, 0x346524, 0xd04648, 0x757161,
      0x597dce, 0xd27d2c, 0x8595a1, 0x6daa2c,
      0xd2aa99, 0x6dc2ca, 0xdad45e, 0xdeeed6
    ]
  }
};

export interface SpriteSheetCardOptions {
  config: SpriteSheetConfig;
  x?: number;
  y?: number;
  renderer: PIXI.Renderer;
  showGrid?: boolean;
}

export interface SpriteSheetCardResult {
  card: PixelCard;
  controller: SpriteSheetController;
}

/**
 * Creates a sprite sheet card with a canvas for editing
 */
export function createSpriteSheetCard(options: SpriteSheetCardOptions): SpriteSheetCardResult {
  const { config, x, y, renderer, showGrid = false } = options;

  let card: PixelCard;
  let contentContainer: PIXI.Container;

  // Create sprite sheet controller
  const controller = new SpriteSheetController({
    config,
    renderer,
    showGrid,
    onScaleChange: (newScale) => {
      // Update card title when scale changes
      card.setTitle(`Sprite Sheet - ${config.type} (${newScale.toFixed(2)}x)`);
      // Re-render the sprite sheet
      controller.render(contentContainer);
    }
  });

  // Get initial scaled dimensions
  const { width: scaledWidth, height: scaledHeight } = controller.getScaledDimensions();

  // Convert pixel dimensions to grid units
  const contentWidth = Math.ceil(scaledWidth / px(1));
  const contentHeight = Math.ceil(scaledHeight / px(1));

  // Default position to center of screen if not specified
  const cardPadding = px(GRID.padding * 2) + px(6); // padding + border
  const titleBarHeight = 24; // Title bar height in pixels
  const defaultX = x ?? (renderer.width - px(contentWidth) - cardPadding) / 2;
  const defaultY = y ?? (renderer.height - px(contentHeight) - cardPadding - titleBarHeight) / 2;

  card = new PixelCard({
    title: `Sprite Sheet - ${config.type} (${controller.getScale().toFixed(2)}x)`,
    x: defaultX,
    y: defaultY,
    contentWidth,
    contentHeight,
    renderer,
    backgroundColor: 0x2f485c, // Dark blue background
    clipContent: true // Enable clipping for sprite sheet (overflow: hidden)
  });

  contentContainer = card.getContentContainer();

  // Initial render
  controller.render(contentContainer);

  return { card, controller };
}
