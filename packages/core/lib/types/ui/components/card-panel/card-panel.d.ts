import * as PIXI from 'pixi.js';
import { UIComponent } from '../../core/ui-component';
import { BoxModel, MeasuredSize } from '../../core/box-model';
import { CardStyle, CardThemeColors } from './card-style';
export type DrawIconFn = (graphics: PIXI.Graphics, x: number, y: number, color: number, pixelSize: number) => void;
export interface CardPanelTitle {
    text?: string;
    icon?: DrawIconFn;
    iconWidth?: number;
    leftText?: string;
    rightText?: string;
}
export interface CardPanelFooter {
    height?: number;
}
export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
export interface CardPanelProps {
    title?: CardPanelTitle;
    bodyWidth: number;
    bodyHeight: number;
    footer?: CardPanelFooter;
    draggable?: boolean;
    resizable?: boolean | ResizeDirection[];
    minWidth?: number;
    minHeight?: number;
    clipContent?: boolean;
    style?: CardStyle;
    colors?: Partial<CardThemeColors>;
    backgroundColor?: number;
    onResize?: (width: number, height: number) => void;
    onMove?: (x: number, y: number) => void;
    onFocus?: () => void;
}
export declare class CardPanel extends UIComponent {
    private props;
    private cardStyle;
    private colors;
    private backgroundGraphics;
    private headerGraphics;
    private footerGraphics;
    private bodyContainer;
    private footerContainer;
    private bodyMask;
    private titleText?;
    private titleIcon?;
    private isDragging;
    private dragStartPos;
    private dragStartCardPos;
    private isResizing;
    private resizeDirection;
    private resizeStartSize;
    private resizeStartPos;
    private resizeStartCardPos;
    private onPointerMoveBound;
    private onPointerUpBound;
    constructor(props: CardPanelProps, boxModel?: Partial<BoxModel>);
    getBodyContainer(): PIXI.Container;
    getFooterContainer(): PIXI.Container;
    getBodySize(): {
        width: number;
        height: number;
    };
    setBodySize(width: number, height: number): void;
    setTitle(text: string): void;
    setColors(colors: Partial<CardThemeColors>): void;
    refresh(): void;
    private redraw;
    private renderTitle;
    private clearTitle;
    private setupBodyMask;
    private setupHeaderInteractivity;
    private setupDragging;
    private onDragStart;
    private onPointerMove;
    private onPointerUp;
    private setupResizing;
    private handleResize;
    measure(): MeasuredSize;
    protected render(): void;
    destroy(): void;
}
