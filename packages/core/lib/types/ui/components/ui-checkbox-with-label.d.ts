import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { UICheckbox, UICheckboxProps } from './ui-checkbox';
import { UILabel } from './ui-label';
export interface UICheckboxWithLabelProps extends UICheckboxProps {
    label: string;
    gap?: number;
    fontSize?: number;
    textColor?: number;
    labelPosition?: 'left' | 'right';
}
export declare class UICheckboxWithLabel extends UIComponent {
    private props;
    private checkbox;
    private label;
    private labelPosition;
    constructor(props: UICheckboxWithLabelProps, boxModel?: Partial<BoxModel>);
    private setupLabelClickability;
    getCheckbox(): UICheckbox;
    getLabel(): UILabel;
    setChecked(checked: boolean): void;
    getChecked(): boolean;
    toggle(): void;
    setDisabled(disabled: boolean): void;
    setLabelText(text: string): void;
    measure(): MeasuredSize;
    layout(availableWidth: number, availableHeight: number): void;
    protected render(): void;
    updateChecked(checked: boolean): void;
    destroy(): void;
}
