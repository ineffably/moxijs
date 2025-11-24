/**
 * Pixel-perfect card component with drag, resize, and triple border
 */
import * as PIXI from 'pixi.js';
import { getTheme } from '../theming/theme';
import { GRID, BORDER, px } from 'moxi';

// Re-export for backwards compatibility with editor code
export { GRID, BORDER, px };

// UI Colors - Maps theme tokens to component usage
export const UI_COLORS = {
  get cardBg() { return getTheme().backgroundSurface; },
  get cardBorder() { return getTheme().borderStrong; },
  get middleBorder() { return getTheme().borderSubtle; },
  get text() { return getTheme().textPrimary; },
  get titleBar() { return getTheme().backgroundOverlay; },
  get selected() { return getTheme().accentPrimary; },
  get buttonBg() { return getTheme().backgroundRaised; },
};

export interface PixelCardOptions {
  title: string;
  x?: number;
  y?: number;
  contentWidth: number;   // In grid units
  contentHeight: number;  // In grid units
  renderer: PIXI.Renderer;
  onResize?: (width: number, height: number) => void;
  onRefresh?: () => void; // Callback when card is refreshed (e.g., theme change)
  minContentSize?: boolean; // If true, prevents resizing below content's actual size
  backgroundColor?: number; // Custom background color (defaults to UI_COLORS.cardBg)
  clipContent?: boolean; // If true, clips content to container bounds (like CSS overflow: hidden)
  pairedCard?: PixelCard; // Optional paired card that should layer together
  onFocus?: () => void; // Callback when card is clicked/focused
}

export interface PixelCardResizeState {
  contentWidth: number;   // Current content width in grid units
  contentHeight: number;  // Current content height in grid units
  minContentWidth?: number;  // Minimum content width in grid units (when minContentSize is enabled)
  minContentHeight?: number; // Minimum content height in grid units (when minContentSize is enabled)
}

/**
 * Creates a pixel-perfect card with drag, resize, and triple border
 */
export class PixelCard {
  public container: PIXI.Container;
  public contentContainer: PIXI.Container;
  private titleBarHeightPx = px(5) + 4; // 5 grid units (20px at 4x scale) + 4px = 24px

  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private cardStartX = 0;
  private cardStartY = 0;

  private isResizing = false;
  private resizeStartX = 0;
  private resizeStartY = 0;
  private resizeStartWidth = 0;
  private resizeStartHeight = 0;
  private resizeDirection: 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw' | null = null;

  private options: PixelCardOptions;
  private state: PixelCardResizeState;

  private scaleIndicator: PIXI.Container | null = null;
  private pairedCard: PixelCard | null = null;
  private onFocus: (() => void) | null = null;
  private onStateChange: (() => void) | null = null;
  private contentMask: PIXI.Graphics | null = null;

  constructor(options: PixelCardOptions) {
    this.options = options;
    this.pairedCard = options.pairedCard ?? null;
    this.onFocus = options.onFocus ?? null;

    this.container = new PIXI.Container();
    this.container.position.set(options.x ?? 0, options.y ?? 0);

    this.contentContainer = new PIXI.Container();

    this.state = {
      contentWidth: options.contentWidth,
      contentHeight: options.contentHeight,
    };

    this.setupEventListeners();
    this.redraw();
  }

