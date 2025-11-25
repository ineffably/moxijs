import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { EdgeInsets } from '../core/edge-insets';
import { SpriteBackgroundConfig } from './button-background-strategy';
/**
 * Button visual states
 *
 * @category UI
 */
export declare enum ButtonState {
    Normal = "normal",
    Hover = "hover",
    Pressed = "pressed",
    Disabled = "disabled"
}
export type { SpriteBackgroundConfig } from './button-background-strategy';
/**
 * Props for configuring a UIButton
 *
 * @category UI
 */
export interface UIButtonProps {
    /** Button label text */
    label?: string;
    /** Button width */
    width?: number;
    /** Button height */
    height?: number;
    /** Background color (only used if spriteBackground is not provided) */
    backgroundColor?: number;
    /** Sprite-based background configuration */
    spriteBackground?: SpriteBackgroundConfig;
    /** Text color */
    textColor?: number;
    /** Font size */
    fontSize?: number;
    /** Border radius (only used with backgroundColor) */
    borderRadius?: number;
    /** Padding inside button */
    padding?: EdgeInsets;
    /** Use BitmapText instead of regular text */
    useBitmapText?: boolean;
    /** BitmapText font family (required if useBitmapText is true) */
    bitmapFontFamily?: string;
    /** Click callback */
    onClick?: () => void;
    /** Hover callback */
    onHover?: () => void;
    /** Enabled state */
    enabled?: boolean;
}
/**
 * An interactive button component
 * Supports hover, press, and disabled states
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const button = new UIButton({
 *   label: 'Click Me',
 *   width: 150,
 *   height: 40,
 *   backgroundColor: 0x4a90e2,
 *   textColor: 0xffffff,
 *   onClick: () => console.log('Button clicked!')
 * });
 * ```
 */
export declare class UIButton extends UIComponent {
    private props;
    private useBitmapText;
    private bitmapFontFamily?;
    private onClick?;
    private onHover?;
    private state;
    private backgroundStrategy;
    private label?;
    private bitmapLabel?;
    private labelCenterX;
    private labelCenterY;
    private keydownHandler?;
    constructor(props?: UIButtonProps, boxModel?: Partial<BoxModel>);
    /**
     * Creates a BitmapText label
     */
    private createBitmapLabel;
    /**
     * Sets up mouse/touch event handlers
     */
    private setupInteractivity;
    private handlePointerOver;
    private handlePointerOut;
    private handlePointerDown;
    private handlePointerUp;
    private handlePointerUpOutside;
    /**
     * Updates the button's visual state
     */
    private setState;
    /**
     * Updates visuals based on current state
     */
    private updateVisuals;
    /**
     * Measures the size needed for this button
     */
    measure(): MeasuredSize;
    /**
     * Performs layout for this button
     */
    layout(availableWidth: number, availableHeight: number): void;
    /**
     * Renders the button (called after layout)
     */
    protected render(): void;
    /**
     * Sets the button label
     */
    setLabel(text: string): void;
    /**
     * Sets the enabled state
     */
    setEnabled(enabled: boolean): void;
    /**
     * Gets the current state
     */
    getState(): ButtonState;
    /**
     * Cleanup when destroying the button
     */
    destroy(): void;
}
