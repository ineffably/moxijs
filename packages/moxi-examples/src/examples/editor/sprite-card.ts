/**
 * Sprite card component for displaying and editing sprite sheets
 */
import * as PIXI from 'pixi.js';
import { PixelCard, GRID, px } from './pixel-card';

export type SpriteSheetType = 'PICO-8' | 'TIC-80';

export interface SpriteSheetConfig {
  type: SpriteSheetType;
  width: number;   // In pixels
  height: number;  // In pixels
  palette: number[]; // Array of color values
}

// Sprite sheet configurations
export const SPRITE_CONFIGS: Record<SpriteSheetType, SpriteSheetConfig> = {
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

export interface SpriteCardOptions {
  config: SpriteSheetConfig;
  x?: number;
  y?: number;
  renderer: PIXI.Renderer;
}

/**
 * Creates a sprite card with a canvas for editing
 */
export function createSpriteCard(options: SpriteCardOptions): PixelCard {
  const { config, x, y, renderer } = options;

  // Calculate initial scale to fit nicely (50% of viewport height)
  const targetHeight = renderer.height * 0.5;
  let currentScale = Math.max(1, Math.floor(targetHeight / config.height));

  // Scale the sprite sheet dimensions
  let scaledWidth = config.width * currentScale;
  let scaledHeight = config.height * currentScale;

  // Convert pixel dimensions to grid units
  let contentWidth = Math.ceil(scaledWidth / px(1));
  let contentHeight = Math.ceil(scaledHeight / px(1));

  // Default position to center of screen if not specified
  const defaultX = x ?? (renderer.width - px(contentWidth) - px(GRID.padding * 2) - px(6)) / 2;
  const defaultY = y ?? (renderer.height - px(contentHeight) - px(GRID.padding * 2) - px(6) - 24) / 2;

  const card = new PixelCard({
    title: `Sprite Sheet - ${config.type} (${currentScale}x)`,
    x: defaultX,
    y: defaultY,
    contentWidth,
    contentHeight,
    renderer,
    backgroundColor: 0xffffff // White background for sprite editing
  });

  const contentContainer = card.getContentContainer();

  function drawSpriteSheet() {
    contentContainer.removeChildren();

    // Create sprite sheet canvas
    const canvas = new PIXI.Graphics();
    canvas.roundPixels = true;

    // Draw scaled sprite sheet (each pixel becomes currentScale x currentScale)
    for (let y = 0; y < config.height; y++) {
      for (let x = 0; x < config.width; x++) {
        canvas.rect(x * currentScale, y * currentScale, currentScale, currentScale);
        canvas.fill({ color: config.palette[0] });
      }
    }

    contentContainer.addChild(canvas);
  }

  // Mouse wheel zoom for sprite scale
  const handleWheel = (e: WheelEvent) => {
    const canvas = renderer.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const cardBounds = card.container.getBounds();

    if (mouseX >= cardBounds.x && mouseX <= cardBounds.x + cardBounds.width &&
        mouseY >= cardBounds.y && mouseY <= cardBounds.y + cardBounds.height) {
      e.preventDefault();

      const delta = e.deltaY > 0 ? -1 : 1;
      const newScale = Math.max(1, Math.min(16, currentScale + delta));

      if (newScale !== currentScale) {
        currentScale = newScale;

        // Update card title to show new scale
        card.setTitle(`Sprite Sheet - ${config.type} (${currentScale}x)`);

        // Redraw sprite sheet at new scale (card size stays the same)
        drawSpriteSheet();
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('wheel', handleWheel, { passive: false });

    card.container.on('destroyed', () => {
      window.removeEventListener('wheel', handleWheel);
    });
  }

  // Initial draw
  drawSpriteSheet();

  return card;
}