  private setupEventListeners() {
    const renderer = this.options.renderer;

    const handleGlobalMove = (e: PointerEvent) => {
      if (this.isDragging) {
        const canvas = renderer.canvas as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const deltaScreenX = e.clientX - this.dragStartX;
        const deltaScreenY = e.clientY - this.dragStartY;

        const deltaX = deltaScreenX * scaleX;
        const deltaY = deltaScreenY * scaleY;

        this.container.x = this.cardStartX + deltaX;
        this.container.y = this.cardStartY + deltaY;
      } else if (this.isResizing && this.resizeDirection) {
        const canvas = renderer.canvas as HTMLCanvasElement;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const deltaScreenX = e.clientX - this.resizeStartX;
        const deltaScreenY = e.clientY - this.resizeStartY;
        const deltaX = deltaScreenX * scaleX;
        const deltaY = deltaScreenY * scaleY;

        // Calculate size changes based on direction
        const deltaGridUnitsX = Math.round(deltaX / px(1));
        const deltaGridUnitsY = Math.round(deltaY / px(1));

        // Determine minimum sizes
        const minWidth = this.state.minContentWidth ?? 10;
        const minHeight = this.state.minContentHeight ?? 10;

        // Horizontal resizing
        if (this.resizeDirection.includes('e')) {
          this.state.contentWidth = Math.max(minWidth, this.resizeStartWidth + deltaGridUnitsX);
        } else if (this.resizeDirection.includes('w')) {
          this.state.contentWidth = Math.max(minWidth, this.resizeStartWidth - deltaGridUnitsX);
        }

        // Vertical resizing
        if (this.resizeDirection.includes('s')) {
          this.state.contentHeight = Math.max(minHeight, this.resizeStartHeight + deltaGridUnitsY);
        } else if (this.resizeDirection.includes('n')) {
          this.state.contentHeight = Math.max(minHeight, this.resizeStartHeight - deltaGridUnitsY);
        }

        this.redraw();

        // Show scale indicator
        this.showScaleIndicator(e.clientX, e.clientY);

        if (this.options.onResize) {
          this.options.onResize(this.state.contentWidth, this.state.contentHeight);
        }
      }
    };

    const handleGlobalUp = () => {
      const wasDragging = this.isDragging;
      const wasResizing = this.isResizing;

      this.isDragging = false;
      this.isResizing = false;
      this.resizeDirection = null;

      // Hide scale indicator
      this.hideScaleIndicator();

      // Trigger state change callback if position or size changed
      if ((wasDragging || wasResizing) && this.onStateChange) {
        this.onStateChange();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', handleGlobalMove);
      window.addEventListener('pointerup', handleGlobalUp);

      this.container.on('destroyed', () => {
        window.removeEventListener('pointermove', handleGlobalMove);
        window.removeEventListener('pointerup', handleGlobalUp);
      });
    }
  }

  private redraw() {
    // Clear all children except content container
    this.container.removeChildren();

    const cardWidth = BORDER.total * 2 + GRID.padding * 2 + this.state.contentWidth;
    const cardHeight = px(BORDER.total * 2) + this.titleBarHeightPx + px(GRID.padding * 2) + px(this.state.contentHeight);

    // Card background with triple border
    const bg = new PIXI.Graphics();
    bg.roundPixels = true;

    // Shadow offset
    const shadowOffset = px(1);
    const shadowColor = 0x000000;

    // Drop shadow (below and to the right)
    bg.rect(shadowOffset, shadowOffset, px(cardWidth), cardHeight);
    bg.fill({ color: shadowColor, alpha: 0.3 });

    // Layer 1: Outer black border
    bg.rect(0, 0, px(cardWidth), cardHeight);
    bg.fill({ color: 0x000000 });

    // Layer 2: Middle tan border
    bg.rect(px(BORDER.outer), px(BORDER.outer),
            px(cardWidth - BORDER.outer * 2), cardHeight - px(BORDER.outer * 2));
    bg.fill({ color: UI_COLORS.middleBorder });

    // Layer 3: Inner black border
    bg.rect(px(BORDER.outer + BORDER.middle), px(BORDER.outer + BORDER.middle),
            px(cardWidth - (BORDER.outer + BORDER.middle) * 2),
            cardHeight - px((BORDER.outer + BORDER.middle) * 2));
    bg.fill({ color: 0x000000 });

    // Layer 4: Content background
    bg.rect(px(BORDER.total), px(BORDER.total),
            px(cardWidth - BORDER.total * 2), cardHeight - px(BORDER.total * 2));
    bg.fill({ color: this.options.backgroundColor ?? UI_COLORS.cardBg });

    this.container.addChild(bg);

    // Title bar
    const titleBar = new PIXI.Graphics();
    titleBar.roundPixels = true;
    titleBar.eventMode = 'static';
    titleBar.cursor = 'move';
    titleBar.rect(px(BORDER.total), px(BORDER.total),
                  px(cardWidth - BORDER.total * 2), this.titleBarHeightPx);
    titleBar.fill({ color: UI_COLORS.titleBar });

    // Title bar dragging and focus
    titleBar.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
      // Trigger focus callback to bring this card to front
      if (this.onFocus) {
        this.onFocus();
      }

      this.isDragging = true;
      this.cardStartX = this.container.x;
      this.cardStartY = this.container.y;

      const canvas = this.options.renderer.canvas as HTMLCanvasElement;
      const rect = canvas.getBoundingClientRect();
      this.dragStartX = e.client.x;
      this.dragStartY = e.client.y;

      e.stopPropagation();
    });

    this.container.addChild(titleBar);

    // Title text
    const theme = getTheme();
    const titleText = new PIXI.BitmapText({
      text: this.options.title,
      style: {
        fontFamily: 'PixelOperator8Bitmap',
        fontSize: 64,
        fill: theme.textPrimary,
      }
    });
    titleText.roundPixels = true;
    titleText.scale.set(GRID.fontScale); // Scale 64px down based on GRID.fontScale

