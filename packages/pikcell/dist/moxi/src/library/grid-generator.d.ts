import PIXI from 'pixi.js';
/**
 * Configuration options for grid generation
 * @category Library
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
 * @category Library
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
 *
 * @category Library
 * @param options - Configuration options for the grid
 * @param textures - Array of textures to use for the tiles
 * @param selector - Optional function to select which texture to use for each cell
 * @returns A PIXI Container with the generated tile grid
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
export declare function createTileGrid(options: GridOptions, textures: PIXI.Texture[], selector?: (position: CellPosition) => number): PIXI.Container;
/**
 * Helper function to get a range of textures
 *
 * @category Library
 * @param textures - Full array of textures
 * @param startIndex - Starting index (from 0)
 * @param count - Number of textures to include
 * @returns Subset of textures
 *
 * @example
 * ```typescript
 * // Get the last 12 frames from a spritesheet
 * const tileVariations = getTextureRange(grassFrames, grassFrames.length - 12, 12);
 * ```
 */
export declare function getTextureRange(textures: PIXI.Texture[], startIndex: number, count: number): PIXI.Texture[];
