export interface PixelGridConfig {
    unit?: number;
    scale?: number;
    border?: number;
    padding?: number;
    gap?: number;
    fontScale?: number;
}
export interface BorderConfig {
    outer?: number;
    middle?: number;
    inner?: number;
    total?: number;
}
export declare class PixelGrid {
    readonly unit: number;
    readonly scale: number;
    readonly border: number;
    readonly padding: number;
    readonly gap: number;
    readonly fontScale: number;
    constructor(config?: PixelGridConfig);
    px(units: number): number;
    units(pixels: number): number;
}
export declare const DEFAULT_PIXEL_GRID: PixelGrid;
export declare const px: (units: number) => number;
export declare const units: (pixels: number) => number;
export declare const GRID: {
    readonly unit: number;
    readonly scale: number;
    readonly border: number;
    readonly padding: number;
    readonly gap: number;
    readonly fontScale: number;
};
export declare const BORDER: {
    readonly outer: 1;
    readonly middle: 1;
    readonly inner: 1;
    readonly total: 3;
};
export declare function createBorderConfig(config?: BorderConfig): Required<BorderConfig>;
