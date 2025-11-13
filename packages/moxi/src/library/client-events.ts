import { Point } from 'pixi.js';
import { OnEvent, ClientEventsArgs } from '..';

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
export class ClientEvents {
  /**
   * Current wheel scroll delta values
   */
  wheelDelta: { yValue: number; xValue: number; };
  
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
  static instance: ClientEvents = null;

  /**
   * Creates a new ClientEvents instance or returns the existing singleton instance
   * 
   * @param options - Configuration options
   * @param options.initWheelOffset - Initial wheel offset value
   * @param options.onAnyEvent - Callback that fires on any input event
   */
  constructor({ initWheelOffset = new Point(), onAnyEvent = (ev: OnEvent) => {} }: ClientEventsArgs = {}) {
    // since we are hooking events into the document, we only want one instance of this class
    if (ClientEvents.instance) {
      return ClientEvents.instance;
    }
    this.wheelOffsets = initWheelOffset;
    this.keydown = {} as Record<string, KeyboardEvent>;
    this.movePosition = new Point();

    const anyEvent = (ev: OnEvent) => {
      onAnyEvent(ev);
    };

    // Register wheel event listener
    document.addEventListener('wheel', (event) => {
      const wheelDelta = this.wheelOffsets || new Point();
      const xValue = wheelDelta.x + event.deltaX;
      const yValue = wheelDelta.y + event.deltaY;
      this.wheelOffsets = new Point(xValue, yValue);
      anyEvent({ eventType: 'wheel', event });
    });

    // Register mouse move event listener
    document.addEventListener('mousemove', (event) => {
      this.lastMovePosition = this.movePosition;
      this.movePosition = new Point(event.clientX, event.clientY);
      this.moveDelta = new Point(
        this.movePosition.x - this.lastMovePosition.x,
        this.movePosition.y - this.lastMovePosition.y
      );
      anyEvent({ eventType: 'mousemove', event });
    });

    // Register mouse down event listener
    document.addEventListener('mousedown', (event) => {
      this.mouseDownEvent = event;
      this.lastMouseDown = event;
      this.mouseUpEvent = null;
      anyEvent({ eventType: 'mousedown', event });
    });

    // Register mouse up event listener
    document.addEventListener('mouseup', (event) => {
      this.mouseUpEvent = event;
      this.lastMouseUp = event;
      this.mouseDownEvent = null;
      anyEvent({ eventType: 'mouseup', event });
    });

    // Register key down event listener
    document.addEventListener('keydown', (event) => {
      const { key } = event;
      this.keyDownEvent = event;
      this.keyUpEvent = null;
      this.keydown[key] = event;
      anyEvent({ eventType: 'keydown', event });
    });

    // Register key up event listener
    document.addEventListener('keyup', (event) => {
      const { key } = event;
      this.keyUpEvent = event;
      this.keyDownEvent = null;
      delete this.keydown[key];
      anyEvent({ eventType: 'keyup', event });
    });

    ClientEvents.instance = this;
  }

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
  isKeyDown(key: string): boolean {
    return Boolean(this.keydown[key]);
  }

  /**
   * Checks if a specific key is currently not pressed
   * 
   * @param key - The key to check, e.g., 'a', 'ArrowUp', 'Space'
   * @returns True if the key is currently not pressed, false if it is pressed
   */
  isKeyUp(key: string): boolean {
    return !this.keydown[key];
  }
}



