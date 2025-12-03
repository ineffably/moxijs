import PIXI from 'pixi.js';
import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
export interface NineSliceConfig {
    leftWidth: number;
    topHeight: number;
    rightWidth: number;
    bottomHeight: number;
}
export interface UIPanelProps {
    texture?: PIXI.Texture;
    backgroundColor?: number;
    backgroundAlpha?: number;
    nineSlice?: NineSliceConfig;
    width?: number;
    height?: number;
    borderRadius?: number;
}
export declare class UIPanel extends UIComponent {
    private props;
    private background?;
    constructor(props?: UIPanelProps, boxModel?: Partial<BoxModel>);
    private createBackground;
    measure(): MeasuredSize;
    protected render(): void;
    setBackgroundColor(color: number, alpha?: number): void;
    setTexture(texture: PIXI.Texture): void;
}
