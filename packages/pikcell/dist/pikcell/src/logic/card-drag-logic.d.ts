/**
 * CardDragLogic - Moxi Logic component for draggable card behavior
 *
 * Implements drag functionality following the Moxi ECS pattern.
 * Can be attached to any PIXI.Container to make it draggable.
 */
import * as PIXI from 'pixi.js';
import { Logic } from 'moxi';
export interface CardDragOptions {
    /** Whether dragging is enabled */
    enabled?: boolean;
    /** Minimum drag distance to distinguish from click */
    clickThreshold?: number;
    /** Callback when drag starts */
    onDragStart?: (x: number, y: number) => void;
    /** Callback during drag */
    onDrag?: (x: number, y: number, deltaX: number, deltaY: number) => void;
    /** Callback when drag ends */
    onDragEnd?: (x: number, y: number) => void;
    /** Callback when clicked (not dragged) */
    onClick?: () => void;
}
/**
 * Logic component for card dragging behavior
 */
export declare class CardDragLogic extends Logic<PIXI.Container> {
    name: string;
    private options;
    private eventManager;
    private isDragging;
    private dragStartX;
    private dragStartY;
    private cardStartX;
    private cardStartY;
    private hasMoved;
    constructor(options?: CardDragOptions);
    /**
     * Initialize drag logic on the entity
     */
    init(entity?: PIXI.Container, renderer?: PIXI.Renderer): void;
    /**
     * Update drag logic (called every frame)
     */
    update(entity?: PIXI.Container, deltaTime?: number): void;
    /**
     * Enable dragging
     */
    enable(): void;
    /**
     * Disable dragging
     */
    disable(): void;
    /**
     * Check if currently dragging
     */
    isActive(): boolean;
    /**
     * Cleanup event listeners
     */
    destroy(): void;
    /**
     * Handle pointer down event
     */
    private handlePointerDown;
    /**
     * Handle pointer move event
     */
    private handlePointerMove;
    /**
     * Handle pointer up event
     */
    private handlePointerUp;
}
