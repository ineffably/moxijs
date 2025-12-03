import { Graphics } from 'pixi.js';
import { UIComponent, UILabel } from '@moxijs/ui';
import type { GUIConfig } from '../gui';
export interface GUIHeaderOptions {
    title: string;
    config?: GUIConfig;
    draggable?: boolean;
    collapsed?: boolean;
    isFolder?: boolean;
}
export declare class GUIHeader extends UIComponent {
    protected _title: string;
    protected _config: GUIConfig;
    protected _draggable: boolean;
    protected _collapsed: boolean;
    protected _isFolder: boolean;
    protected _background: Graphics;
    protected _collapseIndicator: UILabel;
    protected _titleLabel: UILabel;
    protected _dragOffset: {
        x: number;
        y: number;
    };
    protected _isDragging: boolean;
    protected _onToggle?: () => void;
    protected _onDrag?: (x: number, y: number) => void;
    constructor(options: GUIHeaderOptions);
    setTitle(title: string): void;
    setCollapsed(collapsed: boolean): void;
    onToggle(callback: () => void): this;
    onDrag(callback: (x: number, y: number) => void): this;
    protected _setupEvents(): void;
    protected _render(): void;
    measure(): {
        width: number;
        height: number;
    };
    layout(availableWidth?: number, availableHeight?: number): void;
    protected render(): void;
}
export default GUIHeader;
