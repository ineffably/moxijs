type MoxiEvents<T extends string | symbol = string, A = any> = {
    [event in T]: (...args: A extends any[] ? A : [A]) => void;
};
export declare class EventEmitter<T extends MoxiEvents = MoxiEvents> {
    private listeners;
    /**
     * Singleton instance of EventEmitter (lazy initialized)
     * @static
     */
    private static instance;
    on<K extends keyof T>(event: K, listener: T[K]): void;
    off<K extends keyof T>(event: K, listener: T[K]): void;
    emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void;
    once<K extends keyof T>(event: K, listener: T[K]): void;
    /**
     * Get the singleton instance of EventEmitter
     * @static
     */
    static getInstance<T extends MoxiEvents = MoxiEvents>(): EventEmitter<T>;
}
export {};
