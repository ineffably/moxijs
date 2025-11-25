/**
 * Sprite controller - manages a single 8x8 sprite cell from the sprite sheet
 */
import * as PIXI from 'pixi.js';
import { SpriteSheetController } from './sprite-sheet-controller';
export interface SpriteControllerOptions {
    spriteSheetController: SpriteSheetController;
    cellX: number;
    cellY: number;
    scale?: number;
}
/**
 * Controller for managing a single 8x8 sprite cell
 * References the sprite sheet controller and updates it directly
 */
export declare class SpriteController {
    private spriteSheetController;
    private cellX;
    private cellY;
    private scale;
    private sprite;
    private texture;
    constructor(options: SpriteControllerOptions);
    /**
     * Get the current cell coordinates
     */
    getCell(): {
        x: number;
        y: number;
    };
    /**
     * Set which cell to edit
     */
    setCell(cellX: number, cellY: number): void;
    /**
     * Get the scale
     */
    getScale(): number;
    /**
     * Set the scale
     */
    setScale(newScale: number): void;
    /**
     * Get pixel color at local sprite coordinates (0-7, 0-7)
     */
    getPixel(localX: number, localY: number): number;
    /**
     * Set pixel color at local sprite coordinates (0-7, 0-7)
     */
    setPixel(localX: number, localY: number, colorIndex: number): void;
    /**
     * Render the sprite (shows the 8x8 cell from sprite sheet)
     */
    render(container: PIXI.Container): void;
    /**
     * Convert screen coordinates (relative to sprite) to pixel coordinates
     */
    screenToPixel(screenX: number, screenY: number): {
        x: number;
        y: number;
    } | null;
    /**
     * Get the scaled dimensions
     */
    getScaledDimensions(): {
        width: number;
        height: number;
    };
}
