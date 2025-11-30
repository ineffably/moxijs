import { ControlRow } from '../components';
export type ChangeCallback<T> = (value: T) => void;
export interface ControlOptions {
    name?: string;
}
export declare abstract class Control<T = unknown> extends ControlRow {
    protected _panel: any;
    protected _object: Record<string, unknown>;
    protected _property: string;
    protected _initialValue: T;
    protected _name: string;
    protected _disabled: boolean;
    protected _hidden: boolean;
    protected _onChange?: ChangeCallback<T>;
    protected _onFinishChange?: ChangeCallback<T>;
    protected _changed: boolean;
    protected _listening: boolean;
    protected _listenFrameId?: number;
    protected _listenPrevValue?: T;
    constructor(panel: any, object: Record<string, unknown>, property: string, options?: ControlOptions);
    getValue(): T;
    setValue(value: T): this;
    abstract updateDisplay(): this;
    name(name: string): this;
    onChange(callback: ChangeCallback<T>): this;
    onFinishChange(callback: ChangeCallback<T>): this;
    reset(): this;
    enable(enabled?: boolean): this;
    disable(disabled?: boolean): this;
    show(visible?: boolean): this;
    hide(): this;
    listen(enabled?: boolean): this;
    save(): T;
    load(value: T): this;
    destroy(): void;
    protected _callOnChange(): void;
    protected _callOnFinishChange(): void;
    protected _listenCallback: () => void;
}
export default Control;
