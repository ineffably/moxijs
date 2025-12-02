import { Graphics } from 'pixi.js';
import { UIComponent } from '@moxijs/core';
import { Control } from './controls';
import { GUIHeader, GUIBody } from './components';
export interface GUIOptions {
    title?: string;
    width?: number;
    rowHeight?: number;
    labelRatio?: number;
    padding?: number;
    x?: number;
    y?: number;
    closed?: boolean;
    draggable?: boolean;
    closeFolders?: boolean;
    parent?: GUI;
}
export interface GUIConfig {
    width: number;
    rowHeight: number;
    labelRatio: number;
    padding: number;
    headerHeight: number;
    gap: number;
    border: number;
    fontFamily: string;
    fontSize: number;
}
export interface ChangeEvent<T = unknown> {
    object: Record<string, unknown>;
    property: string;
    value: T;
    control: Control<T>;
}
export declare class GUI extends UIComponent {
    protected _title: string;
    protected _width: number;
    readonly config: GUIConfig;
    protected _closed: boolean;
    protected _draggable: boolean;
    protected _closeFolders: boolean;
    protected _parent?: GUI;
    protected _root: GUI;
    protected _controls: Control[];
    protected _folders: GUI[];
    protected _children: (Control | GUI)[];
    protected _background: Graphics;
    protected _header: GUIHeader;
    protected _guiBody: GUIBody;
    protected _onChange?: (event: ChangeEvent) => void;
    protected _onFinishChange?: (event: ChangeEvent) => void;
    protected _onOpenClose?: (gui: GUI) => void;
    constructor(options?: GUIOptions);
    title(title: string): this;
    add<T extends Record<string, unknown>, K extends keyof T>(object: T, property: K, minOrOptions?: number | T[K][] | Record<string, T[K]>, max?: number, step?: number): Control;
    addColor<T extends Record<string, unknown>, K extends keyof T>(object: T, property: K, rgbScale?: number): Control;
    addFolder(title: string): GUI;
    open(open?: boolean): this;
    close(): this;
    toggle(): this;
    onChange(callback: (event: ChangeEvent) => void): this;
    onFinishChange(callback: (event: ChangeEvent) => void): this;
    onOpenClose(callback: (gui: GUI) => void): this;
    reset(recursive?: boolean): this;
    save(recursive?: boolean): Record<string, unknown>;
    load(state: Record<string, unknown>, recursive?: boolean): this;
    controllersRecursive(): Control[];
    foldersRecursive(): GUI[];
    destroy(): void;
    _callOnChange(control: Control): void;
    _callOnFinishChange(control: Control): void;
    _callOnOpenClose(gui: GUI): void;
    _removeControl(control: Control): void;
    protected _layoutChildren(): void;
    measure(): {
        width: number;
        height: number;
    };
    protected _render(): void;
    layout(availableWidth: number, availableHeight: number): void;
    protected render(): void;
}
export default GUI;
