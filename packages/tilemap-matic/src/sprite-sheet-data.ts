/**
 * Sprite Sheet Data Library
 * Manages sprite sheet data structures and JSON generation
 */
import { Texture } from 'pixi.js';

export interface LoadedSpriteSheet {
  id: string;
  name: string;
  texture: Texture;
  width: number;
  height: number;
}

export interface GridSettings {
  cellWidth: number;
  cellHeight: number;
  columns: number;
  rows: number;
}

/**
 * A tile region represents a merged group of cells
 * Stored as grid coordinates (not pixels)
 */
export interface TileRegion {
  id: string;
  /** Starting column (0-indexed) */
  col: number;
  /** Starting row (0-indexed) */
  row: number;
  /** Width in cells */
  colSpan: number;
  /** Height in cells */
  rowSpan: number;
  /** Optional custom name for this tile */
  name?: string;
}

export interface FrameData {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SpriteSheetJSON {
  frames: Record<string, {
    frame: { x: number; y: number; w: number; h: number };
    sourceSize: { w: number; h: number };
  }>;
  meta: {
    image: string;
    format: string;
    size: { w: number; h: number };
    scale: string;
  };
}

/**
 * Calculate grid dimensions based on sprite sheet size and cell dimensions
 */
export function calculateGrid(
  sheetWidth: number,
  sheetHeight: number,
  cellWidth: number,
  cellHeight: number
): GridSettings {
  return {
    cellWidth,
    cellHeight,
    columns: Math.floor(sheetWidth / cellWidth),
    rows: Math.floor(sheetHeight / cellHeight)
  };
}

/**
 * Common sprite cell sizes (power of 2 preferred in game dev)
 */
const COMMON_CELL_SIZES = [8, 16, 24, 32, 48, 64, 96, 128, 256];

/**
 * Calculate GCD of two numbers (Euclidean algorithm)
 */
function gcd(a: number, b: number): number {
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

/**
 * Guess the optimal cell size for a sprite sheet based on its dimensions
 *
 * Algorithm:
 * 1. Try GCD of width and height - often reveals cell size
 * 2. If GCD is too small or too large, find best common size that divides evenly
 * 3. Prefer square cells when possible
 * 4. Bias toward power-of-2 sizes commonly used in game dev
 */
export function guessCellSize(width: number, height: number): { cellWidth: number; cellHeight: number } {
  const sheetGcd = gcd(width, height);

  // If GCD is a reasonable cell size (8-256), use it
  if (sheetGcd >= 8 && sheetGcd <= 256) {
    // Check if it's close to a common size
    const nearestCommon = COMMON_CELL_SIZES.find(s => Math.abs(s - sheetGcd) <= 4);
    if (nearestCommon && width % nearestCommon === 0 && height % nearestCommon === 0) {
      return { cellWidth: nearestCommon, cellHeight: nearestCommon };
    }
    return { cellWidth: sheetGcd, cellHeight: sheetGcd };
  }

  // GCD didn't work well, try common sizes that divide both dimensions evenly
  for (const size of [...COMMON_CELL_SIZES].reverse()) { // Start from largest
    if (width % size === 0 && height % size === 0) {
      const cols = width / size;
      const rows = height / size;
      // Reasonable grid (at least 2 cells, not too many)
      if (cols >= 2 && rows >= 1 && cols <= 32 && rows <= 32) {
        return { cellWidth: size, cellHeight: size };
      }
    }
  }

  // Try sizes that divide width evenly (allow non-square cells)
  for (const size of [...COMMON_CELL_SIZES].reverse()) {
    if (width % size === 0) {
      const cols = width / size;
      if (cols >= 2 && cols <= 32) {
        // Find best height divisor
        const heightSize = COMMON_CELL_SIZES.find(h => height % h === 0 && height / h <= 32) || size;
        return { cellWidth: size, cellHeight: heightSize };
      }
    }
  }

  // Fallback: use 32x32 (very common default)
  return { cellWidth: 32, cellHeight: 32 };
}

/**
 * Generate frame data from grid settings
 */
export function generateFrames(
  sheetName: string,
  gridSettings: GridSettings
): FrameData[] {
  const frames: FrameData[] = [];
  let frameIndex = 0;

  for (let row = 0; row < gridSettings.rows; row++) {
    for (let col = 0; col < gridSettings.columns; col++) {
      frames.push({
        name: `${sheetName}_${frameIndex}.png`,
        x: col * gridSettings.cellWidth,
        y: row * gridSettings.cellHeight,
        w: gridSettings.cellWidth,
        h: gridSettings.cellHeight
      });
      frameIndex++;
    }
  }

  return frames;
}

/**
 * Convert frame data to PIXI.js-compatible JSON format
 */
export function framesToJSON(
  frames: FrameData[],
  sheetName: string,
  sheetWidth: number,
  sheetHeight: number
): SpriteSheetJSON {
  const framesObject: Record<string, any> = {};

  frames.forEach(frame => {
    framesObject[frame.name] = {
      frame: {
        x: frame.x,
        y: frame.y,
        w: frame.w,
        h: frame.h
      },
      sourceSize: {
        w: frame.w,
        h: frame.h
      }
    };
  });

  return {
    frames: framesObject,
    meta: {
      image: `${sheetName}.png`,
      format: 'RGBA8888',
      size: {
        w: sheetWidth,
        h: sheetHeight
      },
      scale: '1'
    }
  };
}

/**
 * Download JSON data as a file
 */
export function downloadJSON(data: SpriteSheetJSON, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate a unique ID for a tile region
 */
export function generateRegionId(): string {
  return `region_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Check if a cell is covered by any tile region
 */
export function getCellRegion(
  col: number,
  row: number,
  regions: TileRegion[]
): TileRegion | null {
  for (const region of regions) {
    if (
      col >= region.col &&
      col < region.col + region.colSpan &&
      row >= region.row &&
      row < region.row + region.rowSpan
    ) {
      return region;
    }
  }
  return null;
}

/**
 * Check if two cells are adjacent (horizontally or vertically)
 */
export function areCellsAdjacent(
  col1: number,
  row1: number,
  col2: number,
  row2: number
): boolean {
  const colDiff = Math.abs(col1 - col2);
  const rowDiff = Math.abs(row1 - row2);
  return (colDiff === 1 && rowDiff === 0) || (colDiff === 0 && rowDiff === 1);
}

/**
 * Create a tile region from a selection of cells
 * Returns null if cells don't form a valid rectangle
 */
export function createRegionFromCells(
  cells: Array<{ col: number; row: number }>,
  existingRegions: TileRegion[]
): TileRegion | null {
  if (cells.length < 2) return null;

  // Find bounding box
  const minCol = Math.min(...cells.map(c => c.col));
  const maxCol = Math.max(...cells.map(c => c.col));
  const minRow = Math.min(...cells.map(c => c.row));
  const maxRow = Math.max(...cells.map(c => c.row));

  const colSpan = maxCol - minCol + 1;
  const rowSpan = maxRow - minRow + 1;

  // Check if selection forms a complete rectangle
  if (cells.length !== colSpan * rowSpan) {
    return null; // Not a complete rectangle
  }

  // Check all cells in bounding box are selected
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const found = cells.some(cell => cell.col === c && cell.row === r);
      if (!found) return null;
    }
  }

  // Check no cell is already part of another region
  for (const cell of cells) {
    if (getCellRegion(cell.col, cell.row, existingRegions)) {
      return null; // Cell already in a region
    }
  }

  return {
    id: generateRegionId(),
    col: minCol,
    row: minRow,
    colSpan,
    rowSpan
  };
}

/**
 * Generate frames from grid settings with tile regions
 * Regions are output as larger frames, remaining cells as individual frames
 */
export function generateFramesWithRegions(
  sheetName: string,
  gridSettings: GridSettings,
  regions: TileRegion[]
): FrameData[] {
  const frames: FrameData[] = [];
  const coveredCells = new Set<string>();

  // First, add frames for all tile regions
  regions.forEach((region, idx) => {
    const frameName = region.name || `${sheetName}_region_${idx}`;
    frames.push({
      name: `${frameName}.png`,
      x: region.col * gridSettings.cellWidth,
      y: region.row * gridSettings.cellHeight,
      w: region.colSpan * gridSettings.cellWidth,
      h: region.rowSpan * gridSettings.cellHeight
    });

    // Mark cells as covered
    for (let r = region.row; r < region.row + region.rowSpan; r++) {
      for (let c = region.col; c < region.col + region.colSpan; c++) {
        coveredCells.add(`${c},${r}`);
      }
    }
  });

  // Then add frames for uncovered cells
  let frameIndex = 0;
  for (let row = 0; row < gridSettings.rows; row++) {
    for (let col = 0; col < gridSettings.columns; col++) {
      if (!coveredCells.has(`${col},${row}`)) {
        frames.push({
          name: `${sheetName}_${frameIndex}.png`,
          x: col * gridSettings.cellWidth,
          y: row * gridSettings.cellHeight,
          w: gridSettings.cellWidth,
          h: gridSettings.cellHeight
        });
      }
      frameIndex++;
    }
  }

  return frames;
}