    const textHeight = titleText.height;
    const verticalCenter = px(BORDER.total) + (this.titleBarHeightPx - textHeight) / 2;
    titleText.position.set(px(BORDER.total) + 2, Math.floor(verticalCenter));
    this.container.addChild(titleText);

    // Position content container
    this.contentContainer.position.set(
      px(BORDER.total + GRID.padding),
      px(BORDER.total) + this.titleBarHeightPx + px(GRID.padding)
    );

    // Create mask to clip content (like CSS overflow: hidden) - only if enabled
    if (this.options.clipContent) {
      // Reuse existing mask or create new one
      if (!this.contentMask) {
        this.contentMask = new PIXI.Graphics();
      }

      this.contentMask.clear();
      this.contentMask.rect(
        px(BORDER.total + GRID.padding),
        px(BORDER.total) + this.titleBarHeightPx + px(GRID.padding),
        px(this.state.contentWidth),
        px(this.state.contentHeight)
      );
      this.contentMask.fill({ color: 0xffffff });
      this.container.addChild(this.contentMask);
      this.contentContainer.mask = this.contentMask;
    } else {
      this.contentContainer.mask = null;
    }

    this.container.addChild(this.contentContainer);

    // Add resize handles
    this.addResizeHandles(cardWidth, cardHeight);
  }

  private addResizeHandles(cardWidth: number, cardHeight: number) {
    const handleThickness = px(1);
    const cornerSize = px(2);

    const createResizeHandle = (
      x: number,
      y: number,
      width: number,
      height: number,
      cursor: string,
      direction: 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw'
    ) => {
      const handle = new PIXI.Graphics();
      handle.roundPixels = true;
      handle.eventMode = 'static';
      handle.cursor = cursor;
      handle.rect(0, 0, width, height);
      handle.fill({ color: 0x000000, alpha: 0.01 });
      handle.position.set(x, y);

      handle.on('pointerdown', (e: PIXI.FederatedPointerEvent) => {
        this.isResizing = true;
        this.resizeDirection = direction;
        this.resizeStartX = e.client.x;
        this.resizeStartY = e.client.y;
        this.resizeStartWidth = this.state.contentWidth;
        this.resizeStartHeight = this.state.contentHeight;
        e.stopPropagation();
      });

      this.container.addChild(handle);
    };

    // Corners
    createResizeHandle(0, 0, cornerSize, cornerSize, 'nwse-resize', 'nw');
    createResizeHandle(px(cardWidth) - cornerSize, 0, cornerSize, cornerSize, 'nesw-resize', 'ne');
    createResizeHandle(0, cardHeight - cornerSize, cornerSize, cornerSize, 'nesw-resize', 'sw');
    createResizeHandle(px(cardWidth) - cornerSize, cardHeight - cornerSize, cornerSize, cornerSize, 'nwse-resize', 'se');

    // Edges
    createResizeHandle(cornerSize, 0, px(cardWidth) - cornerSize * 2, handleThickness, 'ns-resize', 'n');
    createResizeHandle(cornerSize, cardHeight - handleThickness, px(cardWidth) - cornerSize * 2, handleThickness, 'ns-resize', 's');
    createResizeHandle(0, cornerSize, handleThickness, cardHeight - cornerSize * 2, 'ew-resize', 'w');
    createResizeHandle(px(cardWidth) - handleThickness, cornerSize, handleThickness, cardHeight - cornerSize * 2, 'ew-resize', 'e');
  }

  /**
   * Get the content container to add custom content
   */
  public getContentContainer(): PIXI.Container {
    return this.contentContainer;
  }

  /**
   * Get current content dimensions
   */
  public getContentSize(): { width: number; height: number } {
    return {
      width: this.state.contentWidth,
      height: this.state.contentHeight
    };
  }

  /**
   * Set content dimensions and redraw
   */
  public setContentSize(width: number, height: number) {
    this.state.contentWidth = width;
    this.state.contentHeight = height;
    this.redraw();

    // Trigger onResize callback so content can adapt to new size
    if (this.options.onResize) {
      this.options.onResize(width, height);
    }
  }

  /**
   * Manually trigger a redraw (useful after adding/changing content)
   */
  public refresh() {
    this.redraw();

    // Trigger content refresh callback if provided
    if (this.options.onRefresh) {
      this.options.onRefresh();
    }
  }

  /**
   * Update the card title
   */
  public setTitle(title: string) {
    this.options.title = title;
    this.redraw();
  }

  /**
   * Set the paired card (usually set after both cards are created)
   */
  public setPairedCard(card: PixelCard) {
    this.pairedCard = card;
  }

  /**
   * Set callback for when card state changes (position/size)
   */
  public onStateChanged(callback: () => void) {
    this.onStateChange = callback;
  }

  /**
   * Export card state for persistence
   */
  public exportState(id: string): { id: string; x: number; y: number; contentWidth: number; contentHeight: number; visible: boolean } {
    return {
      id,
      x: this.container.x,
      y: this.container.y,
      contentWidth: this.state.contentWidth,
      contentHeight: this.state.contentHeight,
      visible: this.container.visible
    };
  }

  /**
   * Import card state (restore position and size)
   */
  public importState(state: { x: number; y: number; contentWidth: number; contentHeight: number; visible: boolean }): void {
    this.container.position.set(state.x, state.y);
    this.container.visible = state.visible;

    if (state.contentWidth !== this.state.contentWidth ||
        state.contentHeight !== this.state.contentHeight) {
      this.setContentSize(state.contentWidth, state.contentHeight);
    }
  }

  /**
   * Updates minimum content size based on actual content bounds
   * Call this after adding content to the content container when minContentSize is enabled
   */
  public updateMinContentSize() {
    if (!this.options.minContentSize) return;

    const bounds = this.contentContainer.getLocalBounds();

    // Convert pixel bounds to grid units (round up to ensure content fits)
    const minWidth = Math.ceil((bounds.x + bounds.width) / px(1));
    const minHeight = Math.ceil((bounds.y + bounds.height) / px(1));

    this.state.minContentWidth = minWidth;
    this.state.minContentHeight = minHeight;

    // Ensure current size is at least the minimum
    if (this.state.contentWidth < minWidth || this.state.contentHeight < minHeight) {
      this.state.contentWidth = Math.max(this.state.contentWidth, minWidth);
      this.state.contentHeight = Math.max(this.state.contentHeight, minHeight);
      this.redraw();
    }
  }

  /**
   * Shows the scale indicator near the mouse
   */
  private showScaleIndicator(screenX: number, screenY: number) {
    const canvas = this.options.renderer.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (screenX - rect.left) * scaleX;
    const canvasY = (screenY - rect.top) * scaleY;

    if (!this.scaleIndicator) {
      this.scaleIndicator = new PIXI.Container();
    }

    // Clear and rebuild
    this.scaleIndicator.removeChildren();

    const scaleText = `${this.state.contentWidth}x${this.state.contentHeight}`;

    const theme = getTheme();
    const text = new PIXI.BitmapText({
      text: scaleText,
      style: {
        fontFamily: 'PixelOperator8Bitmap',
        fontSize: 64,
        fill: theme.textPrimary,
      }
    });
    text.roundPixels = true;
    text.scale.set(GRID.fontScale); // Scale 64px down based on GRID.fontScale

    const padding = px(2);
    const borderWidth = px(BORDER.outer);
    const shadowOffset = px(1);
    const indicatorWidth = text.width + padding * 2 + borderWidth * 2;
    const indicatorHeight = text.height + padding * 2 + borderWidth * 2;

    const bg = new PIXI.Graphics();
    bg.roundPixels = true;

    // Gray drop shadow
    bg.rect(shadowOffset, shadowOffset, indicatorWidth, indicatorHeight);
    bg.fill({ color: UI_COLORS.titleBar });

    // White outer border
    bg.rect(0, 0, indicatorWidth, indicatorHeight);
    bg.fill({ color: 0xffffff });

    // Black background
    bg.rect(borderWidth, borderWidth,
            indicatorWidth - borderWidth * 2,
            indicatorHeight - borderWidth * 2);
    bg.fill({ color: 0x000000 });

    this.scaleIndicator.addChild(bg);
    text.position.set(borderWidth + padding, borderWidth + padding);
    this.scaleIndicator.addChild(text);

    // Position above and to the right of mouse
    this.scaleIndicator.position.set(
      canvasX + 10,
      canvasY - indicatorHeight - 10
    );

    // Add to container parent (scene) not the card itself
    if (this.container.parent) {
      this.container.parent.addChild(this.scaleIndicator);
    }
  }

  /**
   * Hides the scale indicator
   */
  private hideScaleIndicator() {
    if (this.scaleIndicator && this.scaleIndicator.parent) {
      this.scaleIndicator.parent.removeChild(this.scaleIndicator);
      this.scaleIndicator.destroy();
      this.scaleIndicator = null;
    }
  }
}
