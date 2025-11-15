import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { EdgeInsets } from '../core/edge-insets';
export declare enum ButtonState {
    Normal = "normal",
    Hover = "hover",
    Pressed = "pressed",
    Disabled = "disabled"
}
export interface UIButtonProps {
    label?: string;
    width?: number;
    height?: number;
    backgroundColor?: number;
    textColor?: number;
    fontSize?: number;
    borderRadius?: number;
    padding?: EdgeInsets;
    onClick?: () => void;
    onHover?: () => void;
    enabled?: boolean;
}
export declare class UIButton extends UIComponent {
    private props;
    private onClick?;
    private onHover?;
    private state;
    private background;
    private label?;
    private normalColor;
    private hoverColor;
    private pressedColor;
    private disabledColor;
    private labelCenterX;
    private labelCenterY;
    constructor(props?: UIButtonProps, boxModel?: Partial<BoxModel>);
    private setupInteractivity;
    private handlePointerOver;
    private handlePointerOut;
    private handlePointerDown;
    private handlePointerUp;
    private handlePointerUpOutside;
    private setState;
    private updateVisuals;
    private darkenColor;
    measure(): MeasuredSize;
    layout(availableWidth: number, availableHeight: number): void;
    protected render(): void;
    setLabel(text: string): void;
    setEnabled(enabled: boolean): void;
    getState(): ButtonState;
}
