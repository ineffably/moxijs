import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { EdgeInsets } from '../core/edge-insets';
import { LayoutEngine } from '../services';

/**
 * Props for configuring a UIScrollContainer
 *
 * @category UI
 */
export interface UIScrollContainerProps {
  /** Width of the scroll container */
  width: number;
  /** Height of the scroll container (viewport height) */
  height: number;
  /** Background color of the container */
  backgroundColor?: number;
  /** Border radius */
  borderRadius?: number;
  /** Scrollbar width */
  scrollbarWidth?: number;
  /** Scrollbar track color */
  scrollbarTrackColor?: number;
  /** Scrollbar thumb color */
  scrollbarThumbColor?: number;
  /** Scrollbar thumb hover color */
  scrollbarThumbHoverColor?: number;
  /** Whether to show scrollbar only on hover */
  scrollbarAutoHide?: boolean;
  /** Padding inside the scroll container */
  padding?: EdgeInsets;
}

/**
 * A scrollable container with a visual scrollbar
 * Supports mouse wheel scrolling and draggable scrollbar thumb
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const scrollContainer = new UIScrollContainer({
 *   width: 400,
 *   height: 300,
 *   backgroundColor: 0xffffff
 * });
 *
 * // Add children that exceed the viewport height
 * scrollContainer.addChild(someUIComponent);
 * ```
 */
export class UIScrollContainer extends UIComponent {
  private props: Required<UIScrollContainerProps>;
  private background: PIXI.Graphics;
  private contentContainer: PIXI.Container;
  private contentMask: PIXI.Graphics;
  private scrollbarTrack: PIXI.Graphics;
  private scrollbarThumb: PIXI.Graphics;

  // Services (composition)

  // Public children array for focus manager discovery
  public children: UIComponent[] = [];

  private scrollY: number = 0;
  private maxScrollY: number = 0;
  private contentHeight: number = 0;
  private isDragging: boolean = false;
  private dragStartY: number = 0;
  private dragStartScrollY: number = 0;
  private isHoveringThumb: boolean = false;

  // Bound handlers for proper cleanup
  private boundGlobalPointerMove: ((e: PointerEvent) => void) | null = null;
  private boundGlobalPointerUp: (() => void) | null = null;

  constructor(props: UIScrollContainerProps, boxModel?: Partial<BoxModel>) {
    super(boxModel);


    this.props = {
      width: props.width,
      height: props.height,
      backgroundColor: props.backgroundColor ?? 0xffffff,
      borderRadius: props.borderRadius ?? 0,
      scrollbarWidth: props.scrollbarWidth ?? 12,
      scrollbarTrackColor: props.scrollbarTrackColor ?? 0xe0e0e0,
      scrollbarThumbColor: props.scrollbarThumbColor ?? 0x888888,
      scrollbarThumbHoverColor: props.scrollbarThumbHoverColor ?? 0x555555,
      scrollbarAutoHide: props.scrollbarAutoHide ?? false,
      padding: props.padding ?? EdgeInsets.all(0)
    };

    // Set box model dimensions
    this.boxModel.width = this.props.width;
    this.boxModel.height = this.props.height;

    // Create background
    this.background = new PIXI.Graphics();
    this.updateBackground();
    this.container.addChild(this.background);

    // Create content container
    this.contentContainer = new PIXI.Container();
    this.contentContainer.x = this.props.padding.left;
    this.contentContainer.y = this.props.padding.top;
    this.container.addChild(this.contentContainer);

    // Create mask for content
    this.contentMask = new PIXI.Graphics();
    this.updateMask();
    this.container.addChild(this.contentMask);
    this.contentContainer.mask = this.contentMask;

    // Create scrollbar track
    this.scrollbarTrack = new PIXI.Graphics();
    this.scrollbarTrack.eventMode = 'static';
    this.scrollbarTrack.cursor = 'pointer';
    this.container.addChild(this.scrollbarTrack);

    // Create scrollbar thumb
    this.scrollbarThumb = new PIXI.Graphics();
    this.scrollbarThumb.eventMode = 'static';
    this.scrollbarThumb.cursor = 'pointer';
    this.container.addChild(this.scrollbarThumb);

    // Setup interactivity
    this.setupInteractivity();

    // Initial scrollbar update
    this.updateScrollbar();
  }

