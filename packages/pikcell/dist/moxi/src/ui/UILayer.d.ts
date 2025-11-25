import * as PIXI from 'pixi.js';
import { UIScaleMode } from './UIScaleMode';
export interface UILayerOptions {
    /**
     * Scaling mode for this UI layer
     * @default UIScaleMode.None
     */
    scaleMode?: UIScaleMode;
    /**
     * Target width for the UI layer (used as reference for scaling)
     * If not provided, uses the first child's width
     */
    targetWidth?: number;
    /**
     * Target height for the UI layer (used as reference for scaling)
     * If not provided, uses the first child's height
     */
    targetHeight?: number;
}
/**
 * UILayer is a container that manages scaling behavior for all its children
 *
 * @example
 * ```typescript
 * const hudLayer = new UILayer({ scaleMode: UIScaleMode.ScaleUI });
 * scene.addChild(hudLayer);
 * hudLayer.addChild(tabs.container);
 * ```
 */
export declare class UILayer extends PIXI.Container {
    private scaleMode;
    private targetWidth?;
    private targetHeight?;
    private initialBoundsRecorded;
    constructor(options?: UILayerOptions);
    /**
     * Update the layer's scale based on the current canvas size
     */
    updateScale(canvasWidth: number, canvasHeight: number): void;
    /**
     * Add a child and trigger scale update if needed
     */
    addChild<T extends PIXI.Container[]>(...children: T): T[0];
}
