import { EdgeInsets } from './edge-insets';
export type SizeConstraint = number | 'auto' | 'fill';
export interface BoxModel {
    width: SizeConstraint;
    height: SizeConstraint;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    padding: EdgeInsets;
    margin: EdgeInsets;
    border?: EdgeInsets;
}
export interface ComputedLayout {
    x: number;
    y: number;
    width: number;
    height: number;
    contentX: number;
    contentY: number;
    contentWidth: number;
    contentHeight: number;
}
export interface MeasuredSize {
    width: number;
    height: number;
}
export declare function createDefaultBoxModel(overrides?: Partial<BoxModel>): BoxModel;
