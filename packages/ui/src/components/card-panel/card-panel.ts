/**
 * Card Panel Component
 *
 * A flexible card component with optional title bar, body, and footer sections.
 * Supports dragging, resizing, and pluggable styling via CardStyle interface.
 *
 * Structure:
 * ┌─────────────────────────┐
 * │ Title Bar (optional)    │ ← draggable if enabled
 * ├─────────────────────────┤
 * │                         │
 * │      Body (content)     │
 * │                         │
 * ├─────────────────────────┤
 * │ Footer (optional)       │
 * └─────────────────────────┘
 *
 * If no title but draggable, shows minimal drag strip instead.
 *
 * @category UI
 */

import * as PIXI from 'pixi.js';
import { UIComponent } from '../../base/ui-component';
import { BoxModel, MeasuredSize } from '../../base/box-model';
import { EdgeInsets } from '../../base/edge-insets';
import { CardStyle, CardThemeColors } from './card-style';
import { FlatCardStyle } from './flat-card-style';

/**
 * Draw function for custom icon rendering
 */
export type DrawIconFn = (
  graphics: PIXI.Graphics,
  x: number,
  y: number,
  color: number,
  pixelSize: number
) => void;

/**
 * Title configuration for CardPanel
 */
export interface CardPanelTitle {
  /** Title text */
  text?: string;
  /** Font family for title text (default: 'Arial') */
  fontFamily?: string;
  /** Font size for title text (default: 14) */
  fontSize?: number;
  /** Custom icon draw function */
  icon?: DrawIconFn;
  /** Icon width in pixels (for positioning text after icon) */
  iconWidth?: number;
  /** Left-aligned additional text */
  leftText?: string;
  /** Right-aligned additional text */
  rightText?: string;
}

/**
 * Footer configuration for CardPanel
 */
export interface CardPanelFooter {
  /** Custom height (overrides style default) */
  height?: number;
}

/**
 * Resize direction for resize handles
 */
export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/**
 * CardPanel configuration
 */
export interface CardPanelProps {
  // === Sections ===
  /** Title configuration (optional - if omitted, no title bar shown) */
  title?: CardPanelTitle;
  /** Body width */
  bodyWidth: number;
  /** Body height */
  bodyHeight: number;
  /** Footer configuration (optional) */
  footer?: CardPanelFooter;

  // === Behavior ===
  /** Enable dragging (default: false) */
  draggable?: boolean;
  /** Enable resizing (default: false, or specify allowed directions) */
  resizable?: boolean | ResizeDirection[];
  /** Minimum body width when resizing */
  minWidth?: number;
  /** Minimum body height when resizing */
  minHeight?: number;
  /** Clip content to body bounds (default: false) */
  clipContent?: boolean;

  // === Styling ===
  /** Custom card style (default: FlatCardStyle) */
  style?: CardStyle;
  /** Theme colors (override automatic theme resolution) */
  colors?: Partial<CardThemeColors>;
  /** Background color override */
  backgroundColor?: number;

  // === Callbacks ===
  /** Called when card is resized */
  onResize?: (width: number, height: number) => void;
  /** Called when card position changes (drag end) */
  onMove?: (x: number, y: number) => void;
  /** Called when card is focused/clicked */
  onFocus?: () => void;
}

/**
 * Card Panel Component
 *
 * A flexible, styled card with optional title, body, and footer sections.
 * Supports dragging, resizing, and pluggable visual styles.
 *
 * @example
 * ```typescript
 * // Basic card with title
 * const card = new CardPanel({
 *   title: { text: 'My Card' },
 *   bodyWidth: 300,
 *   bodyHeight: 200,
 *   draggable: true
 * });
 *
 * // Add content to body
 * card.getBodyContainer().addChild(myContent);
 *
 * // Card without title but draggable (shows drag strip)
 * const minimalCard = new CardPanel({
 *   bodyWidth: 200,
 *   bodyHeight: 150,
 *   draggable: true
 * });
 * ```
 */
export class CardPanel extends UIComponent {
  private props: CardPanelProps;
  private cardStyle: CardStyle;
  private colors: CardThemeColors;

  // Graphics layers
  private backgroundGraphics: PIXI.Graphics;
  private headerGraphics: PIXI.Graphics;
  private footerGraphics: PIXI.Graphics;

  // Containers
  private bodyContainer: PIXI.Container;
  private footerContainer: PIXI.Container;
  private bodyMask: PIXI.Graphics | null = null;

