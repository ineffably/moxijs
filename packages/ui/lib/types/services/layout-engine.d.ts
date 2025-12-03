import { BoxModel, ComputedLayout, MeasuredSize } from '../core/box-model';
export interface SizeConstraints {
    width: number;
    height: number;
}
export declare class LayoutEngine {
    measure(boxModel: BoxModel, contentSize: MeasuredSize): MeasuredSize;
    layout(boxModel: BoxModel, measuredSize: MeasuredSize, constraints: SizeConstraints, position?: {
        x: number;
        y: number;
    }): ComputedLayout;
    position(layout: ComputedLayout, parentLayout: ComputedLayout): ComputedLayout;
}
