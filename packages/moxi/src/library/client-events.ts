import { Point } from 'pixi.js';
import { OnEvent, ClientEventsArgs } from '..';

/**
 * Singleton input manager for keyboard, mouse, and wheel events.
 * Tracks current input state for polling-based input handling.
 *
 * @example
 * ```ts
 * const input = ClientEvents.getInstance();
 *
 * // In update loop - check key state
 * if (input.isKeyDown('ArrowRight')) player.moveRight();
 * if (input.isKeyDown('Space')) player.jump();
 *
 * // Mouse position and movement
 * const mousePos = input.movePosition;
 * const delta = input.moveDelta;
 *
 * // Wheel scrolling
 * const scroll = input.wheelOffsets;
 * ```
 */
export class ClientEvents {
  /** Current wheel scroll delta. */
  wheelDelta: { yValue: number; xValue: number; };
  /** Most recent mouseup event. */
  mouseUpEvent: MouseEvent;
  /** Most recent mousedown event. */
  mouseDownEvent: MouseEvent;
  /** Last mousedown event. */
  lastMouseDown: MouseEvent;
  /** Last mouseup event. */
  lastMouseUp: MouseEvent;
  /** Most recent keydown event. */
  keyDownEvent: KeyboardEvent;
  /** Most recent keyup event. */
  keyUpEvent: KeyboardEvent;
  /** @internal Currently pressed keys. */
  keydown: Record<string, KeyboardEvent>;
  /** Accumulated wheel offsets. */
  wheelOffsets: Point;
  /** Current mouse position. */
  movePosition: Point;
  /** Previous mouse position. */
  lastMovePosition: Point;
  /** Mouse movement delta. */
  moveDelta: Point;

  /** @internal */
  private static instance: ClientEvents | null = null;

  /** Get singleton instance. */
  static getInstance(options: ClientEventsArgs = {}): ClientEvents {
    if (!ClientEvents.instance) {
      ClientEvents.instance = new ClientEvents(options);
    }
    return ClientEvents.instance;
  }

  /** @internal Use getInstance() instead. */
  constructor({ initWheelOffset = new Point(), onAnyEvent = (ev: OnEvent) => {} }: ClientEventsArgs = {}) {
    // Return existing instance if one exists (singleton pattern)
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

  /** True if key is currently pressed. */
  isKeyDown(key: string): boolean {
    return Boolean(this.keydown[key]);
  }

  /** True if key is not pressed. */
  isKeyUp(key: string): boolean {
    return !this.keydown[key];
  }
}



