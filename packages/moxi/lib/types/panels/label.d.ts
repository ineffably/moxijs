import PIXI from 'pixi.js';
import { Behavior } from '../core/bahavior';
export declare class LabelPanel extends Behavior<PIXI.BitmapText> {
    text: string;
    style: Partial<PIXI.TextStyle>;
    entity: PIXI.BitmapText;
    renderer: PIXI.Renderer;
    constructor();
    init(entity: PIXI.BitmapText, renderer: PIXI.Renderer): this;
    setText(text: string): void;
    setStyle(style: Partial<PIXI.TextStyle>): void;
}
