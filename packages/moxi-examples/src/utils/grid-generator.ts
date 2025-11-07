import * as PIXI from 'pixi.js';

/**
 * Configuration options for grid generation
 */
export interface GridOptions {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
  centered?: boolean;
}

/**
 * Cell position information passed to callback functions
 */
export interface CellPosition {
  x: number;
  y: number;
  pixelX: number;
  pixelY: number;
  index: number;
  total: number;
}

/**
 * Creates a grid of tiles using a set of textures
 */
export function createTileGrid(
  options: GridOptions,
  textures: PIXI.Texture[],
  selector?: (position: CellPosition) => number
): PIXI.Container {
  const { width, height, cellWidth, cellHeight, centered = false } = options;
  
  // Default selector randomly chooses textures
  const defaultSelector = () => Math.floor(Math.random() * textures.length);
  const getTextureIndex = selector || defaultSelector;
  
  // Create container for the grid
  const container = new PIXI.Container();
  
  // Calculate total number of cells
  const totalCells = width * height;
  
  // Generate each cell in the grid
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Calculate pixel coordinates
      const pixelX = x * cellWidth;
      const pixelY = y * cellHeight;
      
      // Calculate index
      const index = y * width + x;
      
      // Create cell position info
      const position: CellPosition = {
        x, y, pixelX, pixelY, index, total: totalCells
      };
      
      // Get texture index for this position
      const textureIndex = getTextureIndex(position);
      
      // Create sprite with the selected texture
      const cell = new PIXI.Sprite(textures[textureIndex]);
      cell.position.set(pixelX, pixelY);
      
      // Add to container
      container.addChild(cell);
    }
  }
  
  // Center the grid if requested
  if (centered) {
    const gridWidth = width * cellWidth;
    const gridHeight = height * cellHeight;
    container.position.set(-gridWidth / 2, -gridHeight / 2);
  }
  
  return container;
}

/**
 * Helper function to get a range of textures
 */
export function getTextureRange(
  textures: PIXI.Texture[],
  startIndex: number,
  count: number
): PIXI.Texture[] {
  return textures.slice(startIndex, startIndex + count);
}

