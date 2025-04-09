import { Behavior } from 'moxi';
import PIXI, { Point } from 'pixi.js';
export interface ProgressBarOptions {
    barWidth?: number;
    barHeight?: number;
    max?: number;
    min?: number;
    color?: string | number;
    backgroundColor?: string | number;
    barPadding?: Point;
    value?: number;
    bitmapText?: Partial<PIXI.TextStyle>;
}
export interface TextStyle {
    fontName?: string;
    fontSize?: number;
    align?: string;
    maxWidth?: number;
}
export declare const defaultProgressBarOptions: ProgressBarOptions;
export declare class ProgressBarBehavior extends Behavior {
    options: ProgressBarOptions;
    graphics: PIXI.Graphics;
    backgroundBar: PIXI.Graphics;
    forgroundBar: PIXI.Graphics;
    bitmapText: PIXI.BitmapText;
    name: string;
    value: number;
    constructor(options?: ProgressBarOptions);
    setValue(value: number): void;
    init(renderer: PIXI.Renderer<HTMLCanvasElement>): void;
    update(deltaTime: number): void;
}
export declare const init: () => Promise<void>;