  // Title elements
  private titleText?: PIXI.Text;
  private titleIcon?: PIXI.Graphics;

  // Drag state
  private isDragging: boolean = false;
  private dragStartPos: PIXI.Point = new PIXI.Point();
  private dragStartCardPos: PIXI.Point = new PIXI.Point();

  // Resize state
  private isResizing: boolean = false;
  private resizeDirection: ResizeDirection | null = null;
  private resizeStartSize: { width: number; height: number } = { width: 0, height: 0 };
  private resizeStartPos: PIXI.Point = new PIXI.Point();
  private resizeStartCardPos: PIXI.Point = new PIXI.Point();

  // Bound event handlers for cleanup
  private onPointerMoveBound: (e: PIXI.FederatedPointerEvent) => void;
  private onPointerUpBound: (e: PIXI.FederatedPointerEvent) => void;

  constructor(props: CardPanelProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);

    this.props = props;
    this.cardStyle = props.style ?? new FlatCardStyle();

    // Default colors (can be overridden by props.colors)
    this.colors = {
      background: props.backgroundColor ?? props.colors?.background ?? 0x2a2a2a,
      border: props.colors?.border ?? 0x404040,
      titleBar: props.colors?.titleBar ?? 0x333333,
      titleText: props.colors?.titleText ?? 0xffffff,
      footerBackground: props.colors?.footerBackground,
      accent: props.colors?.accent ?? 0x4a90e2,
      bevel: props.colors?.bevel,
      innerBorder: props.colors?.innerBorder
    };

    // Create graphics layers
    this.backgroundGraphics = new PIXI.Graphics();
    this.headerGraphics = new PIXI.Graphics();
    this.footerGraphics = new PIXI.Graphics();

    // Create containers
    this.bodyContainer = new PIXI.Container();
    this.footerContainer = new PIXI.Container();

    // Add to main container in correct order
    this.container.addChild(this.backgroundGraphics);
    this.container.addChild(this.headerGraphics);
    this.container.addChild(this.bodyContainer);
    this.container.addChild(this.footerGraphics);
    this.container.addChild(this.footerContainer);

    // Bind event handlers
    this.onPointerMoveBound = this.onPointerMove.bind(this);
    this.onPointerUpBound = this.onPointerUp.bind(this);

    // Setup interactivity
    this.setupDragging();
    this.setupResizing();

