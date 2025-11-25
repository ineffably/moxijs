import { Point } from 'pixi.js';
import { ClientEventsArgs } from '..';
/**
 * Manages input events from the client (keyboard, mouse, etc.) and provides an interface
 * for querying the current input state.
 *
 * Implements the Singleton pattern to ensure only one instance of event handlers exists.
 *
 * @category Core
 * @example
 * ```typescript
 * // Create/get the ClientEvents instance
 * const events = new ClientEvents();
 *
 * // Check if a key is currently pressed
 * if (events.isKeyDown('ArrowRight')) {
 *   player.moveRight();
 * }
 *
 * // Access mouse position
 * const mousePos = events.movePosition;
 * ```
 */
export declare class ClientEvents {
    /**
     * Current wheel scroll delta values
     */
    wheelDelta: {
        yValue: number;
        xValue: number;
    };
    /**
     * The most recent mouse up event
     */
    mouseUpEvent: MouseEvent;
    /**
     * The most recent mouse down event
     */
    mouseDownEvent: MouseEvent;
    /**
     * The last mouse down event that occurred
     */
    lastMouseDown: MouseEvent;
    /**
     * The last mouse up event that occurred
     */
    lastMouseUp: MouseEvent;
    /**
     * The most recent key down event
     */
    keyDownEvent: KeyboardEvent;
    /**
     * The most recent key up event
     */
    keyUpEvent: KeyboardEvent;
    /**
     * Map of currently pressed keys
     * @internal
     */
    keydown: Record<string, KeyboardEvent>;
    /**
     * Accumulated wheel offset values
     */
    wheelOffsets: Point;
    /**
     * Current mouse position
     */
    movePosition: Point;
    /**
     * Previous mouse position
     */
    lastMovePosition: Point;
    /**
     * Change in mouse position since last update
     */
    moveDelta: Point;
    /**
     * Singleton instance of ClientEvents
     * @static
     */
    private static instance;
    /**
     * Gets the singleton instance of ClientEvents, creating it if necessary
     * This is the preferred way to get the ClientEvents instance
     *
     * @param options - Configuration options (only used on first call)
     * @returns The singleton ClientEvents instance
     */
    static getInstance(options?: ClientEventsArgs): ClientEvents;
    /**
     * Creates a new ClientEvents instance
     * Note: Use getInstance() instead to ensure singleton behavior
     *
     * @param options - Configuration options
     * @param options.initWheelOffset - Initial wheel offset value
     * @param options.onAnyEvent - Callback that fires on any input event
     */
    constructor({ initWheelOffset, onAnyEvent }?: ClientEventsArgs);
    /**
     * Checks if a specific key is currently pressed down
     *
     * @param key - The key to check, e.g., 'a', 'ArrowUp', 'Space'
     * @returns True if the key is currently pressed, false otherwise
     *
     * @example
     * ```typescript
     * if (events.isKeyDown('Space')) {
     *   player.jump();
     * }
     * ```
     */
    isKeyDown(key: string): boolean;
    /**
     * Checks if a specific key is currently not pressed
     *
     * @param key - The key to check, e.g., 'a', 'ArrowUp', 'Space'
     * @returns True if the key is currently not pressed, false if it is pressed
     */
    isKeyUp(key: string): boolean;
}
