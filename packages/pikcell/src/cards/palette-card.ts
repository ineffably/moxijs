/**
 * Palette Card - Color palette selector
 */
import * as PIXI from 'pixi.js';
import { createPixelButton } from '../components/pixel-button';
import { GRID, px } from '@moxijs/core';
import { createCardZoomHandler } from '../utilities/card-zoom-handler';
import { createManagedCard } from '../utilities/managed-card';
import { CardResult } from '../interfaces/components';
import { PALETTE_CARD_CONFIG } from '../config/card-configs';

export interface PaletteCardOptions {
  x: number;
  y: number;
  renderer: PIXI.Renderer;
  palette: number[];
  selectedColorIndex?: number;
  onColorSelect?: (colorIndex: number, color: number) => void;
}

export interface PaletteCardResult extends CardResult {
  getSelectedColorIndex: () => number;
  setSelectedColorIndex: (index: number) => void;
  setPalette: (palette: number[]) => void;
}

/**
 * Creates a pixel-perfect palette card
 */
export function createPaletteCard(options: PaletteCardOptions): PaletteCardResult {
  const { x, y, renderer, palette, onColorSelect } = options;

  // State
  let selectedColorIndex = options.selectedColorIndex ?? 0;
  let currentPalette = [...palette];
  let colorsPerRow = PALETTE_CARD_CONFIG.defaultColorsPerRow;
  let rows = PALETTE_CARD_CONFIG.defaultRows;
  let swatchSize = PALETTE_CARD_CONFIG.defaultSwatchSize;

  // Calculate initial content size
  const contentWidth = colorsPerRow * swatchSize + (colorsPerRow - 1) * GRID.gap;
  const contentHeight = rows * swatchSize + (rows - 1) * GRID.gap;

  // Create the managed card
  const managed = createManagedCard({
    title: 'Palette',
    x,
    y,
    contentWidth,
    contentHeight,
    renderer,
    onResize: (newWidth, newHeight) => {
      // Calculate new swatch size to fit the available space while showing all colors
      const totalColors = currentPalette.length;

      // Try different column layouts and pick the best fitting size
      let bestSize = 2;
      let bestCols = 1;
      let bestRows = totalColors;

      for (let cols = 1; cols <= totalColors; cols++) {
        const rowsNeeded = Math.ceil(totalColors / cols);

        // Calculate max swatch size that fits in this layout
        const maxWidthPerSwatch = Math.floor((newWidth - (cols - 1) * GRID.gap) / cols);
        const maxHeightPerSwatch = Math.floor((newHeight - (rowsNeeded - 1) * GRID.gap) / rowsNeeded);
        const maxSize = Math.min(maxWidthPerSwatch, maxHeightPerSwatch);

        if (maxSize > bestSize) {
          bestSize = maxSize;
          bestCols = cols;
          bestRows = rowsNeeded;
        }
      }

      // Update layout
      swatchSize = Math.max(PALETTE_CARD_CONFIG.minSwatchSize, Math.min(PALETTE_CARD_CONFIG.maxSwatchSize, bestSize));
      colorsPerRow = bestCols;
      rows = bestRows;
      redrawContent();
    },
    onRefresh: () => {
      redrawContent();
    }
  });

  const { card, contentContainer } = managed;

  // Redraw function - only updates content, not the whole card
  function redrawContent() {
    // Cleanup old swatches using managed card
    managed.clearChildren();
    contentContainer.removeChildren();

    const totalSwatches = colorsPerRow * rows;

    // Draw color swatches
    for (let i = 0; i < Math.min(totalSwatches, currentPalette.length); i++) {
      const color = currentPalette[i];
      const col = i % colorsPerRow;
      const row = Math.floor(i / colorsPerRow);

      // Position relative to content container
      const swatchX = px(col * (swatchSize + GRID.gap));
      const swatchY = px(row * (swatchSize + GRID.gap));

      const swatch = createPixelButton({
        size: swatchSize,
        selected: i === selectedColorIndex,
        backgroundColor: color,
        selectionMode: 'highlight',
        actionMode: 'toggle',
        onClick: () => {
          selectedColorIndex = i;
          console.log(`Selected color #${i}: #${color.toString(16).padStart(6, '0')}`);
          redrawContent();
          if (onColorSelect) {
            onColorSelect(i, color);
          }
        }
      });
      managed.trackChild(swatch);

      swatch.container.position.set(swatchX, swatchY);
      contentContainer.addChild(swatch.container);
    }
  }

  // Mouse wheel zoom for swatch size
  const wheelHandler = createCardZoomHandler(renderer, card, (delta) => {
    swatchSize = Math.max(PALETTE_CARD_CONFIG.minSwatchSize, Math.min(PALETTE_CARD_CONFIG.maxSwatchSize, swatchSize + delta));

    // Update card content size to match new swatch size
    const newContentWidth = colorsPerRow * swatchSize + (colorsPerRow - 1) * GRID.gap;
    const newContentHeight = rows * swatchSize + (rows - 1) * GRID.gap;
    card.setContentSize(newContentWidth, newContentHeight);

    redrawContent();
  });

  if (typeof window !== 'undefined') {
    managed.addEventListenerTracked(window, 'wheel', wheelHandler, { passive: false });
  }

  // Initial draw
  redrawContent();

  // Update minimum content size to match actual content
  card.updateMinContentSize();

  return {
    card,
    container: card.container,
    getSelectedColorIndex: () => selectedColorIndex,
    setSelectedColorIndex: (index: number) => {
      selectedColorIndex = index;
      redrawContent();
    },
    setPalette: (newPalette: number[]) => {
      currentPalette = [...newPalette];
      redrawContent();
    },
    destroy: managed.destroy
  };
}
