/**
 * Texture and grid utilities
 */
import * as PIXI from 'pixi.js';
/**
 * Creates a tiled checkerboard grid texture for use as a background
 * @param gridSize Size of each square in the checkerboard pattern
 * @param darkColor Color of the dark squares (hex number)
 * @param lightColor Color of the light squares (hex number)
 * @returns PIXI.Texture with nearest neighbor scaling enabled
 */
export declare function createCheckerboardTexture(gridSize?: number, darkColor?: number, lightColor?: number): PIXI.Texture;
