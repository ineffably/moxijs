/**
 * LayoutManager - Manages card positioning and layouts
 *
 * Extracted from SpriteEditor to follow Single Responsibility Principle.
 * Handles layout presets, card positioning, dimension calculations, and viewport resizing.
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { ILayoutManager, LayoutSpec, CardPosition } from '../interfaces/managers';
/**
 * Manages card layouts and positioning
 */
export declare class LayoutManager implements ILayoutManager {
    private layouts;
    private renderer;
    private currentLayout;
    constructor(renderer: PIXI.Renderer);
    /**
     * Apply a layout preset
     *
     * @param layoutId Layout identifier
     * @param cards Map of cards to position
     */
    applyLayout(layoutId: string, cards: Map<string, PixelCard>): void;
    /**
     * Apply the default layout
     *
     * @param cards Map of cards to position
     */
    applyDefaultLayout(cards: Map<string, PixelCard>): void;
    /**
     * Position a single card
     *
     * @param card Card to position
     * @param position Position specification
     */
    positionCard(card: PixelCard, position: CardPosition): void;
    /**
     * Get a layout by ID
     *
     * @param id Layout identifier
     * @returns The layout or undefined if not found
     */
    getLayout(id: string): LayoutSpec | undefined;
    /**
     * Register a custom layout
     *
     * @param layout Layout specification
     */
    registerLayout(layout: LayoutSpec): void;
    /**
     * Get all available layouts
     *
     * @returns Array of all layout specifications
     */
    getAllLayouts(): LayoutSpec[];
    /**
     * Calculate card dimensions based on content size
     *
     * @param contentWidth Content width in grid units
     * @param contentHeight Content height in grid units
     * @returns Card dimensions in pixels
     */
    calculateCardDimensions(contentWidth: number, contentHeight: number): {
        width: number;
        height: number;
    };
    /**
     * Handle viewport resize
     *
     * This method should be called when the renderer size changes
     * to reposition cards that are anchored to viewport edges
     *
     * @param width New viewport width
     * @param height New viewport height
     */
    onViewportResize(width: number, height: number): void;
    /**
     * Calculate title bar height dynamically based on GRID.fontScale
     *
     * @private
     */
    private calculateTitleBarHeight;
    /**
     * Calculate total card width in pixels given content width in grid units
     *
     * @private
     */
    private calculateCardWidth;
    /**
     * Calculate total card height in pixels given content height in grid units
     *
     * @private
     */
    private calculateCardHeight;
    /**
     * Calculate total card height from content height
     * Helper that wraps calculateCardHeight for public use
     *
     * @param contentHeightGridUnits Content height in grid units
     * @returns Total card height in pixels
     */
    calculateCardHeightFromContent(contentHeightGridUnits: number): number;
    /**
     * Calculate content width needed for edge-to-edge card (full viewport width)
     *
     * @param rendererWidth Viewport width in pixels
     * @returns Content width in grid units
     */
    calculateFullWidthContentSize(rendererWidth: number): number;
    /**
     * Register default layouts
     *
     * @private
     */
    private registerDefaultLayouts;
    /**
     * Get current layout ID
     *
     * @returns Current layout identifier or null
     */
    getCurrentLayoutId(): string | null;
    /**
     * Center a card in the viewport
     *
     * @param card Card to center
     */
    centerCard(card: PixelCard): void;
    /**
     * Align a card to an edge of the viewport
     *
     * @param card Card to align
     * @param edge Edge to align to
     * @param offset Optional offset from edge in pixels
     */
    alignCardToEdge(card: PixelCard, edge: 'top' | 'right' | 'bottom' | 'left', offset?: number): void;
    /**
     * Position a card relative to another card
     *
     * @param card Card to position
     * @param referenceCard Reference card
     * @param direction Direction relative to reference card
     * @param gap Gap between cards in pixels
     */
    positionRelativeTo(card: PixelCard, referenceCard: PixelCard, direction: 'above' | 'below' | 'left' | 'right', gap?: number): void;
}
