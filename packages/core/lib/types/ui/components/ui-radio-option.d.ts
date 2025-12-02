import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { ThemeResolver } from '../theming/theme-resolver';
interface UIRadioOptionProps {
    label: string;
    selected: boolean;
    disabled?: boolean;
    size?: number;
    fontSize?: number;
    textColor?: number;
    backgroundColor?: number;
    borderColor?: number;
    selectedColor?: number;
    labelGap?: number;
    onChange?: (selected: boolean) => void;
    themeResolver?: ThemeResolver;
}
declare class UIRadioOption extends UIComponent {
    private props;
    private onChange?;
    private radioButton;
    private label;
    constructor(props: UIRadioOptionProps, boxModel?: Partial<BoxModel>);
    updateSelected(selected: boolean): void;
    setDisabled(disabled: boolean): void;
    measure(): MeasuredSize;
    layout(availableWidth: number, availableHeight: number): void;
    protected render(): void;
    destroy(): void;
}
export { UIRadioOption };
