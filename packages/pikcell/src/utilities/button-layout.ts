/**
 * Button Layout Utilities
 *
 * Helpers for positioning buttons in common layouts.
 * All dimensions are in grid units unless otherwise noted.
 */
import * as PIXI from 'pixi.js';
import { px, GRID } from '@moxijs/ui';

/**
 * Interface for items that can be positioned
 */
export interface Positionable {
  container: PIXI.Container;
}

/**
 * Result from layout functions
 */
export interface LayoutResult {
  /** Total width of the layout in grid units */
  width: number;
  /** Total height of the layout in grid units */
  height: number;
}

/**
 * Options for row layout
 */
export interface ButtonRowOptions {
  /** Items to arrange in a row */
  items: Positionable[];
  /** Spacing between items in grid units (default: GRID.gap) */
  spacing?: number;
  /** Vertical alignment: 'top' | 'center' | 'bottom' (default: 'top') */
  align?: 'top' | 'center' | 'bottom';
  /** Starting X position in grid units (default: 0) */
  startX?: number;
  /** Starting Y position in grid units (default: 0) */
  startY?: number;
}

/**
 * Options for column layout
 */
export interface ButtonColumnOptions {
  /** Items to arrange in a column */
  items: Positionable[];
  /** Spacing between items in grid units (default: GRID.gap) */
  spacing?: number;
  /** Horizontal alignment: 'left' | 'center' | 'right' (default: 'left') */
  align?: 'left' | 'center' | 'right';
  /** Starting X position in grid units (default: 0) */
  startX?: number;
  /** Starting Y position in grid units (default: 0) */
  startY?: number;
}

/**
 * Options for grid layout
 */
export interface ButtonGridOptions {
  /** Items to arrange in a grid */
  items: Positionable[];
  /** Number of columns */
  columns: number;
  /** Horizontal spacing between items in grid units (default: GRID.gap) */
  spacingX?: number;
  /** Vertical spacing between items in grid units (default: GRID.gap) */
  spacingY?: number;
  /** Starting X position in grid units (default: 0) */
  startX?: number;
  /** Starting Y position in grid units (default: 0) */
  startY?: number;
  /** Uniform cell width in grid units (optional - uses item width if not specified) */
  cellWidth?: number;
  /** Uniform cell height in grid units (optional - uses item height if not specified) */
  cellHeight?: number;
}

/**
 * Get item dimensions in grid units
 */
function getItemDimensions(item: Positionable): { width: number; height: number } {
  const bounds = item.container.getLocalBounds();
  // Convert from pixels to grid units
  return {
    width: Math.ceil(bounds.width / px(1)),
    height: Math.ceil(bounds.height / px(1))
  };
}

/**
 * Arrange items in a horizontal row.
 *
 * @example
 * ```typescript
 * const result = layoutButtonRow({
 *   items: [button1, button2, button3],
 *   spacing: 2,
 *   align: 'center'
 * });
 * console.log(`Row is ${result.width} x ${result.height} grid units`);
 * ```
 */
export function layoutButtonRow(options: ButtonRowOptions): LayoutResult {
  const {
    items,
    spacing = GRID.gap,
    align = 'top',
    startX = 0,
    startY = 0
  } = options;

  if (items.length === 0) {
    return { width: 0, height: 0 };
  }

  // Calculate max height for alignment
  let maxHeight = 0;
  const itemDims = items.map(item => {
    const dims = getItemDimensions(item);
    maxHeight = Math.max(maxHeight, dims.height);
    return dims;
  });

  // Position each item
  let currentX = startX;
  items.forEach((item, i) => {
    const dims = itemDims[i];

    // Calculate Y based on alignment
    let itemY = startY;
    if (align === 'center') {
      itemY = startY + (maxHeight - dims.height) / 2;
    } else if (align === 'bottom') {
      itemY = startY + (maxHeight - dims.height);
    }

    item.container.position.set(px(currentX), px(itemY));
    currentX += dims.width + spacing;
  });

  // Calculate total dimensions
  const totalWidth = currentX - spacing - startX; // Remove last spacing
  return {
    width: totalWidth,
    height: maxHeight
  };
}

