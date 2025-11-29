/**
 * Scale Card - GRID scale testing controls
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { createPixelButton, PixelButtonResult } from '../components/pixel-button';
import { GRID, px } from 'moxijs';
import { CardResult } from '../interfaces/components';

export interface ScaleCardOptions {
  x: number;
  y: number;
  renderer: PIXI.Renderer;
  onScaleChange?: (scale: number) => void;
}

export interface ScaleCardResult extends CardResult {
}

/**
 * Creates a scale control card for testing GRID scaling
 */
export function createScaleCard(options: ScaleCardOptions): ScaleCardResult {
  const { x, y, renderer, onScaleChange } = options;

  // Track created buttons for cleanup
  const createdButtons: PixelButtonResult[] = [];

  const buttonHeight = 12; // Grid units
  const buttonSpacing = px(1);

  // Calculate content size
  const contentWidth = 8; // Enough for label + buttons
  const contentHeight = buttonHeight;

  // Create the card
  const card = new PixelCard({
    title: 'Scale',
    x,
    y,
    contentWidth,
    contentHeight,
    renderer,
    minContentSize: true,
    onRefresh: () => {
      drawContent();
    }
  });

  const contentContainer = card.getContentContainer();

  function drawContent() {
    // Cleanup old buttons
    createdButtons.forEach(btn => btn.destroy());
    createdButtons.length = 0;
    contentContainer.removeChildren();

    let currentX = 0;

    // Scale label
    const scaleLabel = new PIXI.BitmapText({
      text: 'Scale:',
      style: {
        fontFamily: 'PixelOperator8Bitmap',
        fontSize: 64,
        fill: 0x666666,
      }
    });
    scaleLabel.roundPixels = true;
    scaleLabel.scale.set(GRID.fontScale);
    scaleLabel.position.set(currentX, px(3));
    contentContainer.addChild(scaleLabel);
    currentX += scaleLabel.width + buttonSpacing;

    // Scale buttons (1, 2, 3, 4)
    [1, 2, 3, 4].forEach(scale => {
      const scaleButton = createPixelButton({
        height: buttonHeight,
        label: `${scale}`,
        selectionMode: 'press',
        actionMode: 'click',
        onClick: () => {
          if (onScaleChange) {
            onScaleChange(scale);
          }
        }
      });
      createdButtons.push(scaleButton);
      scaleButton.container.position.set(currentX, 0);
      contentContainer.addChild(scaleButton.container);
      currentX += scaleButton.container.width + buttonSpacing;
    });
  }

  // Initial draw
  drawContent();

  // Update minimum content size based on actual content
  card.updateMinContentSize();

  return {
    card,
    container: card.container,
    destroy: () => {
      createdButtons.forEach(btn => btn.destroy());
      createdButtons.length = 0;
      card.container.destroy({ children: true });
    }
  };
}
