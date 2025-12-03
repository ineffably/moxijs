import { Graphics } from 'pixi.js';
import { Control, ControlOptions } from './base-control';
export declare class BooleanControl extends Control<boolean> {
    protected _box: Graphics;
    protected _check: Graphics;
    constructor(panel: any, object: Record<string, unknown>, property: string, options?: ControlOptions);
    updateDisplay(): this;
    protected _setupInteractions(): void;
    protected _renderWidget(): void;
    layout(availableWidth?: number, availableHeight?: number): void;
}
export default BooleanControl;
