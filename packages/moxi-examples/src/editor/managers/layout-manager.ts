/**
 * LayoutManager - Manages card positioning and layouts
 *
 * Extracted from SpriteEditor to follow Single Responsibility Principle.
 * Handles layout presets, card positioning, dimension calculations, and viewport resizing.
 */
import * as PIXI from 'pixi.js';
import { PixelCard } from '../components/pixel-card';
import { ILayoutManager, LayoutSpec, CardPosition } from '../interfaces/managers';
import { GRID, BORDER, px } from 'moxi';
import { LAYOUT_CONSTANTS, CARD_CONSTANTS } from '../config/constants';

/**
 * Manages card layouts and positioning
 */
export class LayoutManager implements ILayoutManager {
  private layouts: Map<string, LayoutSpec> = new Map();
  private renderer: PIXI.Renderer;
  private currentLayout: string | null = null;

  constructor(renderer: PIXI.Renderer) {
    this.renderer = renderer;
    this.registerDefaultLayouts();
  }

  /**
   * Apply a layout preset
   *
   * @param layoutId Layout identifier
   * @param cards Map of cards to position
   */
  applyLayout(layoutId: string, cards: Map<string, PixelCard>): void {
    const layout = this.layouts.get(layoutId);
    if (!layout) {
      console.warn(`Layout "${layoutId}" not found`);
      return;
    }

    // Apply each card position
    Object.entries(layout.positions).forEach(([cardId, position]) => {
      const card = cards.get(cardId);
      if (card) {
        this.positionCard(card, position);
      }
    });

    this.currentLayout = layoutId;
  }

  /**
   * Apply the default layout
   *
   * @param cards Map of cards to position
   */
  applyDefaultLayout(cards: Map<string, PixelCard>): void {
    // Calculate key dimensions
    const titleBarHeight = this.calculateTitleBarHeight();
    const commanderBarHeight = px(12) + px(BORDER.total * 2) + titleBarHeight;
    const topOffset = commanderBarHeight + px(GRID.gap * 2);

    // Position commander bar at top
    const commanderCard = cards.get('commander');
    if (commanderCard) {
      commanderCard.container.position.set(0, 0);
    }

    // Position palette below commander, docked to left
    const paletteCard = cards.get('palette');
    if (paletteCard) {
      paletteCard.container.position.set(0, topOffset);
    }

    // Position info bar at bottom (full width)
    const infoCard = cards.get('info');
    if (infoCard) {
      const barHeight = 8;
      const cardTotalHeight = this.calculateCardHeightFromContent(barHeight);
      const y = this.renderer.height - cardTotalHeight;
      infoCard.container.position.set(0, y);
    }

    this.currentLayout = 'default';
  }

  /**
   * Position a single card
   *
   * @param card Card to position
   * @param position Position specification
   */
  positionCard(card: PixelCard, position: CardPosition): void {
    card.container.position.set(position.x, position.y);

    // Apply size if specified
    if (position.width !== undefined && position.height !== undefined) {
      card.setContentSize(position.width, position.height);
    }
  }

  /**
   * Get a layout by ID
   *
   * @param id Layout identifier
   * @returns The layout or undefined if not found
   */
  getLayout(id: string): LayoutSpec | undefined {
    return this.layouts.get(id);
  }

  /**
   * Register a custom layout
   *
   * @param layout Layout specification
   */
  registerLayout(layout: LayoutSpec): void {
    this.layouts.set(layout.id, layout);
  }

  /**
   * Get all available layouts
   *
   * @returns Array of all layout specifications
   */
  getAllLayouts(): LayoutSpec[] {
    return Array.from(this.layouts.values());
  }

  /**
   * Calculate card dimensions based on content size
   *
   * @param contentWidth Content width in grid units
   * @param contentHeight Content height in grid units
   * @returns Card dimensions in pixels
   */
  calculateCardDimensions(contentWidth: number, contentHeight: number): { width: number; height: number } {
    const titleBarHeight = this.calculateTitleBarHeight();

    const width = this.calculateCardWidth(contentWidth);
    const height = this.calculateCardHeight(contentHeight);

    return { width, height };
  }

  /**
   * Handle viewport resize
   *
   * This method should be called when the renderer size changes
   * to reposition cards that are anchored to viewport edges
   *
   * @param width New viewport width
   * @param height New viewport height
   */
  onViewportResize(width: number, height: number): void {
    // This would typically trigger a layout re-application
    // For now, we just store the new dimensions
    console.log(`Viewport resized to ${width}x${height}`);

    // In a full implementation, this would:
    // 1. Adjust cards anchored to right/bottom edges
    // 2. Ensure cards don't go off-screen
    // 3. Reapply layout if needed
  }

  /**
   * Calculate title bar height dynamically based on GRID.fontScale
   *
   * @private
   */
  private calculateTitleBarHeight(): number {
    const fontHeight = CARD_CONSTANTS.TITLE_FONT_SCALE_MULTIPLIER * GRID.fontScale;
    const verticalPadding = px(GRID.padding * CARD_CONSTANTS.TITLE_PADDING_MULTIPLIER);
    return Math.ceil(fontHeight + verticalPadding);
  }

