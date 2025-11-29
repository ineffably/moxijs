import PIXI from 'pixi.js';
export interface GridOptions {
    width: number;
    height: number;
    cellWidth: number;
    cellHeight: number;
    centered?: boolean;
}
export interface CellPosition {
    x: number;
    y: number;
    pixelX: number;
    pixelY: number;
    index: number;
    total: number;
}
export declare function createTileGrid(options: GridOptions, textures: PIXI.Texture[], selector?: (position: CellPosition) => number): PIXI.Container;
export declare function getTextureRange(textures: PIXI.Texture[], startIndex: number, count: number): PIXI.Texture[];
