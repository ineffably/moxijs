import { Graphics } from 'pixi.js';
import { UILabel } from '@moxijs/core';
import { Control, ControlOptions } from './base-control';
export interface NumberControlOptions extends ControlOptions {
    min?: number;
    max?: number;
    step?: number;
}
export declare class NumberControl extends Control<number> {
    protected _min?: number;
    protected _max?: number;
    protected _step: number;
    protected _hasSlider: boolean;
    protected _track: Graphics;
    protected _fill: Graphics;
    protected _valueLabel: UILabel;
    protected _dragging: boolean;
    protected _dragStartX: number;
    protected _dragStartValue: number;
    constructor(panel: any, object: Record<string, unknown>, property: string, min?: number, max?: number, step?: number, options?: NumberControlOptions);
    min(value: number): this;
    max(value: number): this;
    step(value: number): this;
    updateDisplay(): this;
    protected _computeStep(): number;
    protected _formatValue(value: number): string;
    protected _clampValue(value: number): number;
    protected _getNormalized(): number;
    protected _setFromNormalized(normalized: number): void;
    protected _getSliderWidth(): number;
    protected _setupInteractions(): void;
    protected _renderWidget(): void;
    layout(availableWidth?: number, availableHeight?: number): void;
}
export default NumberControl;