  /**
   * Calculate total card width in pixels given content width in grid units
   *
   * @private
   */
  private calculateCardWidth(contentWidthGridUnits: number): number {
    const cardWidthGridUnits = contentWidthGridUnits + BORDER.total * 2 + GRID.padding * 2;
    return px(cardWidthGridUnits);
  }

  /**
   * Calculate total card height in pixels given content height in grid units
   *
   * @private
   */
  private calculateCardHeight(contentHeightGridUnits: number): number {
    const titleBarHeightPx = this.calculateTitleBarHeight();
    return px(contentHeightGridUnits) + px(BORDER.total * 2) + titleBarHeightPx + px(GRID.padding * 2);
  }

  /**
   * Calculate total card height from content height
   * Helper that wraps calculateCardHeight for public use
   *
   * @param contentHeightGridUnits Content height in grid units
   * @returns Total card height in pixels
   */
  calculateCardHeightFromContent(contentHeightGridUnits: number): number {
    return this.calculateCardHeight(contentHeightGridUnits);
  }

  /**
   * Calculate content width needed for edge-to-edge card (full viewport width)
   *
   * @param rendererWidth Viewport width in pixels
   * @returns Content width in grid units
   */
  calculateFullWidthContentSize(rendererWidth: number): number {
    return Math.floor(rendererWidth / px(1)) - (BORDER.total * 2) - (GRID.padding * 2);
  }

  /**
   * Register default layouts
   *
   * @private
   */
  private registerDefaultLayouts(): void {
    // Default layout
    this.registerLayout({
      id: 'default',
      name: 'Default Layout',
      positions: {
        commander: { x: 0, y: 0 },
        palette: { x: 0, y: 100 }, // Will be calculated dynamically
        info: { x: 0, y: 700 }, // Will be calculated dynamically
      },
    });

    // Compact layout
    this.registerLayout({
      id: 'compact',
      name: 'Compact Layout',
      positions: {
        commander: { x: 0, y: 0 },
        palette: { x: 0, y: 80 },
        tool: { x: 300, y: 80 },
        info: { x: 0, y: 700 },
      },
    });

    // Fullscreen layout
    this.registerLayout({
      id: 'fullscreen',
      name: 'Fullscreen Layout',
      positions: {
        commander: { x: 0, y: 0 },
        info: { x: 0, y: 700 },
      },
    });
  }

  /**
   * Get current layout ID
   *
   * @returns Current layout identifier or null
   */
  getCurrentLayoutId(): string | null {
    return this.currentLayout;
  }

  /**
   * Center a card in the viewport
   *
   * @param card Card to center
   */
  centerCard(card: PixelCard): void {
    const cardWidth = card.getPixelWidth();
    const cardHeight = card.getPixelHeight();

    const x = (this.renderer.width - cardWidth) / 2;
    const y = (this.renderer.height - cardHeight) / 2;

    card.container.position.set(x, y);
  }

  /**
   * Align a card to an edge of the viewport
   *
   * @param card Card to align
   * @param edge Edge to align to
   * @param offset Optional offset from edge in pixels
   */
  alignCardToEdge(
    card: PixelCard,
    edge: 'top' | 'right' | 'bottom' | 'left',
    offset: number = 0
  ): void {
    const cardWidth = card.getPixelWidth();
    const cardHeight = card.getPixelHeight();
    const currentPos = card.container.position;

    switch (edge) {
      case 'top':
        card.container.position.set(currentPos.x, offset);
        break;
      case 'right':
        card.container.position.set(this.renderer.width - cardWidth - offset, currentPos.y);
        break;
      case 'bottom':
        card.container.position.set(currentPos.x, this.renderer.height - cardHeight - offset);
        break;
      case 'left':
        card.container.position.set(offset, currentPos.y);
        break;
    }
  }

  /**
   * Position a card relative to another card
   *
   * @param card Card to position
   * @param referenceCard Reference card
   * @param direction Direction relative to reference card
   * @param gap Gap between cards in pixels
   */
  positionRelativeTo(
    card: PixelCard,
    referenceCard: PixelCard,
    direction: 'above' | 'below' | 'left' | 'right',
    gap: number = LAYOUT_CONSTANTS.CARD_GAP
  ): void {
    const refPos = referenceCard.container.position;
    const refWidth = referenceCard.getPixelWidth();
    const refHeight = referenceCard.getPixelHeight();
    const cardWidth = card.getPixelWidth();
    const cardHeight = card.getPixelHeight();

    switch (direction) {
      case 'above':
        card.container.position.set(refPos.x, refPos.y - cardHeight - gap);
        break;
      case 'below':
        card.container.position.set(refPos.x, refPos.y + refHeight + gap);
        break;
      case 'left':
        card.container.position.set(refPos.x - cardWidth - gap, refPos.y);
        break;
      case 'right':
        card.container.position.set(refPos.x + refWidth + gap, refPos.y);
        break;
    }
  }
}
