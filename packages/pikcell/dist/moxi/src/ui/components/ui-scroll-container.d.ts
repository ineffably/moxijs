import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { EdgeInsets } from '../core/edge-insets';
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
export declare class UIScrollContainer extends UIComponent {
    private props;
    private background;
    private contentContainer;
    private contentMask;
    private scrollbarTrack;
    private scrollbarThumb;
    children: UIComponent[];
    private scrollY;
    private maxScrollY;
    private contentHeight;
    private isDragging;
    private dragStartY;
    private dragStartScrollY;
    private isHoveringThumb;
    constructor(props: UIScrollContainerProps, boxModel?: Partial<BoxModel>);
    /**
     * Updates the background graphics
     */
    private updateBackground;
    /**
     * Updates the content mask
     */
    private updateMask;
    /**
     * Sets up mouse/wheel event handlers
     */
    private setupInteractivity;
    /**
     * Handles mouse wheel events
     */
    private handleWheel;
    /**
     * Handles pointer down on scrollbar thumb
     */
    private handleThumbPointerDown;
    /**
     * Handles pointer down on scrollbar track
     */
    private handleTrackPointerDown;
    /**
     * Handles global pointer move for thumb dragging
     */
    private handleGlobalPointerMove;
    /**
     * Handles global pointer up to end dragging
     */
    private handleGlobalPointerUp;
    /**
     * Updates the content position based on scroll
     */
    private updateContentPosition;
    /**
     * Calculates the thumb height based on content ratio
     */
    private getThumbHeight;
    /**
     * Gets the thumb Y position
     */
    private getThumbY;
    /**
     * Updates the scrollbar appearance
     */
    private updateScrollbar;
    /**
     * Recalculates content height and max scroll
     */
    private updateContentBounds;
    /**
     * Adds a child to the scrollable content
     */
    addChild(child: UIComponent): void;
    /**
     * Removes a child from the scrollable content
     */
    removeChild(child: UIComponent): void;
    /**
     * Scrolls to a specific Y position
     */
    scrollTo(y: number): void;
    /**
     * Scrolls to the top
     */
    scrollToTop(): void;
    /**
     * Scrolls to the bottom
     */
    scrollToBottom(): void;
    /**
     * Gets the current scroll position
     */
    getScrollY(): number;
    /**
     * Gets the maximum scroll position
     */
    getMaxScrollY(): number;
    /**
     * Scrolls to make a child component visible
     */
    scrollToComponent(component: UIComponent): void;
    /**
     * Measures the size needed for this container
     */
    measure(): MeasuredSize;
    /**
     * Performs layout for this container
     */
    layout(availableWidth: number, availableHeight: number): void;
    /**
     * Renders the container
     */
    protected render(): void;
    /**
     * Cleanup when destroying
     */
    destroy(): void;
}
