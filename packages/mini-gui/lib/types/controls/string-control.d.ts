import { Graphics } from 'pixi.js';
import { UILabel } from '@moxijs/ui';
import { Control, ControlOptions } from './base-control';
export declare class StringControl extends Control<string> {
    protected _inputBg: Graphics;
    protected _valueLabel: UILabel;
    protected _htmlInput?: HTMLInputElement;
    protected _editing: boolean;
    constructor(panel: any, object: Record<string, unknown>, property: string, options?: ControlOptions);
    updateDisplay(): this;
    protected _setupInteractions(): void;
    protected _startEditing(): void;
    protected _stopEditing(): void;
    protected _renderWidget(): void;
    layout(availableWidth?: number, availableHeight?: number): void;
    destroy(): void;
}
export default StringControl;
