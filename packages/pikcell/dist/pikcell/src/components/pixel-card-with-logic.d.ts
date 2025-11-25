/**
 * PixelCard with Logic Components (Example/Future Implementation)
 *
 * This demonstrates how PixelCard could be refactored to use Moxi Logic components
 * instead of handling drag/resize internally. This is an EXAMPLE - the actual
 * PixelCard still works fine without this conversion.
 *
 * Benefits of using Logic:
 * - Separation of concerns (UI rendering vs behavior)
 * - Reusable logic across different card types
 * - Easier to test
 * - Can enable/disable behaviors dynamically
 */
import * as PIXI from 'pixi.js';
import { CardDragLogic } from '../logic/card-drag-logic';
import { CardResizeLogic } from '../logic/card-resize-logic';
export interface PixelCardWithLogicOptions {
    title: string;
    x?: number;
    y?: number;
    contentWidth: number;
    contentHeight: number;
    renderer: PIXI.Renderer;
    onResize?: (width: number, height: number) => void;
    draggable?: boolean;
    resizable?: boolean;
}
/**
 * Example of PixelCard using Moxi Logic components
 *
 * This shows the pattern - actual integration would require more work
 * to migrate all the existing PixelCard functionality.
 */
export declare function createPixelCardWithLogic(options: PixelCardWithLogicOptions): {
    container: import("moxi").AsEntity<PIXI.Container<PIXI.ContainerChild>>;
    contentContainer: PIXI.Container<PIXI.ContainerChild>;
    getContentSize: () => {
        width: number;
        height: number;
    };
    setContentSize: (width: number, height: number) => void;
    refresh: () => void;
    getDragLogic: () => CardDragLogic | undefined;
    getResizeLogic: () => CardResizeLogic | undefined;
    enableDrag: () => void;
    disableDrag: () => void;
    enableResize: () => void;
    disableResize: () => void;
};
/**
 * USAGE EXAMPLE:
 *
 * const card = createPixelCardWithLogic({
 *   title: 'My Card',
 *   x: 100,
 *   y: 100,
 *   contentWidth: 50,
 *   contentHeight: 50,
 *   renderer,
 *   draggable: true,
 *   resizable: true,
 *   onResize: (w, h) => console.log(`Resized to ${w}x${h}`)
 * });
 *
 * scene.addChild(card.container);
 *
 * // Dynamically control behaviors
 * card.disableDrag();  // Prevent dragging
 * card.enableResize(); // Allow resizing
 *
 * // Access Logic components directly
 * const dragLogic = card.getDragLogic();
 * if (dragLogic?.isActive()) {
 *   console.log('Card is being dragged!');
 * }
 */
