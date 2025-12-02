import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { ThemeResolver } from '../theming/theme-resolver';
export interface UIRadioButtonProps {
    selected?: boolean;
    defaultSelected?: boolean;
    onChange?: (selected: boolean) => void;
    disabled?: boolean;
    size?: number;
    backgroundColor?: number;
    borderColor?: number;
    selectedColor?: number;
    borderWidth?: number;
    themeResolver?: ThemeResolver;
}
export declare class UIRadioButton extends UIComponent {
    private props;
    private onChange?;
    private selected;
    private isControlled;
    protected themeResolver?: ThemeResolver;
    private radioGraphics;
    private dotGraphics;
    private keydownHandler?;
    constructor(props?: UIRadioButtonProps, boxModel?: Partial<BoxModel>);
    private setupInteractivity;
    private handlePointerOver;
    private handlePointerOut;
    private handlePointerDown;
    private handlePointerUp;
    private handlePointerUpOutside;
    setSelected(selected: boolean): void;
    getSelected(): boolean;
    updateSelected(selected: boolean): void;
    measure(): MeasuredSize;
    layout(availableWidth: number, availableHeight: number): void;
    protected render(): void;
    setDisabled(disabled: boolean): void;
    private updateVisuals;
    destroy(): void;
}
