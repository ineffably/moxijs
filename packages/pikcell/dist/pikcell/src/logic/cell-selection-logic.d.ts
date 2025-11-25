/**
 * CellSelectionLogic - Moxi Logic component for sprite sheet cell selection
 *
 * Implements cell hover, click, and selection behavior for sprite sheet grids
 * following the Moxi ECS pattern.
 */
import * as PIXI from 'pixi.js';
import { Logic } from 'moxi';
export interface CellSelectionOptions {
    /** Grid cell size in pixels */
    cellSize?: number;
    /** Sheet width in cells */
    sheetWidth: number;
    /** Sheet height in cells */
    sheetHeight: number;
    /** Current scale of the sheet */
    scale?: number;
    /** Click threshold to distinguish from drag */
    clickThreshold?: number;
    /** Callback when cell is hovered */
    onCellHover?: (cellX: number, cellY: number) => void;
    /** Callback when cell is clicked */
    onCellClick?: (cellX: number, cellY: number) => void;
    /** Callback when cell is selected (confirms selection) */
    onCellSelect?: (cellX: number, cellY: number) => void;
}
/**
 * Logic component for cell selection in sprite sheets
 */
export declare class CellSelectionLogic extends Logic<PIXI.Container> {
    name: string;
    private options;
    private hoveredCellX;
    private hoveredCellY;
    private selectedCellX;
    private selectedCellY;
    private isDragging;
    private dragStartX;
    private dragStartY;
    private cellOverlay;
    private entity;
    private sprite;
    constructor(options: CellSelectionOptions);
    /**
     * Initialize cell selection logic
     */
    init(entity?: PIXI.Container, renderer?: PIXI.Renderer, sprite?: PIXI.Sprite): void;
    /**
     * Update cell selection (called every frame)
     */
    update(entity?: PIXI.Container, deltaTime?: number): void;
    /**
     * Set the current scale
     */
    setScale(scale: number): void;
    /**
     * Set the sprite reference
     */
    setSprite(sprite: PIXI.Sprite): void;
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
     * Cleanup
     */
    destroy(): void;
    /**
     * Draw cell overlay (selection and hover highlights)
     */
    private drawCellOverlay;
    /**
     * Handle pointer move over sprite
     */
    private handlePointerMove;
    /**
     * Handle pointer out
     */
    private handlePointerOut;
    /**
     * Handle pointer down (start potential drag or click)
     */
    private handlePointerDown;
    /**
     * Handle global pointer move (detect drag)
     */
    private handleGlobalPointerMove;
    /**
     * Handle pointer up (complete click or drag)
     */
    private handlePointerUp;
    /**
     * Handle pointer up outside
     */
    private handlePointerUpOutside;
}
