/**
 * CardResizeHandler - Handles card resizing logic
 *
 * Extracted from PixelCard to follow Single Responsibility Principle.
 * Manages 8-direction resizing, minimum size constraints, and scale indicator.
 */
import * as PIXI from 'pixi.js';
import { getTheme } from '../theming/theme';
import { GRID, BORDER, px } from 'moxijs';
import { UI_COLORS } from '../components/pixel-card';

export type ResizeDirection = 'e' | 'w' | 's' | 'n' | 'se' | 'sw' | 'ne' | 'nw';

export interface ResizeState {
  isResizing: boolean;
  resizeStartX: number;
  resizeStartY: number;
  resizeStartWidth: number;
  resizeStartHeight: number;
  resizeDirection: ResizeDirection | null;
}

export interface ResizeConstraints {
  minContentWidth: number;
  minContentHeight: number;
}

export interface ResizeHandlerOptions {
  renderer: PIXI.Renderer;
  container: PIXI.Container;
  getContentSize: () => { width: number; height: number };
  setContentSize: (width: number, height: number) => void;
  getCardStartPosition: () => { x: number; y: number };
  setCardStartPosition: (x: number, y: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  onResize?: (width: number, height: number) => void;
  redraw: () => void;
}

/**
 * Handles resize operations for a card container
 */
export class CardResizeHandler {
  private renderer: PIXI.Renderer;
  private container: PIXI.Container;
  private state: ResizeState;
  private constraints: ResizeConstraints;
  private capturedPointerId: number | null = null;
  private scaleIndicator: PIXI.Container | null = null;

  // Callbacks
  private getContentSize: () => { width: number; height: number };
  private setContentSize: (width: number, height: number) => void;
  private getCardStartPosition: () => { x: number; y: number };
  private setCardStartPosition: (x: number, y: number) => void;
  private onResizeStart?: () => void;
  private onResizeEnd?: () => void;
  private onResize?: (width: number, height: number) => void;
  private redraw: () => void;

  // Bound event handlers for cleanup
  private boundHandleMove: (e: PointerEvent) => void;
  private boundHandleUp: () => void;

  constructor(options: ResizeHandlerOptions) {
    this.renderer = options.renderer;
    this.container = options.container;
    this.getContentSize = options.getContentSize;
    this.setContentSize = options.setContentSize;
    this.getCardStartPosition = options.getCardStartPosition;
    this.setCardStartPosition = options.setCardStartPosition;
    this.onResizeStart = options.onResizeStart;
    this.onResizeEnd = options.onResizeEnd;
    this.onResize = options.onResize;
    this.redraw = options.redraw;

    this.state = {
      isResizing: false,
      resizeStartX: 0,
      resizeStartY: 0,
      resizeStartWidth: 0,
      resizeStartHeight: 0,
      resizeDirection: null,
    };

    this.constraints = {
      minContentWidth: 10,
      minContentHeight: 10,
    };

    // Bind handlers
    this.boundHandleMove = this.handleMove.bind(this);
    this.boundHandleUp = this.handleUp.bind(this);

    // Setup global listeners
    this.setupEventListeners();
  }

  /**
   * Check if currently resizing
   */
  get isResizing(): boolean {
    return this.state.isResizing;
  }

  /**
   * Set minimum content size constraints
   */
  setConstraints(minWidth: number, minHeight: number): void {
    this.constraints.minContentWidth = minWidth;
    this.constraints.minContentHeight = minHeight;
  }

  /**
   * Start a resize operation
   * Call this from resize handle pointerdown event
   */
  startResize(event: PIXI.FederatedPointerEvent, direction: ResizeDirection): void {
    const contentSize = this.getContentSize();

    this.state.isResizing = true;
    this.state.resizeDirection = direction;
    this.state.resizeStartX = event.client.x;
    this.state.resizeStartY = event.client.y;
    this.state.resizeStartWidth = contentSize.width;
    this.state.resizeStartHeight = contentSize.height;

    // Store card start position for west/north resizing
    this.setCardStartPosition(this.container.x, this.container.y);

    // Capture pointer
    const canvas = this.renderer.canvas as HTMLCanvasElement;
    if (canvas && event.pointerId !== undefined) {
      canvas.setPointerCapture(event.pointerId);
      this.capturedPointerId = event.pointerId;
    }

    if (this.onResizeStart) {
      this.onResizeStart();
    }
  }

