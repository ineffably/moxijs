/**
 * Scale Card - GRID scale testing controls
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { createPixelButton } from '../components/pixel-button';
import { GRID, px, asBitmapText } from '@moxijs/core';
import { CardResult } from '../interfaces/components';
import { createManagedCard } from '../utilities/managed-card';
import { layoutButtonRow } from '../utilities/button-layout';
import { SCALE_CARD_CONFIG } from '../config/card-configs';
import { getTheme } from '../theming/theme';

/** Available scale options */
const SCALE_OPTIONS = [1, 2, 3, 4] as const;

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

  const buttonHeight = 12;
  const buttonSpacing = SCALE_CARD_CONFIG.buttonSpacing;

  // Create the managed card
  const managed = createManagedCard({
    title: 'Scale',
    x,
    y,
    contentWidth: 8, // Will be updated after content drawn
    contentHeight: buttonHeight,
    renderer,
    minContentSize: true,
    onRefresh: () => drawContent()
  });

  const { card, contentContainer } = managed;

  function drawContent() {
    managed.clearChildren();
    contentContainer.removeChildren();

    // Scale label
    const theme = getTheme();
    const scaleLabel = asBitmapText(
      { text: 'Scale:', style: { fontFamily: 'PixelOperator8Bitmap', fontSize: 64, fill: theme.text }, pixelPerfect: true },
      { x: 0, y: px(3), scale: GRID.fontScale }
    );
    scaleLabel.tint = theme.text;
    contentContainer.addChild(scaleLabel);

    // Create scale buttons
    const buttons = SCALE_OPTIONS.map(scale => {
      const btn = createPixelButton({
        height: buttonHeight,
        label: `${scale}`,
        selectionMode: 'press',
        actionMode: 'click',
        onClick: () => onScaleChange?.(scale)
      });
      managed.trackChild(btn);
      contentContainer.addChild(btn.container);
      return btn;
    });

    // Layout buttons in a row after the label
    layoutButtonRow({
      items: buttons,
      spacing: buttonSpacing,
      startX: Math.ceil((scaleLabel.width + px(buttonSpacing)) / px(1))
    });
  }

  // Initial draw
  drawContent();
  card.updateMinContentSize();

  return {
    card,
    container: card.container,
    destroy: managed.destroy
  };
}
