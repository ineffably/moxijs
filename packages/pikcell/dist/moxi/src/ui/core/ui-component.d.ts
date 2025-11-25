import PIXI from 'pixi.js';
import { BoxModel, ComputedLayout, MeasuredSize } from './box-model';
/**
 * Base abstract class for all UI components
 * Provides box model, layout, and rendering functionality
 *
 * @category UI
 */
export declare abstract class UIComponent {
    /**
     * The PIXI container that holds this component's visual representation
     */
    container: PIXI.Container;
    /**
     * The box model defining this component's sizing and spacing
     */
    protected boxModel: BoxModel;
    /**
     * Focus ring for visual focus indication
     */
    protected focusRing?: PIXI.Graphics;
    /**
     * The computed layout after measurement and positioning
     */
    protected computedLayout: ComputedLayout;
    /**
     * Reference to parent component (if any)
     */
    parent?: UIComponent;
    /**
     * Whether this component is currently visible
     */
    visible: boolean;
    /**
     * Whether this component is enabled for interaction
     */
    enabled: boolean;
    /**
     * Flag indicating if layout needs to be recalculated
     */
    protected layoutDirty: boolean;
    /**
     * Tab index for focus order (-1 means not focusable by tab)
     */
    tabIndex: number;
    /**
     * Internal focus state
     */
    protected focused: boolean;
    constructor(boxModel?: Partial<BoxModel>);
    /**
     * Creates the focus ring graphics
     */
    private createFocusRing;
    /**
     * Updates the focus ring appearance based on component size
     */
    protected updateFocusRing(): void;
    /**
     * Measures the size this component needs
     * Must be implemented by subclasses
     *
     * @returns The measured width and height
     */
    abstract measure(): MeasuredSize;
    /**
     * Performs layout for this component within the given available space
     * Must be implemented by subclasses
     *
     * @param availableWidth - Available width in pixels
     * @param availableHeight - Available height in pixels
     */
    abstract layout(availableWidth: number, availableHeight: number): void;
    /**
     * Renders the component's visuals
     * Called after layout is complete
     */
    protected abstract render(): void;
    /**
     * Marks this component's layout as dirty, requiring recalculation
     */
    markLayoutDirty(): void;
    /**
     * Gets the computed layout of this component
     */
    getLayout(): ComputedLayout;
    /**
     * Gets the box model of this component
     */
    getBoxModel(): BoxModel;
    /**
     * Gets the global bounds of this component (position relative to stage)
     */
    getGlobalBounds(): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /**
     * Sets the position of this component
     */
    setPosition(x: number, y: number): void;
    /**
     * Shows this component
     */
    show(): void;
    /**
     * Hides this component
     */
    hide(): void;
    /**
     * Whether this component can receive focus
     */
    canFocus(): boolean;
    /**
     * Whether this component is currently focused
     */
    isFocused(): boolean;
    /**
     * Called when component receives focus
     * Override in subclasses to customize focus behavior
     */
    onFocus(): void;
    /**
     * Shows the focus ring
     */
    protected showFocusRing(): void;
    /**
     * Scrolls this component into view if it's inside a scroll container
     */
    private scrollIntoView;
    /**
     * Called when component loses focus
     * Override in subclasses to customize blur behavior
     */
    onBlur(): void;
    /**
     * Hides the focus ring
     */
    protected hideFocusRing(): void;
    /**
     * Destroys this component and cleans up resources
     */
    destroy(): void;
}
