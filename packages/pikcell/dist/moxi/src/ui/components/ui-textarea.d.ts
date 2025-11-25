import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
/**
 * Props for configuring a UITextArea
 *
 * @category UI
 */
export interface UITextAreaProps {
    /** Current value (controlled) */
    value?: string;
    /** Default value (uncontrolled) */
    defaultValue?: string;
    /** Change callback */
    onChange?: (value: string) => void;
    /** Placeholder text when empty */
    placeholder?: string;
    /** Maximum character length */
    maxLength?: number;
    /** Width of the textarea */
    width?: number;
    /** Height of the textarea */
    height?: number;
    /** Whether the textarea is disabled */
    disabled?: boolean;
    /** Background color */
    backgroundColor?: number;
    /** Text color */
    textColor?: number;
    /** Placeholder text color */
    placeholderColor?: number;
    /** Border radius */
    borderRadius?: number;
    /** Font size */
    fontSize?: number;
    /** Line height multiplier (e.g., 1.5 means 1.5x the font size) */
    lineHeight?: number;
    /** Number of visible rows */
    rows?: number;
}
/**
 * A multi-line text area component
 * Supports word wrapping and scrolling
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const textarea = new UITextArea({
 *   placeholder: 'Enter your message...',
 *   onChange: (value) => console.log('Message:', value),
 *   width: 400,
 *   height: 120,
 *   rows: 4
 * });
 * ```
 */
export declare class UITextArea extends UIComponent {
    private props;
    private onChange?;
    private currentValue;
    private background;
    private textDisplay;
    private cursor;
    private cursorPosition;
    private cursorBlinkInterval?;
    private cursorVisible;
    constructor(props: UITextAreaProps, boxModel?: Partial<BoxModel>);
    /**
     * Gets the display text (value or placeholder)
     */
    private getDisplayText;
    /**
     * Sets up mouse/keyboard event handlers
     */
    private setupInteractivity;
    private handlePointerDown;
    /**
     * Called when textarea receives focus (override from base class)
     */
    onFocus(): void;
    /**
     * Called when textarea loses focus (override from base class)
     */
    onBlur(): void;
    private handleKeyDown;
    /**
     * Moves cursor vertically by the specified number of lines
     */
    private moveCursorVertically;
    /**
     * Updates the text display and triggers onChange
     */
    private updateText;
    /**
     * Updates cursor position visually
     */
    private updateCursor;
    /**
     * Starts cursor blinking animation
     */
    private startCursorBlink;
    /**
     * Stops cursor blinking animation
     */
    private stopCursorBlink;
    /**
     * Lightens a color by a factor
     */
    private lightenColor;
    /**
     * Measures the size needed for this textarea
     */
    measure(): MeasuredSize;
    /**
     * Performs layout for this textarea
     */
    layout(availableWidth: number, availableHeight: number): void;
    /**
     * Renders the textarea
     */
    protected render(): void;
    /**
     * Sets the value programmatically
     */
    setValue(value: string): void;
    /**
     * Gets the current value
     */
    getValue(): string;
    /**
     * Cleanup when destroying
     */
    destroy(): void;
}
