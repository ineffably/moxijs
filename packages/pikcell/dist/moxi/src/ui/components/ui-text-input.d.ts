import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
/**
 * Props for configuring a UITextInput
 *
 * @category UI
 */
export interface UITextInputProps {
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
    /** Width of the input */
    width?: number;
    /** Height of the input */
    height?: number;
    /** Whether the input is disabled */
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
    /** Input type for validation */
    type?: 'text' | 'number';
}
/**
 * A text input component following Ant Design patterns
 * Supports both controlled and uncontrolled modes
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const input = new UITextInput({
 *   placeholder: 'Enter your name...',
 *   onChange: (value) => console.log('Input:', value),
 *   maxLength: 50
 * });
 * ```
 */
export declare class UITextInput extends UIComponent {
    private props;
    private onChange?;
    private currentValue;
    private background;
    private textDisplay;
    private cursor;
    private cursorPosition;
    private cursorBlinkInterval?;
    private cursorVisible;
    constructor(props: UITextInputProps, boxModel?: Partial<BoxModel>);
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
     * Called when input receives focus (override from base class)
     */
    onFocus(): void;
    /**
     * Called when input loses focus (override from base class)
     */
    onBlur(): void;
    private handleKeyDown;
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
     * Measures the size needed for this input
     */
    measure(): MeasuredSize;
    /**
     * Performs layout for this input
     */
    layout(availableWidth: number, availableHeight: number): void;
    /**
     * Renders the input
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
