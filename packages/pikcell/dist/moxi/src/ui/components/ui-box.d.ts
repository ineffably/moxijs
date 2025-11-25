import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
/**
 * Props for configuring a UIBox
 *
 * @category UI
 */
export interface UIBoxProps {
    /** Background color (hex number, e.g., 0xff0000 for red) */
    backgroundColor?: number;
    /** Background alpha/opacity (0-1) */
    backgroundAlpha?: number;
    /** Border color */
    borderColor?: number;
    /** Border width in pixels */
    borderWidth?: number;
    /** Border radius for rounded corners */
    borderRadius?: number;
    /** Fixed width */
    width?: number;
    /** Fixed height */
    height?: number;
}
/**
 * A simple rectangular box component with optional background and border
 * Foundation for panels, buttons, and other visual UI elements
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const box = new UIBox({
 *   backgroundColor: 0x4a90e2,
 *   width: 200,
 *   height: 100,
 *   borderRadius: 8
 * });
 * ```
 */
export declare class UIBox extends UIComponent {
    private props;
    private graphics;
    constructor(props?: UIBoxProps, boxModel?: Partial<BoxModel>);
    /**
     * Measures the size needed for this box
     */
    measure(): MeasuredSize;
    /**
     * Performs layout for this box
     */
    layout(availableWidth: number, availableHeight: number): void;
    /**
     * Renders the box visuals
     */
    protected render(): void;
    /**
     * Updates the background color
     */
    setBackgroundColor(color: number, alpha?: number): void;
    /**
     * Updates the border
     */
    setBorder(color: number, width: number): void;
}
