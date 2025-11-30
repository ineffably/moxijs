import { Container, Graphics } from 'pixi.js';
import { UIComponent, UILabel } from '@moxijs/core';
import type { GUIConfig } from '../gui';
export interface ControlRowOptions {
    label: string;
    config?: GUIConfig;
}
export declare class ControlRow extends UIComponent {
    protected _rowLabel: UILabel;
    protected _labelMask: Graphics;
    protected _widget: Container;
    protected _rowBackground: Graphics;
    protected _rowConfig: GUIConfig;
    protected _labelText: string;
    protected _textY: number;
    protected _widgetWidth: number;
    constructor(options: ControlRowOptions);
    get config(): GUIConfig;
    get widget(): Container;
    get textY(): number;
    get widgetWidth(): number;
    setLabel(text: string): void;
    measure(): {
        width: number;
        height: number;
    };
    layout(availableWidth?: number, availableHeight?: number): void;
    protected _drawRowBackground(hover?: boolean): void;
    protected render(): void;
}
export default ControlRow;
