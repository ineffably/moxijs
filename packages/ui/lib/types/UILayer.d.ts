import * as PIXI from 'pixi.js';
import { UIScaleMode } from './UIScaleMode';
export interface UILayerOptions {
    scaleMode?: UIScaleMode;
    targetWidth?: number;
    targetHeight?: number;
}
export declare class UILayer extends PIXI.Container {
    private scaleMode;
    private targetWidth?;
    private targetHeight?;
    private initialBoundsRecorded;
    constructor(options?: UILayerOptions);
    updateScale(canvasWidth: number, canvasHeight: number): void;
    addChild<T extends PIXI.Container[]>(...children: T): T[0];
}
