/**
 * CardResizeLogic - Moxi Logic component for resizable card behavior
 *
 * Implements resize functionality following the Moxi ECS pattern.
 * Handles edge and corner resize with visual feedback.
 */
import * as PIXI from 'pixi.js';
import { Logic } from 'moxi';
export type ResizeDirection = 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw' | null;
export interface CardResizeOptions {
    /** Whether resizing is enabled */
    enabled?: boolean;
    /** Size of resize handles in pixels */
    handleSize?: number;
    /** Size of corner resize handles in pixels */
    cornerHandleSize?: number;
    /** Minimum width in pixels */
    minWidth?: number;
    /** Minimum height in pixels */
    minHeight?: number;
    /** Callback when resize starts */
    onResizeStart?: (direction: ResizeDirection) => void;
    /** Callback during resize */
    onResize?: (width: number, height: number, direction: ResizeDirection) => void;
    /** Callback when resize ends */
    onResizeEnd?: (width: number, height: number) => void;
}
/**
 * Logic component for card resize behavior
 */
export declare class CardResizeLogic extends Logic<PIXI.Container> {
    name: string;
    private options;
    private eventManager;
    private isResizing;
    private resizeDirection;
    private resizeStartX;
    private resizeStartY;
    private resizeStartWidth;
    private resizeStartHeight;
    private entity;
    private renderer;
    constructor(options?: CardResizeOptions);
    /**
     * Initialize resize logic on the entity
     */
    init(entity?: PIXI.Container, renderer?: PIXI.Renderer): void;
    /**
     * Update resize logic (called every frame)
     */
    update(entity?: PIXI.Container, deltaTime?: number): void;
    /**
     * Enable resizing
     */
    enable(): void;
    /**
     * Disable resizing
     */
    disable(): void;
    /**
     * Check if currently resizing
     */
    isActive(): boolean;
    /**
     * Cleanup event listeners
     */
    destroy(): void;
    /**
     * Detect which resize handle is under the pointer
     */
    private detectResizeHandle;
    /**
     * Get cursor for resize direction
     */
    private getCursorForDirection;
    /**
     * Handle pointer move over entity
     */
    private handlePointerMove;
    /**
     * Handle pointer down on entity
     */
    private handlePointerDown;
    /**
     * Handle global pointer move during resize
     */
    private handleGlobalPointerMove;
    /**
     * Handle pointer up to end resize
     */
    private handlePointerUp;
}
