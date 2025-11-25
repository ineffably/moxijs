import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
/**
 * 9-slice configuration for scalable sprites
 *
 * @category UI
 */
export interface NineSliceConfig {
    /** Width of left edge that doesn't scale */
    leftWidth: number;
    /** Height of top edge that doesn't scale */
    topHeight: number;
    /** Width of right edge that doesn't scale */
    rightWidth: number;
    /** Height of bottom edge that doesn't scale */
    bottomHeight: number;
}
/**
 * Props for configuring a UIPanel
 *
 * @category UI
 */
export interface UIPanelProps {
    /** Background texture */
    texture?: PIXI.Texture;
    /** Background color (if no texture) */
    backgroundColor?: number;
    /** Background alpha */
    backgroundAlpha?: number;
    /** 9-slice configuration (if using texture) */
    nineSlice?: NineSliceConfig;
    /** Fixed width */
    width?: number;
    /** Fixed height */
    height?: number;
    /** Border radius (if using solid color) */
    borderRadius?: number;
}
/**
 * A panel component with optional 9-slice background
 * Can use either a texture or solid color background
 *
 * @category UI
 *
 * @example
 * ```typescript
 * // With texture and 9-slice
 * const panel = new UIPanel({
 *   texture: panelTexture,
 *   nineSlice: { leftWidth: 16, topHeight: 16, rightWidth: 16, bottomHeight: 16 },
 *   width: 300,
 *   height: 200
 * });
 *
 * // With solid color
 * const panel = new UIPanel({
 *   backgroundColor: 0x2c3e50,
 *   width: 300,
 *   height: 200,
 *   borderRadius: 8
 * });
 * ```
 */
export declare class UIPanel extends UIComponent {
    private props;
    private background?;
    constructor(props?: UIPanelProps, boxModel?: Partial<BoxModel>);
    /**
     * Creates the background (either 9-slice sprite or graphics)
     */
    private createBackground;
    /**
     * Measures the size needed for this panel
     */
    measure(): MeasuredSize;
    /**
     * Performs layout for this panel
     */
    layout(availableWidth: number, availableHeight: number): void;
    /**
     * Renders the panel background
     */
    protected render(): void;
    /**
     * Updates the background color (only works for solid color panels)
     */
    setBackgroundColor(color: number, alpha?: number): void;
    /**
     * Updates the texture (only works for texture-based panels)
     */
    setTexture(texture: PIXI.Texture): void;
}
