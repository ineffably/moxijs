import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
/**
 * Option structure for Select component
 *
 * @category UI
 */
export interface SelectOption {
    /** Display text for the option */
    label: string;
    /** The actual value */
    value: any;
    /** Whether this option is disabled */
    disabled?: boolean;
}
/**
 * Props for configuring a UISelect
 *
 * @category UI
 */
export interface UISelectProps {
    /** Array of options */
    options: SelectOption[];
    /** Current selected value (controlled) */
    value?: any;
    /** Default selected value (uncontrolled) */
    defaultValue?: any;
    /** Change callback */
    onChange?: (value: any) => void;
    /** Width of the select */
    width?: number;
    /** Height of the select */
    height?: number;
    /** Placeholder text when nothing selected */
    placeholder?: string;
    /** Whether the select is disabled */
    disabled?: boolean;
    /** Background color */
    backgroundColor?: number;
    /** Text color */
    textColor?: number;
    /** Border radius */
    borderRadius?: number;
}
/**
 * A select/dropdown component with options
 * Follows Ant Design's data-driven pattern
 *
 * @category UI
 *
 * @example
 * ```typescript
 * const select = new UISelect({
 *   options: [
 *     { label: 'Option 1', value: 1 },
 *     { label: 'Option 2', value: 2 },
 *     { label: 'Option 3', value: 3 }
 *   ],
 *   placeholder: 'Choose an option',
 *   onChange: (value) => console.log('Selected:', value)
 * });
 * ```
 */
export declare class UISelect extends UIComponent {
    private props;
    private onChange?;
    private selectedValue;
    private background;
    private label;
    private dropdownContainer?;
    private dropdownPanel?;
    private optionLabels;
    private isOpen;
    private hoverColor;
    private selectedColor;
    constructor(props: UISelectProps, boxModel?: Partial<BoxModel>);
    /**
     * Gets the display text based on selected value
     */
    private getDisplayText;
    /**
     * Sets up mouse/touch event handlers
     */
    private setupInteractivity;
    private handlePointerDown;
    /**
     * Opens the dropdown menu
     */
    private openDropdown;
    /**
     * Closes the dropdown menu
     */
    private closeDropdown;
    /**
     * Selects an option
     */
    private selectOption;
    /**
     * Setup click outside detection
     */
    private setupClickOutside;
    /**
     * Remove click outside detection
     */
    private removeClickOutside;
    /**
     * Darkens a color by a factor
     */
    private darkenColor;
    /**
     * Measures the size needed for this select
     */
    measure(): MeasuredSize;
    /**
     * Performs layout for this select
     */
    layout(availableWidth: number, availableHeight: number): void;
    /**
     * Renders the select
     */
    protected render(): void;
    /**
     * Sets the selected value programmatically
     */
    setValue(value: any): void;
    /**
     * Gets the current selected value
     */
    getValue(): any;
    /**
     * Updates the options
     */
    setOptions(options: SelectOption[]): void;
}
