import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
import { EdgeInsets } from '../core/edge-insets';
import { SpriteBackgroundConfig } from './button-background-strategy';
import { ThemeResolver } from '../theming/theme-resolver';
export declare enum ButtonState {
    Normal = "normal",
    Hover = "hover",
    Pressed = "pressed",
    Disabled = "disabled"
}
export type { SpriteBackgroundConfig } from './button-background-strategy';
export interface UIButtonProps {
    label?: string;
    width?: number;
    height?: number;
    backgroundColor?: number;
    spriteBackground?: SpriteBackgroundConfig;
    textColor?: number;
    fontSize?: number;
    borderRadius?: number;
    padding?: EdgeInsets;
    useBitmapText?: boolean;
    bitmapFontFamily?: string;
    onClick?: () => void;
    onHover?: () => void;
    enabled?: boolean;
    themeResolver?: ThemeResolver;
}
export declare class UIButton extends UIComponent {
    private props;
    private useBitmapText;
    private bitmapFontFamily?;
    private onClick?;
    private onHover?;
    private layoutEngine;
    private themeApplier;
    private state;
    private backgroundStrategy;
    private label?;
    private bitmapLabel?;
    private labelCenterX;
    private labelCenterY;
    private componentState;
    private themeResolver?;
    private keydownHandler?;
    constructor(props?: UIButtonProps, boxModel?: Partial<BoxModel>);
    private createBitmapLabel;
    private setupInteractivity;
    private handlePointerOver;
    private handlePointerOut;
    private handlePointerDown;
    private handlePointerUp;
    private handlePointerUpOutside;
    private setState;
    private updateVisuals;
    measure(): MeasuredSize;
    layout(availableWidth: number, availableHeight: number): void;
    protected render(): void;
    setLabel(text: string): void;
    setEnabled(enabled: boolean): void;
    getState(): ButtonState;
    destroy(): void;
}
