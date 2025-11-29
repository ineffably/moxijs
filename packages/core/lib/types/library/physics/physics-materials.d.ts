import type { PhysicsBodyOptions } from './physics-types';
export declare const PhysicsMaterials: {
    readonly bouncy: {
        readonly density: 0.5;
        readonly friction: 0.1;
        readonly restitution: 0.9;
    };
    readonly wood: {
        readonly density: 0.7;
        readonly friction: 0.4;
        readonly restitution: 0.2;
    };
    readonly metal: {
        readonly density: 1.5;
        readonly friction: 0.3;
        readonly restitution: 0.1;
    };
    readonly ice: {
        readonly density: 0.9;
        readonly friction: 0.02;
        readonly restitution: 0.05;
    };
    readonly rubber: {
        readonly density: 1;
        readonly friction: 0.9;
        readonly restitution: 0.7;
    };
    readonly character: {
        readonly density: 1;
        readonly friction: 0.5;
        readonly restitution: 0;
        readonly fixedRotation: true;
    };
    readonly terrain: {
        readonly density: 0;
        readonly friction: 0.6;
        readonly restitution: 0;
    };
};
export declare function applyMaterial(options: PhysicsBodyOptions, material: keyof typeof PhysicsMaterials): PhysicsBodyOptions;
