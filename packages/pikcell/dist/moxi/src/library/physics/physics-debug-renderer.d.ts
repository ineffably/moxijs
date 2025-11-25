import * as PIXI from 'pixi.js';
import { Logic } from '../../core/logic';
import type { PhysicsWorld } from './physics-world';
import type { PhysicsDebugOptions } from './physics-types';
/**
 * PhysicsDebugRenderer - Visualizes collision shapes, velocity vectors, and physics state
 *
 * @example
 * ```typescript
 * const debugRenderer = physicsWorld.enableDebugRenderer(scene);
 *
 * // Toggle with keyboard
 * document.addEventListener('keydown', (e) => {
 *   if (e.key === 'p') debugRenderer.toggle();
 * });
 * ```
 */
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
    /**
     * Set visibility of debug renderer
     */
    setVisible(visible: boolean): void;
    /**
     * Toggle debug renderer visibility
     */
    toggle(): void;
    /**
     * Check if debug renderer is visible
     */
    getVisible(): boolean;
}
