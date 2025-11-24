/**
 * Sprite card - displays and allows editing of a single 8x8 sprite
 */
import * as PIXI from 'pixi.js';
import { PixelCard, px, GRID } from './pixel-card';
import { SpriteController } from '../controllers/sprite-controller';

export interface SpriteCardOptions {
  x: number;
  y: number;
  renderer: PIXI.Renderer;
  spriteController: SpriteController;
  onPixelClick?: (x: number, y: number) => void;
  onFocus?: () => void;
}

export interface SpriteCardResult {
  card: PixelCard;
  controller: SpriteController;
  redraw: () => void;
}

/**
 * Creates a sprite card for editing a single 8x8 sprite
 */
export function createSpriteCard(options: SpriteCardOptions): SpriteCardResult {
  const { x, y, renderer, spriteController, onPixelClick, onFocus } = options;

  // Get scaled dimensions
  const dims = spriteController.getScaledDimensions();
  const contentWidth = Math.ceil(dims.width / px(1));
  const contentHeight = Math.ceil(dims.height / px(1));

  // Create the card
  const card = new PixelCard({
    title: `Sprite (${spriteController.getScale()}x)`,
    x,
    y,
    contentWidth,
    contentHeight,
    renderer,
    minContentSize: true,
    clipContent: true, // Enable clipping for sprite canvas (overflow: hidden)
    onResize: (width, height) => {
      // Re-render sprite when card resizes
      drawSprite();
    },
    onFocus
  });

  const contentContainer = card.getContentContainer();

  // Container for the sprite
  const spriteContainer = new PIXI.Container();
  contentContainer.addChild(spriteContainer);

  // Draw the sprite
  function drawSprite() {
    spriteContainer.removeChildren();
    spriteController.render(spriteContainer);
  }

  // Handle clicks for drawing
  if (onPixelClick) {
    spriteContainer.eventMode = 'static';
    spriteContainer.cursor = 'crosshair';

    let isDrawing = false;
    let lastPixelX = -1;
    let lastPixelY = -1;

    spriteContainer.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
      isDrawing = true;
      const local = e.getLocalPosition(spriteContainer);
      const pixel = spriteController.screenToPixel(local.x, local.y);
      if (pixel) {
        lastPixelX = pixel.x;
        lastPixelY = pixel.y;
        onPixelClick(pixel.x, pixel.y);
      }
    });

    spriteContainer.on('pointermove', (e: PIXI.FederatedPointerEvent) => {
      if (isDrawing) {
        const local = e.getLocalPosition(spriteContainer);
        const pixel = spriteController.screenToPixel(local.x, local.y);
        if (pixel && (pixel.x !== lastPixelX || pixel.y !== lastPixelY)) {
          lastPixelX = pixel.x;
          lastPixelY = pixel.y;
          onPixelClick(pixel.x, pixel.y);
        }
      }
    });

    spriteContainer.on('pointerup', () => {
      isDrawing = false;
      lastPixelX = -1;
      lastPixelY = -1;
    });

    spriteContainer.on('pointerupoutside', () => {
      isDrawing = false;
      lastPixelX = -1;
      lastPixelY = -1;
    });
  }

  // Initial draw
  drawSprite();

  return {
    card,
    controller: spriteController,
    redraw: drawSprite
  };
}
