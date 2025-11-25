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
export function createCheckerboardTexture(
  gridSize: number = 16,
  darkColor: number = 0x2a2a3a,
  lightColor: number = 0x353545
): PIXI.Texture {
  // Create canvas for the checkerboard pattern
  const gridCanvas = document.createElement('canvas');
  gridCanvas.width = gridSize * 2;
  gridCanvas.height = gridSize * 2;
  const gridCtx = gridCanvas.getContext('2d')!;

  // Draw checkerboard pattern
  gridCtx.fillStyle = `#${darkColor.toString(16).padStart(6, '0')}`;
  gridCtx.fillRect(0, 0, gridSize, gridSize);
  gridCtx.fillRect(gridSize, gridSize, gridSize, gridSize);

  gridCtx.fillStyle = `#${lightColor.toString(16).padStart(6, '0')}`;
  gridCtx.fillRect(gridSize, 0, gridSize, gridSize);
  gridCtx.fillRect(0, gridSize, gridSize, gridSize);

  // Create texture from canvas and enable nearest neighbor scaling
  const gridTexture = PIXI.Texture.from(gridCanvas);
  gridTexture.source.scaleMode = 'nearest'; // Keep it crisp

  return gridTexture;
}
