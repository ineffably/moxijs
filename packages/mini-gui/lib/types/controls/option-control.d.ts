import { Graphics } from 'pixi.js';
import { UILabel } from '@moxijs/ui';
import { Control, ControlOptions } from './base-control';
export type OptionList<T> = T[] | Record<string, T>;
export declare class OptionControl<T = unknown> extends Control<T> {
    protected _options: Array<[string, T]>;
    protected _selectedIndex: number;
    protected _selectBg: Graphics;
    protected _valueLabel: UILabel;
    protected _arrow: UILabel;
    constructor(panel: any, object: Record<string, unknown>, property: string, options: OptionList<T>, controlOptions?: ControlOptions);
    options(opts: OptionList<T>): this;
    updateDisplay(): this;
    protected _normalizeOptions(options: OptionList<T>): void;
    protected _findSelectedIndex(): number;
    protected _getSelectedLabel(): string;
    protected _setupInteractions(): void;
    protected _renderWidget(): void;
    layout(availableWidth?: number, availableHeight?: number): void;
}
export default OptionControl;
