/**
 * Helper to create buttons with SVG icons
 */
import * as PIXI from 'pixi.js';
import { PixelButtonOptions } from '../components/pixel-button';
export interface SVGIconButtonOptions extends Omit<PixelButtonOptions, 'icon'> {
    svgString: string;
    iconColor?: number;
}
/**
 * Creates a pixel button with an SVG icon
 * The icon will be rendered at the proper size accounting for the button dimensions
 */
export declare function createSVGIconButton(options: SVGIconButtonOptions): Promise<PIXI.Graphics>;
export declare const SVG_ICONS: {
    ZOOM_CURSOR: string;
    PAN: string;
};
