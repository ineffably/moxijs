import { UIComponent } from '../core/ui-component';
import { BoxModel, MeasuredSize } from '../core/box-model';
export interface UIBoxProps {
    backgroundColor?: number;
    backgroundAlpha?: number;
    borderColor?: number;
    borderWidth?: number;
    borderRadius?: number;
    width?: number;
    height?: number;
}
export declare class UIBox extends UIComponent {
    private props;
    private graphics;
    constructor(props?: UIBoxProps, boxModel?: Partial<BoxModel>);
    measure(): MeasuredSize;
    protected render(): void;
    setBackgroundColor(color: number, alpha?: number): void;
    setBorder(color: number, width: number): void;
}
