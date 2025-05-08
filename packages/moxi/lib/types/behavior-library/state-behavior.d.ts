import { Behavior } from '../core/bahavior';
import { Container, Renderer } from 'pixi.js';
export declare class StateBehavior extends Behavior<Container> {
    private _entity;
    private _name;
    constructor(name: string);
    get name(): string;
    get entity(): Container<import("pixi.js").ContainerChild>;
    init(entity: Container, renderer: Renderer): void;
    onEnter(state: string): void;
    onExit(state: string): void;
    update(entity: Container, deltaTime: number): void;
}
