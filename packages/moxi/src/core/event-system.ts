type MoxiEvents<T extends string | symbol = string, A = any> = {
  [event in T]: (...args: A extends any[] ? A : [A]) => void;
};

export class EventEmitter<T extends MoxiEvents = MoxiEvents> {
  private listeners: { [K in keyof T]?: T[K][] } = {};
  
  /**
   * Singleton instance of EventEmitter
   * @static
   */
  public static instance: EventEmitter<MoxiEvents> = new EventEmitter<MoxiEvents>();

  on<K extends keyof T>(event: K, listener: T[K]): void {
    (this.listeners[event] || (this.listeners[event] = [])).push(listener);
  }

  off<K extends keyof T>(event: K, listener: T[K]): void {
    const eventListeners = this.listeners[event];
    if (eventListeners) {
      this.listeners[event] = eventListeners.filter(l => l !== listener);
    }
  }

  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void {
    (this.listeners[event] || []).forEach(listener => listener(...args));
  }

  once<K extends keyof T>(event: K, listener: T[K]): void {
    const onceListener = (...args: Parameters<T[K]>) => {
      listener(...args);
      this.off(event, listener);
    };
    this.on(event, onceListener as T[K]);
  }
  
  /**
   * Get the singleton instance of EventEmitter
   * @static
   */
  public static getInstance<T extends MoxiEvents = MoxiEvents>(): EventEmitter<T> {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter<T>();
    }
    return EventEmitter.instance as EventEmitter<T>;
  }
}

