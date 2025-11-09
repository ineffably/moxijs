import * as PIXI from 'pixi.js';
import { Logic } from '../../core/logic';
import type { PhysicsWorld } from './physics-world';
import type { PhysicsDebugOptions } from './physics-types';
export declare class PhysicsDebugRenderer extends Logic<PIXI.Graphics> {
    name: string;
    private world;
    private graphics;
    private options;
    private isVisible;
    constructor(world: PhysicsWorld, options?: PhysicsDebugOptions);
    init(entity: PIXI.Graphics, renderer?: PIXI.Renderer): void;
    update(entity: PIXI.Graphics, deltaTime?: number): void;
    private drawBody;
    private drawShape;
    private drawVelocity;
    private drawAABB;
    private drawCenterOfMass;
    private drawContacts;
    setVisible(visible: boolean): void;
    toggle(): void;
    getVisible(): boolean;
}
