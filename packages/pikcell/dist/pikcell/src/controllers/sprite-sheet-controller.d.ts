/**
 * Sprite sheet controller - manages sprite data and interactions independently of the card
 */
import * as PIXI from 'pixi.js';
export type SpriteSheetType = 'PICO-8' | 'TIC-80';
export interface SpriteSheetConfig {
    type: SpriteSheetType;
    width: number;
    height: number;
    palette: number[];
}
export interface SpriteSheetControllerOptions {
    config: SpriteSheetConfig;
    renderer: PIXI.Renderer;
    showGrid?: boolean;
    onScaleChange?: (scale: number) => void;
    onCellHover?: (cellX: number, cellY: number) => void;
    onCellClick?: (cellX: number, cellY: number) => void;
}
/**
 * Controller for managing sprite sheet state and rendering
 */
export declare class SpriteSheetController {
    private config;
    private renderer;
    private scale;
    private pixels;
    private texture;
    private sprite;
    private showGrid;
    private onScaleChange?;
    private onCellHover?;
    private onCellClick?;
    private isPanning;
    private panStartX;
    private panStartY;
    private spriteStartX;
    private spriteStartY;
    private cellOverlay;
    private selectedCellX;
    private selectedCellY;
    private hoveredCellX;
    private hoveredCellY;
    private interactionSetup;
    private isDragging;
    private dragStartX;
    private dragStartY;
    private clickThreshold;
    constructor(options: SpriteSheetControllerOptions);
    /**
     * Setup mouse wheel zoom handler
     * Based on: https://stackoverflow.com/questions/75969167/pixi-js-zoom-to-mouse-position
     */
    private setupMouseWheelZoom;
    /**
     * Setup middle mouse button pan handler
     */
    private setupMiddleMousePan;
    /**
     * Get the current scale
     */
    getScale(): number;
    /**
     * Set the scale (supports smooth/fractional scaling)
     */
    setScale(newScale: number): void;
    /**
     * Get the sprite sheet config
     */
    getConfig(): SpriteSheetConfig;
    /**
     * Get the scaled dimensions
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
     * Update the texture from pixel data
     */
    private updateTexture;
    /**
     * Draw the cell overlay (highlighting selected/hovered cells)
     */
    private drawCellOverlay;
    /**
     * Setup cell interaction handlers
     */
    private setupCellInteraction;
    /**
     * Render the sprite sheet
     */
    render(container: PIXI.Container): void;
    /**
     * Programmatically select a cell
     */
    selectCell(cellX: number, cellY: number): void;
    /**
     * Clear all pixels to a specific color
     */
    clear(colorIndex?: number): void;
    /**
     * Convert screen coordinates to sprite pixel coordinates
     */
    screenToPixel(screenX: number, screenY: number): {
        x: number;
        y: number;
    } | null;
    /**
     * Get all pixel data (for saving)
     */
    getPixelData(): number[][];
    /**
     * Set all pixel data (for loading)
     */
    setPixelData(pixels: number[][]): void;
    /**
     * Get current selected cell
     */
    getSelectedCell(): {
        x: number;
        y: number;
    };
    /**
     * Position the sprite so that cell 0,0 is at the top-left corner of the content container
     */
    positionCell00AtTopLeft(): void;
    /**
     * Center a specific cell in the viewport
     * Positions the sprite so the given cell is centered in the content container
     */
    centerCell(cellX: number, cellY: number, containerWidth: number, containerHeight: number): void;
}
