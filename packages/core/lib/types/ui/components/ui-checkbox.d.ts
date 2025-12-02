import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { ThemeResolver } from '../theming/theme-resolver';
export interface UICheckboxProps {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    disabled?: boolean;
    size?: number;
    backgroundColor?: number;
    borderColor?: number;
    checkColor?: number;
    checkedBackgroundColor?: number;
    borderRadius?: number;
    themeResolver?: ThemeResolver;
}
export declare class UICheckbox extends UIComponent {
    private props;
    private layoutEngine;
    private stateManager;
    private themeApplier;
    private checkboxGraphics;
    private checkmarkGraphics;
    private componentState;
    protected themeResolver?: ThemeResolver;
    private colorOverrides;
    private keydownHandler?;
    constructor(props?: UICheckboxProps, boxModel?: Partial<BoxModel>);
    private setupInteractivity;
    private handlePointerOver;
    private handlePointerOut;
    private handlePointerDown;
    private handlePointerUp;
    private handlePointerUpOutside;
    toggle(): void;
    setChecked(checked: boolean): void;
    getChecked(): boolean;
    private updateVisuals;
    measure(): MeasuredSize;
    layout(availableWidth: number, availableHeight: number): void;
    protected render(): void;
    updateChecked(checked: boolean): void;
    setDisabled(disabled: boolean): void;
    destroy(): void;
}
