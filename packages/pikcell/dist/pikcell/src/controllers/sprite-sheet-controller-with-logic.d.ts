/**
 * SpriteSheetController with Logic Components (Example/Future Implementation)
 *
 * This demonstrates how SpriteSheetController could be refactored to use Moxi Logic
 * components for zoom/pan and cell selection instead of handling these behaviors internally.
 *
 * Benefits:
 * - Separation of concerns (data management vs interaction behavior)
 * - Reusable interaction logic
 * - Easier to test
 * - Can swap out behaviors dynamically
 */
import * as PIXI from 'pixi.js';
import { SpriteSheetConfig } from './sprite-sheet-controller';
export interface SpriteSheetControllerWithLogicOptions {
    config: SpriteSheetConfig;
    renderer: PIXI.Renderer;
    showGrid?: boolean;
    onScaleChange?: (scale: number) => void;
    onCellHover?: (cellX: number, cellY: number) => void;
    onCellClick?: (cellX: number, cellY: number) => void;
}
/**
 * Example of SpriteSheetController using Moxi Logic components
 *
 * This shows how to separate data (pixels, palette) from behavior (zoom, pan, selection)
 */
export declare class SpriteSheetControllerWithLogic {
    private config;
    private renderer;
    private showGrid;
    private scale;
    private pixels;
    private texture;
    private sprite;
    private container;
    private entity;
    constructor(options: SpriteSheetControllerWithLogicOptions);
    /**
     * Get the current scale
     */
    getScale(): number;
    /**
     * Set the scale
     */
    setScale(newScale: number): void;
    /**
     * Get sprite sheet config
     */
    getConfig(): SpriteSheetConfig;
    /**
     * Get scaled dimensions
     */
    getScaledDimensions(): {
        width: number;
        height: number;
    };
    /**
     * Get pixel color at coordinates
     */
    getPixel(x: number, y: number): number;
    /**
     * Set pixel color at coordinates
     */
    setPixel(x: number, y: number, colorIndex: number): void;
    /**
     * Update texture from pixel data using PixelRenderer utility
     */
    private updateTexture;
    /**
     * Render the sprite sheet
     */
    render(container: PIXI.Container): void;
    /**
     * Programmatically select a cell
     */
    selectCell(cellX: number, cellY: number): void;
    /**
     * Get selected cell
     */
    getSelectedCell(): {
        x: number;
        y: number;
    };
    /**
     * Get all pixel data (for saving)
     */
    getPixelData(): number[][];
    /**
     * Set all pixel data (for loading)
     */
    setPixelData(pixels: number[][]): void;
    /**
     * Clear all pixels to a specific color
     */
    clear(colorIndex?: number): void;
    /**
     * Get the container (for adding to scene)
     */
    getContainer(): PIXI.Container;
    /**
     * Update logic components (called every frame)
     */
    update(deltaTime: number): void;
    /**
     * Enable/disable zoom
     */
    enableZoom(): void;
    disableZoom(): void;
    /**
     * Enable/disable pan
     */
    enablePan(): void;
    disablePan(): void;
}
/**
 * USAGE EXAMPLE:
 *
 * const controller = new SpriteSheetControllerWithLogic({
 *   config: {
 *     type: 'PICO-8',
 *     width: 128,
 *     height: 128,
 *     palette: PICO8_PALETTE
 *   },
 *   renderer,
 *   showGrid: true,
 *   onScaleChange: (scale) => console.log(`Zoom: ${scale}x`),
 *   onCellHover: (x, y) => console.log(`Hover: ${x}, ${y}`),
 *   onCellClick: (x, y) => console.log(`Click: ${x}, ${y}`)
 * });
 *
 * // Render to container
 * controller.render(contentContainer);
 *
 * // Update each frame
 * app.ticker.add((delta) => {
 *   controller.update(delta);
 * });
 *
 * // Dynamically control behaviors
 * controller.disableZoom(); // Prevent zooming
 * controller.enablePan();   // Allow panning
 */
