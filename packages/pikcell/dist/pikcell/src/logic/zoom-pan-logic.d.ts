/**
 * ZoomPanLogic - Moxi Logic component for zoom and pan behavior
 *
 * Implements zoom (mouse wheel) and pan (middle mouse button) functionality
 * following the Moxi ECS pattern.
 */
import * as PIXI from 'pixi.js';
import { Logic } from 'moxi';
export interface ZoomPanOptions {
    /** Whether zoom is enabled */
    zoomEnabled?: boolean;
    /** Whether pan is enabled */
    panEnabled?: boolean;
    /** Minimum scale */
    minScale?: number;
    /** Maximum scale */
    maxScale?: number;
    /** Zoom increment per wheel notch */
    zoomIncrement?: number;
    /** Initial scale */
    initialScale?: number;
    /** Callback when zoom changes */
    onZoomChange?: (scale: number) => void;
    /** Callback when pan changes */
    onPanChange?: (x: number, y: number) => void;
}
/**
 * Logic component for zoom and pan behavior
 */
export declare class ZoomPanLogic extends Logic<PIXI.Container> {
    name: string;
    private options;
    private eventManager;
    private currentScale;
    private isPanning;
    private panStartX;
    private panStartY;
    private entityStartX;
    private entityStartY;
    private entity;
    private renderer;
    constructor(options?: ZoomPanOptions);
    /**
     * Initialize zoom/pan logic on the entity
     */
    init(entity?: PIXI.Container, renderer?: PIXI.Renderer): void;
    /**
     * Update zoom/pan logic
     */
    update(entity?: PIXI.Container, deltaTime?: number): void;
    /**
     * Get current scale
     */
    getScale(): number;
    /**
     * Set scale
     */
    setScale(scale: number): void;
    /**
     * Enable zoom
     */
    enableZoom(): void;
    /**
     * Disable zoom
     */
    disableZoom(): void;
    /**
     * Enable pan
     */
    enablePan(): void;
    /**
     * Disable pan
     */
    disablePan(): void;
    /**
     * Cleanup event listeners
     */
    destroy(): void;
    /**
     * Handle mouse wheel for zoom
     * Based on: https://stackoverflow.com/questions/75969167/pixi-js-zoom-to-mouse-position
     */
    private handleWheel;
    /**
     * Handle mouse down for middle mouse pan
     */
    private handleMouseDown;
    /**
     * Handle mouse move for panning
     */
    private handleMouseMove;
    /**
     * Handle mouse up to end panning
     */
    private handleMouseUp;
}