    // Initial render
    this.redraw();
  }

  /**
   * Get the body container for adding content
   */
  public getBodyContainer(): PIXI.Container {
    return this.bodyContainer;
  }

  /**
   * Get the footer container for adding content
   */
  public getFooterContainer(): PIXI.Container {
    return this.footerContainer;
  }

  /**
   * Get current body dimensions
   */
  public getBodySize(): { width: number; height: number } {
    return {
      width: this.props.bodyWidth,
      height: this.props.bodyHeight
    };
  }

  /**
   * Set body dimensions and redraw
   */
  public setBodySize(width: number, height: number): void {
    this.props.bodyWidth = width;
    this.props.bodyHeight = height;
    this.redraw();
    this.props.onResize?.(width, height);
  }

  /**
   * Update title text
   */
  public setTitle(text: string): void {
    if (!this.props.title) {
      this.props.title = {};
    }
    this.props.title.text = text;
    this.redraw();
  }

  /**
   * Update theme colors and redraw
   */
  public setColors(colors: Partial<CardThemeColors>): void {
    Object.assign(this.colors, colors);
    this.redraw();
  }

  /**
   * Refresh/redraw the card (e.g., after theme change)
   */
  public refresh(): void {
    this.redraw();
  }

  // ============ Internal Methods ============

  private redraw(): void {
    const style = this.cardStyle;
    const hasTitle = !!(this.props.title?.text || this.props.title?.icon);
    const hasFooter = !!this.props.footer;
    const isDraggable = this.props.draggable ?? false;

    // Calculate dimensions
    const borderInsets = style.getBorderInsets();
    const contentPadding = style.getContentPadding();

    // Header height logic:
    // - If title set: full title bar
    // - If no title but draggable: drag strip
    // - Otherwise: no header
    let headerHeight = 0;
    if (hasTitle) {
      headerHeight = style.getTitleBarHeight(true);
    } else if (isDraggable) {
      headerHeight = style.getDragStripHeight();
    }

    const footerHeight = hasFooter
      ? (this.props.footer?.height ?? style.getFooterHeight())
      : 0;

    // Total card dimensions
    const totalWidth =
      borderInsets.left +
      contentPadding.left +
      this.props.bodyWidth +
      contentPadding.right +
      borderInsets.right;

    const totalHeight =
      borderInsets.top +
      headerHeight +
      contentPadding.top +
      this.props.bodyHeight +
      contentPadding.bottom +
      footerHeight +
      borderInsets.bottom;

    // Draw background
    this.backgroundGraphics.clear();
    style.drawBackground(this.backgroundGraphics, totalWidth, totalHeight, this.colors);

    // Draw header (title bar or drag strip)
    this.headerGraphics.clear();
    if (hasTitle) {
      style.drawTitleBar(this.headerGraphics, {
        x: borderInsets.left,
        y: borderInsets.top,
        width: totalWidth - borderInsets.left - borderInsets.right,
        height: headerHeight
      }, this.colors);
      this.setupHeaderInteractivity(true);
      this.renderTitle(borderInsets, headerHeight);
    } else if (isDraggable) {
      style.drawDragStrip(this.headerGraphics, {
        x: borderInsets.left,
        y: borderInsets.top,
        width: totalWidth - borderInsets.left - borderInsets.right,
        height: headerHeight
      }, this.colors);
      this.setupHeaderInteractivity(true);
      this.clearTitle();
    } else {
      this.clearTitle();
    }

    // Position body container
    const bodyX = borderInsets.left + contentPadding.left;
    const bodyY = borderInsets.top + headerHeight + contentPadding.top;
    this.bodyContainer.position.set(bodyX, bodyY);

    // Setup content clipping if enabled
    this.setupBodyMask(bodyX, bodyY);

    // Draw footer
    this.footerGraphics.clear();
    if (hasFooter) {
      const footerY = totalHeight - borderInsets.bottom - footerHeight;
      style.drawFooter(this.footerGraphics, {
        x: borderInsets.left,
        y: footerY,
        width: totalWidth - borderInsets.left - borderInsets.right,
        height: footerHeight
      }, this.colors);

      // Position footer container
      this.footerContainer.position.set(
        borderInsets.left + contentPadding.left,
        footerY + contentPadding.top
      );
      this.footerContainer.visible = true;
    } else {
      this.footerContainer.visible = false;
    }

    // Update computed layout
    this.computedLayout.width = totalWidth;
    this.computedLayout.height = totalHeight;
  }

  private renderTitle(borderInsets: EdgeInsets, headerHeight: number): void {
    // Clear existing title elements
    this.clearTitle();

    const title = this.props.title;
    if (!title) return;

    const padding = 8;
    let currentX = borderInsets.left + padding;
    const centerY = borderInsets.top + headerHeight / 2;

    // Draw icon if provided
    if (title.icon) {
      this.titleIcon = new PIXI.Graphics();
      const iconSize = title.iconWidth ?? 16;
      title.icon(this.titleIcon, currentX, centerY - iconSize / 2, this.colors.titleText, 1);
      this.container.addChild(this.titleIcon);
      currentX += iconSize + padding / 2;
    }

    // Draw title text
    if (title.text) {
      this.titleText = new PIXI.Text({
        text: title.text,
        style: {
          fontFamily: title.fontFamily ?? 'Arial',
          fontSize: title.fontSize ?? 14,
          fill: this.colors.titleText
        }
      });
      this.titleText.position.set(currentX, centerY - this.titleText.height / 2);
      this.container.addChild(this.titleText);
    }
  }

  private clearTitle(): void {
    if (this.titleText) {
      this.container.removeChild(this.titleText);
      this.titleText.destroy();
      this.titleText = undefined;
    }
    if (this.titleIcon) {
      this.container.removeChild(this.titleIcon);
      this.titleIcon.destroy();
      this.titleIcon = undefined;
    }
  }

  private setupBodyMask(bodyX: number, bodyY: number): void {
    if (this.props.clipContent) {
      if (!this.bodyMask) {
        this.bodyMask = new PIXI.Graphics();
        this.container.addChild(this.bodyMask);
      }
      this.bodyMask.clear();
      this.bodyMask.rect(bodyX, bodyY, this.props.bodyWidth, this.props.bodyHeight);
      this.bodyMask.fill({ color: 0xffffff });
      this.bodyContainer.mask = this.bodyMask;
    } else if (this.bodyMask) {
      this.bodyContainer.mask = null;
    }
  }

  private setupHeaderInteractivity(draggable: boolean): void {
    this.headerGraphics.eventMode = draggable ? 'static' : 'auto';
    this.headerGraphics.cursor = draggable ? 'move' : 'default';

    // Remove existing listeners
    this.headerGraphics.removeAllListeners();

    if (draggable) {
      this.headerGraphics.on('pointerdown', this.onDragStart.bind(this));
    }
  }

  private setupDragging(): void {
    // Global move/up handlers will be added to stage when dragging starts
  }

  private onDragStart(e: PIXI.FederatedPointerEvent): void {
    if (!this.props.draggable) return;

    this.isDragging = true;
    this.dragStartPos.set(e.global.x, e.global.y);
    this.dragStartCardPos.set(this.container.x, this.container.y);

    // Notify focus
    this.props.onFocus?.();

    // Add global listeners
    const stage = this.container.parent;
    if (stage) {
      stage.eventMode = 'static';
      stage.on('pointermove', this.onPointerMoveBound);
      stage.on('pointerup', this.onPointerUpBound);
      stage.on('pointerupoutside', this.onPointerUpBound);
    }

    e.stopPropagation();
  }

  private onPointerMove(e: PIXI.FederatedPointerEvent): void {
    if (this.isDragging) {
      const dx = e.global.x - this.dragStartPos.x;
      const dy = e.global.y - this.dragStartPos.y;
      this.container.position.set(
        this.dragStartCardPos.x + dx,
        this.dragStartCardPos.y + dy
      );
    } else if (this.isResizing) {
      this.handleResize(e);
    }
  }

  private onPointerUp(e: PIXI.FederatedPointerEvent): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.props.onMove?.(this.container.x, this.container.y);
    }
    if (this.isResizing) {
      this.isResizing = false;
      this.resizeDirection = null;
      this.props.onResize?.(this.props.bodyWidth, this.props.bodyHeight);
    }

    // Remove global listeners
    const stage = this.container.parent;
    if (stage) {
      stage.off('pointermove', this.onPointerMoveBound);
      stage.off('pointerup', this.onPointerUpBound);
      stage.off('pointerupoutside', this.onPointerUpBound);
    }
  }

  private setupResizing(): void {
    if (!this.props.resizable) return;

    // Resize handles will be added in a future enhancement
    // For now, edge-based resizing can be implemented
  }

  private handleResize(e: PIXI.FederatedPointerEvent): void {
    if (!this.resizeDirection) return;

    const dx = e.global.x - this.resizeStartPos.x;
    const dy = e.global.y - this.resizeStartPos.y;
    const minWidth = this.props.minWidth ?? 50;
    const minHeight = this.props.minHeight ?? 50;

    let newWidth = this.resizeStartSize.width;
    let newHeight = this.resizeStartSize.height;
    let newX = this.resizeStartCardPos.x;
    let newY = this.resizeStartCardPos.y;

    // Handle horizontal resize
    if (this.resizeDirection.includes('e')) {
      newWidth = Math.max(minWidth, this.resizeStartSize.width + dx);
    } else if (this.resizeDirection.includes('w')) {
      const widthDelta = Math.min(dx, this.resizeStartSize.width - minWidth);
      newWidth = this.resizeStartSize.width - widthDelta;
      newX = this.resizeStartCardPos.x + widthDelta;
    }

    // Handle vertical resize
    if (this.resizeDirection.includes('s')) {
      newHeight = Math.max(minHeight, this.resizeStartSize.height + dy);
    } else if (this.resizeDirection.includes('n')) {
      const heightDelta = Math.min(dy, this.resizeStartSize.height - minHeight);
      newHeight = this.resizeStartSize.height - heightDelta;
      newY = this.resizeStartCardPos.y + heightDelta;
    }

    // Apply changes
    this.props.bodyWidth = newWidth;
    this.props.bodyHeight = newHeight;
    this.container.position.set(newX, newY);
    this.redraw();
  }

  // ============ UIComponent overrides ============

  measure(): MeasuredSize {
    return {
      width: this.computedLayout.width,
      height: this.computedLayout.height
    };
  }

  protected render(): void {
    // Rendering handled by redraw()
  }

  destroy(): void {
    this.clearTitle();
    if (this.bodyMask) {
      this.bodyMask.destroy();
    }
    super.destroy();
  }
}