/**
 * Arrange items in a vertical column.
 *
 * @example
 * ```typescript
 * const result = layoutButtonColumn({
 *   items: [button1, button2, button3],
 *   spacing: 1,
 *   align: 'center'
 * });
 * ```
 */
export function layoutButtonColumn(options: ButtonColumnOptions): LayoutResult {
  const {
    items,
    spacing = GRID.gap,
    align = 'left',
    startX = 0,
    startY = 0
  } = options;

  if (items.length === 0) {
    return { width: 0, height: 0 };
  }

  // Calculate max width for alignment
  let maxWidth = 0;
  const itemDims = items.map(item => {
    const dims = getItemDimensions(item);
    maxWidth = Math.max(maxWidth, dims.width);
    return dims;
  });

  // Position each item
  let currentY = startY;
  items.forEach((item, i) => {
    const dims = itemDims[i];

    // Calculate X based on alignment
    let itemX = startX;
    if (align === 'center') {
      itemX = startX + (maxWidth - dims.width) / 2;
    } else if (align === 'right') {
      itemX = startX + (maxWidth - dims.width);
    }

    item.container.position.set(px(itemX), px(currentY));
    currentY += dims.height + spacing;
  });

  // Calculate total dimensions
  const totalHeight = currentY - spacing - startY; // Remove last spacing
  return {
    width: maxWidth,
    height: totalHeight
  };
}

/**
 * Arrange items in a grid layout.
 *
 * @example
 * ```typescript
 * const result = layoutButtonGrid({
 *   items: colorSwatches,
 *   columns: 4,
 *   spacingX: 1,
 *   spacingY: 1,
 *   cellWidth: 12,
 *   cellHeight: 12
 * });
 * ```
 */
export function layoutButtonGrid(options: ButtonGridOptions): LayoutResult {
  const {
    items,
    columns,
    spacingX = GRID.gap,
    spacingY = GRID.gap,
    startX = 0,
    startY = 0,
    cellWidth,
    cellHeight
  } = options;

  if (items.length === 0 || columns <= 0) {
    return { width: 0, height: 0 };
  }

  const rows = Math.ceil(items.length / columns);

  // Determine cell dimensions
  let effectiveCellWidth = cellWidth ?? 0;
  let effectiveCellHeight = cellHeight ?? 0;

  if (!cellWidth || !cellHeight) {
    // Calculate from item dimensions
    items.forEach(item => {
      const dims = getItemDimensions(item);
      effectiveCellWidth = Math.max(effectiveCellWidth, dims.width);
      effectiveCellHeight = Math.max(effectiveCellHeight, dims.height);
    });
  }

  // Position each item
  items.forEach((item, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);

    const itemX = startX + col * (effectiveCellWidth + spacingX);
    const itemY = startY + row * (effectiveCellHeight + spacingY);

    item.container.position.set(px(itemX), px(itemY));
  });

  // Calculate total dimensions
  const totalWidth = columns * effectiveCellWidth + (columns - 1) * spacingX;
  const totalHeight = rows * effectiveCellHeight + (rows - 1) * spacingY;

  return {
    width: totalWidth,
    height: totalHeight
  };
}

/**
 * Calculate the dimensions a grid would have without actually positioning items.
 * Useful for determining content size before creating buttons.
 */
export function calculateGridDimensions(
  itemCount: number,
  columns: number,
  cellWidth: number,
  cellHeight: number,
  spacingX: number = GRID.gap,
  spacingY: number = GRID.gap
): LayoutResult {
  if (itemCount === 0 || columns <= 0) {
    return { width: 0, height: 0 };
  }

  const rows = Math.ceil(itemCount / columns);
  const totalWidth = columns * cellWidth + (columns - 1) * spacingX;
  const totalHeight = rows * cellHeight + (rows - 1) * spacingY;

  return { width: totalWidth, height: totalHeight };
}
