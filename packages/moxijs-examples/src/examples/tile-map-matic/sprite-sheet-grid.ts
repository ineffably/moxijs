/**
 * Sprite Sheet Grid Visualization Library
 * Handles grid overlay rendering and cell highlighting
 */
import { Graphics, Container, Text } from 'pixi.js';
import { GridSettings } from './sprite-sheet-data';

export interface GridVisualizationOptions {
  gridColor?: number;
  gridAlpha?: number;
  gridWidth?: number;
  dashed?: boolean;
  dashLength?: number;
  gapLength?: number;
  showCellNumbers?: boolean;
  cellNumberColor?: number;
  cellNumberSize?: number;
}

/**
 * Create a grid overlay graphics object
 */
export function createGridOverlay(
  gridSettings: GridSettings,
  options: GridVisualizationOptions = {}
): Graphics {
  const {
    gridColor = 0x00ff00,
    gridAlpha = 0.7,
    gridWidth = 1,
    dashed = false,
    dashLength = 4,
    gapLength = 4
  } = options;

  const grid = new Graphics();

  if (dashed) {
    // Draw dashed vertical lines
    for (let col = 0; col <= gridSettings.columns; col++) {
      const x = col * gridSettings.cellWidth;
      const totalHeight = gridSettings.rows * gridSettings.cellHeight;
      let y = 0;
      while (y < totalHeight) {
        const endY = Math.min(y + dashLength, totalHeight);
        grid.moveTo(x, y);
        grid.lineTo(x, endY);
        grid.stroke({ color: gridColor, width: gridWidth, alpha: gridAlpha });
        y += dashLength + gapLength;
      }
    }

    // Draw dashed horizontal lines
    for (let row = 0; row <= gridSettings.rows; row++) {
      const y = row * gridSettings.cellHeight;
      const totalWidth = gridSettings.columns * gridSettings.cellWidth;
      let x = 0;
      while (x < totalWidth) {
        const endX = Math.min(x + dashLength, totalWidth);
        grid.moveTo(x, y);
        grid.lineTo(endX, y);
        grid.stroke({ color: gridColor, width: gridWidth, alpha: gridAlpha });
        x += dashLength + gapLength;
      }
    }
  } else {
    // Draw solid vertical lines
    for (let col = 0; col <= gridSettings.columns; col++) {
      const x = col * gridSettings.cellWidth;
      grid.moveTo(x, 0);
      grid.lineTo(x, gridSettings.rows * gridSettings.cellHeight);
      grid.stroke({ color: gridColor, width: gridWidth, alpha: gridAlpha });
    }

    // Draw solid horizontal lines
    for (let row = 0; row <= gridSettings.rows; row++) {
      const y = row * gridSettings.cellHeight;
      grid.moveTo(0, y);
      grid.lineTo(gridSettings.columns * gridSettings.cellWidth, y);
      grid.stroke({ color: gridColor, width: gridWidth, alpha: gridAlpha });
    }
  }

  return grid;
}

/**
 * Create cell number labels for the grid
 */
export function createCellNumbers(
  gridSettings: GridSettings,
  options: GridVisualizationOptions = {}
): Container {
  const {
    showCellNumbers = true,
    cellNumberColor = 0xffff00,
    cellNumberSize = 10
  } = options;

  const container = new Container();

  if (!showCellNumbers) return container;

  let cellIndex = 0;

  for (let row = 0; row < gridSettings.rows; row++) {
    for (let col = 0; col < gridSettings.columns; col++) {
      const label = new Text({
        text: cellIndex.toString(),
        style: {
          fontFamily: 'Arial, sans-serif',
          fontSize: cellNumberSize,
          fill: cellNumberColor
        }
      });
      label.x = col * gridSettings.cellWidth + 2;
      label.y = row * gridSettings.cellHeight + 2;
      container.addChild(label);
      cellIndex++;
    }
  }

  return container;
}

/**
 * Create a cell highlight overlay
 */
export function createCellHighlight(
  col: number,
  row: number,
  cellWidth: number,
  cellHeight: number,
  color: number = 0xffff00,
  alpha: number = 0.3
): Graphics {
  const highlight = new Graphics();
  highlight.rect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
  highlight.fill({ color, alpha });
  highlight.stroke({ color, width: 2, alpha: 1 });
  return highlight;
}

/**
 * Get cell coordinates from pixel position
 */
export function pixelToCell(
  x: number,
  y: number,
  cellWidth: number,
  cellHeight: number
): { col: number; row: number } {
  return {
    col: Math.floor(x / cellWidth),
    row: Math.floor(y / cellHeight)
  };
}

/**
 * Get cell index from grid position
 */
export function cellToIndex(
  col: number,
  row: number,
  columns: number
): number {
  return row * columns + col;
}
