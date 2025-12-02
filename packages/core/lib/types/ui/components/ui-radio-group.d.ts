import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { ThemeResolver } from '../theming/theme-resolver';
export interface RadioOption {
    label: string;
    value: any;
    disabled?: boolean;
}
export interface UIRadioGroupProps {
    options: RadioOption[];
    value?: any;
    defaultValue?: any;
    onChange?: (value: any) => void;
    disabled?: boolean;
    direction?: 'horizontal' | 'vertical';
    gap?: number;
    size?: number;
    fontSize?: number;
    textColor?: number;
    backgroundColor?: number;
    borderColor?: number;
    selectedColor?: number;
    labelGap?: number;
    themeResolver?: ThemeResolver;
}
export declare class UIRadioGroup extends UIComponent {
    private props;
    private onChange?;
    private selectedValue;
    private isControlled;
    private themeResolver?;
    private radioOptions;
    private flexContainer;
    constructor(props: UIRadioGroupProps, boxModel?: Partial<BoxModel>);
    private createRadioButtons;
    private handleSelection;
    getValue(): any;
    setValue(value: any): void;
    updateValue(value: any): void;
    setDisabled(disabled: boolean): void;
    measure(): MeasuredSize;
    layout(availableWidth: number, availableHeight: number): void;
    protected render(): void;
    destroy(): void;
}
