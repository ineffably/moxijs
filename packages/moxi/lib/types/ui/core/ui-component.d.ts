import PIXI from 'pixi.js';
import { BoxModel, ComputedLayout, MeasuredSize } from './box-model';
export declare abstract class UIComponent {
    container: PIXI.Container;
    protected boxModel: BoxModel;
    protected computedLayout: ComputedLayout;
    parent?: UIComponent;
    visible: boolean;
    enabled: boolean;
    protected layoutDirty: boolean;
    constructor(boxModel?: Partial<BoxModel>);
    abstract measure(): MeasuredSize;
    abstract layout(availableWidth: number, availableHeight: number): void;
    protected abstract render(): void;
    markLayoutDirty(): void;
    getLayout(): ComputedLayout;
    getBoxModel(): BoxModel;
    setPosition(x: number, y: number): void;
    show(): void;
    hide(): void;
    destroy(): void;
}
