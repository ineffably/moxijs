import * as PIXI from 'pixi.js';
import { EdgeInsets } from '../../core/edge-insets';
import { BaseCardStyle, CardThemeColors, CardSectionDimensions } from './card-style';
export interface FlatCardStyleConfig {
    borderRadius?: number;
    borderWidth?: number;
    titleBarHeight?: number;
    dragStripHeight?: number;
    footerHeight?: number;
    contentPadding?: number;
    showShadow?: boolean;
    shadowOffset?: number;
    shadowAlpha?: number;
}
export declare class FlatCardStyle extends BaseCardStyle {
    private config;
    constructor(config?: FlatCardStyleConfig);
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