  /**
   * Handle pointer move during resize
   */
  private handleMove(e: PointerEvent): void {
    if (!this.state.isResizing || !this.state.resizeDirection) return;

    const canvas = this.renderer.canvas as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const deltaScreenX = e.clientX - this.state.resizeStartX;
    const deltaScreenY = e.clientY - this.state.resizeStartY;
    const deltaX = deltaScreenX * scaleX;
    const deltaY = deltaScreenY * scaleY;

    // Calculate size changes based on direction
    const deltaGridUnitsX = Math.round(deltaX / px(1));
    const deltaGridUnitsY = Math.round(deltaY / px(1));

    const cardStart = this.getCardStartPosition();
    let newWidth = this.getContentSize().width;
    let newHeight = this.getContentSize().height;

    // Horizontal resizing
    if (this.state.resizeDirection.includes('e')) {
      // East: resize right edge (width changes, position stays)
      newWidth = Math.max(this.constraints.minContentWidth, this.state.resizeStartWidth + deltaGridUnitsX);
    } else if (this.state.resizeDirection.includes('w')) {
      // West: resize left edge (position and width both change)
      newWidth = Math.max(this.constraints.minContentWidth, this.state.resizeStartWidth - deltaGridUnitsX);
      const widthDelta = newWidth - this.state.resizeStartWidth;
      const newX = Math.max(0, cardStart.x - px(widthDelta));
      this.container.x = newX;
    }

    // Vertical resizing
    if (this.state.resizeDirection.includes('s')) {
      // South: resize bottom edge (height changes, position stays)
      newHeight = Math.max(this.constraints.minContentHeight, this.state.resizeStartHeight + deltaGridUnitsY);
    } else if (this.state.resizeDirection.includes('n')) {
      // North: resize top edge (position and height both change)
      newHeight = Math.max(this.constraints.minContentHeight, this.state.resizeStartHeight - deltaGridUnitsY);
      const heightDelta = newHeight - this.state.resizeStartHeight;
      const newY = Math.max(0, cardStart.y - px(heightDelta));
      this.container.y = newY;
    }

    // Apply new size
    this.setContentSize(newWidth, newHeight);
    this.redraw();

    // Show scale indicator
    this.showScaleIndicator(e.clientX, e.clientY, newWidth, newHeight);

    if (this.onResize) {
      this.onResize(newWidth, newHeight);
    }
  }

  /**
   * Handle pointer up to end resize
   */
  private handleUp(): void {
    if (!this.state.isResizing) return;

    const wasResizing = this.state.isResizing;
    this.state.isResizing = false;
    this.state.resizeDirection = null;

    // Release pointer capture
    this.releasePointerCapture();

    // Hide scale indicator
    this.hideScaleIndicator();

    if (wasResizing && this.onResizeEnd) {
      this.onResizeEnd();
    }
  }

  /**
   * Release pointer capture
   */
  private releasePointerCapture(): void {
    if (this.capturedPointerId !== null) {
      const canvas = this.renderer.canvas as HTMLCanvasElement;
      if (canvas) {
        try {
          canvas.releasePointerCapture(this.capturedPointerId);
        } catch {
          // Ignore errors if pointer was already released
        }
      }
      this.capturedPointerId = null;
    }
  }

  /**
   * Show the scale indicator near the mouse
   */
  private showScaleIndicator(screenX: number, screenY: number, width: number, height: number): void {
    const canvas = this.renderer.canvas as HTMLCanvasElement;
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

    const scaleText = `${width}x${height}`;

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
    text.scale.set(GRID.fontScale);

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
   * Hide the scale indicator
   */
  private hideScaleIndicator(): void {
    if (this.scaleIndicator && this.scaleIndicator.parent) {
      this.scaleIndicator.parent.removeChild(this.scaleIndicator);
      this.scaleIndicator.destroy();
      this.scaleIndicator = null;
    }
  }

  /**
   * Setup global event listeners
   */
  private setupEventListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('pointermove', this.boundHandleMove);
      window.addEventListener('pointerup', this.boundHandleUp);
    }
  }

  /**
   * Cleanup event listeners and resources
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointermove', this.boundHandleMove);
      window.removeEventListener('pointerup', this.boundHandleUp);
    }
    this.releasePointerCapture();
    this.hideScaleIndicator();
  }
}
