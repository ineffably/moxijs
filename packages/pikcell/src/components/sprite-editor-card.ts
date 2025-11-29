/**
 * Sprite editor card - displays and allows editing of a single 8x8 sprite
 * 
 * ⚠️ IMPORTANT: This component bridges pixel-based sprite content and grid-based UI
 * - Sprite dimensions are in ACTUAL PIXELS (8x8 pixels)
 * - Card UI wrapper uses GRID UNITS (converted from pixels for content size)
 * - The sprite content itself is rendered at pixel scale, not grid scale
 * 
 * @see ../utilities/README.md for grid system documentation
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from './pixel-card';
import { px, GRID } from '@moxijs/core';
import { SpriteController } from '../controllers/sprite-controller';
import { CardResult, ControllableComponent, RefreshableComponent } from '../interfaces/components';

export interface SpriteEditorCardOptions {
  x: number;
  y: number;
  renderer: PIXI.Renderer;
  spriteController: SpriteController;
  onPixelClick?: (x: number, y: number) => void;
  onFocus?: () => void;
}

export interface SpriteEditorCardResult extends CardResult, ControllableComponent<SpriteController>, RefreshableComponent {
}

/**
 * Creates a sprite editor card for editing a single 8x8 sprite
 */
export function createSpriteEditorCard(options: SpriteEditorCardOptions): SpriteEditorCardResult {
  const { x, y, renderer, spriteController, onPixelClick, onFocus } = options;

  // Get scaled dimensions
  const dims = spriteController.getScaledDimensions();
  const contentWidth = Math.ceil(dims.width / px(1));
  const contentHeight = Math.ceil(dims.height / px(1));

  // Create the card
  const card = new PixelCard({
    title: `(${spriteController.getScale()}x)`,
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

    const drawFalse = () => {
      isDrawing = false;
      lastPixelX = -1;
      lastPixelY = -1;
    }

    spriteContainer.on('pointerup', drawFalse);
    spriteContainer.on('pointerupoutside', drawFalse);
  }

  // Initial draw
  drawSprite();

  return {
    card,
    container: card.container,
    controller: spriteController,
    redraw: drawSprite,
    destroy: () => {
      spriteContainer.removeAllListeners();
      card.container.destroy({ children: true });
    }
  };
}

