import { PixelGrid } from '@moxijs/core';
export declare const GUI_GRID: PixelGrid;
export declare const px: (units: number) => number;
export declare const units: (pixels: number) => number;
export declare const GUI_CONST: {
    readonly width: 100;
    readonly rowHeight: 12;
    readonly padding: 3;
    readonly border: 1;
    readonly headerHeight: 12;
    readonly gap: 1;
    readonly labelRatio: 0.4;
    readonly fontFamily: "PixelOperator8, ui-monospace";
    readonly fontSize: 8;
};
export declare const GUI_COLORS: {
    readonly background: 1710638;
    readonly header: 1450302;
    readonly border: 996448;
    readonly text: 16777215;
    readonly textMuted: 8947848;
    readonly accent: 54527;
    readonly sliderTrack: 996448;
    readonly sliderFill: 54527;
    readonly input: 2434341;
    readonly inputBorder: 3815994;
    readonly hover: 2763342;
    readonly folder: 1184302;
};
