/**
 * Sprite sheet card component for displaying and editing sprite sheets
 * 
 * ⚠️ IMPORTANT: This component bridges pixel-based sprite sheet content and grid-based UI
 * - Sprite sheet dimensions are in ACTUAL PIXELS (128x128, 256x256, etc.)
 * - Card UI wrapper uses GRID UNITS (converted from pixels for content size)
 * - The sprite sheet content itself is rendered at pixel scale, not grid scale
 * 
 * @see ../utilities/README.md for grid system documentation
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from './pixel-card';
import { GRID, px } from 'moxi-kit';
import { SpriteSheetController, SpriteSheetConfig, SpriteSheetType } from '../controllers/sprite-sheet-controller';
import { createCheckerboardTexture } from '../utilities/texture-utils';
import { PICO8_PALETTE, TIC80_PALETTE } from '../theming/palettes';
import palettesConfig from '../config/palettes.json';

export { SpriteSheetType, SpriteSheetConfig };

// Sprite sheet configurations - now uses centralized palette data
export const SPRITESHEET_CONFIGS: Record<SpriteSheetType, SpriteSheetConfig> = {
  'PICO-8': {
    type: 'PICO-8',
    width: palettesConfig.spriteSheets['PICO-8'].width,
    height: palettesConfig.spriteSheets['PICO-8'].height,
    palette: PICO8_PALETTE
  },
  'TIC-80': {
    type: 'TIC-80',
    width: palettesConfig.spriteSheets['TIC-80'].width,
    height: palettesConfig.spriteSheets['TIC-80'].height,
    palette: TIC80_PALETTE
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
  container: PIXI.Container;
  controller: SpriteSheetController;
  destroy: () => void;
}

/**
 * Creates a sprite sheet card with a canvas for editing
 */
export function createSpriteSheetCard(options: SpriteSheetCardOptions): SpriteSheetCardResult {
  const { config, x, y, renderer, showGrid = false, onCellHover, onCellClick, onFocus } = options;

  let card: PixelCard;
  let contentContainer: PIXI.Container;
  let gridBackground: PIXI.TilingSprite;

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
    onFocus,
    onResize: (width, height) => {
      // Update tiled background size when card is resized
      if (gridBackground) {
        gridBackground.width = px(width);
        gridBackground.height = px(height);
      }
    }
  });

  contentContainer = card.getContentContainer();

  // Create tiled grid background using utility
  const gridTexture = createCheckerboardTexture(16, 0x2a2a3a, 0x353545);
  gridBackground = new PIXI.TilingSprite({
    texture: gridTexture,
    width: px(contentWidth),
    height: px(contentHeight)
  });
  gridBackground.tileScale.set(1, 1);
  contentContainer.addChildAt(gridBackground, 0); // Add as first child (behind everything)

  // Initial render - controller now handles cell selection/highlighting
  controller.render(contentContainer);

  return {
    card,
    container: card.container,
    controller,
    destroy: () => {
      controller.destroy();
      gridBackground.destroy();
      card.container.destroy({ children: true });
    }
  };
}