  /**
   * Updates the background graphics
   */
  private updateBackground(): void {
    this.background.clear();
    this.background.roundRect(
      0,
      0,
      this.props.width,
      this.props.height,
      this.props.borderRadius
    );
    this.background.fill({ color: this.props.backgroundColor });
  }

  /**
   * Updates the content mask
   */
  private updateMask(): void {
    const contentWidth = this.props.width - this.props.padding.left - this.props.padding.right - this.props.scrollbarWidth;
    const contentHeight = this.props.height - this.props.padding.top - this.props.padding.bottom;

    this.contentMask.clear();
    this.contentMask.rect(
      this.props.padding.left,
      this.props.padding.top,
      contentWidth,
      contentHeight
    );
    this.contentMask.fill({ color: 0xffffff });
  }

  /**
   * Sets up mouse/wheel event handlers
   */
  private setupInteractivity(): void {
    // Mouse wheel scrolling
    this.makeInteractive('default');
    this.container.on('wheel', this.handleWheel.bind(this));

    // Scrollbar thumb dragging
    this.scrollbarThumb.on('pointerdown', this.handleThumbPointerDown.bind(this));
    this.scrollbarThumb.on('pointerover', () => {
      this.isHoveringThumb = true;
      this.updateScrollbar();
    });
    this.scrollbarThumb.on('pointerout', () => {
      if (!this.isDragging) {
        this.isHoveringThumb = false;
        this.updateScrollbar();
      }
    });

    // Track click for jumping
    this.scrollbarTrack.on('pointerdown', this.handleTrackPointerDown.bind(this));

    // Global pointer events for dragging - store bound references for cleanup
    if (typeof window !== 'undefined') {
      this.boundGlobalPointerMove = this.handleGlobalPointerMove.bind(this);
      this.boundGlobalPointerUp = this.handleGlobalPointerUp.bind(this);
      window.addEventListener('pointermove', this.boundGlobalPointerMove);
      window.addEventListener('pointerup', this.boundGlobalPointerUp);
    }
  }

  /**
   * Handles mouse wheel events
   */
  private handleWheel(e: PIXI.FederatedWheelEvent): void {
    e.preventDefault();

    const delta = e.deltaY;
    this.scrollY += delta;
    this.scrollY = Math.max(0, Math.min(this.maxScrollY, this.scrollY));

    this.updateContentPosition();
    this.updateScrollbar();
  }

  /**
   * Handles pointer down on scrollbar thumb
   */
  private handleThumbPointerDown(e: PIXI.FederatedPointerEvent): void {
    this.isDragging = true;
    this.dragStartY = e.globalY;
    this.dragStartScrollY = this.scrollY;
    e.stopPropagation();
  }

  /**
   * Handles pointer down on scrollbar track
   */
  private handleTrackPointerDown(e: PIXI.FederatedPointerEvent): void {
    const localY = e.globalY - this.container.worldTransform.ty;
    const thumbHeight = this.getThumbHeight();
    const trackTop = 0;
    const trackBottom = this.props.height;

    // Calculate target scroll position
    const clickRatio = (localY - trackTop) / (trackBottom - trackTop);
    this.scrollY = clickRatio * this.maxScrollY;
    this.scrollY = Math.max(0, Math.min(this.maxScrollY, this.scrollY));

    this.updateContentPosition();
    this.updateScrollbar();
  }

