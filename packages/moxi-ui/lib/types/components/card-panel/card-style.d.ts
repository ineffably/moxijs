import * as PIXI from 'pixi.js';
import { EdgeInsets } from '../../core/edge-insets';
export interface CardThemeColors {
    background: number;
    border: number;
    titleBar: number;
    titleText: number;
    footerBackground?: number;
    accent?: number;
    bevel?: number;
    innerBorder?: number;
}
export interface CardSectionDimensions {
    x: number;
    y: number;
    width: number;
    height: number;
}
export interface CardStyle {
    drawBackground(graphics: PIXI.Graphics, width: number, height: number, colors: CardThemeColors): void;
    drawTitleBar(graphics: PIXI.Graphics, dims: CardSectionDimensions, colors: CardThemeColors): void;
    drawDragStrip(graphics: PIXI.Graphics, dims: CardSectionDimensions, colors: CardThemeColors): void;
    drawFooter(graphics: PIXI.Graphics, dims: CardSectionDimensions, colors: CardThemeColors): void;
    getTitleBarHeight(hasTitle: boolean): number;
    getDragStripHeight(): number;
    getFooterHeight(): number;
    getBorderInsets(): EdgeInsets;
    getContentPadding(): EdgeInsets;
}
export declare abstract class BaseCardStyle implements CardStyle {
    abstract drawBackground(graphics: PIXI.Graphics, width: number, height: number, colors: CardThemeColors): void;
    abstract drawTitleBar(graphics: PIXI.Graphics, dims: CardSectionDimensions, colors: CardThemeColors): void;
    abstract drawDragStrip(graphics: PIXI.Graphics, dims: CardSectionDimensions, colors: CardThemeColors): void;
    abstract drawFooter(graphics: PIXI.Graphics, dims: CardSectionDimensions, colors: CardThemeColors): void;
    abstract getTitleBarHeight(hasTitle: boolean): number;
    abstract getDragStripHeight(): number;
    abstract getFooterHeight(): number;
    abstract getBorderInsets(): EdgeInsets;
    abstract getContentPadding(): EdgeInsets;
}
