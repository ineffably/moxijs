/** @internal */
export type MoxiEvents<T extends string | symbol = string, A = any> = {
  [event in T]: (...args: A extends any[] ? A : [A]) => void;
};

/**
 * Type-safe event emitter for pub/sub communication.
 *
 * @example
 * ```ts
 * // Define event types
 * type GameEvents = {
 *   'player:hit': (damage: number) => void;
 *   'game:over': () => void;
 *   'score:change': (score: number, combo: number) => void;
 * };
 *
 * const events = new EventEmitter<GameEvents>();
 *
 * // Subscribe
 * events.on('player:hit', (dmg) => console.log(`Hit for ${dmg}`));
 * events.once('game:over', () => showGameOver());
 *
 * // Emit
 * events.emit('player:hit', 10);
 * events.emit('score:change', 100, 3);
 *
 * // Unsubscribe
 * events.off('player:hit', handler);
 * ```
 */
export class EventEmitter<T extends MoxiEvents = MoxiEvents> {
  private listeners: { [K in keyof T]?: T[K][] } = {};
  /** @internal */
  private static instance: EventEmitter<MoxiEvents> | null = null;

  /** Subscribe to event. */
  on<K extends keyof T>(event: K, listener: T[K]): void {
    (this.listeners[event] || (this.listeners[event] = [])).push(listener);
  }

  /** Unsubscribe from event. */
  off<K extends keyof T>(event: K, listener: T[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      this.listeners[event] = eventListeners.filter(l => l !== listener);
    }
  }

  /** Emit event to all listeners. */
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
    (this.listeners[event] || []).forEach(listener => listener(...args));
  }

  /** Subscribe once, auto-unsubscribe after first emit. */
  once<K extends keyof T>(event: K, listener: T[K]): void {
    const onceListener = (...args: Parameters<T[K]>) => {
      listener(...args);
      this.off(event, listener);
    };
    this.on(event, onceListener as T[K]);
  }

  /** Get singleton instance. */
  public static getInstance<T extends MoxiEvents = MoxiEvents>(): EventEmitter<T> {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter<MoxiEvents>();
    }
    return EventEmitter.instance as EventEmitter<T>;
  }
}

