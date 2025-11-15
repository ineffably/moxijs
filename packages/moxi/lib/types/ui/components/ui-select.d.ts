import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
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
    textColor?: number;
    borderRadius?: number;
}
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
    private getDisplayText;
    private setupInteractivity;
    private handlePointerDown;
    private openDropdown;
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
    setOptions(options: SelectOption[]): void;
}
