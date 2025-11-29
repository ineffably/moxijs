import { Logic } from '../core/logic';
import { Container, Renderer } from 'pixi.js';
export declare class StateLogic extends Logic<Container> {
    private _entity;
    constructor(name: string);
    get entity(): Container<import("pixi.js").ContainerChild>;
    init(entity: Container, renderer: Renderer): void;
    onEnter(state: string): void;
    onExit(state: string): void;
    update(entity: Container, deltaTime: number): void;
}
