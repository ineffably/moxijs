import { Entity } from './entity';
export declare abstract class Behavior {
    entity: Entity;
    active: boolean;
    constructor(entity?: Entity);
    setEntity(entity: Entity): void;
    init(...args: any[]): void;
    update(deltaTime: number, entity?: Entity): void;
}
export declare class InstancedBehavior extends Behavior {
}
