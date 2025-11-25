import { EdgeInsets } from './edge-insets';
/**
 * Size constraint values for UI components
 * Can be a fixed number, 'auto' to fit content, or 'fill' to expand
 *
 * @category UI
 */
export type SizeConstraint = number | 'auto' | 'fill';
/**
 * Represents the box model for a UI component
 * Similar to CSS box model with width, height, padding, margin, and border
 *
 * @category UI
 */
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
/**
 * The computed/actual layout of a component after measurement
 * All values are concrete pixel values
 *
 * @category UI
 */
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
/**
 * Result of measuring a component's size
 *
 * @category UI
 */
export interface MeasuredSize {
    width: number;
    height: number;
}
/**
 * Helper to create a default BoxModel
 */
export declare function createDefaultBoxModel(overrides?: Partial<BoxModel>): BoxModel;
