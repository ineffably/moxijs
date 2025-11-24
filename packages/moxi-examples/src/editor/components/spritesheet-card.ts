/**
 * Sprite sheet card component for displaying and editing sprite sheets
 */
import * as PIXI from 'pixi.js';
import { PixelCard, GRID, px } from './pixel-card';
import { SpriteSheetController, SpriteSheetConfig, SpriteSheetType } from '../controllers/sprite-sheet-controller';
import { createCheckerboardTexture } from '../utilities/texture-utils';

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
  onCellHover?: (cellX: number, cellY: number) => void;
  onCellClick?: (cellX: number, cellY: number) => void;
  onFocus?: () => void;
}

export interface SpriteSheetCardResult {
  card: PixelCard;
  controller: SpriteSheetController;
}

/**
 * Creates a sprite sheet card with a canvas for editing
 */
export function createSpriteSheetCard(options: SpriteSheetCardOptions): SpriteSheetCardResult {
  const { config, x, y, renderer, showGrid = false, onCellHover, onCellClick, onFocus } = options;

  let card: PixelCard;
  let contentContainer: PIXI.Container;

  // Create sprite sheet controller
  const controller = new SpriteSheetController({
    config,
    renderer,
    showGrid,
    onScaleChange: (newScale) => {
      // Update card title when scale changes
      const cell = controller.getSelectedCell();
      const cellText = cell ? `${cell.x},${cell.y}` : 'grid-cell';
      card.setTitle(`${cellText} | ${newScale.toFixed(2)}x`);
      // Re-render the sprite sheet
      controller.render(contentContainer);
    },
    onCellHover,
    onCellClick: (cellX, cellY) => {
      // Update title when cell is selected
      card.setTitle(`${cellX},${cellY} | ${controller.getScale().toFixed(2)}x`);
      // Call original onCellClick if provided
      if (onCellClick) {
        onCellClick(cellX, cellY);
      }
    }
  });

  // Get initial scaled dimensions
  const { width: scaledWidth, height: scaledHeight } = controller.getScaledDimensions();

  // Convert pixel dimensions to grid units
  const contentWidth = Math.ceil(scaledWidth / px(1));
  const contentHeight = Math.ceil(scaledHeight / px(1));

  // Default position to bottom right (minimap style) if not specified
  const cardPadding = px(GRID.padding * 2) + px(6); // padding + border
  const titleBarHeight = 24; // Title bar height in pixels
  const margin = 20; // Margin from edges
  const defaultX = x ?? (renderer.width - px(contentWidth) - cardPadding - margin);
  const defaultY = y ?? (renderer.height - px(contentHeight) - cardPadding - titleBarHeight - margin);

  card = new PixelCard({
    title: `grid-cell | ${controller.getScale().toFixed(2)}x`,
    x: defaultX,
    y: defaultY,
    contentWidth,
    contentHeight,
    renderer,
    clipContent: true, // Enable clipping for sprite sheet (overflow: hidden)
    onFocus
  });

  contentContainer = card.getContentContainer();

  // Create tiled grid background using utility
  const gridTexture = createCheckerboardTexture(16, 0x2a2a3a, 0x353545);
  const gridBackground = new PIXI.TilingSprite({
    texture: gridTexture,
    width: px(contentWidth),
    height: px(contentHeight)
  });
  gridBackground.tileScale.set(1, 1);
  contentContainer.addChildAt(gridBackground, 0); // Add as first child (behind everything)

  // Initial render - controller now handles cell selection/highlighting
  controller.render(contentContainer);

  return { card, controller };
}
