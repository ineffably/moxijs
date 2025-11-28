type MoxiEvents<T extends string | symbol = string, A = any> = {
    [event in T]: (...args: A extends any[] ? A : [A]) => void;
};
export declare class EventEmitter<T extends MoxiEvents = MoxiEvents> {
    private listeners;
    private static instance;
    on<K extends keyof T>(event: K, listener: T[K]): void;
    off<K extends keyof T>(event: K, listener: T[K]): void;
    emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): void;
    once<K extends keyof T>(event: K, listener: T[K]): void;
    static getInstance<T extends MoxiEvents = MoxiEvents>(): EventEmitter<T>;
}
export {};
