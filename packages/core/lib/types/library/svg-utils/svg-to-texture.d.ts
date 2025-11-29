import * as PIXI from 'pixi.js';
export interface SVGToTextureOptions {
    svgString: string;
    width: number;
    height: number;
    color?: number;
}
export declare function svgToTexture(options: SVGToTextureOptions): Promise<PIXI.Texture>;
