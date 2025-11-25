/**
 * PixelRenderer - Centralized utility for rendering pixel data to canvas and PIXI textures
 *
 * This utility consolidates duplicate rendering logic from SpriteSheetController and SpriteController,
 * providing a single source of truth for pixel-to-texture conversion.
 */
import * as PIXI from 'pixi.js';

export interface PixelRenderOptions {
  width: number;
  height: number;
  pixels: number[][];
  palette: number[];
  grid?: GridOptions;
  scale?: number;
}

export interface GridOptions {
  enabled: boolean;
  size: number;  // Grid cell size (e.g., 8 for 8x8 cells)
  color?: string;  // CSS color string, default 'rgba(128, 128, 128, 0.3)'
  lineWidth?: number;  // Default 1
}

/**
 * Centralized pixel rendering utility
 */
export class PixelRenderer {
  /**
   * Render pixel data to a canvas element
   *
   * @param options Rendering options
   * @returns Canvas element with rendered pixels
   */
  static renderToCanvas(options: PixelRenderOptions): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }

    // Render pixels
    this.drawPixels(ctx, options);

    // Render grid if enabled
    if (options.grid?.enabled) {
      this.drawGrid(ctx, options);
    }

    return canvas;
  }

  /**
   * Render pixel data to a PIXI texture with nearest-neighbor scaling
   *
   * @param options Rendering options
   * @returns PIXI.Texture with rendered pixels
   */
  static renderToTexture(options: PixelRenderOptions): PIXI.Texture {
    const canvas = this.renderToCanvas(options);
    const texture = PIXI.Texture.from(canvas);
    texture.source.scaleMode = 'nearest';
    return texture;
  }

  /**
   * Draw pixel data to canvas context
   *
   * @private
   */
  private static drawPixels(ctx: CanvasRenderingContext2D, options: PixelRenderOptions): void {
    const { width, height, pixels, palette } = options;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const colorIndex = pixels[y][x];
        const color = palette[colorIndex];
        ctx.fillStyle = this.colorToCSS(color);
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  /**
   * Draw grid lines over the canvas
   *
   * @private
   */
  private static drawGrid(ctx: CanvasRenderingContext2D, options: PixelRenderOptions): void {
    if (!options.grid) return;

    const { width, height } = options;
    const { size, color = 'rgba(128, 128, 128, 0.3)', lineWidth = 1 } = options.grid;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    // Draw vertical grid lines
    for (let x = size; x < width; x += size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let y = size; y < height; y += size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  /**
   * Convert a 24-bit RGB color integer to CSS rgb() string
   *
   * @param color 24-bit RGB color (0xRRGGBB format)
   * @returns CSS color string (e.g., 'rgb(255, 0, 0)')
   */
  static colorToCSS(color: number): string {
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Extract a sub-region of pixels from a larger pixel array
   *
   * @param pixels Source pixel data
   * @param startX Starting X coordinate
   * @param startY Starting Y coordinate
   * @param width Width of region to extract
   * @param height Height of region to extract
   * @returns Extracted pixel region
   */
  static extractRegion(
    pixels: number[][],
    startX: number,
    startY: number,
    width: number,
    height: number
  ): number[][] {
    const region: number[][] = [];

    for (let y = 0; y < height; y++) {
      region[y] = [];
      for (let x = 0; x < width; x++) {
        const sourceY = startY + y;
        const sourceX = startX + x;

        // Bounds check
        if (sourceY >= 0 && sourceY < pixels.length &&
            sourceX >= 0 && sourceX < pixels[0].length) {
          region[y][x] = pixels[sourceY][sourceX];
        } else {
          region[y][x] = 0; // Default to first palette color if out of bounds
        }
      }
    }

    return region;
  }
}
