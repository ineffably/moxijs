import { Container, Graphics } from 'pixi.js';
import { UIComponent } from '@moxijs/core';
import type { GUIConfig } from '../gui';
export interface GUIBodyOptions {
    config?: GUIConfig;
    collapsed?: boolean;
    animationSpeed?: number;
}
export declare class GUIBody extends UIComponent {
    protected _collapsed: boolean;
    protected _content: Container;
    protected _mask: Graphics;
    protected _targetHeight: number;
    protected _currentHeight: number;
    protected _contentHeight: number;
    protected _animationSpeed: number;
    protected _animating: boolean;
    protected _config: GUIConfig;
    protected _onOpenClose?: () => void;
    constructor(options?: GUIBodyOptions);
    get content(): Container;
    get collapsed(): boolean;
    setContentHeight(height: number): void;
    collapse(animated?: boolean): void;
    expand(animated?: boolean): void;
    toggle(animated?: boolean): void;
    onOpenClose(callback: () => void): this;
    getVisibleHeight(): number;
    protected _onTick: () => void;
    protected _updateMask(): void;
    measure(): {
        width: number;
        height: number;
    };
    destroy(): void;
    layout(availableWidth?: number, availableHeight?: number): void;
    protected render(): void;
}
export default GUIBody;
