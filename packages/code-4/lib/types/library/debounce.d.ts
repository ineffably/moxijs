export declare const getHashCode: (str?: string) => number;
interface DebounceFuncInfo {
    lastCall: number;
    waitMs: number;
    timer: number;
}
export declare function trueDebounce(func: () => void, waitMs?: number): void;
export declare namespace trueDebounce {
    var funcDictionary: Record<string, DebounceFuncInfo>;
}
export {};
