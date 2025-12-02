import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { ThemeResolver } from '../theming/theme-resolver';
export interface SelectOption {
    label: string;
    value: any;
    disabled?: boolean;
}
export interface UISelectProps {
    options: SelectOption[];
    value?: any;
    defaultValue?: any;
    onChange?: (value: any) => void;
    width?: number;
    height?: number;
    placeholder?: string;
    disabled?: boolean;
    backgroundColor?: number;
    dropdownBackgroundColor?: number;
    textColor?: number;
    borderRadius?: number;
    filterable?: boolean;
    allowCustomValue?: boolean;
    themeResolver?: ThemeResolver;
}
export declare class UISelect extends UIComponent {
    private props;
    private onChange?;
    private stateManager;
    private background;
    private label;
    private textInput?;
    private arrowIndicator;
    private dropdownContainer?;
    private dropdownPanel?;
    private optionLabels;
    private optionContainers;
    private isOpen;
    private highlightedIndex;
    private filteredOptions;
    private filterText;
    private hoverColor;
    private selectedColor;
    private keydownHandler?;
    constructor(props: UISelectProps, boxModel?: Partial<BoxModel>);
    private getDisplayText;
    private updateArrowIndicator;
    private updateDisabledVisuals;
    private filterOptions;
    private setupInteractivity;
    private handlePointerDown;
    private highlightNext;
    private highlightPrevious;
    private updateHighlight;
    private openDropdown;
    private updateDropdown;
    private closeDropdown;
    private selectOption;
    private setupClickOutside;
    private removeClickOutside;
    private darkenColor;
    measure(): MeasuredSize;
    layout(availableWidth: number, availableHeight: number): void;
    protected render(): void;
    setValue(value: any): void;
    getValue(): any;
    destroy(): void;
    setOptions(options: SelectOption[]): void;
}
