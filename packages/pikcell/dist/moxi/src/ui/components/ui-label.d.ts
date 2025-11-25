import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
/**
 * Text alignment options
 *
 * @category UI
 */
export type TextAlign = 'left' | 'center' | 'right';
/**
 * Props for configuring a UILabel
 *
 * @category UI
 */
export interface UILabelProps {
    /** The text to display */
    text: string;
    /** Font size in pixels */
    fontSize?: number;
    /** Font family name */
    fontFamily?: string;
    /** Text color (hex number) */
    color?: number;
    /** Text alignment */
    align?: TextAlign;
    /** Enable word wrapping */
    wordWrap?: boolean;
    /** Word wrap width (required if wordWrap is true) */
    wordWrapWidth?: number;
    /** Font weight */
    fontWeight?: string;
    /** Line height multiplier */
    lineHeight?: number;
}
/**
 * A text label component
 * Wraps PIXI.Text with layout integration
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const label = new UILabel({
 *   text: 'Hello World',
 *   fontSize: 24,
 *   color: 0xffffff,
 *   align: 'center'
 * });
 * ```
 */
export declare class UILabel extends UIComponent {
    private props;
    private textObject;
    constructor(props: UILabelProps, boxModel?: Partial<BoxModel>);
    /**
     * Gets the PIXI text style based on current props
     */
    private getTextStyle;
    /**
     * Measures the size needed for this label
     */
    measure(): MeasuredSize;
    /**
     * Performs layout for this label
     */
    layout(availableWidth: number, availableHeight: number): void;
    /**
     * Renders the label (positions the text object)
     */
    protected render(): void;
    /**
     * Updates the text content
     */
    setText(text: string): void;
    /**
     * Updates the text color
     */
    setColor(color: number): void;
    /**
     * Updates the font size
     */
    setFontSize(size: number): void;
    /**
     * Gets the current text
     */
    getText(): string;
}
