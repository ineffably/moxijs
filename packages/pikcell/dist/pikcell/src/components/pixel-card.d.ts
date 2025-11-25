/**
 * Pixel-perfect card component with drag, resize, and triple border
 */
import * as PIXI from 'pixi.js';
import { GRID, BORDER, px } from 'moxi';
export { GRID, BORDER, px };
export declare const UI_COLORS: {
    readonly cardBg: number;
    readonly cardBorder: number;
    readonly middleBorder: number;
    readonly text: number;
    readonly titleBar: number;
    readonly selected: number;
    readonly buttonBg: number;
};
export interface PixelCardOptions {
    title: string;
    x?: number;
    y?: number;
    contentWidth: number;
    contentHeight: number;
    renderer: PIXI.Renderer;
    onResize?: (width: number, height: number) => void;
    onRefresh?: () => void;
    minContentSize?: boolean;
    backgroundColor?: number;
    clipContent?: boolean;
    pairedCard?: PixelCard;
    onFocus?: () => void;
}
export interface PixelCardResizeState {
    contentWidth: number;
    contentHeight: number;
    minContentWidth?: number;
    minContentHeight?: number;
}
/**
 * Creates a pixel-perfect card with drag, resize, and triple border
 */
export declare class PixelCard {
    container: PIXI.Container;
    contentContainer: PIXI.Container;
    private titleBarHeightPx;
    private isDragging;
    private dragStartX;
    private dragStartY;
    private cardStartX;
    private cardStartY;
    private isResizing;
    private resizeStartX;
    private resizeStartY;
    private resizeStartWidth;
    private resizeStartHeight;
    private resizeDirection;
    private capturedPointerId;
    private options;
    private state;
    private scaleIndicator;
    private pairedCard;
    private onFocus;
    private onStateChange;
    private contentMask;
    constructor(options: PixelCardOptions);
    private setupEventListeners;
    private redraw;
    private addResizeHandles;
    /**
     * Get the content container to add custom content
     */
    getContentContainer(): PIXI.Container;
    /**
     * Get current content dimensions
     */
    getContentSize(): {
        width: number;
        height: number;
    };
    /**
     * Set content dimensions and redraw
     */
    setContentSize(width: number, height: number): void;
    /**
     * Get total card width in pixels
     * Formula: cardWidth = px(contentWidth + BORDER.total * 2 + GRID.padding * 2)
     */
    getPixelWidth(): number;
    /**
     * Get total card height in pixels
     * Formula: cardHeight = px(contentHeight) + px(BORDER.total * 2) + titleBarHeight + px(GRID.padding * 2)
     */
    getPixelHeight(): number;
    /**
     * Manually trigger a redraw (useful after adding/changing content)
     */
    refresh(): void;
    /**
     * Update the card title
     */
    setTitle(title: string): void;
    /**
     * Set custom title bar content with left and right aligned text
     */
    setTitleContent(leftText: string, rightText: string): void;
    /**
     * Set the paired card (usually set after both cards are created)
     */
    setPairedCard(card: PixelCard): void;
    /**
     * Get the paired card
     */
    getPairedCard(): PixelCard | null;
    /**
     * Set callback for when card state changes (position/size)
     */
    onStateChanged(callback: () => void): void;
    /**
     * Export card state for persistence
     */
    exportState(id: string): {
        id: string;
        x: number;
        y: number;
        contentWidth: number;
        contentHeight: number;
        visible: boolean;
    };
    /**
     * Import card state (restore position and size)
     */
    importState(state: {
        x: number;
        y: number;
        contentWidth: number;
        contentHeight: number;
        visible: boolean;
    }): void;
    /**
     * Updates minimum content size based on actual content bounds
     * Call this after adding content to the content container when minContentSize is enabled
     */
    updateMinContentSize(): void;
    /**
     * Shows the scale indicator near the mouse
     */
    private showScaleIndicator;
    /**
     * Hides the scale indicator
     */
    private hideScaleIndicator;
}
