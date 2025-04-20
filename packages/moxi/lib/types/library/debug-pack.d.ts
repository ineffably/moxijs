import PIXI from 'pixi.js';
import { Scene } from '../core/scene';
export declare const console: () => void;
export declare class SceneGraph extends PIXI.Container {
    scene: Scene;
    constructor(scene: Scene);
    update(deltaTime: number): void;
}