  /**
   * Handles global pointer move for thumb dragging
   */
  private handleGlobalPointerMove(e: PointerEvent): void {
    if (!this.isDragging) return;

    const deltaY = e.clientY - this.dragStartY;
    const trackHeight = this.props.height;
    const thumbHeight = this.getThumbHeight();
    const scrollableTrackHeight = trackHeight - thumbHeight;

    if (scrollableTrackHeight <= 0) return;

    const scrollDelta = (deltaY / scrollableTrackHeight) * this.maxScrollY;
    this.scrollY = this.dragStartScrollY + scrollDelta;
    this.scrollY = Math.max(0, Math.min(this.maxScrollY, this.scrollY));

    this.updateContentPosition();
    this.updateScrollbar();
  }

  /**
   * Handles global pointer up to end dragging
   */
  private handleGlobalPointerUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      if (!this.isHoveringThumb) {
        this.updateScrollbar();
      }
    }
  }

  /**
   * Updates the content position based on scroll
   */
  private updateContentPosition(): void {
    this.contentContainer.y = this.props.padding.top - this.scrollY;
  }

  /**
   * Calculates the thumb height based on content ratio
   */
  private getThumbHeight(): number {
    if (this.contentHeight <= 0) return 0;

    const viewportHeight = this.props.height - this.props.padding.top - this.props.padding.bottom;
    const ratio = viewportHeight / this.contentHeight;
    const thumbHeight = Math.max(30, this.props.height * ratio);

    return Math.min(thumbHeight, this.props.height);
  }

  /**
   * Gets the thumb Y position
   */
  private getThumbY(): number {
    if (this.maxScrollY <= 0) return 0;

    const trackHeight = this.props.height;
    const thumbHeight = this.getThumbHeight();
    const scrollableTrackHeight = trackHeight - thumbHeight;

    const scrollRatio = this.scrollY / this.maxScrollY;
    return scrollRatio * scrollableTrackHeight;
  }

  /**
   * Updates the scrollbar appearance
   */
  private updateScrollbar(): void {
    const trackX = this.props.width - this.props.scrollbarWidth;
    const trackWidth = this.props.scrollbarWidth;
    const trackHeight = this.props.height;

    // Update track
    this.scrollbarTrack.clear();
    this.scrollbarTrack.rect(trackX, 0, trackWidth, trackHeight);
    this.scrollbarTrack.fill({ color: this.props.scrollbarTrackColor });

    // Update thumb
    const thumbHeight = this.getThumbHeight();
    const thumbY = this.getThumbY();
    const thumbColor = (this.isHoveringThumb || this.isDragging)
      ? this.props.scrollbarThumbHoverColor
      : this.props.scrollbarThumbColor;

    this.scrollbarThumb.clear();

    // Only show thumb if content is scrollable
    if (this.maxScrollY > 0) {
      this.scrollbarThumb.roundRect(
        trackX + 2,
        thumbY + 2,
        trackWidth - 4,
        thumbHeight - 4,
        4
      );
      this.scrollbarThumb.fill({ color: thumbColor });
      this.scrollbarThumb.visible = true;
    } else {
      this.scrollbarThumb.visible = false;
    }

    // Handle auto-hide
    if (this.props.scrollbarAutoHide && !this.isDragging && !this.isHoveringThumb) {
      this.scrollbarTrack.alpha = 0;
      this.scrollbarThumb.alpha = 0;
    } else {
      this.scrollbarTrack.alpha = 1;
      this.scrollbarThumb.alpha = 1;
    }
  }

  /**
   * Recalculates content height and max scroll
   */
  private updateContentBounds(): void {
    // Calculate content height from children's computed layouts
    let maxHeight = 0;

    this.contentContainer.children.forEach((child: any) => {
      if (child && typeof child.y === 'number' && typeof child.height === 'number') {
        const childBottom = child.y + child.height;
        if (childBottom > maxHeight) {
          maxHeight = childBottom;
        }
      }
    });

    this.contentHeight = maxHeight;

    const viewportHeight = this.props.height - this.props.padding.top - this.props.padding.bottom;
    this.maxScrollY = Math.max(0, this.contentHeight - viewportHeight);

    // Clamp current scroll position
    this.scrollY = Math.max(0, Math.min(this.maxScrollY, this.scrollY));

    this.updateContentPosition();
    this.updateScrollbar();
  }

  /**
   * Adds a child to the scrollable content
   */
  addChild(child: UIComponent): void {
    // Set parent reference for scroll-into-view support
    child.parent = this as any;

    // Track child for focus manager discovery
    this.children.push(child);

    this.contentContainer.addChild(child.container);

    // Layout the child with available content width
    const contentWidth = this.props.width - this.props.padding.left - this.props.padding.right - this.props.scrollbarWidth;
    const contentHeight = 999999; // Allow unlimited height for scrolling
    child.layout(contentWidth, contentHeight);

    this.updateContentBounds();
  }

  /**
   * Removes a child from the scrollable content
   */
  removeChild(child: UIComponent): void {
    child.parent = undefined;

    // Remove from children tracking
    const index = this.children.indexOf(child);
    if (index !== -1) {
      this.children.splice(index, 1);
    }

    this.contentContainer.removeChild(child.container);
    this.updateContentBounds();
  }

  /**
   * Scrolls to a specific Y position
   */
  scrollTo(y: number): void {
    this.scrollY = Math.max(0, Math.min(this.maxScrollY, y));
    this.updateContentPosition();
    this.updateScrollbar();
  }

  /**
   * Scrolls to the top
   */
  scrollToTop(): void {
    this.scrollTo(0);
  }

  /**
   * Scrolls to the bottom
   */
  scrollToBottom(): void {
    this.scrollTo(this.maxScrollY);
  }

  /**
   * Gets the current scroll position
   */
  getScrollY(): number {
    return this.scrollY;
  }

  /**
   * Gets the maximum scroll position
   */
  getMaxScrollY(): number {
    return this.maxScrollY;
  }

  /**
   * Scrolls to make a child component visible
   */
  scrollToComponent(component: UIComponent): void {
    const componentBounds = component.getGlobalBounds();
    const containerBounds = this.getGlobalBounds();

    // Calculate component position relative to scroll container's content area
    const relativeY = componentBounds.y - containerBounds.y - this.props.padding.top + this.scrollY;
    const viewportHeight = this.props.height - this.props.padding.top - this.props.padding.bottom;

    // Check if component is above viewport
    if (relativeY < this.scrollY) {
      // Scroll up to show component at top
      this.scrollTo(relativeY);
    }
    // Check if component is below viewport
    else if (relativeY + componentBounds.height > this.scrollY + viewportHeight) {
      // Scroll down to show component at bottom
      const targetScroll = relativeY + componentBounds.height - viewportHeight;
      this.scrollTo(targetScroll);
    }
    // Component is already visible, no need to scroll
  }

  /**
   * Measures the size needed for this container
   */
  measure(): MeasuredSize {
    const contentSize: MeasuredSize = {
      width: this.props.width,
      height: this.props.height
    };
    
    return this.layoutEngine.measure(this.boxModel, contentSize);
  }

  /**
   * Performs layout for this container
   */
  layout(availableWidth: number, availableHeight: number): void {
    super.layout(availableWidth, availableHeight);
    this.updateContentBounds();
  }

  /**
   * Renders the container
   */
  protected render(): void {
    // Rendering handled by background, content, mask, and scrollbar
  }

  /**
   * Cleanup when destroying
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      if (this.boundGlobalPointerMove) {
        window.removeEventListener('pointermove', this.boundGlobalPointerMove);
        this.boundGlobalPointerMove = null;
      }
      if (this.boundGlobalPointerUp) {
        window.removeEventListener('pointerup', this.boundGlobalPointerUp);
        this.boundGlobalPointerUp = null;
      }
    }
    super.destroy();
  }
}
