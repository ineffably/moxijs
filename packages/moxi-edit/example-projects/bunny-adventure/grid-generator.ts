import PIXI from 'pixi.js';

/**
 * Configuration options for grid generation
 */
export interface GridOptions {
  /** Width of the grid in cells */
  width: number;
  /** Height of the grid in cells */
  height: number;
  /** Width of each cell in pixels */
  cellWidth: number;
  /** Height of each cell in pixels */
  cellHeight: number;
  /** Whether to center the grid at (0,0) */
  centered?: boolean;
}

/**
 * Cell position information passed to callback functions
 */
export interface CellPosition {
  /** X coordinate in grid units */
  x: number;
  /** Y coordinate in grid units */
  y: number;
  /** X position in pixels */
  pixelX: number;
  /** Y position in pixels */
  pixelY: number;
  /** Index in the grid (y * width + x) */
  index: number;
  /** Total number of cells in the grid */
  total: number;
}

/**
 * Creates a grid of elements using a generator callback function
 * 
 * @param options - Configuration options for the grid
 * @param generator - Callback function that creates content for each cell
 * @returns PIXI.Container containing the generated grid
 * 
 * @example
 * ```typescript
 * // Create a 10x10 grid of random colored squares
 * const grid = createGrid({
 *   width: 10,
 *   height: 10,
 *   cellWidth: 32,
 *   cellHeight: 32,
 *   centered: true
 * }, (position) => {
 *   const square = new PIXI.Graphics();
 *   const color = Math.random() * 0xFFFFFF;
 *   square.beginFill(color);
 *   square.drawRect(0, 0, 32, 32);
 *   square.endFill();
 *   return square;
 * });
 * ```
 */
export function createGrid<T extends PIXI.Container>(
  options: GridOptions,
  generator: (position: CellPosition) => T
): PIXI.Container {
  const { width, height, cellWidth, cellHeight, centered = false } = options;
  
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
      
      // Call generator to create content for this cell
      const cell = generator(position);
      
      // Position the cell
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
 * Creates a grid of tiles using a set of textures
 * 
 * @param options - Configuration options for the grid
 * @param textures - Array of textures to use for the tiles
 * @param selector - Optional function to select which texture to use for each cell
 * @returns PIXI.Container containing the generated tile grid
 * 
 * @example
 * ```typescript
 * // Create a random grass field
 * const grassField = createTileGrid({
 *   width: 64,
 *   height: 64,
 *   cellWidth: 16,
 *   cellHeight: 16,
 *   centered: true
 * }, grassTextures);
 * ```
 */
export function createTileGrid(
  options: GridOptions,
  textures: PIXI.Texture[],
  selector?: (position: CellPosition) => number
): PIXI.Container {
  // Default selector randomly chooses textures
  const defaultSelector = () => Math.floor(Math.random() * textures.length);
  
  // Use provided selector or default random selector
  const getTextureIndex = selector || defaultSelector;
  
  // Create grid using the generic grid function
  return createGrid(options, (position) => {
    // Get texture index for this position
    const textureIndex = getTextureIndex(position);
    
    // Create sprite with the selected texture
    return new PIXI.Sprite(textures[textureIndex]);
  });
}

/**
 * Helper function to get a range of textures
 * 
 * @param textures - Full array of textures
 * @param startIndex - Starting index (from 0)
 * @param count - Number of textures to include
 * @returns Subset of textures
 */
export function getTextureRange(
  textures: PIXI.Texture[],
  startIndex: number,
  count: number
): PIXI.Texture[] {
  return textures.slice(startIndex, startIndex + count);
} 