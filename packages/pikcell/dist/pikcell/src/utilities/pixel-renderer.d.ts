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
    size: number;
    color?: string;
    lineWidth?: number;
}
/**
 * Centralized pixel rendering utility
 */
export declare class PixelRenderer {
    /**
     * Render pixel data to a canvas element
     *
     * @param options Rendering options
     * @returns Canvas element with rendered pixels
     */
    static renderToCanvas(options: PixelRenderOptions): HTMLCanvasElement;
    /**
     * Render pixel data to a PIXI texture with nearest-neighbor scaling
     *
     * @param options Rendering options
     * @returns PIXI.Texture with rendered pixels
     */
    static renderToTexture(options: PixelRenderOptions): PIXI.Texture;
    /**
     * Draw pixel data to canvas context
     *
     * @private
     */
    private static drawPixels;
    /**
     * Draw grid lines over the canvas
     *
     * @private
     */
    private static drawGrid;
    /**
     * Convert a 24-bit RGB color integer to CSS rgb() string
     *
     * @param color 24-bit RGB color (0xRRGGBB format)
     * @returns CSS color string (e.g., 'rgb(255, 0, 0)')
     */
    static colorToCSS(color: number): string;
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
    static extractRegion(pixels: number[][], startX: number, startY: number, width: number, height: number): number[][];
}
